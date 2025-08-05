"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { calendarCache, CacheConfig, CacheStats } from '@/lib/cache/calendar-cache';

interface CalendarCacheContextType {
  lastCacheInvalidation: number;
  invalidateCache: () => void;
  isCachingEnabled: boolean;
  setCachingEnabled: (enabled: boolean) => void;
  clearAllCaches: () => void;
  get: (key: string, config?: CacheConfig, refreshFn?: () => Promise<any>) => Promise<any>;
  set: (key: string, value: any, config?: CacheConfig) => Promise<void>;
  invalidate: (pattern: string | RegExp, reason?: 'create' | 'update' | 'delete') => Promise<void>;
  clear: () => Promise<void>;
  getStats: () => CacheStats;
}

const CalendarCacheContext = createContext<CalendarCacheContextType>({
  lastCacheInvalidation: 0,
  invalidateCache: () => {},
  isCachingEnabled: true, 
  setCachingEnabled: () => {},
  clearAllCaches: () => {},
  get: async () => null,
  set: async () => {},
  invalidate: async () => {},
  clear: async () => {},
  getStats: () => ({
    hitRate: 0,
    totalHits: 0,
    totalMisses: 0,
    cacheSize: 0,
    memoryUsage: 0,
    oldestEntry: 0,
    newestEntry: 0
  })
});

export const useCalendarCache = () => useContext(CalendarCacheContext);

interface CalendarCacheProviderProps {
  children: ReactNode;
}

// Add a safe localStorage function
function isLocalStorageAvailable() {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export const CalendarCacheProvider = ({ children }: CalendarCacheProviderProps) => {
  const [lastCacheInvalidation, setLastCacheInvalidation] = useState<number>(Date.now());
  const [isCachingEnabled, setIsCachingEnabled] = useState<boolean>(
    process.env.NODE_ENV === 'development' // Enable by default in development
  );

  // Use the exported cache instance
  const getCache = useCallback(() => {
    return calendarCache;
  }, []);

  const invalidateCache = useCallback(() => {
    setLastCacheInvalidation(Date.now());
  }, []);

  // Enhanced cache operations
  const get = useCallback(async (
    key: string,
    config?: CacheConfig,
    refreshFn?: () => Promise<any>
  ): Promise<any> => {
    if (!isCachingEnabled) {
      return refreshFn ? await refreshFn() : null;
    }

    const cache = getCache();
    return cache.get(key, config, refreshFn);
  }, [isCachingEnabled, getCache]);

  const set = useCallback(async (
    key: string,
    value: any,
    config?: CacheConfig
  ): Promise<void> => {
    if (!isCachingEnabled) return;

    const cache = getCache();
    return cache.set(key, value, config);
  }, [isCachingEnabled, getCache]);

  const invalidate = useCallback(async (
    pattern: string | RegExp,
    reason: 'create' | 'update' | 'delete' = 'update'
  ): Promise<void> => {
    if (!isCachingEnabled) return;

    const cache = getCache();
    await cache.invalidate(pattern, reason);
    setLastCacheInvalidation(Date.now());
  }, [isCachingEnabled, getCache]);

  const clear = useCallback(async (): Promise<void> => {
    if (!isCachingEnabled) return;

    const cache = getCache();
    await cache.clear();
    setLastCacheInvalidation(Date.now());
  }, [isCachingEnabled, getCache]);

  const getStats = useCallback((): CacheStats => {
    if (!isCachingEnabled) {
      return {
        hitRate: 0,
        totalHits: 0,
        totalMisses: 0,
        cacheSize: 0,
        memoryUsage: 0,
        oldestEntry: 0,
        newestEntry: 0
      };
    }

    const cache = getCache();
    return cache.getStats();
  }, [isCachingEnabled, getCache]);

  // Update the clearAllCaches function to safely use localStorage
  const clearAllCaches = useCallback(async () => {
    // Clear localStorage cache
    if (isLocalStorageAvailable()) {
      try {
        localStorage.removeItem('calendarEventsCache');
        localStorage.removeItem('calendarEventsCacheTimestamp');
        console.log('[CalendarCache] Cleared localStorage cache');
      } catch (error) {
        console.warn('[CalendarCache] Error clearing localStorage cache:', error);
      }
    }
    
    // Clear advanced cache
    await clear();
    
    // Invalidate memory cache by updating timestamp
    invalidateCache();
  }, [invalidateCache, clear]);

  return (
    <CalendarCacheContext.Provider
      value={{
        lastCacheInvalidation,
        invalidateCache,
        isCachingEnabled,
        setCachingEnabled: setIsCachingEnabled,
        clearAllCaches,
        get,
        set,
        invalidate,
        clear,
        getStats,
      }}
    >
      {children}
    </CalendarCacheContext.Provider>
  );
};