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
    const { name, email, phone, address, organizationId } = body;

    // Validate input
    if (!name || !email || !organizationId) {
      return NextResponse.json(
        { error: "Name, email, and organizationId are required" },
        { status: 400 }
      );
    }

    // Workaround: fetch all clients for org and check email in JS
    const existingClients = await prisma.client.findMany({
      where: { organizationId },
      select: { email: true },
    });
    const emailExists = existingClients.some(c => c.email === email);
    if (emailExists) {
      return NextResponse.json(
        { error: "Client with this email already exists in this organization" },
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

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
