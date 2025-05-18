import type { AnalyticsTimeframe } from '@/types';
import { DateRange } from 'react-day-picker';

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
export async function fetchAnalyticsMetrics(params: AnalyticsParams) {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch analytics data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    throw error;
  }
}

/**
 * Fetches chart data for audience growth
 */
export async function fetchAudienceGrowthData(params: AnalyticsParams) {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch audience growth data');
    }
    const data = await response.json();
    return data.audienceGrowthData;
  } catch (error) {
    console.error('Error fetching audience growth data:', error);
    throw error;
  }
}

/**
 * Fetches chart data for engagement breakdown
 */
export async function fetchEngagementBreakdownData(params: AnalyticsParams) {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch engagement breakdown data');
    }
    const data = await response.json();
    return data.engagementPieData;
  } catch (error) {
    console.error('Error fetching engagement breakdown data:', error);
    throw error;
  }
}

/**
 * Fetches chart data for performance trends
 */
export async function fetchPerformanceTrendData(params: AnalyticsParams) {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch performance trend data');
    }
    const data = await response.json();
    return data.performanceLineData;
  } catch (error) {
    console.error('Error fetching performance trend data:', error);
    throw error;
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