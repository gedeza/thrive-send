"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CalendarEvent } from '@/components/content/content-calendar';

interface CalendarCacheContextType {
  lastCacheInvalidation: number;
  invalidateCache: () => void;
  isCachingEnabled: boolean;
  setCachingEnabled: (enabled: boolean) => void;
  clearAllCaches: () => void;
}

const CalendarCacheContext = createContext<CalendarCacheContextType>({
  lastCacheInvalidation: 0,
  invalidateCache: () => {},
  isCachingEnabled: true, 
  setCachingEnabled: () => {},
  clearAllCaches: () => {},
});

export const useCalendarCache = () => useContext(CalendarCacheContext);

interface CalendarCacheProviderProps {
  children: ReactNode;
}

export const CalendarCacheProvider = ({ children }: CalendarCacheProviderProps) => {
  const [lastCacheInvalidation, setLastCacheInvalidation] = useState<number>(Date.now());
  const [isCachingEnabled, setIsCachingEnabled] = useState<boolean>(
    process.env.NODE_ENV === 'development' // Enable by default in development
  );

  const invalidateCache = useCallback(() => {
    setLastCacheInvalidation(Date.now());
  }, []);

  const clearAllCaches = useCallback(() => {
    // Clear localStorage cache
    try {
      localStorage.removeItem('calendarEventsCache');
      localStorage.removeItem('calendarEventsCacheTimestamp');
      console.log('[CalendarCache] Cleared localStorage cache');
    } catch (error) {
      console.warn('[CalendarCache] Error clearing localStorage cache:', error);
    }
    
    // Invalidate memory cache by updating timestamp
    invalidateCache();
  }, [invalidateCache]);

  return (
    <CalendarCacheContext.Provider
      value={{
        lastCacheInvalidation,
        invalidateCache,
        isCachingEnabled,
        setCachingEnabled: setIsCachingEnabled,
        clearAllCaches,
      }}
    >
      {children}
    </CalendarCacheContext.Provider>
  );
}; 