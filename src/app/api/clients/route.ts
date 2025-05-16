import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all clients
export async function GET(request: NextRequest) {
  try {
    const clients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        status: true,
        createdAt: true
      }
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
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and type are required" },
        { status: 400 }
      );
    }
    
    // Create client in database
    const newClient = await db.client.create({
      data: {
        name: data.name,
        email: data.email,
        type: data.type,
        status: "active"
      }
    });
    
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating client:', error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
