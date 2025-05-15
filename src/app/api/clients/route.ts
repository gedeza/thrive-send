import { NextRequest, NextResponse } from "next/server";
import mockClients from "./mock";

// GET: List all clients
export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(mockClients);
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
    
    // Simulate client creation with mock data
    console.log("[API] Mock mode: Simulating client creation");
    
    // Return a mock success response
    return NextResponse.json(
      { 
        ...data, 
        id: `mock-${Date.now()}`,
        createdAt: new Date().toISOString()
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating client:', error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
