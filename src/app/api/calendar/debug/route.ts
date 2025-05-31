import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic'; // Force dynamic evaluation, prevent caching

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be signed in to access this endpoint"
      }, { status: 401 });
    }

    // Get the user and their organization membership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Not Found",
        message: "User not found"
      }, { status: 404 });
    }

    if (user.organizationMemberships.length === 0) {
      return NextResponse.json({ 
        error: "Forbidden",
        message: "User is not a member of any organization"
      }, { status: 403 });
    }

    // Use the first organization membership
    const organizationId = user.organizationMemberships[0].organizationId;

    // Direct query to count all calendar events
    const eventCount = await db.calendarEvent.count({
      where: { organizationId },
    });

    // Get a few sample events for debugging
    const sampleEvents = await db.calendarEvent.findMany({
      where: { organizationId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Get database stats
    const tables = [
      'User',
      'Organization',
      'OrganizationMembership',
      'CalendarEvent',
      'Content',
      'Project',
      'Client'
    ];
    
    const stats = {};
    for (const table of tables) {
      try {
        // @ts-ignore - dynamic table access
        const count = await db[table].count();
        // @ts-ignore - dynamic property assignment
        stats[table] = count;
      } catch (e) {
        // @ts-ignore - dynamic property assignment
        stats[table] = `Error: ${e.message}`;
      }
    }

    return NextResponse.json({
      debug: true,
      userId,
      user: {
        id: user.id,
        email: user.email,
        organizationMemberships: user.organizationMemberships.map(m => ({ 
          id: m.id, 
          organizationId: m.organizationId,
          role: m.role
        }))
      },
      organizationId,
      calendarEvents: {
        count: eventCount,
        sample: sampleEvents.map(event => ({
          id: event.id,
          title: event.title,
          type: event.type,
          status: event.status,
          startTime: event.startTime,
          createdAt: event.createdAt
        }))
      },
      databaseStats: stats
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("[CALENDAR_DEBUG_GET]", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 