import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const campaignId = body.campaignId;
    const dateRange = body.dateRange;
    
    if (!campaignId) {
      return new NextResponse('Campaign ID is required', { status: 400 });
    }

    // Check if the campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return new NextResponse('Campaign not found', { status: 404 });
    }

    // Return mock data for development
    const mockData = generateMockAudienceData();
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error in audience segments API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function generateMockAudienceData() {
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
      { name: 'Active Users', count: 3240, percentage: 32.4 },
      { name: 'New Subscribers', count: 2150, percentage: 21.5 },
      { name: 'High Value', count: 1800, percentage: 18.0 },
      { name: 'At Risk', count: 1450, percentage: 14.5 },
      { name: 'Inactive', count: 1360, percentage: 13.6 }
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
    openRate: 28.4,
    clickRate: 12.7,
    conversionRate: 3.2,
    bounceRate: 24.5,
    timeOnSite: 145 // seconds
  };

  // Generate mock engagement data
  const engagement = {
    score: 68.5, // out of 100
    metrics: [
      { metric: 'Opens', total: 7850, percentage: 78.5 },
      { metric: 'Clicks', total: 3240, percentage: 32.4 },
      { metric: 'Conversions', total: 980, percentage: 9.8 }
    ],
    trends: generateEngagementTrends(),
    mostActiveSegment: 'High Value',
    totalAudienceSize: 10000
  };

  return {
    demographics,
    behavioral,
    engagement
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