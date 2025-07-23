import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { EventRescheduleSchema } from "../../validation";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    const body = await req.json();

    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate request body
    try {
      EventRescheduleSchema.parse(body);
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

    const { eventId, date, time } = body;
    const event = await db.calendarEvent.findUnique({
      where: {
        id: eventId,
        organizationId: orgId,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        organizationId: true,
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Calculate new start and end times
    const newStartTime = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      newStartTime.setHours(hours, minutes, 0, 0);
    }

    // Calculate end time (preserve original duration)
    const originalDuration = event.endTime.getTime() - event.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + originalDuration);

    // Update the event
    const updatedEvent = await db.calendarEvent.update({
      where: {
        id: eventId,
        organizationId: orgId,
      },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_RESCHEDULE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 