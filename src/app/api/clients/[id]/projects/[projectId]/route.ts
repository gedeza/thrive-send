import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate client exists and user has access
    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                user: {
                  clerkId: session.userId,
                },
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this client" },
        { status: 403 }
      );
    }

    // Fetch project
    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        clientId: params.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate client exists and user has access
    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                user: {
                  clerkId: session.userId,
                },
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this client" },
        { status: 403 }
      );
    }

    // Validate project exists
    const existingProject = await db.project.findUnique({
      where: {
        id: params.projectId,
        clientId: params.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Update project
    const updatedProject = await db.project.update({
      where: { id: params.projectId },
      data: validatedData,
    });

    return NextResponse.json(updatedProject);
  } catch (_error) {
    console.error("", _error);
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate client exists and user has access
    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                user: {
                  clerkId: session.userId,
                },
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this client" },
        { status: 403 }
      );
    }

    // Validate project exists
    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        clientId: params.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete project
    await db.project.delete({
      where: { id: params.projectId },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
} 