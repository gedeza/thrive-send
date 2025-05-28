import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    // Verify user has access to the project through organization membership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          members: {
            where: {
              user: {
                clerkId: userId
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have permission to delete this project" },
        { status: 403 }
      );
    }

    // Delete the project
    await db.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    const data = await request.json();

    // Verify user has access to the project through organization membership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          members: {
            where: {
              user: {
                clerkId: userId
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have permission to update this project" },
        { status: 403 }
      );
    }

    // Update the project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        clientId: data.clientId,
        managerId: data.managerId
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[API] Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    // Get project with organization access check
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          members: {
            where: {
              user: {
                clerkId: userId
              }
            }
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have permission to view this project" },
        { status: 403 }
      );
    }

    // Remove organization.members from response
    const { organization, ...projectData } = project;
    return NextResponse.json(projectData);
  } catch (error) {
    console.error("[API] Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
} 