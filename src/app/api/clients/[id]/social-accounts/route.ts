import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const socialAccountSchema = z.object({
  platform: z.enum(["FACEBOOK", "TWITTER", "INSTAGRAM", "LINKEDIN"]),
  handle: z.string().min(1),
});

export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = socialAccountSchema.parse(body);

    // Check for duplicate social account
    const existingAccount = await db.socialAccount.findFirst({
      where: {
        clientId: params.id,
        platform: validatedData.platform,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: `A ${validatedData.platform} account already exists for this client` },
        { status: 409 }
      );
    }

    // Create social account
    const socialAccount = await db.socialAccount.create({
      data: {
        platform: validatedData.platform,
        handle: validatedData.handle,
        clientId: params.id,
        organizationId: client.organizationId,
      },
    });

    return NextResponse.json(socialAccount, { status: 201 });
  } catch (_error) {
    console.error("", _error);
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create social account" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const socialAccounts = await db.socialAccount.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(socialAccounts);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch social accounts" },
      { status: 500 }
    );
  }
} 