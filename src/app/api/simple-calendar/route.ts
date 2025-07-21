import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('📅 Simple Calendar API: Fetching events...');
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true }
    });

    if (!user?.organizationMemberships.length) {
      return NextResponse.json({ events: [] });
    }

    const organizationId = user.organizationMemberships[0].organizationId;

    // Get calendar events with linked content
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        organizationId
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            content: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(`✅ Simple Calendar API: Found ${calendarEvents.length} events`);

    // Transform to simple format
    const events = calendarEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      contentId: event.contentId,
      content: event.content ? {
        id: event.content.id,
        title: event.content.title,
        type: event.content.type,
        status: event.content.status
      } : null,
      // Transform for calendar component compatibility
      start: event.startTime.toISOString(),
      end: event.endTime.toISOString(),
      allDay: false,
      color: getEventColor(event.type, event.status)
    }));

    return NextResponse.json({ events });

  } catch (error) {
    console.error('❌ Simple Calendar API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getEventColor(type: string, status: string): string {
  // Simple color mapping
  if (status === 'scheduled') return '#3b82f6'; // blue
  if (status === 'draft') return '#6b7280'; // gray
  if (status === 'sent') return '#10b981'; // green
  
  // Type-based colors as fallback
  switch (type) {
    case 'social': return '#8b5cf6'; // purple
    case 'blog': return '#f59e0b'; // amber
    case 'email': return '#ef4444'; // red
    case 'article': return '#06b6d4'; // cyan
    default: return '#6b7280'; // gray
  }
}