import type { AnalyticsTimeframe } from '@/types';
import { DateRange } from 'react-day-picker';
import { AnalyticMetric, AnalyticsFilter } from '@/components/analytics/analytics-dashboard';

export type AnalyticsDateRange = {
  start: string;
  end: string;
};

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

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  isPositive: boolean;
}

export interface CampaignMetrics {
  id: string;
  name: string;
  metrics: AnalyticMetric[];
  timeSeriesData: TimeSeriesData;
}

export interface AudienceSegment {
  id: string;
  name: string;
  size: number;
  metrics: AnalyticMetric[];
}

export interface ABTestResult {
  id: string;
  name: string;
  variantA: {
    name: string;
    metrics: AnalyticMetric[];
  };
  variantB: {
    name: string;
    metrics: AnalyticMetric[];
  };
  winner: 'A' | 'B' | 'none';
  confidence: number;
}

export interface ConversionMetrics {
  totalConversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  byCampaign: {
    campaignId: string;
    campaignName: string;
    conversions: number;
    revenue: number;
  }[];
}

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  // Time Series Analysis
  async getTimeSeriesData(
    metric: string,
    dateRange: AnalyticsDateRange,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData> {
    const response = await fetch(
      `${this.baseUrl}/analytics/time-series?metric=${metric}&start=${dateRange.start}&end=${dateRange.end}&interval=${interval}`
    );
    return response.json();
  }

  // Comparison Views
  async getComparisonData(
    metric: string,
    dateRange: AnalyticsDateRange,
    comparisonType: 'week' | 'month' | 'year' = 'week'
  ): Promise<ComparisonData> {
    const response = await fetch(
      `${this.baseUrl}/analytics/comparison?metric=${metric}&start=${dateRange.start}&end=${dateRange.end}&type=${comparisonType}`
    );
    return response.json();
  }

  // Campaign Filtering
  async getCampaignMetrics(
    campaignId?: string,
    dateRange?: AnalyticsDateRange
  ): Promise<CampaignMetrics[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append('campaignId', campaignId);
    if (dateRange) {
      params.append('start', dateRange.start);
      params.append('end', dateRange.end);
    }
    
    const response = await fetch(`${this.baseUrl}/analytics/campaigns?${params}`);
    return response.json();
  }

  // Audience Segmentation
  async getAudienceSegments(
    dateRange: AnalyticsDateRange
  ): Promise<AudienceSegment[]> {
    const response = await fetch(
      `${this.baseUrl}/analytics/audience-segments?start=${dateRange.start}&end=${dateRange.end}`
    );
    return response.json();
  }

  // A/B Testing
  async getABTestResults(
    testId?: string
  ): Promise<ABTestResult[]> {
    const params = new URLSearchParams();
    if (testId) params.append('testId', testId);
    
    const response = await fetch(`${this.baseUrl}/analytics/ab-tests?${params}`);
    return response.json();
  }

  // Conversion Tracking
  async getConversionMetrics(
    dateRange: AnalyticsDateRange
  ): Promise<ConversionMetrics> {
    const response = await fetch(
      `${this.baseUrl}/analytics/conversions?start=${dateRange.start}&end=${dateRange.end}`
    );
    return response.json();
  }

  // Export Data
  async exportData(
    format: 'csv' | 'pdf',
    dateRange: AnalyticsDateRange,
    metrics: string[]
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/analytics/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}&metrics=${metrics.join(',')}`,
      {
        headers: {
          'Accept': format === 'csv' ? 'text/csv' : 'application/pdf'
        }
      }
    );
    return response.blob();
  }

  // Schedule Report
  async scheduleReport(
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      metrics: string[];
      recipients: string[];
      format: 'csv' | 'pdf';
    }
  ): Promise<{ id: string; status: 'scheduled' }> {
    const response = await fetch(`${this.baseUrl}/analytics/schedule-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schedule)
    });
    return response.json();
  }
}

export const analyticsService = new AnalyticsService();

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
      throw new Error(errorData.message || 'Failed to fetch analytics data');
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
      throw new Error(errorData.message || 'Failed to fetch audience growth data');
    }
    const data = await response.json();
    return data.audienceGrowthData || audienceGrowthMockData;
  } catch (error) {
    console.error('Error fetching audience growth data:', error);
    return audienceGrowthMockData;
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
      throw new Error(errorData.message || 'Failed to fetch engagement breakdown data');
    }
    const data = await response.json();
    return data.engagementPieData || engagementPieMockData;
  } catch (error) {
    console.error('Error fetching engagement breakdown data:', error);
    return engagementPieMockData;
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
      throw new Error(errorData.message || 'Failed to fetch performance trend data');
    }
    const data = await response.json();
    return data.performanceLineData || performanceLineMockData;
  } catch (error) {
    console.error('Error fetching performance trend data:', error);
    return performanceLineMockData;
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