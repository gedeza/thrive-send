import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from '@/lib/api/analytics-service';
import type { AnalyticsParams } from '@/lib/api/analytics-service';

export function useAnalyticsQueries(params: AnalyticsParams) {
  const analytics = useAnalytics();

  // Query for metrics data
  const metricsQuery = useQuery({
    queryKey: ['analytics', 'metrics', params],
    queryFn: () => analytics.fetchAnalyticsMetrics(params),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });

  // Query for audience growth data
  const audienceQuery = useQuery({
    queryKey: ['analytics', 'audience', params],
    queryFn: () => analytics.fetchAudienceGrowthData(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query for engagement breakdown data
  const engagementQuery = useQuery({
    queryKey: ['analytics', 'engagement', params],
    queryFn: () => analytics.fetchEngagementBreakdownData(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query for performance trend data
  const performanceQuery = useQuery({
    queryKey: ['analytics', 'performance', params],
    queryFn: () => analytics.fetchPerformanceTrendData(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    metrics: metricsQuery.data || [],
    metricsLoading: metricsQuery.isLoading,
    metricsError: metricsQuery.error,
    audienceData: audienceQuery.data,
    audienceLoading: audienceQuery.isLoading,
    audienceError: audienceQuery.error,
    engagementData: engagementQuery.data,
    engagementLoading: engagementQuery.isLoading,
    engagementError: engagementQuery.error,
    performanceData: performanceQuery.data,
    performanceLoading: performanceQuery.isLoading,
    performanceError: performanceQuery.error,
    refetchAll: () => {
      metricsQuery.refetch();
      audienceQuery.refetch();
      engagementQuery.refetch();
      performanceQuery.refetch();
    },
  };
} 