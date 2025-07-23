import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, dateRange } = body;

    if (!campaignId || !dateRange) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Generate dynamic audience insights data
    const audienceData = generateMockAudienceData(campaignId, dateRange);
    
    logger.info('Audience insights retrieved', {
      userId,
      campaignId,
      startDate: dateRange.start,
      endDate: dateRange.end,
      totalAudience: audienceData.total,
    });

    return NextResponse.json(audienceData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('Failed to get audience insights', error as Error);
    
    return NextResponse.json({
      error: 'Failed to retrieve audience insights',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function generateMockAudienceData(campaignId: string, dateRange: any) {
  // Use campaignId and dateRange to create variance in data
  const seed = campaignId.length + new Date(dateRange.start).getDate();
  const variance = (seed % 100) / 100;
  // Generate mock demographic data
  const demographics = {
    ageRanges: [
      { range: '18-24', percentage: 15 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 25 },
      { range: '45-54', percentage: 15 },
      { range: '55+', percentage: 10 }
    ],
    regions: [
      { region: 'North America', percentage: 55 },
      { region: 'Europe', percentage: 25 },
      { region: 'Asia', percentage: 12 },
      { region: 'South America', percentage: 5 },
      { region: 'Other', percentage: 3 }
    ],
    genders: [
      { gender: 'Male', percentage: 48 },
      { gender: 'Female', percentage: 51 },
      { gender: 'Non-binary', percentage: 1 }
    ],
    segments: [
      { name: 'Active Users', count: Math.floor(3000 + variance * 1000), percentage: 32.4 + variance * 5 },
      { name: 'New Subscribers', count: Math.floor(2000 + variance * 800), percentage: 21.5 + variance * 3 },
      { name: 'High Value', count: Math.floor(1700 + variance * 600), percentage: 18.0 + variance * 4 },
      { name: 'At Risk', count: Math.floor(1400 + variance * 400), percentage: 14.5 + variance * 2 },
      { name: 'Inactive', count: Math.floor(1300 + variance * 300), percentage: 13.6 + variance * 1 }
    ],
    interests: [
      { interest: 'Technology', percentage: 65 },
      { interest: 'Business', percentage: 58 },
      { interest: 'Marketing', percentage: 45 },
      { interest: 'Finance', percentage: 32 },
      { interest: 'Design', percentage: 28 }
    ]
  };

  // Generate mock behavioral data
  const behavioral = {
    devices: [
      { device: 'Mobile', percentage: 62 },
      { device: 'Desktop', percentage: 32 },
      { device: 'Tablet', percentage: 6 }
    ],
    timeSlots: [
      { slot: 'Morning', percentage: 28 },
      { slot: 'Afternoon', percentage: 35 },
      { slot: 'Evening', percentage: 32 },
      { slot: 'Night', percentage: 5 }
    ],
    contentTypes: [
      { type: 'Blog Posts', percentage: 45 },
      { type: 'Product Pages', percentage: 25 },
      { type: 'Videos', percentage: 18 },
      { type: 'Case Studies', percentage: 12 }
    ],
    openRate: 28.4 + variance * 10,
    clickRate: 12.7 + variance * 5,
    conversionRate: 3.2 + variance * 2,
    bounceRate: 24.5 - variance * 5,
    timeOnSite: Math.floor(145 + variance * 60) // seconds
  };

  // Generate mock engagement data
  const engagement = {
    score: 68.5 + variance * 15, // out of 100
    metrics: [
      { metric: 'Opens', total: 7850, percentage: 78.5 },
      { metric: 'Clicks', total: 3240, percentage: 32.4 },
      { metric: 'Conversions', total: 980, percentage: 9.8 }
    ],
    trends: generateEngagementTrends(),
    mostActiveSegment: 'High Value',
    totalAudienceSize: Math.floor(8000 + variance * 5000)
  };

  return {
    demographics,
    behavioral,
    engagement,
    total: Math.floor(8000 + variance * 5000),
    campaignId,
    dateRange
  };
}

function generateEngagementTrends() {
  const trends = [];
  const startDate = new Date('2023-11-01');
  const endDate = new Date('2023-11-30');
  
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / dayMilliseconds) + 1;
  
  // Create a baseline that will increase over time with some randomness
  let baseline = 60;
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * dayMilliseconds);
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Slight upward trend with random fluctuations
    baseline += 0.2;
    const randomFactor = Math.random() * 10 - 5; // +/- 5
    const value = Math.min(100, Math.max(0, baseline + randomFactor));
    
    trends.push({
      date: dateString,
      value: parseFloat(value.toFixed(1))
    });
  }
  
  return trends;
} 