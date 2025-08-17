import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const socialAccountSchema = z.object({
  platform: z.enum(["FACEBOOK", "TWITTER", "INSTAGRAM", "LINKEDIN"]),
  handle: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
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

    // Fetch social account
    const socialAccount = await db.socialAccount.findUnique({
      where: {
        id: params.accountId,
        clientId: params.id,
      },
    });

    if (!socialAccount) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(socialAccount);
  } catch (error) {
    console.error("Error fetching social account:", error);
    return NextResponse.json(
      { error: "Failed to fetch social account" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
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

    // Validate social account exists
    const existingAccount = await db.socialAccount.findUnique({
      where: {
        id: params.accountId,
        clientId: params.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = socialAccountSchema.parse(body);

    // Check for duplicate handles
    const duplicateHandle = await db.socialAccount.findFirst({
      where: {
        platform: validatedData.platform,
        handle: validatedData.handle,
        clientId: params.id,
        id: { not: params.accountId },
      },
    });

    if (duplicateHandle) {
      return NextResponse.json(
        { error: "This social media handle is already linked to this client" },
        { status: 409 }
      );
    }

    // Update social account
    const updatedAccount = await db.socialAccount.update({
      where: { id: params.accountId },
      data: validatedData,
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Error updating social account:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update social account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; accountId: string } }
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

    // Validate social account exists and belongs to the client
    const socialAccount = await db.socialAccount.findUnique({
      where: {
        id: params.accountId,
        clientId: params.id,
      },
    });

    if (!socialAccount) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    // Delete social account
    await db.socialAccount.delete({
      where: { id: params.accountId },
    });

    return NextResponse.json({ message: "Social account deleted successfully" });
  } catch (error) {
    console.error("Error deleting social account:", error);
    return NextResponse.json(
      { error: "Failed to delete social account" },
      { status: 500 }
    );
  }
} 