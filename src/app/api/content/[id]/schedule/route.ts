import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NotificationService } from '@/lib/services/notification-service';

// Validation schemas
const scheduleSchema = z.object({
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  timezone: z.string().default('UTC'),
  recurrence: z.record(z.any()).optional(),
});

// GET /api/content/[id]/schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { contentId: params.id },
    });

    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content/[id]/schedule
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
    const { frequency, startDate, endDate, timezone, recurrence } = scheduleSchema.parse(body);

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

    // Create or update schedule
    const schedule = await prisma.schedule.upsert({
      where: { contentId: params.id },
      create: {
        contentId: params.id,
        frequency,
        startDate,
        endDate,
        timezone,
        recurrence,
        nextScheduled: startDate,
      },
      update: {
        frequency,
        startDate,
        endDate,
        timezone,
        recurrence,
        nextScheduled: startDate,
      },
    });

    // Update content status
    await prisma.content.update({
      where: { id: params.id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: startDate,
      },
    });

    // Send notification
    await NotificationService.notifyContentScheduled(params.id, userId);

    return NextResponse.json(schedule);
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/content/[id]/schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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

    // Delete schedule
    await prisma.schedule.delete({
      where: { contentId: params.id },
    });

    // Update content status
    await prisma.content.update({
      where: { id: params.id },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
      },
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 