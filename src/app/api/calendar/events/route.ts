import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { CalendarEvent } from "@/types/calendar";
import { 
  CalendarEventSchema, 
  CalendarEventUpdateSchema, 
  EventRescheduleSchema,
  AnalyticsQuerySchema 
} from "../validation";

export const dynamic = 'force-dynamic'; // Force dynamic evaluation, prevent caching

// Helper function to handle validation errors
function handleValidationError(error: any) {
  if (error.name === 'ZodError') {
    const errors = error.errors.map((err: any) => ({
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

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user and their organization membership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.organizationMemberships.length === 0) {
      return new NextResponse("User is not a member of any organization", { status: 403 });
    }

    // Use the first organization membership
    const organizationId = user.organizationMemberships[0].organizationId;

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (startDate && endDate) {
      try {
        AnalyticsQuerySchema.parse({ startDate, endDate, type, status });
      } catch (error) {
        return handleValidationError(error);
      }
    }

    const events = await db.calendarEvent.findMany({
      where: {
        organizationId,
        ...(startDate && endDate ? {
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: {
        startTime: "asc",
      },
    });

    console.log(`[CALENDAR_EVENTS_GET] Found ${events.length} events for organizationId: ${organizationId}`);
    if (events.length === 0) {
      console.log("[CALENDAR_EVENTS_GET] No events found, showing all events regardless of date range");
      // If no events found with date filters, try getting all events for debugging
      const allEvents = await db.calendarEvent.findMany({
        where: { organizationId },
        orderBy: { startTime: "asc" },
      });
      console.log(`[CALENDAR_EVENTS_GET] Total events in database for this organization: ${allEvents.length}`);
    }

    // Transform dates to ISO strings for JSON serialization
    const transformedEvents = events.map(event => ({
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return NextResponse.json({ events: transformedEvents }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user and their organization membership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.organizationMemberships.length === 0) {
      return new NextResponse("User is not a member of any organization", { status: 403 });
    }

    // Use the first organization membership
    const organizationId = user.organizationMemberships[0].organizationId;

    // Remove server-set fields from the request body before validation
    const { organizationId: _, createdBy: __, ...validationBody } = body;

    // Validate request body
    try {
      CalendarEventSchema.parse(validationBody);
    } catch (error) {
      console.error("[CALENDAR_EVENTS_POST] Validation error:", error);
      return handleValidationError(error);
    }

    // Create the event with required fields
    const event = await db.calendarEvent.create({
      data: {
        ...validationBody,
        startTime: new Date(validationBody.startTime),
        endTime: new Date(validationBody.endTime),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id,
        organizationId,
        status: validationBody.status || 'draft',
        type: validationBody.type,
      },
    });

    // Transform dates to ISO strings for JSON serialization
    const transformedEvent = {
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const body = await req.json();

    console.log("[CALENDAR_EVENTS_PUT] Request received:", {
      userId,
      bodyKeys: Object.keys(body),
      hasId: !!body.id
    });

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user and their organization membership (consistent with GET route)
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.organizationMemberships.length === 0) {
      return new NextResponse("User is not a member of any organization", { status: 403 });
    }

    // Use the first organization membership
    const organizationId = user.organizationMemberships[0].organizationId;

    if (!body.id) {
      return new NextResponse("Event ID is required for updates", { status: 400 });
    }

    // Validate request body
    try {
      CalendarEventUpdateSchema.parse(body);
    } catch (error) {
      console.error("[CALENDAR_EVENTS_PUT] Validation error:", error);
      return handleValidationError(error);
    }

    // Check if event exists and user has permission to update it
    const existingEvent = await db.calendarEvent.findFirst({
      where: {
        id: body.id,
        organizationId,
      },
    });

    if (!existingEvent) {
      return new NextResponse("Event not found or access denied", { status: 404 });
    }

    // Prepare update data, excluding server-controlled fields
    const { id, organizationId: _, createdBy: __, createdAt: ___, ...updateData } = body;
    
    // Convert date strings to proper ISO DateTime format if needed
    if (updateData.startTime) {
      const startDate = new Date(updateData.startTime);
      if (isNaN(startDate.getTime())) {
        // If it's just a date like "2025-05-31", add default time
        updateData.startTime = new Date(updateData.startTime + 'T00:00:00.000Z');
      } else {
        updateData.startTime = startDate;
      }
    }
    
    if (updateData.endTime) {
      const endDate = new Date(updateData.endTime);
      if (isNaN(endDate.getTime())) {
        // If it's just a date like "2025-05-31", add default time
        updateData.endTime = new Date(updateData.endTime + 'T23:59:59.000Z');
      } else {
        updateData.endTime = endDate;
      }
    }
    
    updateData.updatedAt = new Date();

    const event = await db.calendarEvent.update({
      where: {
        id: body.id,
      },
      data: updateData,
    });

    console.log("[CALENDAR_EVENTS_PUT] Event updated successfully:", event.id);

    // Transform dates to ISO strings for JSON serialization
    const transformedEvent = {
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_PUT] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    // Get the user and their organization membership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.organizationMemberships.length === 0) {
      return new NextResponse("User is not a member of any organization", { status: 403 });
    }

    // Use the first organization membership
    const organizationId = user.organizationMemberships[0].organizationId;

    await db.calendarEvent.delete({
      where: {
        id,
        // Note: Prisma doesn't support composite constraints in delete,
        // so we'll need to check permissions first
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 