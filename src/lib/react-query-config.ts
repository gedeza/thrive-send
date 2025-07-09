import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized React Query configuration to control API polling and caching
 * This prevents high-frequency API calls and optimizes performance
 */

export const QUERY_STALE_TIME = {
  // Very short-lived data (user interactions)
  SHORT: 30 * 1000, // 30 seconds
  
  // Medium-lived data (analytics, dashboard metrics)  
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  
  // Long-lived data (campaigns, content lists)
  LONG: 15 * 60 * 1000, // 15 minutes
  
  // Very long-lived data (user profiles, settings)
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
};

export const QUERY_CACHE_TIME = {
  // Keep in memory for short time
  SHORT: 5 * 60 * 1000, // 5 minutes
  
  // Standard cache time
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  
  // Long cache time for stable data
  LONG: 60 * 60 * 1000, // 1 hour
  
  // Very long cache for rarely changing data
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Default query options that prevent aggressive polling
export const defaultQueryOptions = {
  // Disable automatic background refetching
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchInterval: false,
  
  // Conservative retry strategy
  retry: 1,
  retryDelay: (attemptIndex: number) => Math.min(3000 * 2 ** attemptIndex, 30000),
  
  // Standard cache settings
  staleTime: QUERY_STALE_TIME.MEDIUM,
  cacheTime: QUERY_CACHE_TIME.MEDIUM,
};

// Specific configurations for different data types
export const queryConfig = {
  // Dashboard data - balance between freshness and performance
  dashboard: {
    ...defaultQueryOptions,
    staleTime: QUERY_STALE_TIME.LONG,
    cacheTime: QUERY_CACHE_TIME.LONG,
  },
  
  // Analytics data - can be slightly stale for performance
  analytics: {
    ...defaultQueryOptions,
    staleTime: QUERY_STALE_TIME.LONG,
    cacheTime: QUERY_CACHE_TIME.LONG,
  },
  
  // Campaign data - moderate freshness needed
  campaigns: {
    ...defaultQueryOptions,
    staleTime: QUERY_STALE_TIME.LONG,
    cacheTime: QUERY_CACHE_TIME.LONG,
  },
  
  // Content data - needs fresher data for active editing
  content: {
    ...defaultQueryOptions,
    staleTime: QUERY_STALE_TIME.MEDIUM,
    cacheTime: QUERY_CACHE_TIME.MEDIUM,
  },
  
  // Activity feed - can tolerate longer intervals
  activity: {
    ...defaultQueryOptions,
    staleTime: QUERY_STALE_TIME.VERY_LONG,
    cacheTime: QUERY_CACHE_TIME.LONG,
  },
  
  // User/profile data - very stable
  profile: {
    ...defaultQueryOptions,
    staleTime: QUERY_STALE_TIME.VERY_LONG,
    cacheTime: QUERY_CACHE_TIME.VERY_LONG,
  },
};

// Create QueryClient with optimized defaults
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: defaultQueryOptions,
      mutations: {
        retry: 1,
        retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 20000),
      },
    },
  });
}

// Hook to get query configuration by type
export function useQueryConfig(type: keyof typeof queryConfig) {
  return queryConfig[type];
}