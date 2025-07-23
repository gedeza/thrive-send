import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Ultra-simple validation
const SimpleContentSchema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().min(1, 'Content required'),
  type: z.enum(['SOCIAL', 'BLOG', 'EMAIL', 'ARTICLE']).default('SOCIAL'),
  scheduledAt: z.string().optional()
});

export async function POST(request: Request) {
  try {
    console.log('🚀 Simple Content API: Starting request...');
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const organizationId = user.organizationMemberships[0]?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 403 });
    }

    // Parse request
    const body = await request.json();
    console.log('📝 Simple Content API: Request data:', body);
    
    const data = SimpleContentSchema.parse(body);

    // Create content - SIMPLE!
    const content = await prisma.content.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        status: 'DRAFT',
        slug: `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        tags: [],
        platforms: [],
        authorId: user.id,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      }
    });

    console.log('✅ Simple Content API: Content created:', content.id);

    // Create calendar event - SIMPLE!
    if (data.type === 'SOCIAL' || data.scheduledAt) {
      try {
        const startTime = data.scheduledAt ? new Date(data.scheduledAt) : new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const calendarEvent = await prisma.calendarEvent.create({
          data: {
            title: data.title,
            description: data.content.substring(0, 100),
            contentId: content.id,
            type: data.type.toLowerCase(),
            status: data.scheduledAt ? 'scheduled' : 'draft',
            startTime,
            endTime,
            organizationId,
            createdBy: user.id,
            analytics: {
              views: 0,
              engagement: { likes: 0, shares: 0, comments: 0 },
              clicks: 0,
              lastUpdated: new Date().toISOString()
            }
          }
        });

        console.log('📅 Simple Content API: Calendar event created:', calendarEvent.id);
      } catch (calendarError) {
        console.warn('Calendar creation failed but continuing:', calendarError);
      }
    }

    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        title: content.title,
        type: content.type,
        status: content.status,
        createdAt: content.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Simple Content API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true }
    });

    if (!user?.organizationMemberships.length) {
      return NextResponse.json({ content: [] });
    }

    const organizationId = user.organizationMemberships[0].organizationId;
    const orgMembers = await prisma.organizationMember.findMany({
      where: { organizationId },
      select: { userId: true }
    });

    const content = await prisma.content.findMany({
      where: {
        authorId: { in: orgMembers.map(m => m.userId) }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        scheduledAt: true,
        publishedAt: true,
        content: true,
        tags: true,
        platforms: true,
        authorId: true
      }
    });

    return NextResponse.json({ content });

  } catch (error) {
    console.error('❌ Simple Content GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}