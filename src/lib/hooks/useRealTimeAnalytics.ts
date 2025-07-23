'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ContentAnalytics } from '@/lib/api/content-analytics-service';

interface RealTimeUpdate {
  contentId: string;
  field: keyof ContentAnalytics;
  value: number;
  timestamp: number;
}

interface UseRealTimeAnalyticsOptions {
  contentIds: string[];
  enabled?: boolean;
  interval?: number; // Update interval in ms
  simulateUpdates?: boolean; // For development - simulate real-time updates
}

export function useRealTimeAnalytics({
  contentIds,
  enabled = true,
  interval = 30000, // 30 seconds default
  simulateUpdates = process.env.NODE_ENV === 'development'
}: UseRealTimeAnalyticsOptions) {
  const [realtimeUpdates, setRealtimeUpdates] = useState<Record<string, Partial<ContentAnalytics>>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket>();

  // Ensure contentIds is always an array to prevent crashes
  const safeContentIds = Array.isArray(contentIds) ? contentIds : [];

  // Simulate real-time updates (for development)
  const simulateRealTimeUpdate = useCallback(() => {
    if (!simulateUpdates || safeContentIds.length === 0) return;

    const randomContentId = safeContentIds[Math.floor(Math.random() * safeContentIds.length)];
    const updateTypes: Array<keyof ContentAnalytics> = ['views', 'likes', 'shares', 'comments'];
    const randomField = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    // Generate realistic increments
    let increment = 1;
    if (randomField === 'views') increment = Math.floor(Math.random() * 5) + 1;
    else if (randomField === 'likes') increment = Math.floor(Math.random() * 3) + 1;
    else increment = Math.floor(Math.random() * 2) + 1;

    setRealtimeUpdates(prev => {
      const currentValue = prev[randomContentId]?.[randomField] || 0;
      return {
        ...prev,
        [randomContentId]: {
          ...prev[randomContentId],
          [randomField]: (currentValue as number) + increment,
          updatedAt: new Date().toISOString()
        }
      };
    });

    setLastUpdateTime(new Date());

    // Invalidate React Query cache to trigger refetch
    queryClient.invalidateQueries({ 
      queryKey: ['content-analytics', 'bulk'],
      exact: false 
    });
  }, [safeContentIds, simulateUpdates, queryClient]);

  // Initialize WebSocket connection (for production)
  const initializeWebSocket = useCallback(() => {
    if (typeof window === 'undefined' || !enabled) return;

    // In a real implementation, this would connect to your WebSocket server
    // For now, we'll use a mock WebSocket for demonstration
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/analytics';
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Analytics WebSocket connected');
        setIsConnected(true);
        
        // Subscribe to analytics updates for specific content
        ws.send(JSON.stringify({
          type: 'subscribe',
          contentIds: safeContentIds
        }));
      };

      ws.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          
          setRealtimeUpdates(prev => ({
            ...prev,
            [update.contentId]: {
              ...prev[update.contentId],
              [update.field]: update.value,
              updatedAt: new Date(update.timestamp).toISOString()
            }
          }));

          setLastUpdateTime(new Date(update.timestamp));
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ 
            queryKey: ['content-analytics', update.contentId] 
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (enabled) initializeWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setIsConnected(false);
    }
  }, [safeContentIds, enabled, queryClient]);

  // Start real-time updates
  useEffect(() => {
    if (!enabled || safeContentIds.length === 0) return;

    if (simulateUpdates) {
      // Use polling for simulated updates
      intervalRef.current = setInterval(simulateRealTimeUpdate, interval);
      setIsConnected(true);
    } else {
      // Use WebSocket for real updates
      initializeWebSocket();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsConnected(false);
    };
  }, [enabled, safeContentIds, interval, simulateUpdates, simulateRealTimeUpdate, initializeWebSocket]);

  // Manual refresh function
  const refreshAnalytics = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['content-analytics'],
      exact: false 
    });
    setLastUpdateTime(new Date());
  }, [queryClient]);

  // Get real-time analytics for a specific content item
  const getRealTimeAnalytics = useCallback((contentId: string): Partial<ContentAnalytics> | null => {
    return realtimeUpdates[contentId] || null;
  }, [realtimeUpdates]);

  // Clear real-time updates
  const clearUpdates = useCallback(() => {
    setRealtimeUpdates({});
  }, []);

  // Ensure all return values are defined
  return {
    realtimeUpdates: realtimeUpdates || {},
    isConnected: isConnected || false,
    lastUpdateTime: lastUpdateTime || null,
    refreshAnalytics: refreshAnalytics || (() => {}),
    getRealTimeAnalytics: getRealTimeAnalytics || (() => null),
    clearUpdates: clearUpdates || (() => {}),
    connectionStatus: isConnected ? 'connected' : 'disconnected'
  };
}

// Hook for a single content item's real-time analytics
export function useContentRealTimeAnalytics(contentId: string, enabled = true) {
  const { 
    realtimeUpdates, 
    isConnected, 
    lastUpdateTime,
    getRealTimeAnalytics 
  } = useRealTimeAnalytics({
    contentIds: [contentId],
    enabled
  });

  return {
    realTimeAnalytics: getRealTimeAnalytics(contentId),
    isConnected,
    lastUpdateTime,
    hasUpdates: !!realtimeUpdates[contentId]
  };
}