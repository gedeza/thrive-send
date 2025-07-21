import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Debug endpoint to check system status and recent content
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and organization info
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const organizationId = user.organizationMemberships[0]?.organizationId;

    // Get recent content (last 10 items)
    const recentContent = await prisma.content.findMany({
      where: {
        authorId: user.id
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        scheduledAt: true,
        publishedAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            email: true,
            organizationMemberships: {
              select: {
                organizationId: true
              }
            }
          }
        }
      }
    });

    // Get calendar events for this user's content
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        contentId: {
          in: recentContent.map(c => c.id)
        }
      },
      select: {
        id: true,
        title: true,
        contentId: true,
        status: true,
        startTime: true,
        endTime: true,
        createdAt: true,
        organizationId: true
      }
    });

    // Check organization member content
    if (organizationId) {
      const orgMembers = await prisma.organizationMember.findMany({
        where: { organizationId },
        select: { userId: true }
      });

      const orgMemberContent = await prisma.content.findMany({
        where: {
          authorId: { in: orgMembers.map(m => m.userId) }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          authorId: true,
          createdAt: true
        }
      });

      return NextResponse.json({
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          clerkId: user.clerkId,
          organizationId
        },
        recentContent: recentContent,
        calendarEvents: calendarEvents,
        organizationContent: orgMemberContent,
        summary: {
          totalUserContent: recentContent.length,
          totalCalendarEvents: calendarEvents.length,
          totalOrgContent: orgMemberContent.length,
          contentWithEvents: recentContent.filter(c => 
            calendarEvents.some(e => e.contentId === c.id)
          ).length
        }
      });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        clerkId: user.clerkId,
        organizationId: null
      },
      recentContent: recentContent,
      calendarEvents: calendarEvents,
      summary: {
        totalUserContent: recentContent.length,
        totalCalendarEvents: calendarEvents.length
      }
    });

  } catch (error) {
    console.error('Debug system status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}