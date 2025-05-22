import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { z } from "zod";
import { Prisma } from '@prisma/client';

// Types for session claims
interface ClerkSessionClaims {
  email?: string;
  firstName?: string;
  lastName?: string;
  o?: {
    id: string;
    name?: string;
    slg?: string;
    rol?: string;
  };
}

// Validation schema for calendar events
const calendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  type: z.enum(["email", "social", "blog", "other"]),
  status: z.enum(["draft", "scheduled", "sent", "failed"]),
  contentType: z.string().optional(),
  socialMediaContent: z.object({
    platforms: z.array(z.enum(["FACEBOOK", "TWITTER", "INSTAGRAM", "LINKEDIN"])),
    crossPost: z.boolean(),
    mediaUrls: z.array(z.string()),
    platformSpecificContent: z.record(z.object({
      text: z.string(),
      mediaUrls: z.array(z.string()),
      scheduledTime: z.string().optional()
    }))
  }).optional()
});

// Helper function to get or create user
async function getOrCreateUser(clerkId: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@placeholder.com`,
          name: 'New User',
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}

// GET: List all events for the user/org
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const events = await (prisma as any).calendarEvent.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    try {
      const validatedData = calendarEventSchema.parse(body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      const user = await getOrCreateUser(session.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get the user's organization
      const orgMember = await prisma.organizationMember.findFirst({
        where: { userId: user.id },
      });

      if (!orgMember) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      // Prepare the data for Prisma
      const { socialMediaContent, ...rest } = validatedData;
      const eventData = {
        ...rest,
        userId: user.id,
        organizationId: orgMember.organizationId,
        socialMediaContent: socialMediaContent as Prisma.JsonValue,
      };

      console.log("Event data for Prisma:", JSON.stringify(eventData, null, 2));

      const event = await (prisma as any).calendarEvent.create({
        data: eventData,
      });

      console.log("Created event:", JSON.stringify(event, null, 2));
      return NextResponse.json(event);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: 'Invalid request data', 
          details: validationError.errors 
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error("[CALENDAR_EVENTS_POST] Error:", error);
    const err = error as Error;
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err)
    }, { status: 500 });
  }
}

// PUT: Update an event
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Update request body:", JSON.stringify(body, null, 2));

    try {
      const validatedData = calendarEventSchema.parse(body);
      console.log("Validated update data:", JSON.stringify(validatedData, null, 2));

      const user = await getOrCreateUser(session.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if event exists and belongs to user
      const existingEvent = await (prisma as any).calendarEvent.findUnique({
        where: {
          id: body.id,
          userId: user.id,
        },
      });

      if (!existingEvent) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Prepare the data for Prisma
      const { socialMediaContent, ...rest } = validatedData;
      const eventData = {
        ...rest,
        socialMediaContent: socialMediaContent as Prisma.JsonValue,
      };

      console.log("Event data for Prisma update:", JSON.stringify(eventData, null, 2));

      const event = await (prisma as any).calendarEvent.update({
        where: {
          id: body.id,
          userId: user.id,
        },
        data: eventData,
      });

      console.log("Updated event:", JSON.stringify(event, null, 2));
      return NextResponse.json(event);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: 'Invalid request data', 
          details: validationError.errors 
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error("[CALENDAR_EVENTS_PUT] Error:", error);
    const err = error as Error;
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err)
    }, { status: 500 });
  }
}

// DELETE: Delete an event by id (in body)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    const user = await getOrCreateUser(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if event exists and belongs to user
    const existingEvent = await (prisma as any).calendarEvent.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await (prisma as any).calendarEvent.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_DELETE] Error:", error);
    const err = error as Error;
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err)
    }, { status: 500 });
  }
} 