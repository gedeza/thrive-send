'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ContentAnalytics, 
  getBulkContentAnalytics, 
  getContentAnalytics 
} from '@/lib/api/content-analytics-service';

// Hook for fetching analytics for multiple content items
export function useBulkContentAnalytics(contentIds: string[]) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-analytics', 'bulk', contentIds.sort()],
    queryFn: () => getBulkContentAnalytics(contentIds),
    enabled: contentIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    analyticsMap: data || {},
    isLoading,
    error,
    refetch,
  };
}

// Hook for fetching analytics for a single content item
export function useContentAnalytics(contentId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-analytics', contentId],
    queryFn: () => getContentAnalytics(contentId),
    enabled: !!contentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    analytics: data,
    isLoading,
    error,
    refetch,
  };
}

// Hook for managing analytics state with local updates
export function useContentAnalyticsState(initialAnalytics?: ContentAnalytics | null) {
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(initialAnalytics || null);
  const [isOptimisticallyUpdated, setIsOptimisticallyUpdated] = useState(false);

  // Update analytics optimistically (for real-time feel)
  const updateAnalyticsOptimistically = (updates: Partial<ContentAnalytics>) => {
    if (analytics) {
      setAnalytics(prev => prev ? { ...prev, ...updates } : null);
      setIsOptimisticallyUpdated(true);
      
      // Reset optimistic flag after a delay
      setTimeout(() => setIsOptimisticallyUpdated(false), 3000);
    }
  };

  // Increment view count (for when user views content)
  const incrementViews = () => {
    updateAnalyticsOptimistically({
      views: (analytics?.views || 0) + 1
    });
  };

  // Increment engagement (likes, shares, comments)
  const incrementEngagement = (type: 'likes' | 'shares' | 'comments') => {
    if (analytics) {
      const currentValue = analytics[type] || 0;
      updateAnalyticsOptimistically({
        [type]: currentValue + 1
      });
    }
  };

  return {
    analytics,
    setAnalytics,
    isOptimisticallyUpdated,
    updateAnalyticsOptimistically,
    incrementViews,
    incrementEngagement,
  };
}