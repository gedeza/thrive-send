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

  const invalidateCache = useCallback(() => {
    setLastCacheInvalidation(Date.now());
  }, []);

  // Update the clearAllCaches function to safely use localStorage
  const clearAllCaches = useCallback(() => {
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