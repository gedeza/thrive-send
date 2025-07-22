import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is member of organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Get organization with counts
    const organization = await db.organization.findUnique({
      where: { id: params.organizationId },
      include: {
        members: true,
        campaigns: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
            }
          }
        },
        content: true,
        _count: {
          select: {
            members: true,
            campaigns: true,
            content: true,
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get subscription to determine limits
    const subscription = await db.subscription.findUnique({
      where: { organizationId: params.organizationId }
    });

    // Calculate storage usage (estimate based on content)
    const storageUsed = organization.content.reduce((total, content) => {
      // Estimate content size (in bytes)
      const contentSize = (content.title?.length || 0) * 2 + 
                         (content.content?.length || 0) * 2 + 
                         (content.description?.length || 0) * 2;
      return total + contentSize;
    }, 0);

    // Define limits based on subscription plan
    const planLimits = {
      starter: {
        campaigns: { limit: 100 },
        members: { limit: 5 },
        storage: { limit: 1073741824 } // 1GB in bytes
      },
      professional: {
        campaigns: { limit: 1000 },
        members: { limit: 20 },
        storage: { limit: 10737418240 } // 10GB in bytes
      },
      enterprise: {
        campaigns: { limit: -1 }, // unlimited
        members: { limit: -1 }, // unlimited
        storage: { limit: 107374182400 } // 100GB in bytes
      }
    };

    const currentPlan = subscription?.plan || 'professional';
    const limits = planLimits[currentPlan as keyof typeof planLimits] || planLimits.professional;

    const usageData = {
      campaigns: {
        used: organization.campaigns.length,
        limit: limits.campaigns.limit
      },
      members: {
        used: organization.members.length,
        limit: limits.members.limit
      },
      storage: {
        used: storageUsed,
        limit: limits.storage.limit
      }
    };

    return NextResponse.json(usageData);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}