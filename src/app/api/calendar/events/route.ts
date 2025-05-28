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
    const { userId, orgId } = getAuth(req);

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

    // Transform dates to ISO strings for JSON serialization
    const transformedEvents = events.map(event => ({
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
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
      return handleValidationError(error);
    }

    const event = await db.calendarEvent.create({
      data: {
        ...validationBody,
        startTime: new Date(validationBody.startTime),
        endTime: new Date(validationBody.endTime),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id,
        organizationId,
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
    const { userId, orgId } = getAuth(req);
    const body = await req.json();

    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate request body
    try {
      CalendarEventUpdateSchema.parse(body);
    } catch (error) {
      return handleValidationError(error);
    }

    const event = await db.calendarEvent.update({
      where: {
        id: body.id,
        organizationId: orgId,
      },
      data: {
        ...body,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        updatedAt: new Date(),
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
    console.error("[CALENDAR_EVENTS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    await db.calendarEvent.delete({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 