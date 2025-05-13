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
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Query content items for this user
    const items = await prisma.contentItem.findMany({
      where: { authorId: userId },
      orderBy: { scheduledFor: 'desc' },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error as Error);
  }
}

// POST /api/content-calendar - create a new content item (with auth)
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Create content item in database
    const created = await prisma.contentItem.create({
      data: {
        title: body.title,
        body: body.body ?? '',
        status: body.status ?? 'SCHEDULED',
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
        projectId: body.projectId,
        authorId: userId,
        organizationId: body.organizationId,
      },
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error as Error);
  }
}

// PUT /api/content-calendar/:id - update content item (with auth)
export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    // Update content item in database
    const updated = await prisma.contentItem.update({
      where: { 
        id: body.id,
        authorId: userId // Ensure user can only update their own content
      },
      data: {
        title: body.title,
        body: body.body,
        status: body.status,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error as Error);
  }
}

// Preview endpoint, e.g., /api/content-calendar/preview
// Implement as needed if rendering server-side previews.
