import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * High-Performance Analytics Hook
 * Features:
 * - Intelligent caching with stale-while-revalidate
 * - Background prefetching
 * - Smart invalidation
 * - Performance monitoring
 * - Memory optimization
 */

export interface AnalyticsParams {
  timeframe?: string;
  startDate?: string;
  endDate?: string;
  include?: {
    audience?: boolean;
    engagement?: boolean;
    revenue?: boolean;
    overview?: boolean;
  };
  platform?: string;
  refreshInterval?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface AnalyticsMetrics {
  totalViews: number;
  totalReach: number;
  totalConversions: number;
  engagementRate: string;
  viewsChange: number;
  reachChange: number;
  conversionsChange: number;
  engagementChange: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  summary: any;
  timeSeriesData: any;
  charts: {
    performanceTrend: any[];
    platformPerformance: any[];
    activityHeatmap: any[];
  };
  audience?: any;
  engagement?: any;
  revenue?: any;
  overview?: any;
  performance: {
    databaseQueries: number;
    cacheMiss: boolean;
    responseTime: string;
  };
}

// Cache configuration optimized for analytics
const ANALYTICS_CACHE_CONFIG = {
  staleTime: 4 * 60 * 1000, // 4 minutes - data is fresh
  gcTime: 15 * 60 * 1000, // 15 minutes - keep in memory
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: (failureCount: number, error: any) => {
    // Exponential backoff for retries
    if (failureCount < 3 && error?.status !== 401) {
      return true;
    }
    return false;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Performance tracking
let renderCount = 0;
const performanceMetrics = {
  averageResponseTime: 0,
  cacheHitRate: 0,
  totalRequests: 0,
  cacheHits: 0,
};

export function useOptimizedAnalytics(params: AnalyticsParams = {}) {
  const queryClient = useQueryClient();
  const performanceRef = useRef({ startTime: 0, endTime: 0 });
  const renderCountRef = useRef(0);
  
  // Increment render counter for performance monitoring
  useEffect(() => {
    renderCountRef.current += 1;
    renderCount += 1;
  });

  // Memoized query key for optimal cache performance
  const queryKey = useMemo(() => {
    const baseKey = ['analytics', 'comprehensive'];
    const paramsKey = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : value]);
    
    return [...baseKey, ...paramsKey];
  }, [params]);

  // Optimized fetch function with performance tracking
  const fetchAnalytics = useCallback(async (): Promise<AnalyticsData> => {
    performanceRef.current.startTime = performance.now();
    performanceMetrics.totalRequests += 1;

    try {
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Let our cache handle it
        },
        body: JSON.stringify({
          ...params,
          requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analytics fetch failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Track performance
      performanceRef.current.endTime = performance.now();
      const responseTime = performanceRef.current.endTime - performanceRef.current.startTime;
      
      // Update performance metrics
      performanceMetrics.averageResponseTime = 
        (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + responseTime) / performanceMetrics.totalRequests;
      
      if (result.cached) {
        performanceMetrics.cacheHits += 1;
      }
      performanceMetrics.cacheHitRate = performanceMetrics.cacheHits / performanceMetrics.totalRequests;

      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Analytics fetch completed in ${responseTime.toFixed(2)}ms`, {
          cached: result.cached,
          cacheHitRate: `${(performanceMetrics.cacheHitRate * 100).toFixed(1)}%`,
          averageResponseTime: `${performanceMetrics.averageResponseTime.toFixed(2)}ms`,
          renderCount: renderCountRef.current,
        });
      }

      return result.data;
    } catch (error) {
      console.error('Analytics fetch error:', error);
      throw error;
    }
  }, [params]);

  // Main analytics query with optimized configuration
  const analyticsQuery = useQuery({
    queryKey,
    queryFn: fetchAnalytics,
    ...ANALYTICS_CACHE_CONFIG,
    refetchInterval: params.refreshInterval || (params.priority === 'high' ? 30000 : 60000),
    enabled: true,
  });

  // Prefetch related data for better UX
  const prefetchRelatedData = useCallback(() => {
    if (analyticsQuery.isSuccess && !params.include?.overview) {
      // Prefetch overview data for potential future requests
      queryClient.prefetchQuery({
        queryKey: [...queryKey.slice(0, -1), 'include', { ...params.include, overview: true }],
        queryFn: () => fetchAnalytics(),
        staleTime: ANALYTICS_CACHE_CONFIG.staleTime,
      });
    }
  }, [queryClient, queryKey, fetchAnalytics, analyticsQuery.isSuccess, params.include]);

  // Trigger prefetch when main query succeeds
  useEffect(() => {
    if (analyticsQuery.isSuccess && params.priority !== 'low') {
      prefetchRelatedData();
    }
  }, [analyticsQuery.isSuccess, prefetchRelatedData, params.priority]);

  // Smart cache invalidation
  const invalidateAnalytics = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['analytics'],
      type: 'all',
    });
  }, [queryClient]);

  // Background refresh for stale data
  const refreshAnalytics = useCallback(() => {
    queryClient.refetchQueries({
      queryKey,
      type: 'active',
    });
  }, [queryClient, queryKey]);

  // Memoized derived data to prevent unnecessary recalculations
  const derivedMetrics = useMemo(() => {
    if (!analyticsQuery.data) return null;

    const { metrics } = analyticsQuery.data;
    
    return {
      totalEngagements: metrics.totalViews + metrics.totalReach,
      conversionRate: metrics.totalConversions / Math.max(metrics.totalViews, 1),
      engagementTrend: metrics.viewsChange > 0 && metrics.reachChange > 0 ? 'up' : 
                      metrics.viewsChange < 0 && metrics.reachChange < 0 ? 'down' : 'neutral',
      performanceScore: (
        (metrics.totalViews / 1000) * 0.3 +
        (metrics.totalReach / 1000) * 0.3 +
        (metrics.totalConversions / 100) * 0.4
      ),
    };
  }, [analyticsQuery.data]);

  // Performance monitoring data
  const performanceData = useMemo(() => ({
    renderCount: renderCountRef.current,
    globalRenderCount: renderCount,
    averageResponseTime: performanceMetrics.averageResponseTime,
    cacheHitRate: performanceMetrics.cacheHitRate,
    totalRequests: performanceMetrics.totalRequests,
    lastFetchTime: performanceRef.current.endTime - performanceRef.current.startTime,
    queryStatus: analyticsQuery.status,
    dataUpdatedAt: analyticsQuery.dataUpdatedAt,
  }), [analyticsQuery.status, analyticsQuery.dataUpdatedAt]);

  return {
    // Core data
    data: analyticsQuery.data,
    metrics: analyticsQuery.data?.metrics,
    charts: analyticsQuery.data?.charts,
    summary: analyticsQuery.data?.summary,
    timeSeriesData: analyticsQuery.data?.timeSeriesData,
    
    // Query state
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    isSuccess: analyticsQuery.isSuccess,
    isFetching: analyticsQuery.isFetching,
    isRefetching: analyticsQuery.isRefetching,
    
    // Derived data
    derivedMetrics,
    
    // Actions
    refresh: refreshAnalytics,
    invalidate: invalidateAnalytics,
    prefetchRelated: prefetchRelatedData,
    
    // Performance monitoring
    performance: performanceData,
    
    // Cache management
    queryKey,
    lastUpdated: analyticsQuery.dataUpdatedAt,
  };
}

/**
 * Lightweight analytics hook for dashboard widgets
 * Optimized for minimal re-renders and memory usage
 */
export function useAnalyticsWidget(params: AnalyticsParams = {}) {
  const { data, isLoading, error, metrics, performance } = useOptimizedAnalytics(params);
  
  return useMemo(() => ({
    metrics: metrics || null,
    isLoading,
    hasError: !!error,
    performance: performance.lastFetchTime,
  }), [metrics, isLoading, error, performance.lastFetchTime]);
}

/**
 * Advanced real-time analytics hook with WebSocket support and intelligent fallback
 */
export function useRealTimeAnalytics(params: AnalyticsParams = {}) {
  const queryClient = useQueryClient();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { data, queryKey, refresh } = useOptimizedAnalytics({ 
    ...params, 
    refreshInterval: isRealTimeEnabled ? undefined : 30000 // Disable polling when real-time is active
  });

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Skip connection if WebSocket is not enabled in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_WEBSOCKET_ENABLED !== 'true') {
      console.log('📊 WebSocket disabled in development mode');
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    try {
      // Use secure WebSocket in production, regular in development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/analytics/realtime`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('📊 Real-time analytics WebSocket connected');
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        // Send subscription message with query parameters
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          params: {
            ...params,
            queryKey: queryKey.join('_')
          }
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'analytics_update' && message.data) {
            // Update React Query cache with real-time data
            queryClient.setQueryData(queryKey, (oldData: any) => {
              if (!oldData) return message.data;
              
              // Merge real-time updates with existing data
              return {
                ...oldData,
                ...message.data,
                metrics: {
                  ...oldData.metrics,
                  ...message.data.metrics
                },
                charts: {
                  ...oldData.charts,
                  ...message.data.charts
                },
                performance: {
                  ...message.data.performance,
                  realTime: true,
                  lastUpdate: new Date().toISOString()
                }
              };
            });

            // Log real-time update in development
            if (process.env.NODE_ENV === 'development') {
              console.log('📈 Real-time analytics update received:', {
                timestamp: new Date().toISOString(),
                dataKeys: Object.keys(message.data),
                metricsKeys: Object.keys(message.data.metrics || {}),
              });
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('📊 Real-time analytics WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if connection was intentional
        if (isRealTimeEnabled && reconnectAttempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/5)`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('📊 Real-time analytics WebSocket error:', error);
        setConnectionStatus('error');
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      
      // Fallback to polling if WebSocket fails
      if (isRealTimeEnabled) {
        console.log('🔄 Falling back to polling mode');
        // The useOptimizedAnalytics hook will handle polling
      }
    }
  }, [params, queryKey, queryClient, isRealTimeEnabled, reconnectAttempts]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
  }, []);

  // Enable real-time updates
  const enableRealTime = useCallback(() => {
    setIsRealTimeEnabled(true);
    connectWebSocket();
  }, [connectWebSocket]);

  // Disable real-time updates
  const disableRealTime = useCallback(() => {
    setIsRealTimeEnabled(false);
    disconnectWebSocket();
  }, [disconnectWebSocket]);

  // Force refresh (useful when WebSocket is unavailable)
  const forceRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  }, [refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  // Auto-reconnect when enabled
  useEffect(() => {
    if (isRealTimeEnabled && connectionStatus === 'disconnected' && reconnectAttempts === 0) {
      // Only try to connect in production or if WebSocket server is available
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_WEBSOCKET_ENABLED === 'true') {
        connectWebSocket();
      } else {
        console.log('📊 Real-time analytics disabled in development (WebSocket server not available)');
        setConnectionStatus('disconnected');
      }
    }
  }, [isRealTimeEnabled, connectionStatus, reconnectAttempts, connectWebSocket]);

  return {
    data,
    isRealTime: isRealTimeEnabled,
    connectionStatus,
    reconnectAttempts,
    enableRealTime,
    disableRealTime,
    forceRefresh,
    isConnected: connectionStatus === 'connected',
    hasError: connectionStatus === 'error',
  };
}

// Export performance metrics for debugging
export const getAnalyticsPerformanceMetrics = () => ({
  ...performanceMetrics,
  totalRenderCount: renderCount,
});