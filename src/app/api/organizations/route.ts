import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  clerkId: z.string(),
  clerkOrganizationId: z.string(),
});

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
  } catch (_error) {
    console.error("", _error);
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

    console.log('Creating organization for user:', userId);

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizationMemberships: true
      }
    });

    console.log('Found user:', user ? 'yes' : 'no');

    if (!user) {
      // Create user if they don't exist
      console.log('Creating new user for clerkId:', userId);
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: `${userId}@temp.com`, // Temporary email, will be updated later
          role: "CONTENT_CREATOR"
        },
        include: {
          organizationMemberships: true
        }
      });
      console.log('Created new user:', user);
    }

    // Check if user has reached organization limit
    const MAX_ORGANIZATIONS = 3;
    if (user.organizationMemberships.length >= MAX_ORGANIZATIONS) {
      return NextResponse.json(
        { error: "You have reached the maximum number of organizations allowed" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    console.log('Request body:', body);
    
    try {
      const validatedData = createOrganizationSchema.parse(body);
      console.log('Validated data:', validatedData);

      // Check if slug is already taken
      const existingOrg = await prisma.organization.findFirst({
        where: { slug: validatedData.slug }
      });

      if (existingOrg) {
        return NextResponse.json(
          { error: "This organization slug is already taken" },
          { status: 400 }
        );
      }

      // Create organization and add user as admin
      console.log('Creating organization with data:', {
        name: validatedData.name,
        slug: validatedData.slug,
        website: validatedData.website || null,
        clerkOrganizationId: validatedData.clerkOrganizationId,
      });

      const organization = await prisma.organization.create({
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          website: validatedData.website || null,
          clerkOrganizationId: validatedData.clerkOrganizationId,
          members: {
            create: {
              userId: user.id,
              role: "ADMIN"
            }
          }
        },
        include: {
          members: true
        }
      });

      console.log('Created organization:', organization);
      return NextResponse.json(organization, { status: 201 });
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }
      throw _error;
    }
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to create organization", details: error instanceof Error ? error.message : 'Unknown error' },
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
  } catch (_error) {
    console.error("", _error);
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
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
