import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: List all clients for the user's organizations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const clients = await prisma.client.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        socialAccounts: true,
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST: Create a new client
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received client creation request:", body);
    
    const { name, email, phone, address, organizationId } = body;

    // Validate input
    if (!name || !email || !organizationId) {
      console.error("Missing required fields:", { name, email, organizationId });
      return NextResponse.json(
        { error: "Name, email, and organizationId are required" },
        { status: 400 }
      );
    }

    // Verify user has access to the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { clerkId: session.userId }
      }
    });

    if (!membership) {
      console.error("User does not have access to organization:", { userId: session.userId, organizationId });
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Check for existing client with same email
    const existingClient = await prisma.client.findFirst({
      where: {
        email,
        organizationId,
      },
    });

    if (existingClient) {
      console.error("Client with email already exists:", { email, organizationId });
      return NextResponse.json(
        { error: "A client with this email already exists in this organization" },
        { status: 409 }
      );
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        organization: { connect: { id: organizationId } },
      },
    });

    console.log("Successfully created client:", client);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error occurred while creating client" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
