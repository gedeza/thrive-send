import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, subWeeks, subMonths, subYears, format, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsRequest {
  timeframe: 'day' | 'week' | 'month' | 'year';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  campaign?: string;
  platform?: string;
  include: {
    metrics?: boolean;
    charts?: boolean;
    audience?: boolean;
    engagement?: boolean;
    revenue?: boolean;
  };
}

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizationMemberships: {
        include: {
          organization: true
        }
      }
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

async function getAnalyticsMetrics(
  organizationIds: string[],
  startDate: Date,
  endDate: Date,
  platform?: string
) {
  // Get current period analytics
  const currentAnalytics = await prisma.analytics.findMany({
    where: {
      organizationId: { in: organizationIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      },
      ...(platform && { platform })
    }
  });

  // Get previous period for comparison
  const periodLength = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - periodLength);
  const prevEndDate = new Date(endDate.getTime() - periodLength);

  const previousAnalytics = await prisma.analytics.findMany({
    where: {
      organizationId: { in: organizationIds },
      timestamp: {
        gte: prevStartDate,
        lte: prevEndDate
      },
      ...(platform && { platform })
    }
  });

  // Calculate current metrics
  const totalViews = currentAnalytics.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalReach = currentAnalytics.reduce((sum, a) => sum + (a.reach || 0), 0);
  const totalConversions = currentAnalytics.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const totalEngagement = currentAnalytics.reduce((sum, a) => 
    sum + (a.likes || 0) + (a.shares || 0) + (a.comments || 0), 0
  );

  // Calculate previous metrics for comparison
  const prevTotalViews = previousAnalytics.reduce((sum, a) => sum + (a.views || 0), 0);
  const prevTotalReach = previousAnalytics.reduce((sum, a) => sum + (a.reach || 0), 0);
  const prevTotalConversions = previousAnalytics.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const prevTotalEngagement = previousAnalytics.reduce((sum, a) => 
    sum + (a.likes || 0) + (a.shares || 0) + (a.comments || 0), 0
  );

  // Calculate percentage changes
  const viewsChange = prevTotalViews > 0 ? ((totalViews - prevTotalViews) / prevTotalViews) * 100 : 0;
  const reachChange = prevTotalReach > 0 ? ((totalReach - prevTotalReach) / prevTotalReach) * 100 : 0;
  const conversionsChange = prevTotalConversions > 0 ? ((totalConversions - prevTotalConversions) / prevTotalConversions) * 100 : 0;
  const engagementChange = prevTotalEngagement > 0 ? ((totalEngagement - prevTotalEngagement) / prevTotalEngagement) * 100 : 0;

  const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) + '%' : '0%';

  return {
    totalViews,
    totalReach,
    totalConversions,
    engagementRate,
    viewsChange: Math.round(viewsChange * 10) / 10,
    reachChange: Math.round(reachChange * 10) / 10,
    conversionsChange: Math.round(conversionsChange * 10) / 10,
    engagementChange: Math.round(engagementChange * 10) / 10
  };
}

