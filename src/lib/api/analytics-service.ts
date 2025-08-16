'use client';

import type { AnalyticsTimeframe } from '@/types';
import { DateRange } from 'react-day-picker';
import { AnalyticMetric, AnalyticsFilter } from '@/components/analytics/analytics-dashboard';
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';

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
  demographics: {
    ageRange: string;
    region: string;
    segment: string;
    gender?: string;
    language?: string;
    interests: string[];
  };
  behavioral: {
    timeSlot: string;
    device: string;
    contentType: string;
    opens: number;
    clicks: number;
    conversions: number;
    bounceRate: number;
    timeOnSite: number;
  };
  engagement: {
    score: number;
    metrics: {
      total: number;
      percentage: number;
    }[];
    trends: {
      date: string;
      value: number;
    }[];
  };
  totalAudienceSize: number;
  averageEngagementScore: number;
  mostActiveSegment: string;
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

// Standardized event types
export type AnalyticsEventType = 
  | 'content_created'
  | 'content_updated'
  | 'content_published'
  | 'content_scheduled'
  | 'content_deleted'
  | 'content_viewed'
  | 'content_engaged'
  | 'campaign_created'
  | 'campaign_updated'
  | 'campaign_published'
  | 'campaign_scheduled'
  | 'campaign_deleted'
  | 'user_action'
  | 'error_occurred';

// Base event interface
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;
  userId?: string;
  organizationId?: string;
  metadata: Record<string, any>;
}

export interface CampaignPerformanceMetrics {
  metrics: {
    title: string;
    value: number | string;
    percentChange: number;
  }[];
  timeSeriesData: {
    datasets: {
      data: {
        date: string;
        value: number;
        engagement?: number;
        conversionRate?: number;
        roi?: number;
        channel?: string;
      }[];
    }[];
  };
}

// Analytics service class
export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track a new event
  public async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Store event locally
    this.events.push(fullEvent);

    // TODO: Implement actual analytics provider integration
    // For now, we'll just log to console
    console.log('Analytics Event:', fullEvent);

    // In a real implementation, you would:
    // 1. Send to analytics provider
    // 2. Store in database
    // 3. Trigger any necessary webhooks
  }

  // Get analytics data for a specific timeframe
  public async getAnalytics(params: AnalyticsParams): Promise<AnalyticsMetric[]> {
    // TODO: Implement actual analytics data fetching
    // This would typically query your analytics provider or database
    return [];
  }

  // Get events for a specific timeframe
  public async getEvents(params: AnalyticsParams): Promise<AnalyticsEvent[]> {
    const { startDate, endDate } = params;
    
    return this.events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return (!startDate || eventDate >= startDate) && 
             (!endDate || eventDate <= endDate);
    });
  }
}

// Export a singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Helper function to track events
export const trackAnalyticsEvent = async (
  type: AnalyticsEventType,
  metadata: Record<string, any>,
  userId?: string,
  organizationId?: string
): Promise<void> => {
  await analyticsService.trackEvent({
    type,
    metadata,
    userId,
    organizationId
  });
};

