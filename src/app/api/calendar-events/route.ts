import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from "zod";

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
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  type: z.enum(["email", "social", "blog", "other"]),
  status: z.enum(["draft", "scheduled", "sent", "failed"]),
  contentType: z.string().optional(),
});

// Helper function to get or create user
async function getOrCreateUser(clerkId: string, sessionClaims: ClerkSessionClaims | null) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      // Use a placeholder email if none is provided
      const email = sessionClaims?.email || `${clerkId}@placeholder.com`;
      const name = sessionClaims?.firstName || sessionClaims?.lastName 
        ? `${sessionClaims.firstName || ''} ${sessionClaims.lastName || ''}`.trim()
        : 'New User';

      console.log("Creating new user with data:", {
        clerkId,
        email,
        name,
      });

      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          name,
        },
      });
      console.log("Created new user:", user);
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
    console.log("GET /api/calendar-events - Starting request");
    const auth = getAuth(req);
    console.log("Full auth object:", JSON.stringify(auth, null, 2));
    const { userId: clerkId, orgId, sessionClaims } = auth;
    console.log("Auth check - clerkId:", clerkId, "orgId:", orgId);

    if (!clerkId || !orgId) {
      console.log("Auth check failed - Missing clerkId or orgId");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create the user
    const user = await getOrCreateUser(clerkId, sessionClaims as ClerkSessionClaims);
    console.log("User found/created:", JSON.stringify(user, null, 2));

    // Create organization if it doesn't exist
    let organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      const orgSlug = (sessionClaims as ClerkSessionClaims)?.o?.slg || `org-${orgId}`;
      console.log("Creating new organization with ID:", orgId);
      organization = await prisma.organization.create({
        data: {
          id: orgId,
          name: (sessionClaims as ClerkSessionClaims)?.o?.name || 'New Organization',
          slug: orgSlug,
        },
      });
      console.log("Created new organization:", organization);
    }

    console.log("Fetching events from database...");
    const events = await prisma.calendarEvent.findMany({
      where: { 
        userId: user.id, 
        organizationId: orgId 
      },
      orderBy: { date: 'asc' },
    });
    console.log("Found events:", JSON.stringify(events, null, 2));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error in GET /api/calendar-events:", error);
    const err = error as Error;
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err),
      stack: err.stack,
      name: err.name
    }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/calendar-events - Starting request");
    const auth = getAuth(req);
    console.log("Full auth object:", JSON.stringify(auth, null, 2));
    const { userId: clerkId, orgId } = auth;
    console.log("Auth check - clerkId:", clerkId, "orgId:", orgId);

    if (!clerkId || !orgId) {
      console.log("Auth check failed - Missing clerkId or orgId");
      return NextResponse.json({ error: 'Unauthorized', auth }, { status: 401 });
    }

    // Get the user from our database
    console.log("Looking up user in database with clerkId:", clerkId);
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("User found:", JSON.stringify(user, null, 2));
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    try {
      const validatedData = calendarEventSchema.parse(body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      // Add more detailed logging before database operation
      console.log("Attempting to create calendar event with data:", JSON.stringify({
        ...validatedData,
        userId: user.id,
        organizationId: orgId,
      }, null, 2));

      const event = await prisma.calendarEvent.create({
        data: {
          ...validatedData,
          userId: user.id,
          organizationId: orgId,
        },
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
    // Add more detailed error information
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err),
      stack: err.stack,
      name: err.name
    }, { status: 500 });
  }
}

// PUT: Update an event
export async function PUT(req: NextRequest) {
  try {
    console.log("PUT /api/calendar-events - Starting request");
    const auth = getAuth(req);
    console.log("Full auth object:", JSON.stringify(auth, null, 2));
    const { userId: clerkId, orgId } = auth;
    console.log("Auth check - clerkId:", clerkId, "orgId:", orgId);

    if (!clerkId || !orgId) {
      console.log("Auth check failed - Missing clerkId or orgId");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from our database
    console.log("Looking up user in database with clerkId:", clerkId);
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("User found:", JSON.stringify(user, null, 2));
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    if (!body.id) {
      console.log("Missing event ID in request body");
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    try {
      const validatedData = calendarEventSchema.parse(body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      const event = await prisma.calendarEvent.update({
        where: { id: body.id },
        data: {
          ...validatedData,
          userId: user.id,
          organizationId: orgId,
        },
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
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err),
      stack: err.stack,
      name: err.name
    }, { status: 500 });
  }
}

// DELETE: Delete an event by id (in body)
export async function DELETE(req: NextRequest) {
  try {
    console.log("DELETE /api/calendar-events - Starting request");
    const auth = getAuth(req);
    console.log("Full auth object:", JSON.stringify(auth, null, 2));
    const { userId: clerkId, orgId } = auth;
    console.log("Auth check - clerkId:", clerkId, "orgId:", orgId);

    if (!clerkId || !orgId) {
      console.log("Auth check failed - Missing clerkId or orgId");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from our database
    console.log("Looking up user in database with clerkId:", clerkId);
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("User found:", JSON.stringify(user, null, 2));
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    if (!body.id) {
      console.log("Missing event ID in request body");
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Verify the event belongs to the user
    const event = await prisma.calendarEvent.findUnique({
      where: { id: body.id },
    });

    if (!event) {
      console.log("Event not found");
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.userId !== user.id) {
      console.log("Event does not belong to user");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.calendarEvent.delete({
      where: { id: body.id },
    });
    console.log("Event deleted successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_DELETE] Error:", error);
    const err = error as Error;
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json({ 
      error: err.message, 
      detail: String(err),
      stack: err.stack,
      name: err.name
    }, { status: 500 });
  }
} 