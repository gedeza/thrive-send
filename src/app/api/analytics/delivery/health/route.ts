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

    const healthScore = await deliveryTracker.getDeliveryHealthScore(
      organizationId,
      campaignId || undefined
    );

    const systemHealth = await deliveryTracker.healthCheck();
    
    logger.info('Delivery health score calculated', {
      organizationId,
      campaignId,
      score: healthScore.score,
      systemHealthy: systemHealth.healthy,
    });

    return NextResponse.json({
      success: true,
      data: {
        healthScore,
        systemHealth,
      },
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (_error) {
    logger.error('Failed to get delivery health score', error as Error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve health score',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}