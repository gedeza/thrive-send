import type { AnalyticsTimeframe } from '@/types';
import { DateRange } from 'react-day-picker';
import { AnalyticMetric, AnalyticsFilter } from '@/components/analytics/analytics-dashboard';
import { useAuth } from '@clerk/nextjs';

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

export function useAnalytics() {
  const { getToken } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  const getAuthHeaders = async () => {
    const token = await getToken();
    console.log('Auth token:', token ? 'Present' : 'Missing');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Time Series Analysis
  const getTimeSeriesData = async (
    metric: string,
    dateRange: AnalyticsDateRange,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${baseUrl}/analytics/time-series?metric=${metric}&start=${dateRange.start}&end=${dateRange.end}&interval=${interval}`,
      { headers }
    );
    return response.json();
  };

  // Comparison Views
  const getComparisonData = async (
    metric: string,
    dateRange: AnalyticsDateRange,
    comparisonType: 'week' | 'month' | 'year' = 'week'
  ): Promise<ComparisonData> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${baseUrl}/analytics/comparison?metric=${metric}&start=${dateRange.start}&end=${dateRange.end}&type=${comparisonType}`,
      { headers }
    );
    return response.json();
  };

  // Campaign Filtering
  const getCampaignMetrics = async (
    campaignId?: string,
    dateRange?: AnalyticsDateRange
  ): Promise<CampaignMetrics[]> => {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (campaignId) params.append('campaignId', campaignId);
    if (dateRange) {
      params.append('start', dateRange.start);
      params.append('end', dateRange.end);
    }
    
    const response = await fetch(`${baseUrl}/analytics/campaigns?${params}`, { headers });
    return response.json();
  };

  // Audience Segmentation
  const getAudienceSegments = async (
    dateRange: AnalyticsDateRange
  ): Promise<AudienceSegment[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${baseUrl}/analytics/audience-segments?start=${dateRange.start}&end=${dateRange.end}`,
      { headers }
    );
    return response.json();
  };

  // A/B Testing
  const getABTestResults = async (
    testId?: string
  ): Promise<ABTestResult[]> => {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (testId) params.append('testId', testId);
    
    const response = await fetch(`${baseUrl}/analytics/ab-tests?${params}`, { headers });
    return response.json();
  };

  // Conversion Tracking
  const getConversionMetrics = async (
    dateRange: AnalyticsDateRange
  ): Promise<ConversionMetrics> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${baseUrl}/analytics/conversions?start=${dateRange.start}&end=${dateRange.end}`,
      { headers }
    );
    return response.json();
  };

  // Export Data
  const exportData = async (
    format: 'csv' | 'pdf',
    dateRange: AnalyticsDateRange,
    metrics: string[]
  ): Promise<Blob> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${baseUrl}/analytics/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}&metrics=${metrics.join(',')}`,
      {
        headers: {
          ...headers,
          'Accept': format === 'csv' ? 'text/csv' : 'application/pdf'
        }
      }
    );
    return response.blob();
  };

  // Schedule Report
  const scheduleReport = async (
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      metrics: string[];
      recipients: string[];
      format: 'csv' | 'pdf';
    }
  ): Promise<{ id: string; status: 'scheduled' }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${baseUrl}/analytics/schedule-report`, {
      method: 'POST',
      headers,
      body: JSON.stringify(schedule)
    });
    return response.json();
  };

  // Analytics Dashboard Data
  const fetchAnalyticsMetrics = async (params: AnalyticsParams) => {
  try {
      const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

      const response = await fetch(`/api/analytics?${queryParams.toString()}`, {
        headers,
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch analytics data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    throw error;
  }
  };

  const fetchAudienceGrowthData = async (params: AnalyticsParams) => {
  try {
      const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

      const response = await fetch(`/api/analytics?${queryParams.toString()}`, {
        headers,
      });

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
  };

  const fetchEngagementBreakdownData = async (params: AnalyticsParams) => {
  try {
      const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

      const response = await fetch(`/api/analytics?${queryParams.toString()}`, {
        headers,
      });

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
  };

  const fetchPerformanceTrendData = async (params: AnalyticsParams) => {
  try {
      const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.campaignId) queryParams.append('campaignId', params.campaignId);

      const response = await fetch(`/api/analytics?${queryParams.toString()}`, {
        headers,
      });

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
  };

  return {
    getTimeSeriesData,
    getComparisonData,
    getCampaignMetrics,
    getAudienceSegments,
    getABTestResults,
    getConversionMetrics,
    exportData,
    scheduleReport,
    fetchAnalyticsMetrics,
    fetchAudienceGrowthData,
    fetchEngagementBreakdownData,
    fetchPerformanceTrendData,
  };
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