import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createNotFoundResponse,
  createValidationResponse,
  handleApiError 
} from "@/lib/api-utils";

// Validation schema
const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["MUNICIPALITY", "BUSINESS", "STARTUP", "INDIVIDUAL", "NONPROFIT"]),
  website: z.string().optional(),
  industry: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        socialAccounts: true,
        projects: true,
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

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate client exists and user has access
    const existingClient = await db.client.findUnique({
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

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (existingClient.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this client" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = clientSchema.parse(body);

    // Check if email is being changed and if it's already in use
    if (validatedData.email !== existingClient.email) {
      const emailExists = await db.client.findFirst({
        where: {
          email: validatedData.email,
          organizationId: existingClient.organizationId,
          id: { not: params.id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use by another client" },
          { status: 409 }
        );
      }
    }

    // Update client
    const updatedClient = await db.client.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Delete client and all related data
    await db.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
} 