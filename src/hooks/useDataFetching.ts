import { useState, useEffect, useCallback, useRef } from 'react';
import { errorLogger } from '@/lib/error/errorLogger';
import { errorTracking } from '@/lib/error/errorTracking';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  cacheTime?: number; // Time in milliseconds to cache the data
  retryCount?: number; // Number of times to retry on failure
  retryDelay?: number; // Delay between retries in milliseconds
}

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useDataFetching<T>(
  url: string,
  options: FetchOptions = {}
) {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache time
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isRefreshing: false,
  });

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const abortController = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRefreshing = false) => {
    try {
      // Check cache first
      const cachedEntry = cache.current.get(url);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < cacheTime) {
        setState(prev => ({
          ...prev,
          data: cachedEntry.data,
          error: null,
          isLoading: false,
          isRefreshing: false,
        }));
        return;
      }

      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
      }

      // Create new abort controller
      abortController.current = new AbortController();

      setState(prev => ({
        ...prev,
        isLoading: !isRefreshing,
        isRefreshing,
        error: null,
      }));

      let attempts = 0;
      let lastError: Error | null = null;

      while (attempts <= retryCount) {
        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: abortController.current.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Update cache
          cache.current.set(url, {
            data,
            timestamp: Date.now(),
          });

          setState(prev => ({
            ...prev,
            data,
            error: null,
            isLoading: false,
            isRefreshing: false,
          }));

          return;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }

          attempts++;
          if (attempts <= retryCount) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      throw lastError;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Log error
      errorLogger.log(error, {
        context: { url, method, attempts: retryCount },
        component: 'useDataFetching',
      });

      // Track error
      errorTracking.captureError(error, {
        url,
        method,
        attempts: retryCount,
      });

      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error(errorMessage),
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, [url, method, headers, body, cacheTime, retryCount, retryDelay]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchData]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Clear cache for this URL
  const clearCache = useCallback(() => {
    cache.current.delete(url);
  }, [url]);

  return {
    ...state,
    refresh,
    clearCache,
  };
} 