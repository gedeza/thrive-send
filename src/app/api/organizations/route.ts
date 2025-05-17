import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organizations where the user is a member
    const memberships = await db.organizationMember.findMany({
      where: { user: { clerkId: userId } },
      select: { organizationId: true },
    });

    if (memberships.length === 0) {
      return NextResponse.json([]);
    }

    const organizations = await db.organization.findMany({
      where: {
        id: { in: memberships.map(m => m.organizationId) }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        website: true,
        primaryColor: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Log the response for debugging
    console.log('Organizations API Response:', organizations);
    
    // Ensure we return an array
    return NextResponse.json(Array.isArray(organizations) ? organizations : []);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, website, logoUrl, primaryColor } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Create organization and add user as member
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        website,
        logoUrl,
        primaryColor,
        members: {
          create: {
            userId,
            role: "ADMIN"
          }
        }
      }
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, slug, website, logoUrl, primaryColor } = body;

    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: "ID, name, and slug are required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: id,
        user: { clerkId: userId }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Organization not found or access denied" },
        { status: 404 }
      );
    }

    const organization = await db.organization.update({
      where: { id },
      data: {
        name,
        slug,
        website,
        logoUrl,
        primaryColor
      }
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: id,
        user: { clerkId: userId }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Organization not found or access denied" },
        { status: 404 }
      );
    }

    await db.organization.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
