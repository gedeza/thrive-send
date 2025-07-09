import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useState, useCallback, useMemo } from 'react';

/**
 * Unified Analytics Hook
 * Provides a single interface for fetching multiple analytics data types
 * Reduces network requests and improves performance
 */

interface UnifiedAnalyticsRequest {
  include: {
    metrics?: boolean;
    overview?: boolean;
    timeSeries?: {
      metric: string;
      interval?: string;
    }[];
    audience?: boolean;
    engagement?: boolean;
    performance?: boolean;
  };
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  timeframe?: string;
  platform?: string;
  campaignId?: string;
}

interface UnifiedAnalyticsResponse {
  success: boolean;
  data: {
    metrics?: any;
    overview?: any;
    timeSeries?: Record<string, any>;
    audience?: any;
    engagement?: any;
    performance?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    executionTime: number;
    cacheStatus: Record<string, 'hit' | 'miss'>;
  };
}

export function useUnifiedAnalytics(
  request: UnifiedAnalyticsRequest,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
    onSuccess?: (data: UnifiedAnalyticsResponse) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Create a stable query key
  const queryKey = useMemo(() => {
    return ['unified-analytics', request];
  }, [request]);

  // Fetch function
  const fetchUnifiedAnalytics = useCallback(async (): Promise<UnifiedAnalyticsResponse> => {
    const token = await getToken();
    
    const requestBody = {
      ...request,
      dateRange: request.dateRange ? {
        startDate: request.dateRange.startDate.toISOString(),
        endDate: request.dateRange.endDate.toISOString()
      } : undefined
    };

    const response = await fetch('/api/analytics/unified-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch analytics data');
    }

    return response.json();
  }, [request, getToken]);

  // Use React Query for caching and state management
  const {
    data,
    isLoading: queryLoading,
    error: queryError,
    refetch,
    isFetching,
    isStale
  } = useQuery({
    queryKey,
    queryFn: fetchUnifiedAnalytics,
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval,
    onSuccess: options.onSuccess,
    onError: options.onError,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Memoized selectors for specific data types
  const selectors = useMemo(() => ({
    metrics: data?.data?.metrics,
    overview: data?.data?.overview,
    timeSeries: data?.data?.timeSeries,
    audience: data?.data?.audience,
    engagement: data?.data?.engagement,
    performance: data?.data?.performance,
    metadata: data?.metadata
  }), [data]);

  // Performance metrics
  const performance = useMemo(() => {
    if (!data?.metadata) return null;
    
    const cacheHitRate = Object.values(data.metadata.cacheStatus)
      .filter(status => status === 'hit').length / 
      Object.keys(data.metadata.cacheStatus).length;
    
    return {
      executionTime: data.metadata.executionTime,
      cacheHitRate: Math.round(cacheHitRate * 100),
      requestId: data.metadata.requestId,
      timestamp: data.metadata.timestamp
    };
  }, [data]);

  // Invalidate specific parts of the cache
  const invalidateCache = useCallback((dataTypes?: string[]) => {
    if (dataTypes) {
      // Invalidate specific data types
      dataTypes.forEach(type => {
        queryClient.invalidateQueries({ queryKey: ['unified-analytics', type] });
      });
    } else {
      // Invalidate all unified analytics queries
      queryClient.invalidateQueries({ queryKey: ['unified-analytics'] });
    }
  }, [queryClient]);

  // Prefetch data
  const prefetch = useCallback((newRequest: UnifiedAnalyticsRequest) => {
    const prefetchKey = ['unified-analytics', newRequest];
    
    queryClient.prefetchQuery({
      queryKey: prefetchKey,
      queryFn: () => fetchUnifiedAnalytics(),
      staleTime: options.staleTime || 5 * 60 * 1000
    });
  }, [queryClient, fetchUnifiedAnalytics, options.staleTime]);

  return {
    // Data
    data: selectors,
    
    // Loading states
    isLoading: queryLoading || isLoading,
    isFetching,
    isStale,
    
    // Error handling
    error: queryError || error,
    
    // Actions
    refetch,
    invalidateCache,
    prefetch,
    
    // Performance metrics
    performance,
    
    // Raw response for debugging
    raw: data
  };
}

/**
 * Hook for dashboard-specific analytics
 * Pre-configured for common dashboard needs
 */
export function useDashboardAnalytics(
  dateRange: { startDate: Date; endDate: Date },
  options: {
    timeframe?: string;
    platform?: string;
    campaignId?: string;
    enabled?: boolean;
  } = {}
) {
  const request: UnifiedAnalyticsRequest = {
    include: {
      metrics: true,
      overview: true,
      timeSeries: [
        { metric: 'views', interval: 'day' },
        { metric: 'engagement', interval: 'day' },
        { metric: 'conversions', interval: 'day' }
      ],
      audience: true,
      engagement: true,
      performance: true
    },
    dateRange,
    timeframe: options.timeframe || '7d',
    platform: options.platform || 'all',
    campaignId: options.campaignId
  };

  return useUnifiedAnalytics(request, {
    enabled: options.enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes for dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

/**
 * Hook for real-time analytics
 * Optimized for frequent updates
 */
export function useRealTimeAnalytics(
  metrics: string[],
  options: {
    interval?: string;
    timeframe?: string;
    enabled?: boolean;
  } = {}
) {
  const dateRange = {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    endDate: new Date()
  };

  const request: UnifiedAnalyticsRequest = {
    include: {
      timeSeries: metrics.map(metric => ({
        metric,
        interval: options.interval || 'hour'
      }))
    },
    dateRange,
    timeframe: options.timeframe || '24h'
  };

  return useUnifiedAnalytics(request, {
    enabled: options.enabled,
    staleTime: 60 * 1000, // 1 minute for real-time
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Hook for campaign-specific analytics
 * Focused on campaign performance metrics
 */
export function useCampaignAnalytics(
  campaignId: string,
  dateRange: { startDate: Date; endDate: Date },
  options: {
    platform?: string;
    enabled?: boolean;
  } = {}
) {
  const request: UnifiedAnalyticsRequest = {
    include: {
      metrics: true,
      overview: true,
      timeSeries: [
        { metric: 'views', interval: 'day' },
        { metric: 'engagement', interval: 'day' },
        { metric: 'conversions', interval: 'day' },
        { metric: 'clicks', interval: 'day' }
      ],
      performance: true
    },
    dateRange,
    campaignId,
    platform: options.platform || 'all'
  };

  return useUnifiedAnalytics(request, {
    enabled: options.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Utility function to create custom analytics requests
 */
export function createAnalyticsRequest(
  config: Partial<UnifiedAnalyticsRequest>
): UnifiedAnalyticsRequest {
  return {
    include: {
      metrics: false,
      overview: false,
      audience: false,
      engagement: false,
      performance: false,
      ...config.include
    },
    timeframe: '7d',
    platform: 'all',
    ...config
  };
}

/**
 * Hook for analytics health monitoring
 */
export function useAnalyticsHealth() {
  const { getToken } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-health'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch('/api/analytics/unified?action=health', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Check every minute
  });

  return {
    health: data,
    isLoading,
    error,
    isHealthy: data?.status === 'healthy'
  };
}