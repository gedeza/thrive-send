import { NextRequest, NextResponse } from 'next/server';
import { deliveryTracker } from '@/lib/email/delivery-tracker';
import { logger } from '@/lib/utils/logger';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const campaignId = searchParams.get('campaignId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const stats = await deliveryTracker.getRealTimeStats(organizationId, campaignId || undefined);
    
    logger.info('Real-time delivery stats retrieved', {
      organizationId,
      campaignId,
      lastHourSent: stats.lastHour.totalSent,
    });

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    });

  } catch (error) {
    logger.error('Failed to get real-time delivery stats', error as Error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve real-time stats',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}