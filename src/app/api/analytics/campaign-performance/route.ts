import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!campaignId || !startDate || !endDate) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Check if the campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return new NextResponse('Campaign not found', { status: 404 });
    }

    // For development, return mock data
    // In production, replace this with actual database queries
    const mockData = generateMockPerformanceData(campaign.id, new Date(startDate), new Date(endDate));
    
    return NextResponse.json(mockData);
  } catch (_error) {
    console.error("", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function generateMockPerformanceData(campaignId: string, startDate: Date, endDate: Date) {
  // Generate daily metrics for the given date range
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / dayMilliseconds) + 1;
  
  // Base metrics that will be randomized
  const baseMetrics = {
    impressions: 5000,
    clicks: 750,
    conversions: 120,
    investment: 1000,
    revenue: 3500
  };

  // Generate daily data points
  const timeSeriesData = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * dayMilliseconds);
    
    // Randomize metrics with some variance
    const variance = 0.3; // 30% variance
    const randomFactor = () => 1 + (Math.random() * 2 - 1) * variance;
    
    const impressions = Math.floor(baseMetrics.impressions * randomFactor());
    const clicks = Math.floor(baseMetrics.clicks * randomFactor());
    const conversions = Math.floor(baseMetrics.conversions * randomFactor());
    const investment = Math.floor(baseMetrics.investment * randomFactor());
    const revenue = Math.floor(baseMetrics.revenue * randomFactor());
    
    timeSeriesData.push({
      date: currentDate.toISOString().split('T')[0],
      impressions,
      clicks,
      conversions,
      investment,
      revenue,
      engagementRate: (clicks / impressions) * 100,
      conversionRate: (conversions / clicks) * 100,
      roi: ((revenue - investment) / investment) * 100,
      channel: Math.random() > 0.7 ? 'Email' : 'Social'
    });
  }

  // Calculate totals for summary metrics
  const totals = timeSeriesData.reduce((acc, day) => {
    return {
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      conversions: acc.conversions + day.conversions,
      investment: acc.investment + day.investment,
      revenue: acc.revenue + day.revenue
    };
  }, { impressions: 0, clicks: 0, conversions: 0, investment: 0, revenue: 0 });

  // Format the summary metrics
  const metrics = [
    { title: 'Impressions', value: totals.impressions, percentChange: 12.5 },
    { title: 'Clicks', value: totals.clicks, percentChange: 8.3 },
    { title: 'Conversions', value: totals.conversions, percentChange: 15.2 },
    { title: 'Investment', value: totals.investment, percentChange: 0 },
    { title: 'Revenue', value: totals.revenue, percentChange: 22.7 },
    { title: 'ROI', value: ((totals.revenue - totals.investment) / totals.investment) * 100, percentChange: 14.2 },
  ];

  return [{
    id: campaignId,
    metrics,
    timeSeriesData: {
      datasets: [{
        data: timeSeriesData
      }]
    },
    channelBreakdown: [
      { channel: 'Email', value: 65 },
      { channel: 'Social', value: 35 }
    ],
    deviceBreakdown: [
      { device: 'Mobile', value: 48 },
      { device: 'Desktop', value: 42 },
      { device: 'Tablet', value: 10 }
    ]
  }];
} 