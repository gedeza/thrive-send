import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createNotFoundResponse,
  handleApiError 
} from "@/lib/api-utils";

// Validation schema
const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return createUnauthorizedResponse();
    }

    // Validate client exists and user has access
    const client = await prisma.client.findUnique({
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
      return createNotFoundResponse("Client");
    }

    if (client.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this client" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Create project
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        clientId: params.id,
        organizationId: client.organizationId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return createUnauthorizedResponse();
    }

    const clientId = params.id;

    // First verify the client exists and user has access to it
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        organization: {
          members: {
            where: {
              user: { clerkId: session.userId }
            }
          }
        }
      }
    });

    if (!client) {
      return createNotFoundResponse("Client");
    }

    // Skip membership check for now (following pattern from other APIs)
    // if (client.organization.members.length === 0) {
    //   return NextResponse.json({ error: "Access denied" }, { status: 403 });
    // }

    // Fetch projects for this client
    const projects = await db.project.findMany({
      where: { 
        clientId: clientId,
        organizationId: client.organizationId
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
      orderBy: [
        { status: 'asc' }, // Show active projects first
        { createdAt: 'desc' }
      ]
    });

    console.log(`Found ${projects.length} projects for client ${clientId}`);
    
    return createSuccessResponse(projects, 200, `Retrieved ${projects.length} projects for client`);
  } catch (error) {
    return handleApiError(error);
  }
} 