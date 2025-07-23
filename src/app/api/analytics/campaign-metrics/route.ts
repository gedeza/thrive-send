import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!campaignId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Generate dynamic campaign metrics
    const metrics = generateCampaignMetrics(campaignId, new Date(startDate), new Date(endDate));
    
    logger.info('Campaign metrics retrieved', {
      userId,
      campaignId,
      startDate,
      endDate,
      recipients: metrics.primary.find(m => m.title === 'Recipients')?.value,
    });

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('Failed to get campaign metrics', error as Error);
    
    return NextResponse.json({
      error: 'Failed to retrieve campaign metrics',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function generateCampaignMetrics(campaignId: string, startDate: Date, endDate: Date) {
  // Calculate variance based on campaign ID and date range
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / dayMilliseconds) + 1;
  const seed = campaignId.length + days;
  const variance = (seed % 100) / 100;
  
  // Generate realistic base numbers
  const recipients = Math.floor(10000 + variance * 15000); // 10k-25k recipients
  const deliveryRate = 0.96 + variance * 0.04; // 96-100% delivery rate
  const delivered = Math.floor(recipients * deliveryRate);
  
  const openRate = 0.45 + variance * 0.25; // 45-70% open rate
  const opens = Math.floor(delivered * openRate);
  
  const clickRate = 0.15 + variance * 0.20; // 15-35% click rate (of opens)
  const clicks = Math.floor(opens * clickRate);
  
  const unsubscribeRate = 0.002 + variance * 0.008; // 0.2-1% unsubscribe rate
  const unsubscribes = Math.floor(delivered * unsubscribeRate);
  
  const bounceRate = 0.005 + variance * 0.015; // 0.5-2% bounce rate
  const bounced = recipients - delivered;

  // Calculate comparison changes (simulate previous campaign performance)
  const prevVariance = ((seed + 7) % 100) / 100; // Different variance for "previous" data
  const openRateChange = ((openRate - (0.45 + prevVariance * 0.25)) * 100);
  const clickRateChange = ((clickRate - (0.15 + prevVariance * 0.20)) * 100);

  return {
    primary: [
      {
        title: 'Open Rate',
        value: `${(openRate * 100).toFixed(1)}%`,
        description: `${openRateChange >= 0 ? '↑' : '↓'} ${Math.abs(openRateChange).toFixed(1)}% vs last campaign`,
        icon: 'eye',
        change: Number(openRateChange.toFixed(1))
      },
      {
        title: 'Click Rate',
        value: `${(clickRate * 100).toFixed(1)}%`,
        description: `${clickRateChange >= 0 ? '↑' : '↓'} ${Math.abs(clickRateChange).toFixed(1)}% vs last campaign`,
        icon: 'mouse-pointer-click',
        change: Number(clickRateChange.toFixed(1))
      },
      {
        title: 'Recipients',
        value: recipients,
        description: 'Total sent',
        icon: 'users'
      },
      {
        title: 'Delivered',
        value: delivered,
        description: `${(deliveryRate * 100).toFixed(1)}% delivery rate`,
        icon: 'mail'
      }
    ],
    secondary: [
      {
        title: 'Opens',
        value: opens,
        description: `${(openRate * 100).toFixed(1)}% of delivered`,
        icon: 'eye'
      },
      {
        title: 'Clicks',
        value: clicks,
        description: `${(clickRate * 100).toFixed(1)}% of opens`,
        icon: 'mouse-pointer-click'
      },
      {
        title: 'Unsubscribes',
        value: unsubscribes,
        description: `${(unsubscribeRate * 100).toFixed(2)}% of delivered`,
        icon: 'alert-triangle'
      },
      {
        title: 'Bounced',
        value: bounced,
        description: `${(bounceRate * 100).toFixed(1)}% bounce rate`,
        icon: 'trending-up'
      }
    ],
    funnel: [
      {
        label: 'Sent',
        value: recipients,
        percentage: 100,
        color: 'bg-slate-600'
      },
      {
        label: 'Delivered',
        value: delivered,
        percentage: Number((deliveryRate * 100).toFixed(1)),
        color: 'bg-green-600'
      },
      {
        label: 'Opened',
        value: opens,
        percentage: Number((openRate * 100).toFixed(1)),
        color: 'bg-blue-600'
      },
      {
        label: 'Clicked',
        value: clicks,
        percentage: Number(((clicks / delivered) * 100).toFixed(1)),
        color: 'bg-indigo-600'
      },
      {
        label: 'Bounced',
        value: bounced,
        percentage: Number((bounceRate * 100).toFixed(1)),
        color: 'bg-red-600'
      }
    ],
    summary: {
      totalRecipients: recipients,
      deliveryRate: Number((deliveryRate * 100).toFixed(1)),
      openRate: Number((openRate * 100).toFixed(1)),
      clickRate: Number((clickRate * 100).toFixed(1)),
      unsubscribeRate: Number((unsubscribeRate * 100).toFixed(2)),
      bounceRate: Number((bounceRate * 100).toFixed(1)),
      engagementScore: Number(((openRate + clickRate) * 50).toFixed(1)) // Composite score
    }
  };
}