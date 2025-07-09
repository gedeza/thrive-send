import { prisma } from '@/lib/prisma';
import { analyticsCacheManager, createCachedApiHandler } from './cache-manager';

/**
 * Optimized analytics query utilities to solve N+1 query problems
 */

export interface OptimizedAnalyticsParams {
  userId: string;
  clerkId?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
  timeframe?: string;
}

export interface TimeSeriesPoint {
  date: string;
  content: number;
  campaigns: number;
  analytics: number;
}

export interface OptimizedAnalyticsResult {
  metrics: {
    key: string;
    label: string;
    value: string;
    description: string;
    icon: string;
  }[];
  timeSeriesData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  summary: {
    totalContent: number;
    publishedContent: number;
    publishRate: number;
    activeCampaigns: number;
    totalCampaigns: number;
  };
}

/**
 * Optimized query to get all analytics data in minimal database calls
 */
export const getOptimizedAnalytics = createCachedApiHandler(
  'METRICS',
  async (params: OptimizedAnalyticsParams): Promise<OptimizedAnalyticsResult> => {
  const { userId, organizationId, startDate, endDate } = params;

  // Build date range filter
  const dateFilter = startDate && endDate ? {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  } : {};

  // Get user's organization memberships if not provided
  const userWithOrgs = !organizationId ? await prisma.user.findUnique({
    where: { clerkId: params.clerkId || userId },
    include: { organizationMemberships: true }
  }) : null;

  const orgIds = organizationId ? [organizationId] : 
    userWithOrgs?.organizationMemberships.map(m => m.organizationId) || [];

  // Single optimized query for all content metrics
  const contentStats = await prisma.content.groupBy({
    by: ['status'],
    where: {
      author: {
        clerkId: params.clerkId || userId
      },
      ...dateFilter
    },
    _count: {
      id: true
    }
  });

  // Single optimized query for all campaign metrics
  const campaignStats = await prisma.campaign.groupBy({
    by: ['status'],
    where: {
      organizationId: { in: orgIds },
      ...dateFilter
    },
    _count: {
      id: true
    }
  });

  // Generate date range for time series
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Single optimized query for time series data using date_trunc
  const timeSeriesContent = await prisma.$queryRaw<{
    date: Date;
    content_count: bigint;
  }[]>`
    SELECT 
      DATE_TRUNC('day', c."createdAt") as date,
      COUNT(*) as content_count
    FROM "Content" c
    JOIN "User" u ON c."authorId" = u.id
    WHERE u."clerkId" = ${params.clerkId || userId}
      AND c."createdAt" >= ${last7Days[0]}
      AND c."createdAt" < ${new Date(last7Days[6].getTime() + 24 * 60 * 60 * 1000)}
    GROUP BY DATE_TRUNC('day', c."createdAt")
    ORDER BY date ASC
  `;

  // Single optimized query for campaign time series
  const timeSeriesCampaigns = await prisma.$queryRaw<{
    date: Date;
    campaign_count: bigint;
  }[]>`
    SELECT 
      DATE_TRUNC('day', "createdAt") as date,
      COUNT(*) as campaign_count
    FROM "Campaign"
    WHERE "organizationId" = ANY(${orgIds})
      AND "createdAt" >= ${last7Days[0]}
      AND "createdAt" < ${new Date(last7Days[6].getTime() + 24 * 60 * 60 * 1000)}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `;

  // Process content stats
  const totalContent = contentStats.reduce((sum, stat) => sum + stat._count.id, 0);
  const publishedContent = contentStats.find(s => s.status === 'PUBLISHED')?._count.id || 0;
  const publishRate = totalContent > 0 ? ((publishedContent / totalContent) * 100) : 0;

  // Process campaign stats
  const totalCampaigns = campaignStats.reduce((sum, stat) => sum + stat._count.id, 0);
  const activeCampaigns = campaignStats.find(s => s.status === 'ACTIVE')?._count.id || 0;

  // Create time series data map for efficient lookup
  const contentMap = new Map<string, number>();
  const campaignMap = new Map<string, number>();

  timeSeriesContent.forEach(item => {
    const dateKey = item.date.toISOString().split('T')[0];
    contentMap.set(dateKey, Number(item.content_count));
  });

  timeSeriesCampaigns.forEach(item => {
    const dateKey = item.date.toISOString().split('T')[0];
    campaignMap.set(dateKey, Number(item.campaign_count));
  });

  // Build time series data
  const timeSeriesData = last7Days.map(date => {
    const dateKey = date.toISOString().split('T')[0];
    return {
      date: dateKey,
      content: contentMap.get(dateKey) || 0,
      campaigns: campaignMap.get(dateKey) || 0,
      analytics: 0 // Placeholder for analytics data
    };
  });

  return {
    metrics: [
      {
        key: 'total_content',
        label: 'Total Content',
        value: totalContent.toString(),
        description: 'All content items',
        icon: '📝'
      },
      {
        key: 'published_content',
        label: 'Published Content',
        value: publishedContent.toString(),
        description: 'Published content items',
        icon: '✅'
      },
      {
        key: 'publish_rate',
        label: 'Publish Rate',
        value: `${publishRate.toFixed(1)}%`,
        description: 'Content publish success rate',
        icon: '📈'
      },
      {
        key: 'active_campaigns',
        label: 'Active Campaigns',
        value: activeCampaigns.toString(),
        description: 'Currently active campaigns',
        icon: '🎯'
      }
    ],
    timeSeriesData: {
      labels: timeSeriesData.map(d => d.date),
      datasets: [
        {
          label: 'Content Created',
          data: timeSeriesData.map(d => d.content),
          borderColor: 'var(--color-chart-blue)',
          backgroundColor: 'var(--color-chart-blue)'
        },
        {
          label: 'Campaigns Created',
          data: timeSeriesData.map(d => d.campaigns),
          borderColor: 'var(--color-chart-green)',
          backgroundColor: 'var(--color-chart-green)'
        }
      ]
    },
    summary: {
      totalContent,
      publishedContent,
      publishRate,
      activeCampaigns,
      totalCampaigns
    }
  };
  },
  300 // 5 minutes cache
);

