import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/error-handler";

export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    user: {
      id: string;
      clerkId: string;
    };
    organizationId?: string;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get internal user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Add auth info to request
    const authedRequest = request as AuthenticatedRequest;
    authedRequest.auth = {
      userId,
      user,
      organizationId: undefined,
    };

    return handler(authedRequest);
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export async function withOrganization(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(request, async (authedRequest) => {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const session = await auth();
      const organizationId = session.orgId;
      
      // Simplified: Don't auto-create organizations
      if (!organizationId) {
        return NextResponse.json(
          { error: "No organization selected. Please select an organization first." },
          { status: 400 }
        );
      }

      // Verify organization exists and user has access
      const membership = await db.organizationMember.findFirst({
        where: {
          organization: { clerkOrganizationId: organizationId },
          user: { clerkId: authedRequest.auth.user.clerkId }
        },
        include: { organization: true }
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Access denied to this organization" },
          { status: 403 }
        );
      }

      authedRequest.auth.organizationId = membership.organization.id;
      return handler(authedRequest);
    } catch (error) {
      console.error('Organization middleware error:', error);
      return NextResponse.json(
        { error: "Organization access check failed" },
        { status: 500 }
      );
    }
  });
}