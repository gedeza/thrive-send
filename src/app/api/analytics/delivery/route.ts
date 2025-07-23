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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const granularity = searchParams.get('granularity') as 'hour' | 'day' | 'week' | 'month' || 'day';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const options: any = { granularity };
    if (campaignId) options.campaignId = campaignId;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    const analytics = await deliveryTracker.getAnalytics(organizationId, options);
    
    logger.info('Delivery analytics retrieved', {
      organizationId,
      campaignId,
      timeRange: `${options.startDate?.toISOString()} - ${options.endDate?.toISOString()}`,
    });

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('Failed to get delivery analytics', error as Error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve analytics',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}