import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET: List all clients for the user's organizations
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

    // Get clients for user's organizations
    const clients = await db.client.findMany({
      where: {
        organizationId: { in: memberships.map(m => m.organizationId) }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        organizationId: true,
        createdAt: true,
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            handle: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Transform the data to match the expected format
    const transformedClients = clients.map(client => ({
      ...client,
      type: "BUSINESS", // Default type since it's not in the schema
      status: "active", // Default status since it's not in the schema
      industry: "General", // Default industry since it's not in the schema
      website: null, // Default website since it's not in the schema
      logoUrl: null // Default logoUrl since it's not in the schema
    }));
    
    // Ensure we return an array
    return NextResponse.json(Array.isArray(transformedClients) ? transformedClients : []);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST: Create a new client
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and organizationId are required" },
        { status: 400 }
      );
    }

    // Verify user has access to the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: data.organizationId,
        user: { clerkId: userId }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Organization not found or access denied" },
        { status: 404 }
      );
    }
    
    // Create client in database
    const newClient = await db.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        organizationId: data.organizationId
      }
    });
    
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating client:', error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
