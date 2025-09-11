import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization memberships
    const memberships = await db.organizationMember.findMany({
      where: { user: { clerkId: userId } },
      select: { organizationId: true },
    });

    if (memberships.length === 0) {
      return NextResponse.json([]);
    }

    // Get projects for user's organizations
    const projects = await db.project.findMany({
      where: {
        organizationId: { in: memberships.map(m => m.organizationId) }
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        clientId: true,
        organizationId: true,
        managerId: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(projects);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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

    const data = await req.json();
    console.log("Project creation request data:", data);
    
    // Validate required fields
    if (!data.name || !data.organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: name and organizationId are required" },
        { status: 400 }
      );
    }

    // Map Clerk organizationId to internal organization id
    const organization = await db.organization.findUnique({
      where: { clerkOrganizationId: data.organizationId },
    });
    if (!organization) {
      console.error("No organization found for Clerk organizationId:", data.organizationId);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 400 }
      );
    }
    const internalOrganizationId = organization.id;
    console.log("Mapped organization:", { clerkId: data.organizationId, internalId: internalOrganizationId });

    // Verify user has access to the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: internalOrganizationId,
        user: { clerkId: userId }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Organization not found or access denied" },
        { status: 404 }
      );
    }
    
    // Create project in database
    const newProject = await db.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || "PLANNED",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        clientId: data.clientId,
        organizationId: internalOrganizationId,
        managerId: data.managerId
      }
    });
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
