import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Basic auth check
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, organizationId: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get projects - simple query
    const projects = await db.project.findMany({
      where: { 
        clientId: clientId
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
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;
    const body = await request.json();

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, organizationId: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Basic validation
    if (!body.name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Create project
    const project = await db.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        status: body.status || "PLANNING",
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        clientId: clientId,
        organizationId: client.organizationId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}