async function getChartData(
  organizationIds: string[],
  startDate: Date,
  endDate: Date,
  timeframe: string,
  platform?: string
) {
  const analytics = await prisma.analytics.findMany({
    where: {
      organizationId: { in: organizationIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      },
      ...(platform && { platform })
    },
    orderBy: { timestamp: 'asc' }
  });

  // Group data by time periods
  const groupedData = new Map();
  
  analytics.forEach(record => {
    let key: string;
    switch (timeframe) {
      case 'day':
        key = format(record.timestamp, 'MMM dd');
        break;
      case 'week':
        key = format(record.timestamp, 'MMM dd');
        break;
      case 'month':
        key = format(record.timestamp, 'MMM yyyy');
        break;
      case 'year':
        key = format(record.timestamp, 'yyyy');
        break;
      default:
        key = format(record.timestamp, 'MMM dd');
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, {
        name: key,
        views: 0,
        engagement: 0,
        conversions: 0,
        reach: 0
      });
    }

    const existing = groupedData.get(key);
    existing.views += record.views || 0;
    existing.engagement += (record.likes || 0) + (record.shares || 0) + (record.comments || 0);
    existing.conversions += record.conversions || 0;
    existing.reach += record.reach || 0;
  });

  const performanceTrend = Array.from(groupedData.values());

  // Platform performance
  const platformData = new Map();
  analytics.forEach(record => {
    const platform = record.platform || 'unknown';
    if (!platformData.has(platform)) {
      platformData.set(platform, {
        name: platform,
        value: 0
      });
    }
    platformData.get(platform).value += record.views || 0;
  });

  const platformPerformance = Array.from(platformData.values());

  // Activity heatmap (simplified - you can enhance this)
  const activityHeatmap = [];
  for (let i = 0; i < 365; i++) {
    const date = subDays(new Date(), i);
    const dayAnalytics = analytics.filter(a => 
      format(a.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const totalActivity = dayAnalytics.reduce((sum, a) => 
      sum + (a.views || 0) + (a.likes || 0) + (a.shares || 0), 0
    );
    
    activityHeatmap.push({
      day: format(date, 'EEE'),
      week: Math.floor(i / 7),
      value: Math.min(Math.floor(totalActivity / 100), 4), // Scale to 0-4
      date: format(date, 'MMM dd, yyyy')
    });
  }

  return {
    performanceTrend,
    platformPerformance,
    activityHeatmap: activityHeatmap.reverse() // Most recent first
  };
}

async function getAudienceData(
  organizationIds: string[],
  startDate: Date,
  endDate: Date
) {
  // This would typically come from user tracking data
  // For now, we'll generate based on analytics patterns
  const analytics = await prisma.analytics.findMany({
    where: {
      organizationId: { in: organizationIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Device distribution (mock data based on platform patterns)
  const platformCounts = analytics.reduce((acc, a) => {
    const platform = a.platform || 'unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceDistribution = [
    { name: 'Desktop', value: Math.floor(Object.values(platformCounts).reduce((a, b) => a + b, 0) * 0.45) },
    { name: 'Mobile', value: Math.floor(Object.values(platformCounts).reduce((a, b) => a + b, 0) * 0.35) },
    { name: 'Tablet', value: Math.floor(Object.values(platformCounts).reduce((a, b) => a + b, 0) * 0.20) }
  ];

  // Demographics (mock data)
  const demographics = [
    { name: '18-24', value: Math.floor(analytics.length * 0.25) },
    { name: '25-34', value: Math.floor(analytics.length * 0.35) },
    { name: '35-44', value: Math.floor(analytics.length * 0.25) },
    { name: '45+', value: Math.floor(analytics.length * 0.15) }
  ];

  return {
    deviceDistribution,
    demographics
  };
}

async function getEngagementData(
  organizationIds: string[],
  startDate: Date,
  endDate: Date,
  timeframe: string
) {
  const analytics = await prisma.analytics.findMany({
    where: {
      organizationId: { in: organizationIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  const groupedData = new Map();
  
  analytics.forEach(record => {
    let key: string;
    switch (timeframe) {
      case 'day':
        key = format(record.timestamp, 'MMM dd');
        break;
      case 'week':
        key = format(record.timestamp, 'MMM dd');
        break;
      case 'month':
        key = format(record.timestamp, 'MMM yyyy');
        break;
      default:
        key = format(record.timestamp, 'MMM dd');
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, {
        name: key,
        likes: 0,
        shares: 0,
        comments: 0,
        total: 0
      });
    }

    const existing = groupedData.get(key);
    existing.likes += record.likes || 0;
    existing.shares += record.shares || 0;
    existing.comments += record.comments || 0;
    existing.total += (record.likes || 0) + (record.shares || 0) + (record.comments || 0);
  });

  return {
    engagementTrend: Array.from(groupedData.values())
  };
}

async function getRevenueData(
  organizationIds: string[],
  startDate: Date,
  endDate: Date,
  timeframe: string
) {
  const analytics = await prisma.analytics.findMany({
    where: {
      organizationId: { in: organizationIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  // Calculate revenue metrics (you might have a separate revenue/order table)
  const totalRevenue = analytics.reduce((sum, a) => sum + (a.revenue || 0), 0);
  const totalConversions = analytics.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);

  const conversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) + '%' : '0%';
  const avgOrderValue = totalConversions > 0 ? (totalRevenue / totalConversions) : 0;

  // Revenue trend
  const groupedData = new Map();
  analytics.forEach(record => {
    let key: string;
    switch (timeframe) {
      case 'day':
        key = format(record.timestamp, 'MMM dd');
        break;
      case 'week':
        key = format(record.timestamp, 'MMM dd');
        break;
      case 'month':
        key = format(record.timestamp, 'MMM yyyy');
        break;
      default:
        key = format(record.timestamp, 'MMM dd');
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, {
        name: key,
        revenue: 0,
        conversions: 0
      });
    }

    const existing = groupedData.get(key);
    existing.revenue += record.revenue || 0;
    existing.conversions += record.conversions || 0;
  });

  return {
    totalRevenue: `$${totalRevenue.toLocaleString()}`,
    conversionRate,
    avgOrderValue: `$${avgOrderValue.toFixed(2)}`,
    revenueChange: 0, // TODO: Calculate compared to previous period
    conversionChange: 0,
    aovChange: 0,
    revenueTrend: Array.from(groupedData.values())
  };
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const requestData: AnalyticsRequest = await request.json();

    const organizationIds = user.organizationMemberships.map(m => m.organizationId);
    
    if (organizationIds.length === 0) {
      return NextResponse.json({
        error: 'No organization access',
        success: false
      }, { status: 403 });
    }

    const startDate = new Date(requestData.dateRange.startDate);
    const endDate = new Date(requestData.dateRange.endDate);

    const result: any = {
      success: true,
      data: {}
    };

    // Fetch requested data sections
    if (requestData.include.metrics) {
      result.data.metrics = await getAnalyticsMetrics(
        organizationIds,
        startDate,
        endDate,
        requestData.platform
      );
    }

    if (requestData.include.charts) {
      result.data.charts = await getChartData(
        organizationIds,
        startDate,
        endDate,
        requestData.timeframe,
        requestData.platform
      );
    }

    if (requestData.include.audience) {
      result.data.audience = await getAudienceData(
        organizationIds,
        startDate,
        endDate
      );
    }

    if (requestData.include.engagement) {
      result.data.engagement = await getEngagementData(
        organizationIds,
        startDate,
        endDate,
        requestData.timeframe
      );
    }

    if (requestData.include.revenue) {
      result.data.revenue = await getRevenueData(
        organizationIds,
        startDate,
        endDate,
        requestData.timeframe
      );
    }

    result.metadata = {
      timeframe: requestData.timeframe,
      dateRange: requestData.dateRange,
      platform: requestData.platform,
      campaign: requestData.campaign,
      organizationCount: organizationIds.length,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Comprehensive analytics error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      success: false,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}