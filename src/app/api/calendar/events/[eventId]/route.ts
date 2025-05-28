import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { CalendarEventUpdateSchema } from "../../validation";

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

// GET /api/calendar/events/[eventId]
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
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

    const event = await db.calendarEvent.findFirst({
      where: {
        id: params.eventId,
        organizationId,
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Return the event with proper date transformations
    const transformedEvent = {
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("[CALENDAR_EVENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT /api/calendar/events/[eventId]
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = getAuth(req);
    const body = await req.json();

    console.log("[CALENDAR_EVENT_PUT] Request:", {
      eventId: params.eventId,
      userId,
      body
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

    // Remove server-set and ID fields from the request body before validation
    const { id, organizationId: _, createdBy: __, createdAt: ___, updatedAt: ____, ...validationBody } = body;

    // Check if event exists and user has permission to update it
    const existingEvent = await db.calendarEvent.findFirst({
      where: {
        id: params.eventId,
        organizationId,
      },
    });

    if (!existingEvent) {
      return new NextResponse("Event not found or access denied", { status: 404 });
    }

    // Prepare data for update
    const updateData: any = { ...validationBody };
    updateData.updatedAt = new Date();

    // Update the event
    const updatedEvent = await db.calendarEvent.update({
      where: {
        id: params.eventId,
      },
      data: updateData,
    });

    console.log("[CALENDAR_EVENT_PUT] Event updated successfully:", updatedEvent.id);

    // Return transformed event with proper date formatting
    const transformedEvent = {
      ...updatedEvent,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("[CALENDAR_EVENT_PUT] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/calendar/events/[eventId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
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

    // Check if event exists and user has permission to delete it
    const existingEvent = await db.calendarEvent.findFirst({
      where: {
        id: params.eventId,
        organizationId,
      },
    });

    if (!existingEvent) {
      return new NextResponse("Event not found or access denied", { status: 404 });
    }

    await db.calendarEvent.delete({
      where: {
        id: params.eventId,
      },
    });

    console.log("[CALENDAR_EVENT_DELETE] Event deleted successfully:", params.eventId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CALENDAR_EVENT_DELETE] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 