export function useAnalytics() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const { getApiBaseUrl, mobileFetch } = await import('./mobile-config');
    const baseUrl = getApiBaseUrl();
    const headers = await getAuthHeaders();
    const response = await mobileFetch(
      `/analytics/time-series?metric=${metric}&start=${dateRange.start}&end=${dateRange.end}&interval=${interval}`,
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
    const { getApiBaseUrl, mobileFetch } = await import('./mobile-config');
    const baseUrl = getApiBaseUrl();
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${baseUrl}/analytics/comparison?metric=${metric}&start=${dateRange.start}&end=${dateRange.end}&type=${comparisonType}`,
      { headers }
    );
    return response.json();
  };

  // Campaign Filtering
  const getCampaignMetrics = async (
    campaignId: string,
    dateRange: AnalyticsDateRange
  ): Promise<CampaignPerformanceMetrics[]> => {
    try {
      const { getApiBaseUrl } = await import('./mobile-config');
      const baseUrl = getApiBaseUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${baseUrl}/analytics/campaign-performance?campaignId=${campaignId}&start=${dateRange.start}&end=${dateRange.end}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch campaign metrics');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      return [];
    }
  };

  // Audience Segmentation
  const getAudienceSegments = async (campaignId: string, dateRange: { start: Date; end: Date }): Promise<AudienceSegment> => {
    try {
      const response = await fetch('/api/analytics/audience-segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audience segments');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching audience segments:', error);
      throw error;
    }
  };

  // A/B Testing
  const getABTestResults = async (testId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would fetch from an API endpoint
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Generate mock A/B test results
      const mockResults = generateMockABTestResults(testId);
      return mockResults;
    } catch (err) {
      console.error('Error fetching A/B test results:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Conversion Tracking
  const getConversionMetrics = async (
    dateRange: AnalyticsDateRange
  ): Promise<any> => {
    try {
      const { getApiBaseUrl } = await import('./mobile-config');
      const baseUrl = getApiBaseUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${baseUrl}/analytics/conversions?start=${dateRange.start}&end=${dateRange.end}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversion metrics');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
      throw error;
    }
  };

  // Export Data
  const exportData = async (
    format: 'csv' | 'pdf',
    dateRange: AnalyticsDateRange,
    metrics: string[]
  ): Promise<Blob> => {
    const { getApiBaseUrl } = await import('./mobile-config');
    const baseUrl = getApiBaseUrl();
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
    const { getApiBaseUrl } = await import('./mobile-config');
    const baseUrl = getApiBaseUrl();
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
      const { getApiBaseUrl } = await import('./mobile-config');
      const baseUrl = getApiBaseUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${baseUrl}/analytics/metrics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
          timeframe: params.timeframe,
          campaignId: params.campaignId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics metrics');
      }

      const data = await response.json();
      
      // Transform the data into the expected MetricData format
      return Array.isArray(data) ? data.map(metric => ({
        key: metric.id || metric.key,
        label: metric.title || metric.label,
        value: metric.value,
        description: metric.description,
        icon: metric.icon
      })) : [];
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return [];
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

  const getCampaignPerformance = async (campaignId: string, startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = `/api/analytics/campaign-performance?campaignId=${campaignId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaign performance: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching campaign performance:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAudienceInsights = async (campaignId: string, dateRange: { start: Date, end: Date }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/audience-segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          dateRange: {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString(),
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audience insights: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching audience insights:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Campaign Overview Metrics
  const getCampaignOverviewMetrics = async (
    campaignId: string,
    dateRange: AnalyticsDateRange
  ): Promise<any> => {
    try {
      const { getApiBaseUrl } = await import('./mobile-config');
      const baseUrl = getApiBaseUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${baseUrl}/analytics/campaign-metrics?campaignId=${campaignId}&start=${dateRange.start}&end=${dateRange.end}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch campaign overview metrics');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching campaign overview metrics:', error);
      throw error;
    }
  };

  // Device Analytics
  const getDeviceAnalytics = async (
    campaignId: string,
    dateRange: AnalyticsDateRange
  ): Promise<any> => {
    try {
      const { getApiBaseUrl } = await import('./mobile-config');
      const baseUrl = getApiBaseUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${baseUrl}/analytics/devices?campaignId=${campaignId}&start=${dateRange.start}&end=${dateRange.end}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch device analytics');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching device analytics:', error);
      throw error;
    }
  };

  // Link Analytics
  const getLinkAnalytics = async (
    campaignId: string,
    dateRange: AnalyticsDateRange
  ): Promise<any> => {
    try {
      const { getApiBaseUrl } = await import('./mobile-config');
      const baseUrl = getApiBaseUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${baseUrl}/analytics/links?campaignId=${campaignId}&start=${dateRange.start}&end=${dateRange.end}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch link analytics');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching link analytics:', error);
      throw error;
    }
  };

  return {
    isLoading,
    error,
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
    getCampaignPerformance,
    getAudienceInsights,
    getCampaignOverviewMetrics,
    getDeviceAnalytics,
    getLinkAnalytics,
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

function generateMockABTestResults(testId: string) {
  // Create mock metrics for variants A and B
  const variantA = {
    metrics: [
      { name: 'Open Rate', value: '24.8%' },
      { name: 'Click Rate', value: '4.2%' },
      { name: 'Conversion Rate', value: '1.8%' },
      { name: 'Revenue', value: '$3,245' },
    ],
  };
  
  const variantB = {
    metrics: [
      { name: 'Open Rate', value: '28.3%' },
      { name: 'Click Rate', value: '5.7%' },
      { name: 'Conversion Rate', value: '2.3%' },
      { name: 'Revenue', value: '$4,120' },
    ],
  };
  
  // Determine winner
  const winner = Math.random() > 0.3 ? 'B' : (Math.random() > 0.5 ? 'A' : 'none');
  
  // Generate time series data for 30 days
  const timeSeriesData = [];
  const startDate = new Date('2023-11-01');
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Generate random metrics with variant B performing slightly better
    const variantA_base = 0.2 + (Math.random() * 0.1);
    const variantB_base = 0.23 + (Math.random() * 0.12);
    
    timeSeriesData.push({
      date: date.toISOString().split('T')[0],
      variantA_open_rate: (variantA_base + Math.random() * 0.05).toFixed(3),
      variantB_open_rate: (variantB_base + Math.random() * 0.05).toFixed(3),
      variantA_click_rate: (variantA_base * 0.2 + Math.random() * 0.02).toFixed(3),
      variantB_click_rate: (variantB_base * 0.22 + Math.random() * 0.02).toFixed(3),
      variantA_conversion_rate: (variantA_base * 0.1 + Math.random() * 0.01).toFixed(3),
      variantB_conversion_rate: (variantB_base * 0.11 + Math.random() * 0.01).toFixed(3),
    });
  }
  
  // Create a timeline of test events
  const timeline = [
    {
      date: '2023-11-01',
      title: 'Test Started',
      description: 'A/B test initiated with equal traffic distribution.'
    },
    {
      date: '2023-11-10',
      title: 'First Significant Results',
      description: 'Initial data indicates Variant B is performing better for open rates.'
    },
    {
      date: '2023-11-20',
      title: 'Traffic Adjustment',
      description: 'Increased traffic to Variant B to 65% based on performance.'
    },
    {
      date: '2023-11-30',
      title: 'Test Concluded',
      description: winner === 'none' 
        ? 'No clear winner determined. Further testing recommended.' 
        : `Variant ${winner} declared winner with statistical significance.`
    },
  ];
  
  return {
    testId,
    variantA,
    variantB,
    winner,
    confidence: winner === 'none' ? 85 : 95,
    sampleSize: 12500,
    timeSeriesData,
    timeline,
  };
}

// API endpoint configuration
const SERVICE_PROVIDER_ANALYTICS_API_URL = '/api/analytics/service-provider';

// 🚀 B2B2G SERVICE PROVIDER ANALYTICS - Extended Interfaces and Functions

export interface ServiceProviderClientAnalytics {
  clientId: string;
  clientName: string;
  clientType: string;
  contentMetrics: {
    totalContent: number;
    publishedContent: number;
    draftContent: number;
    contentTypes: Record<string, number>;
    avgEngagementRate: number;
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
  };
  performanceData: Array<{
    date: string;
    views: number;
    engagement: number;
    clicks: number;
    impressions: number;
    reach: number;
  }>;
  topContent: Array<{
    id: string;
    title: string;
    type: string;
    publishedAt: string;
    views: number;
    engagement: number;
    clicks: number;
  }>;
}

export interface ServiceProviderCrossClientAnalytics {
  aggregateMetrics: {
    totalClients: number;
    totalContent: number;
    totalPublishedContent: number;
    averageEngagement: number;
    totalViews: number;
    totalClicks: number;
    averageConversionRate: number;
  };
  clientAnalytics: ServiceProviderClientAnalytics[];
  contentTypeDistribution: Record<string, number>;
  clientRankings: {
    byEngagement: ServiceProviderClientAnalytics[];
    byViews: ServiceProviderClientAnalytics[];
    byConversion: ServiceProviderClientAnalytics[];
  };
  timeRange: string;
  compareClients: boolean;
  generatedAt: string;
  insights: Array<{
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export interface ServiceProviderSingleClientAnalyticsResponse {
  clientAnalytics: ServiceProviderClientAnalytics;
  timeRange: string;
  generatedAt: string;
}

/**
 * Get analytics for a specific client in service provider context
 */
export async function getServiceProviderClientAnalytics(params: {
  organizationId: string;
  clientId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}): Promise<ServiceProviderSingleClientAnalyticsResponse> {
  try {
    console.log('📊 Fetching service provider client analytics:', params);
    
    const queryParams = new URLSearchParams({
      organizationId: params.organizationId,
      clientId: params.clientId,
      timeRange: params.timeRange || '30d',
    });

    const response = await fetch(`${SERVICE_PROVIDER_ANALYTICS_API_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Service Provider Client Analytics API Error:', error);
      throw new Error(error.message || 'Failed to fetch client analytics');
    }

    const data = await response.json();
    console.log('✅ Service provider client analytics fetched:', {
      clientId: params.clientId,
      contentCount: data.clientAnalytics.contentMetrics.totalContent
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching service provider client analytics:', error);
    throw error;
  }
}

/**
 * Get cross-client analytics for service provider dashboard
 */
export async function getServiceProviderCrossClientAnalytics(params: {
  organizationId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  compareClients?: boolean;
}): Promise<ServiceProviderCrossClientAnalytics> {
  try {
    console.log('📊 Fetching service provider cross-client analytics:', params);
    
    const queryParams = new URLSearchParams({
      organizationId: params.organizationId,
      clientId: 'all',
      timeRange: params.timeRange || '30d',
      compareClients: params.compareClients ? 'true' : 'false',
    });

    const response = await fetch(`${SERVICE_PROVIDER_ANALYTICS_API_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Service Provider Cross-Client Analytics API Error:', error);
      throw new Error(error.message || 'Failed to fetch cross-client analytics');
    }

    const data = await response.json();
    console.log('✅ Service provider cross-client analytics fetched:', {
      clientCount: data.aggregateMetrics.totalClients,
      totalContent: data.aggregateMetrics.totalContent
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching service provider cross-client analytics:', error);
    throw error;
  }
}

/**
 * Get client performance comparison for service providers
 */
export async function getServiceProviderClientPerformanceComparison(params: {
  organizationId: string;
  clientIds: string[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  metrics?: string[];
}): Promise<{
  comparisonData: Array<{
    clientId: string;
    clientName: string;
    metrics: Record<string, number>;
    performanceData: Array<{
      date: string;
      [key: string]: number | string;
    }>;
  }>;
  timeRange: string;
  comparedMetrics: string[];
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    message: string;
    clientsAffected: string[];
  }>;
}> {
  try {
    console.log('📊 Fetching service provider client performance comparison:', params);

    // Get individual client data for each client
    const clientAnalyticsPromises = params.clientIds.map(clientId =>
      getServiceProviderClientAnalytics({
        organizationId: params.organizationId,
        clientId,
        timeRange: params.timeRange
      })
    );

    const clientAnalyticsResults = await Promise.all(clientAnalyticsPromises);
    
    // Transform data for comparison
    const comparisonData = clientAnalyticsResults.map(result => ({
      clientId: result.clientAnalytics.clientId,
      clientName: result.clientAnalytics.clientName,
      metrics: {
        totalContent: result.clientAnalytics.contentMetrics.totalContent,
        avgEngagementRate: result.clientAnalytics.contentMetrics.avgEngagementRate,
        totalViews: result.clientAnalytics.contentMetrics.totalViews,
        totalClicks: result.clientAnalytics.contentMetrics.totalClicks,
        conversionRate: result.clientAnalytics.contentMetrics.conversionRate
      },
      performanceData: result.clientAnalytics.performanceData
    }));

    // Generate comparison insights
    const insights = generateServiceProviderComparisonInsights(comparisonData);

    const result = {
      comparisonData,
      timeRange: params.timeRange || '30d',
      comparedMetrics: params.metrics || ['avgEngagementRate', 'totalViews', 'conversionRate'],
      insights
    };

    console.log('✅ Service provider client performance comparison generated:', {
      clientCount: comparisonData.length,
      insightCount: insights.length
    });

    return result;
  } catch (error) {
    console.error('❌ Error generating service provider client performance comparison:', error);
    throw error;
  }
}

// Helper function to generate service provider specific comparison insights
function generateServiceProviderComparisonInsights(comparisonData: any[]) {
  const insights = [];
  
  // Find best and worst performers
  const byEngagement = [...comparisonData].sort((a, b) => b.metrics.avgEngagementRate - a.metrics.avgEngagementRate);
  const bestEngagement = byEngagement[0];
  const worstEngagement = byEngagement[byEngagement.length - 1];
  
  if (bestEngagement && worstEngagement && byEngagement.length > 1) {
    const gap = bestEngagement.metrics.avgEngagementRate - worstEngagement.metrics.avgEngagementRate;
    if (gap > 5) {
      insights.push({
        type: 'warning' as const,
        message: `${gap.toFixed(1)}% engagement gap between ${bestEngagement.clientName} and ${worstEngagement.clientName}`,
        clientsAffected: [bestEngagement.clientId, worstEngagement.clientId]
      });
    }
  }
  
  // Volume insights
  const totalContent = comparisonData.reduce((sum, client) => sum + client.metrics.totalContent, 0);
  const avgContent = totalContent / comparisonData.length;
  const lowVolumeClients = comparisonData.filter(client => client.metrics.totalContent < avgContent * 0.7);
  
  if (lowVolumeClients.length > 0) {
    insights.push({
      type: 'info' as const,
      message: `${lowVolumeClients.length} client(s) producing below-average content volume`,
      clientsAffected: lowVolumeClients.map(client => client.clientId)
    });
  }

  // Service provider specific insights
  const highPerformers = comparisonData.filter(client => client.metrics.avgEngagementRate > avgContent * 1.2);
  if (highPerformers.length > 0) {
    insights.push({
      type: 'success' as const,
      message: `${highPerformers.length} client(s) exceeding performance benchmarks - consider sharing best practices`,
      clientsAffected: highPerformers.map(client => client.clientId)
    });
  }
  
  return insights;
}