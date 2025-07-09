import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { DateRange } from 'react-day-picker';

interface UseAnalyticsDataParams {
  timeframe: 'day' | 'week' | 'month' | 'year';
  dateRange: DateRange;
  campaign: string;
  platform: string;
}

interface AnalyticsMetrics {
  totalViews: number;
  totalReach: number;
  totalConversions: number;
  engagementRate: string;
  viewsChange?: number;
  reachChange?: number;
  conversionsChange?: number;
  engagementChange?: number;
}

interface ChartData {
  performanceTrend?: any[];
  platformPerformance?: any[];
  activityHeatmap?: any[];
}

interface AudienceData {
  deviceDistribution?: any[];
  demographics?: any[];
}

interface EngagementData {
  engagementTrend?: any[];
}

interface RevenueData {
  totalRevenue: string;
  conversionRate: string;
  avgOrderValue: string;
  revenueChange?: number;
  conversionChange?: number;
  aovChange?: number;
  revenueTrend?: any[];
}

export function useAnalyticsData({
  timeframe,
  dateRange,
  campaign,
  platform
}: UseAnalyticsDataParams) {
  const { getToken } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-data', timeframe, dateRange, campaign, platform],
    queryFn: async () => {
      const token = await getToken();
      
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timeframe,
          dateRange: {
            startDate: dateRange.from?.toISOString(),
            endDate: dateRange.to?.toISOString()
          },
          campaign: campaign === 'all' ? undefined : campaign,
          platform: platform === 'all' ? undefined : platform,
          include: {
            metrics: true,
            charts: true,
            audience: true,
            engagement: true,
            revenue: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Transform the API response to match our component expectations
  const metrics: AnalyticsMetrics = data?.data?.metrics ? {
    totalViews: data.data.metrics.totalViews || 0,
    totalReach: data.data.metrics.totalReach || 0,
    totalConversions: data.data.metrics.totalConversions || 0,
    engagementRate: data.data.metrics.engagementRate || '0%',
    viewsChange: data.data.metrics.viewsChange,
    reachChange: data.data.metrics.reachChange,
    conversionsChange: data.data.metrics.conversionsChange,
    engagementChange: data.data.metrics.engagementChange
  } : {
    totalViews: 0,
    totalReach: 0,
    totalConversions: 0,
    engagementRate: '0%'
  };

  const chartData: ChartData = {
    performanceTrend: data?.data?.charts?.performanceTrend || [],
    platformPerformance: data?.data?.charts?.platformPerformance || [],
    activityHeatmap: data?.data?.charts?.activityHeatmap || []
  };

  const audienceData: AudienceData = {
    deviceDistribution: data?.data?.audience?.deviceDistribution || [],
    demographics: data?.data?.audience?.demographics || []
  };

  const engagementData: EngagementData = {
    engagementTrend: data?.data?.engagement?.engagementTrend || []
  };

  const revenueData: RevenueData = {
    totalRevenue: data?.data?.revenue?.totalRevenue || '$0',
    conversionRate: data?.data?.revenue?.conversionRate || '0%',
    avgOrderValue: data?.data?.revenue?.avgOrderValue || '$0',
    revenueChange: data?.data?.revenue?.revenueChange,
    conversionChange: data?.data?.revenue?.conversionChange,
    aovChange: data?.data?.revenue?.aovChange,
    revenueTrend: data?.data?.revenue?.revenueTrend || []
  };

  return {
    metrics,
    chartData,
    audienceData,
    engagementData,
    revenueData,
    isLoading,
    error,
    refetch,
    rawData: data
  };
}