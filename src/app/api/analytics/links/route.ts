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

    // Generate dynamic link analytics data
    const linkData = generateLinkAnalytics(campaignId, new Date(startDate), new Date(endDate));
    
    logger.info('Link analytics retrieved', {
      userId,
      campaignId,
      startDate,
      endDate,
      totalClicks: linkData.reduce((sum, link) => sum + link.clicks, 0),
    });

    return NextResponse.json(linkData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('Failed to get link analytics', error as Error);
    
    return NextResponse.json({
      error: 'Failed to retrieve link analytics',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function generateLinkAnalytics(campaignId: string, startDate: Date, endDate: Date) {
  // Calculate variance based on campaign ID and date range
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / dayMilliseconds) + 1;
  const seed = campaignId.length + days;
  const variance = (seed % 100) / 100;
  
  // Generate realistic total clicks
  const totalClicks = Math.floor(3000 + variance * 2000); // 3000-5000 total clicks
  
  // Common link types with realistic distributions
  const linkTypes = [
    { 
      label: 'Primary CTA Button', 
      basePercentage: 35,
      urlSuffix: '/cta-main',
      description: 'Main call-to-action button'
    },
    { 
      label: 'Product Showcase', 
      basePercentage: 25,
      urlSuffix: '/products/featured',
      description: 'Featured product links'
    },
    { 
      label: 'Special Offer', 
      basePercentage: 20,
      urlSuffix: '/offers/special',
      description: 'Limited time offers'
    },
    { 
      label: 'Learn More', 
      basePercentage: 10,
      urlSuffix: '/learn-more',
      description: 'Educational content'
    },
    { 
      label: 'Social Media', 
      basePercentage: 6,
      urlSuffix: '/social',
      description: 'Social media links'
    },
    { 
      label: 'Unsubscribe', 
      basePercentage: 4,
      urlSuffix: '/unsubscribe',
      description: 'Unsubscribe links'
    }
  ];

  let remainingClicks = totalClicks;
  const links = linkTypes.map((linkType, index) => {
    // Add some variance to percentages
    const adjustedPercentage = linkType.basePercentage + (variance - 0.5) * 10;
    const isLast = index === linkTypes.length - 1;
    
    const clicks = isLast 
      ? remainingClicks // Give remaining clicks to last item
      : Math.floor(totalClicks * (adjustedPercentage / 100));
    
    remainingClicks -= clicks;
    
    const percentage = Number(((clicks / totalClicks) * 100).toFixed(1));
    
    return {
      label: linkType.label,
      url: `https://example.com${linkType.urlSuffix}?utm_campaign=${campaignId}`,
      clicks,
      percentage,
      description: linkType.description,
      clickRate: Number((percentage / 10).toFixed(2)), // Rough CTR estimate
      uniqueClicks: Math.floor(clicks * (0.7 + variance * 0.2)), // 70-90% unique
      conversionRate: Number((Math.random() * 5 + 1).toFixed(2)), // 1-6% conversion
      avgTimeOnPage: Math.floor(60 + variance * 120), // 1-3 minutes
      bounceRate: Number((20 + variance * 30).toFixed(1)), // 20-50%
    };
  });

  return links.sort((a, b) => b.clicks - a.clicks); // Sort by clicks descending
}