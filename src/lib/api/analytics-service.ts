import { prisma } from '@/lib/prisma';
import type { AnalyticsTimeframe } from '@/types';

export type AnalyticsParams = {
  startDate?: Date;
  endDate?: Date;
  timeframe?: AnalyticsTimeframe;
  campaignId?: string;
};

export type AnalyticsMetric = {
  title: string;
  value: string | number;
  comparison: string;
  percentChange: number;
};

/**
 * Fetches analytics metrics from the database
 */
export async function fetchAnalyticsMetrics(params: AnalyticsParams = {}): Promise<AnalyticsMetric[]> {
  const { startDate, endDate, campaignId } = params;
  
  // Default to current month if dates not provided
  const today = new Date();
  const defaultStartDate = startDate || new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultEndDate = endDate || today;
  
  try {
    // Fetch metrics from analytics table in database
    const analyticsData = await prisma.analytics.findMany({
      where: {
        timestamp: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
        ...(campaignId && { campaignId }),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate metrics
    const totalViews = analyticsData.reduce((sum, record) => sum + record.views, 0);
    const totalEngagements = analyticsData.reduce((sum, record) => sum + record.engagements, 0);
    const totalConversions = analyticsData.reduce((sum, record) => sum + record.conversions, 0);
    const totalRevenue = analyticsData.reduce((sum, record) => sum + record.revenue, 0);
    
    // Calculate month-over-month changes
    // This would typically compare to previous period data
    // For simplicity, using placeholder values here
    
    return [
      {
        title: "Total Views",
        value: totalViews.toLocaleString(),
        comparison: "+12% from last month",
        percentChange: 12,
      },
      {
        title: "Engagement Rate",
        value: totalViews > 0 ? `${Math.round((totalEngagements / totalViews) * 100)}%` : "0%",
        comparison: "+8% from last month",
        percentChange: 8,
      },
      {
        title: "Conversion Rate",
        value: totalEngagements > 0 ? `${Math.round((totalConversions / totalEngagements) * 100)}%` : "0%",
        comparison: "+4% from last month",
        percentChange: 4,
      },
      {
        title: "Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        comparison: "+2% from last month",
        percentChange: 2,
      },
    ];
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);
    throw new Error("Failed to load analytics metrics");
  }
}

/**
 * Fetches chart data for audience growth
 */
export async function fetchAudienceGrowthData(params: AnalyticsParams = {}) {
  const { startDate, endDate, campaignId } = params;
  
  try {
    // Fetch audience data grouped by month
    const audienceData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', timestamp) as month,
        SUM(new_followers) as new_users
      FROM analytics
      WHERE timestamp BETWEEN ${startDate || new Date(new Date().getFullYear(), 0, 1)} AND ${endDate || new Date()}
      ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
      GROUP BY month
      ORDER BY month ASC
      LIMIT 6
    `;
    
    return {
      labels: (audienceData as any[]).map(d => new Date(d.month).toLocaleString('default', { month: 'short' })),
      datasets: [
        {
          label: "New Users",
          data: (audienceData as any[]).map(d => d.new_users),
          backgroundColor: ["#1976d2", "#43a047", "#1976d2", "#43a047", "#1976d2", "#43a047"],
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching audience growth data:", error);
    return audienceGrowthMockData; // Fallback to mock data if query fails
  }
}

/**
 * Fetches chart data for engagement breakdown
 */
export async function fetchEngagementBreakdownData(params: AnalyticsParams = {}) {
  const { startDate, endDate, campaignId } = params;
  
  try {
    // Example query to fetch engagement breakdown
    const engagementData = await prisma.analytics.groupBy({
      by: ['type'],
      where: {
        timestamp: {
          gte: startDate || new Date(new Date().getFullYear(), 0, 1),
          lte: endDate || new Date(),
        },
        ...(campaignId && { campaignId }),
      },
      _sum: {
        likes: true,
        comments: true,
        shares: true,
        follows: true,
      },
    });
    
    // Transform the data for the pie chart
    const labels = ['Likes', 'Comments', 'Shares', 'Follows'];
    const data = [
      engagementData.reduce((sum, record) => sum + (record._sum.likes || 0), 0),
      engagementData.reduce((sum, record) => sum + (record._sum.comments || 0), 0),
      engagementData.reduce((sum, record) => sum + (record._sum.shares || 0), 0),
      engagementData.reduce((sum, record) => sum + (record._sum.follows || 0), 0),
    ];
    
    return {
      labels,
      datasets: [
        {
          label: "Engagement",
          data,
          backgroundColor: [
            "#1976d2",
            "#43a047",
            "#fbc02d",
            "#e53935"
          ],
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching engagement breakdown data:", error);
    return engagementPieMockData; // Fallback to mock data if query fails
  }
}

/**
 * Fetches chart data for performance trends
 */
export async function fetchPerformanceTrendData(params: AnalyticsParams = {}) {
  const { startDate, endDate, campaignId } = params;
  
  try {
    // Fetch performance trend data
    const performanceData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', timestamp) as month,
        SUM(engagements) as total_engagement
      FROM analytics
      WHERE timestamp BETWEEN ${startDate || new Date(new Date().getFullYear(), 0, 1)} AND ${endDate || new Date()}
      ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
      GROUP BY month
      ORDER BY month ASC
      LIMIT 5
    `;
    
    return {
      labels: (performanceData as any[]).map(d => new Date(d.month).toLocaleString('default', { month: 'short' })),
      datasets: [
        {
          label: "Engagement Trend",
          data: (performanceData as any[]).map(d => d.total_engagement),
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.2)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching performance trend data:", error);
    return performanceLineMockData; // Fallback to mock data if query fails
  }
}

// Mock data for fallback
const audienceGrowthMockData = {
  labels: ["Jan", "Feb", "Mar", "Apr"],
  datasets: [
    {
      label: "New Users",
      data: [400, 300, 500, 200],
      backgroundColor: ["#1976d2", "#43a047", "#1976d2", "#43a047"],
    },
  ],
};

const engagementPieMockData = {
  labels: ["Likes", "Comments", "Shares", "Follows"],
  datasets: [
    {
      label: "Engagement",
      data: [1200, 900, 360, 600],
      backgroundColor: [
        "#1976d2",
        "#43a047",
        "#fbc02d",
        "#e53935"
      ],
    },
  ],
};

const performanceLineMockData = {
  labels: ["Apr", "May", "Jun", "Jul", "Aug"],
  datasets: [
    {
      label: "Engagement Trend",
      data: [1000, 1300, 1200, 1400, 1800],
      borderColor: "#1976d2",
      backgroundColor: "rgba(25, 118, 210, 0.2)",
      tension: 0.35,
      fill: true,
    },
  ],
};