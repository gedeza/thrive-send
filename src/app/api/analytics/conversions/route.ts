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
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Generate mock conversion metrics data
    // In production, replace with actual database queries
    const mockConversionData = generateMockConversionData(new Date(startDate), new Date(endDate));
    
    logger.info('Conversion metrics retrieved', {
      userId,
      startDate,
      endDate,
      totalConversions: mockConversionData.totalConversions,
    });

    return NextResponse.json(mockConversionData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('Failed to get conversion metrics', error as Error);
    
    return NextResponse.json({
      error: 'Failed to retrieve conversion metrics',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function generateMockConversionData(startDate: Date, endDate: Date) {
  // Calculate days in range
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / dayMilliseconds) + 1;

  // Generate base conversion metrics
  const baseConversions = Math.floor(Math.random() * 500) + 100;
  const baseRevenue = Math.floor(Math.random() * 50000) + 10000;
  const baseAOV = baseRevenue / baseConversions;

  // Generate campaign-specific data
  const campaignData = Array.from({ length: 5 }, (_, i) => ({
    campaignId: `campaign-${i + 1}`,
    campaignName: [
      'Black Friday Sale',
      'Newsletter Campaign',
      'Product Launch',
      'Welcome Series',
      'Re-engagement Campaign'
    ][i],
    conversions: Math.floor(baseConversions * (0.1 + Math.random() * 0.3)),
    revenue: Math.floor(baseRevenue * (0.1 + Math.random() * 0.3)),
  }));

  // Attribution models data
  const attributionModels = {
    firstClick: {
      channels: [
        { name: 'Email', value: 45, conversions: Math.floor(baseConversions * 0.45), revenue: Math.floor(baseRevenue * 0.45) },
        { name: 'Social Media', value: 30, conversions: Math.floor(baseConversions * 0.30), revenue: Math.floor(baseRevenue * 0.30) },
        { name: 'Paid Search', value: 15, conversions: Math.floor(baseConversions * 0.15), revenue: Math.floor(baseRevenue * 0.15) },
        { name: 'Direct', value: 10, conversions: Math.floor(baseConversions * 0.10), revenue: Math.floor(baseRevenue * 0.10) },
      ]
    },
    lastClick: {
      channels: [
        { name: 'Email', value: 40, conversions: Math.floor(baseConversions * 0.40), revenue: Math.floor(baseRevenue * 0.40) },
        { name: 'Social Media', value: 25, conversions: Math.floor(baseConversions * 0.25), revenue: Math.floor(baseRevenue * 0.25) },
        { name: 'Paid Search', value: 20, conversions: Math.floor(baseConversions * 0.20), revenue: Math.floor(baseRevenue * 0.20) },
        { name: 'Direct', value: 15, conversions: Math.floor(baseConversions * 0.15), revenue: Math.floor(baseRevenue * 0.15) },
      ]
    },
    multiTouch: {
      channels: [
        { name: 'Email', value: 35, conversions: Math.floor(baseConversions * 0.35), revenue: Math.floor(baseRevenue * 0.35) },
        { name: 'Social Media', value: 25, conversions: Math.floor(baseConversions * 0.25), revenue: Math.floor(baseRevenue * 0.25) },
        { name: 'Paid Search', value: 25, conversions: Math.floor(baseConversions * 0.25), revenue: Math.floor(baseRevenue * 0.25) },
        { name: 'Direct', value: 15, conversions: Math.floor(baseConversions * 0.15), revenue: Math.floor(baseRevenue * 0.15) },
      ]
    }
  };

  // Generate time series data
  const conversionTimeSeries = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate.getTime() + i * dayMilliseconds);
    const dailyConversions = Math.floor((baseConversions / days) * (0.7 + Math.random() * 0.6));
    const dailyRevenue = Math.floor(dailyConversions * baseAOV * (0.8 + Math.random() * 0.4));
    
    return {
      date: date.toISOString().split('T')[0],
      conversions: dailyConversions,
      revenue: dailyRevenue,
      conversionRate: (Math.random() * 5 + 1).toFixed(2), // 1-6%
    };
  });

  // Calculate totals
  const totalConversions = conversionTimeSeries.reduce((sum, day) => sum + day.conversions, 0);
  const totalRevenue = conversionTimeSeries.reduce((sum, day) => sum + day.revenue, 0);

  return {
    totalConversions,
    conversionRate: ((totalConversions / (totalConversions * 20)) * 100).toFixed(2), // Mock calculation
    revenue: totalRevenue,
    averageOrderValue: totalRevenue / totalConversions,
    byCampaign: campaignData,
    models: attributionModels,
    timeSeries: conversionTimeSeries,
    conversionFunnel: [
      { stage: 'Visitors', count: totalConversions * 50, percentage: 100 },
      { stage: 'Engaged Users', count: totalConversions * 10, percentage: 20 },
      { stage: 'Qualified Leads', count: totalConversions * 5, percentage: 10 },
      { stage: 'Opportunities', count: totalConversions * 2, percentage: 4 },
      { stage: 'Conversions', count: totalConversions, percentage: 2 },
    ],
    topConvertingContent: [
      { contentId: 'content-1', title: 'Black Friday Landing Page', conversions: Math.floor(totalConversions * 0.3) },
      { contentId: 'content-2', title: 'Product Demo Video', conversions: Math.floor(totalConversions * 0.25) },
      { contentId: 'content-3', title: 'Customer Testimonials', conversions: Math.floor(totalConversions * 0.2) },
      { contentId: 'content-4', title: 'Pricing Page', conversions: Math.floor(totalConversions * 0.15) },
      { contentId: 'content-5', title: 'Contact Form', conversions: Math.floor(totalConversions * 0.1) },
    ]
  };
}