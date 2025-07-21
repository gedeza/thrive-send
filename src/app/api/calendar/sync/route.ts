import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CalendarIntegrationService } from '@/lib/services/calendar-integration';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.organizationMemberships.length === 0) {
      return NextResponse.json({ error: 'No organization membership' }, { status: 403 });
    }

    const organizationId = user.organizationMemberships[0].organizationId;

    // Run sync
    const result = await CalendarIntegrationService.syncContentToCalendar(organizationId);

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${result.created} events created`,
      ...result
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}