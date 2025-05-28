import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { EventRescheduleSchema } from "../../validation";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
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
        date: true,
        time: true,
        organizationId: true,
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Calculate new date and time
    const newDate = date;
    const newTime = time || event.time;

    // Update the event
    const updatedEvent = await db.calendarEvent.update({
      where: {
        id: eventId,
        organizationId: orgId,
      },
      data: {
        date: newDate,
        time: newTime,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_RESCHEDULE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 