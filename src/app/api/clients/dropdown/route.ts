import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET: Get simplified client list for dropdown/filter usage
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization memberships
    const memberships = await db.organizationMember.findMany({
      where: { user: { clerkId: session.userId } },
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
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients for dropdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}