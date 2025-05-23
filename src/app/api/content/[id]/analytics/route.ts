import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const analyticsUpdateSchema = z.object({
  views: z.number().optional(),
  likes: z.number().optional(),
  shares: z.number().optional(),
  comments: z.number().optional(),
  engagementRate: z.number().optional(),
  conversionRate: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/content/[id]/analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await prisma.contentAnalytics.findUnique({
      where: { contentId: params.id },
    });

    if (!analytics) {
      return NextResponse.json({ message: 'Analytics not found' }, { status: 404 });
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content/[id]/analytics
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const analyticsData = analyticsUpdateSchema.parse(body);

    // Check if content exists and user has permission
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    if (content.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Create or update analytics
    const analytics = await prisma.contentAnalytics.upsert({
      where: { contentId: params.id },
      create: {
        contentId: params.id,
        ...analyticsData,
      },
      update: analyticsData,
    });

    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 