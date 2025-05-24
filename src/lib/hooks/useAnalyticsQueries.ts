import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from '@/lib/api/analytics-service';
import type { AnalyticsParams } from '@/lib/api/analytics-service';

export function useAnalyticsQueries(params: AnalyticsParams) {
  const analytics = useAnalytics();
  const queryKey = ['analytics', params];

  // Metrics query with 5 minute stale time
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: [...queryKey, 'metrics'],
    queryFn: () => analytics.fetchAnalyticsMetrics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Audience data query with 10 minute stale time
  const {
    data: audienceData,
    isLoading: audienceLoading,
    error: audienceError,
    refetch: refetchAudience
  } = useQuery({
    queryKey: [...queryKey, 'audience'],
    queryFn: () => analytics.fetchAudienceGrowthData(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Engagement data query with 5 minute stale time
  const {
    data: engagementData,
    isLoading: engagementLoading,
    error: engagementError,
    refetch: refetchEngagement
  } = useQuery({
    queryKey: [...queryKey, 'engagement'],
    queryFn: () => analytics.fetchEngagementBreakdownData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Performance data query with 5 minute stale time
  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance
  } = useQuery({
    queryKey: [...queryKey, 'performance'],
    queryFn: () => analytics.fetchPerformanceTrendData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Function to refetch all queries
  const refetchAll = () => {
    refetchMetrics();
    refetchAudience();
    refetchEngagement();
    refetchPerformance();
  };

  return {
    metrics,
    metricsLoading,
    metricsError,
    audienceData,
    audienceLoading,
    audienceError,
    engagementData,
    engagementLoading,
    engagementError,
    performanceData,
    performanceLoading,
    performanceError,
    refetchAll
  };
} 