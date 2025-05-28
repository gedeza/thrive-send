import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AnalyticsQuerySchema } from "../../validation";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);

    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    try {
      AnalyticsQuerySchema.parse({ startDate, endDate, type, status });
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }));
        return new NextResponse(JSON.stringify({ 
          error: "Validation Error", 
          details: errors 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Get total events count
    const totalEvents = await db.calendarEvent.count({
      where: {
        organizationId: orgId,
        ...(startDate && endDate ? {
          date: {
            gte: startDate,
            lte: endDate,
          }
        } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
    });

    // Get events by type
    const eventsByType = await db.calendarEvent.groupBy({
      by: ['type'],
      where: {
        organizationId: orgId,
        ...(startDate && endDate ? {
          date: {
            gte: startDate,
            lte: endDate,
          }
        } : {}),
        ...(status ? { status } : {}),
      },
      _count: {
        type: true,
      },
    });

    // Get events by status
    const eventsByStatus = await db.calendarEvent.groupBy({
      by: ['status'],
      where: {
        organizationId: orgId,
        ...(startDate && endDate ? {
          date: {
            gte: startDate,
            lte: endDate,
          }
        } : {}),
        ...(type ? { type } : {}),
      },
      _count: {
        status: true,
      },
    });

    // Get events by date (daily distribution)
    const eventsByDate = await db.calendarEvent.groupBy({
      by: ['date'],
      where: {
        organizationId: orgId,
        ...(startDate && endDate ? {
          date: {
            gte: startDate,
            lte: endDate,
          }
        } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
      _count: {
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      totalEvents,
      eventsByType,
      eventsByStatus,
      eventsByDate,
    });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_ANALYTICS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 