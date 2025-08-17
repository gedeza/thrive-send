import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  handleApiError 
} from "@/lib/api-utils";

// GET: Get simplified client list for dropdown/filter usage
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return createUnauthorizedResponse();
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
    
    return createSuccessResponse(clients, 200, "Clients retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}