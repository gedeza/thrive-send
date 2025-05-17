import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

// Error handling middleware
function handleApiError(error: Error) {
  console.error('API Error:', error);
  
  if (error.message === 'Unauthorized') {
    return NextResponse.json(
      { error: 'You do not have permission to perform this action' },
      { status: 403 }
    );
  }
  
  // Handle Prisma specific errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return NextResponse.json(
      { error: 'Database operation failed', detail: String(error) },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'An unexpected error occurred', detail: String(error) },
    { status: 500 }
  );
}

// GET /api/content-calendar - fetch all content items (with auth)
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await prisma.contentPiece.findMany({
      where: {
        authorId: userId,
        organizationId: orgId,
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    // Format the response to match what the frontend expects
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.content || "",
      date: event.scheduledFor ? new Date(event.scheduledFor).toISOString().split("T")[0] : "",
      time: event.scheduledFor ? new Date(event.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
      type: event.contentType || "email",
      status: (event.status || "scheduled").toLowerCase(),
      campaignId: event.campaignId || undefined,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching content calendar events:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/content-calendar - create a new content item (with auth)
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, time, type, status, campaignId } = body;

    const scheduledFor = new Date(`${date}T${time || "00:00"}`);

    const event = await prisma.contentPiece.create({
      data: {
        title,
        content: description,
        scheduledFor,
        contentType: type,
        status,
        campaignId,
        authorId: userId,
        organizationId: orgId,
        mediaUrls: [],
      },
    });

    // Format the response to match what the frontend expects
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.content || "",
      date: event.scheduledFor ? new Date(event.scheduledFor).toISOString().split("T")[0] : "",
      time: event.scheduledFor ? new Date(event.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
      type: event.contentType || "email",
      status: (event.status || "scheduled").toLowerCase(),
      campaignId: event.campaignId || undefined,
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("Error creating content calendar event:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/content-calendar/:id - update content item (with auth)
export async function PUT(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    // Update content item in database
    const updated = await prisma.contentPiece.update({
      where: { 
        id: body.id,
        authorId: userId, // Ensure user can only update their own content
        organizationId: orgId, // Ensure content belongs to the organization
      },
      data: {
        title: body.title,
        content: body.description,
        status: body.status,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
        contentType: body.type,
        campaignId: body.campaignId,
      },
    });
    
    // Format the response to match what the frontend expects
    const formattedEvent = {
      id: updated.id,
      title: updated.title,
      description: updated.content || "",
      date: updated.scheduledFor ? new Date(updated.scheduledFor).toISOString().split("T")[0] : "",
      time: updated.scheduledFor ? new Date(updated.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
      type: updated.contentType || "email",
      status: (updated.status || "scheduled").toLowerCase(),
      campaignId: updated.campaignId || undefined,
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    return handleApiError(error as Error);
  }
}

// Preview endpoint, e.g., /api/content-calendar/preview
// Implement as needed if rendering server-side previews.
