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
 * Fetches analytics metrics from the API
 */
export async function fetchAnalyticsMetrics(params: AnalyticsParams = {}): Promise<AnalyticsMetric[]> {
  const { startDate, endDate, campaignId, timeframe } = params;
  
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (campaignId) queryParams.append('campaignId', campaignId);
    if (timeframe) queryParams.append('timeframe', timeframe);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const data = await response.json();
    return data.metrics;
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);
    throw error;
  }
}

/**
 * Fetches chart data for audience growth
 */
export async function fetchAudienceGrowthData(params: AnalyticsParams = {}) {
  const { startDate, endDate, campaignId, timeframe } = params;
  
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (campaignId) queryParams.append('campaignId', campaignId);
    if (timeframe) queryParams.append('timeframe', timeframe);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const data = await response.json();
    return data.audienceGrowthData;
  } catch (error) {
    console.error("Error fetching audience growth data:", error);
    return audienceGrowthMockData; // Fallback to mock data if query fails
  }
}

/**
 * Fetches chart data for engagement breakdown
 */
export async function fetchEngagementBreakdownData(params: AnalyticsParams = {}) {
  const { startDate, endDate, campaignId, timeframe } = params;
  
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (campaignId) queryParams.append('campaignId', campaignId);
    if (timeframe) queryParams.append('timeframe', timeframe);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const data = await response.json();
    return data.engagementPieData;
  } catch (error) {
    console.error("Error fetching engagement breakdown data:", error);
    return engagementPieMockData; // Fallback to mock data if query fails
  }
}

/**
 * Fetches chart data for performance trends
 */
export async function fetchPerformanceTrendData(params: AnalyticsParams = {}) {
  const { startDate, endDate, campaignId, timeframe } = params;
  
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (campaignId) queryParams.append('campaignId', campaignId);
    if (timeframe) queryParams.append('timeframe', timeframe);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const data = await response.json();
    return data.performanceLineData;
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