/**
 * Real Analytics Metrics - Production Ready
 * Replaces metrics.mock.ts with actual database-driven data
 */

import { BarChart, PieChart, Activity, Users, TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface RealMetric {
  title: string;
  value: string | number;
  icon: IconType;
  comparison: string;
  change: number;
  isPositive: boolean;
  description: string;
  source: 'database' | 'api' | 'calculated';
}

export interface MetricsResponse {
  success: boolean;
  data: {
    overview: {
      totalViews: number;
      engagementRate: string;
      conversionRate: string;
      totalRevenue: string;
      viewsChange: number;
      engagementChange: number;
      conversionsChange: number;
      revenueChange: number;
      totalReach: number;
      reachChange: number;
      totalConversions: number;
    };
    clients: Array<{
      clientId: string;
      clientName: string;
      totalViews: number;
      engagementRate: number;
      conversionRate: number;
      revenue: number;
      contentCount: number;
      projectCount: number;
    }>;
    trends: Array<{
      date: string;
      views: number;
      engagement: number;
      conversions: number;
    }>;
    timestamp: string;
    source: string;
  };
}

/**
 * Fetch real analytics metrics from API
 */
export async function fetchRealMetrics(
  organizationId: string,
  dateRange?: { startDate: Date; endDate: Date },
  clientId?: string
): Promise<MetricsResponse> {
  const params = new URLSearchParams({
    organizationId,
  });

  if (dateRange) {
    params.append('startDate', dateRange.startDate.toISOString());
    params.append('endDate', dateRange.endDate.toISOString());
  }

  if (clientId) {
    params.append('clientId', clientId);
  }

  try {
    const response = await fetch(`/api/analytics/real-metrics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (_error) {
    console.error("", _error);
    throw new Error('Failed to fetch analytics metrics from database');
  }
}

/**
 * Transform API response into dashboard-ready metrics
 */
export function transformToMetricsData(apiResponse: MetricsResponse): RealMetric[] {
  const { overview } = apiResponse.data;

  return [
    {
      title: "Total Views",
      value: overview.totalViews.toLocaleString(),
      icon: Eye,
      comparison: `${overview.viewsChange >= 0 ? '+' : ''}${overview.viewsChange}% from last period`,
      change: overview.viewsChange,
      isPositive: overview.viewsChange >= 0,
      description: "Total content views across all platforms and clients",
      source: 'database',
    },
    {
      title: "Engagement Rate",
      value: overview.engagementRate,
      icon: Users,
      comparison: `${overview.engagementChange >= 0 ? '+' : ''}${overview.engagementChange}% from last period`,
      change: overview.engagementChange,
      isPositive: overview.engagementChange >= 0,
      description: "Average engagement rate across all content",
      source: 'calculated',
    },
    {
      title: "Conversion Rate",
      value: overview.conversionRate,
      icon: MousePointer,
      comparison: `${overview.conversionsChange >= 0 ? '+' : ''}${overview.conversionsChange}% from last period`,
      change: overview.conversionsChange,
      isPositive: overview.conversionsChange >= 0,
      description: "Click-through and conversion rate from content",
      source: 'calculated',
    },
    {
      title: "Total Revenue",
      value: overview.totalRevenue,
      icon: DollarSign,
      comparison: `${overview.revenueChange >= 0 ? '+' : ''}${overview.revenueChange}% from last period`,
      change: overview.revenueChange,
      isPositive: overview.revenueChange >= 0,
      description: "Total revenue generated from all client activities",
      source: 'database',
    },
    {
      title: "Total Reach",
      value: overview.totalReach.toLocaleString(),
      icon: TrendingUp,
      comparison: `${overview.reachChange >= 0 ? '+' : ''}${overview.reachChange}% from last period`,
      change: overview.reachChange,
      isPositive: overview.reachChange >= 0,
      description: "Total unique users reached across all campaigns",
      source: 'database',
    },
    {
      title: "Total Conversions",
      value: overview.totalConversions.toLocaleString(),
      icon: Activity,
      comparison: `${overview.conversionsChange >= 0 ? '+' : ''}${overview.conversionsChange}% from last period`,
      change: overview.conversionsChange,
      isPositive: overview.conversionsChange >= 0,
      description: "Total conversions and goal completions",
      source: 'database',
    },
  ];
}

/**
 * Hook for real-time metrics data
 */
export function useRealMetrics(
  organizationId: string,
  dateRange?: { startDate: Date; endDate: Date },
  clientId?: string
) {
  return {
    fetchMetrics: () => fetchRealMetrics(organizationId, dateRange, clientId),
    transformMetrics: transformToMetricsData,
  };
}

/**
 * Get performance indicators based on real data
 */
export function getPerformanceIndicators(metrics: RealMetric[]) {
  const positiveChanges = metrics.filter(m => m.isPositive).length;
  const totalMetrics = metrics.length;
  const overallHealth = (positiveChanges / totalMetrics) * 100;

  return {
    overallHealth: Math.round(overallHealth),
    positiveMetrics: positiveChanges,
    totalMetrics,
    healthStatus: overallHealth >= 70 ? 'excellent' : 
                 overallHealth >= 50 ? 'good' : 
                 overallHealth >= 30 ? 'fair' : 'poor',
  };
}

/**
 * Export for backward compatibility (replacing mock data)
 */
export { transformToMetricsData as metricsData };