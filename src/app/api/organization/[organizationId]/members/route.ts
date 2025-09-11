import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET: Fetch organization members with roles
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = params;

    // Find the organization
    const organization = await db.organization.findFirst({
      where: {
        OR: [
          { id: organizationId },
          { clerkOrganizationId: organizationId }
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Verify user has access to the organization
    const userMembership = await db.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        user: { clerkId: session.userId }
      }
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch organization members
    const members = await db.organizationMember.findMany({
      where: {
        organizationId: organization.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });

    // Transform the data to include user info at the top level
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      joinedAt: member.createdAt,
      isActive: true // You could add activity tracking later
    }));

    return NextResponse.json(formattedMembers);

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch organization members" },
      { status: 500 }
    );
  }
}