/**
 * Optimized query for analytics overview with proper includes
 */
export const getOptimizedAnalyticsOverview = createCachedApiHandler(
  'OVERVIEW',
  async (params: OptimizedAnalyticsParams & { 
    timeRange?: string; 
    platform?: string;
  }) => {
  const { userId, timeRange = '7d', platform = 'all' } = params;

  // Convert timeRange to days
  const days = parseInt(timeRange.replace('d', ''));
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  // Get user's organization memberships
  const userWithMemberships = await prisma.user.findUnique({
    where: { clerkId: params.clerkId || userId },
    include: { organizationMemberships: true }
  });
  
  const orgIds = userWithMemberships?.organizationMemberships.map(m => m.organizationId) || [];

  // Single optimized query with proper includes to avoid N+1
  const analyticsData = await prisma.analytics.findMany({
    where: {
      client: {
        organizationId: { in: orgIds }
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      client: {
        select: {
          id: true,
          name: true
        }
      },
      campaign: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transform data efficiently
  return analyticsData.map((data) => ({
    contentId: data.id,
    platform: platform === 'all' ? 'mixed' : platform,
    clientName: data.client.name,
    campaignName: data.campaign?.name || 'No Campaign',
    metrics: {
      views: data.views,
      engagement: {
        likes: data.likes,
        shares: data.shares,
        comments: data.comments,
      },
      reach: data.reachCount,
      clicks: data.clicks,
      impressions: data.impressions,
      engagements: data.engagements,
      conversions: data.conversions,
      revenue: data.revenue,
      openRate: data.openRate,
      clickRate: data.clickRate,
      conversionRate: data.conversionRate,
      engagementRate: data.engagementRate,
      timestamp: data.createdAt.toISOString(),
    },
  }));
  },
  180 // 3 minutes cache
);

/**
 * Optimized time series query with aggregation
 */
export const getOptimizedTimeSeriesData = createCachedApiHandler(
  'TIME_SERIES',
  async (params: OptimizedAnalyticsParams & {
    metric: string;
    interval?: string;
  }) => {
  const { userId, metric, interval = 'day', startDate, endDate } = params;

  // Parse date range or use default (last 7 days)
  const finalEndDate = endDate || new Date();
  const finalStartDate = startDate || new Date(finalEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get user's organization memberships
  const userWithMemberships = await prisma.user.findUnique({
    where: { clerkId: params.clerkId || userId },
    include: { organizationMemberships: true }
  });
  
  const orgIds = userWithMemberships?.organizationMemberships.map(m => m.organizationId) || [];

  // Single aggregated query using raw SQL for optimal performance
  const metricColumn = metric === 'views' ? 'views' : 
                      metric === 'engagement' ? 'engagements' : 
                      metric === 'conversions' ? 'conversions' : 
                      metric === 'clicks' ? 'clicks' : 
                      metric === 'impressions' ? 'impressions' : 'views';

  // Validate interval parameter to prevent SQL injection
  const validIntervals = ['hour', 'day', 'week', 'month'];
  if (!validIntervals.includes(interval)) {
    throw new Error(`Invalid interval: ${interval}`);
  }

  // Use switch statement for safer column selection
  let columnToSelect: string;
  switch (metric) {
    case 'views':
      columnToSelect = 'views';
      break;
    case 'engagement':
      columnToSelect = 'engagements';
      break;
    case 'conversions':
      columnToSelect = 'conversions';
      break;
    case 'clicks':
      columnToSelect = 'clicks';
      break;
    case 'impressions':
      columnToSelect = 'impressions';
      break;
    default:
      columnToSelect = 'views';
  }

  // Use Prisma raw query with proper parameterization
  const timeSeriesData = await prisma.$queryRaw<{
    date: Date;
    total_value: bigint;
  }[]>`
    SELECT 
      DATE_TRUNC(${interval}, a."createdAt") as date,
      COALESCE(SUM(a."${columnToSelect}"), 0) as total_value
    FROM "Analytics" a
    JOIN "Client" c ON a."clientId" = c.id
    WHERE c."organizationId" = ANY(${orgIds})
      AND a."createdAt" >= ${finalStartDate}
      AND a."createdAt" <= ${finalEndDate}
    GROUP BY DATE_TRUNC(${interval}, a."createdAt")
    ORDER BY date ASC
  `;

  // Generate labels and data arrays
  const labels: string[] = [];
  const data: number[] = [];

  // Fill in missing dates with 0 values
  const currentDate = new Date(finalStartDate);
  const dataMap = new Map<string, number>();
  
  // Create lookup map for efficient access
  timeSeriesData.forEach(item => {
    const dateKey = item.date.toISOString().split('T')[0];
    dataMap.set(dateKey, Number(item.total_value));
  });

  while (currentDate <= finalEndDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    labels.push(dateKey);
    data.push(dataMap.get(dateKey) || 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    labels,
    datasets: [
      {
        label: metric === 'views' ? 'Views' : 
               metric === 'engagement' ? 'Engagement' : 
               metric === 'conversions' ? 'Conversions' : 
               metric === 'clicks' ? 'Clicks' : 
               metric === 'impressions' ? 'Impressions' : 'Views',
        data,
        borderColor: 'var(--color-chart-blue)',
        backgroundColor: 'var(--color-chart-blue)'
      }
    ]
  };
  },
  600 // 10 minutes cache
);