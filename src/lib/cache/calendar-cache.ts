/**
 * Calendar Cache System
 * Intelligent caching strategies for calendar data with automatic invalidation
 */

import { CalendarEvent } from '@/components/content/types';

export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';

export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  invalidateOn: ('create' | 'update' | 'delete')[];
  compression: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  key: string;
}

export interface CacheStats {
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

// Default cache configurations for different data types
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  events: {
    strategy: 'memory',
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    invalidateOn: ['create', 'update', 'delete'],
    compression: true
  },
  monthView: {
    strategy: 'memory',
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 50,
    invalidateOn: ['create', 'update', 'delete'],
    compression: false
  },
  templates: {
    strategy: 'localStorage',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 100,
    invalidateOn: [],
    compression: true
  },
  userPreferences: {
    strategy: 'localStorage',
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 10,
    invalidateOn: [],
    compression: false
  },
  recurringPatterns: {
    strategy: 'memory',
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 200,
    invalidateOn: ['create', 'update'],
    compression: true
  }
};

class CalendarCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    operations: 0
  };
  private maxMemorySize = 50 * 1024 * 1024; // 50MB
  private currentMemorySize = 0;

  constructor() {
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
    
    // Listen for storage events to sync across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Get data from cache with automatic fallback and refresh
   */
  async get<T>(
    key: string, 
    config: CacheConfig = CACHE_CONFIGS.events,
    refreshFn?: () => Promise<T>
  ): Promise<T | null> {
    this.stats.operations++;

    // Try to get from appropriate cache
    const entry = await this.getFromCache<T>(key, config.strategy);
    
    if (entry && !this.isExpired(entry)) {
      entry.hits++;
      this.stats.hits++;
      return entry.data;
    }

    this.stats.misses++;

    // If refresh function provided, fetch fresh data
    if (refreshFn) {
      try {
        const freshData = await refreshFn();
        await this.set(key, freshData, config);
        return freshData;
      } catch (error) {
        console.warn('Cache refresh failed:', error);
        // Return stale data if available
        return entry?.data || null;
      }
    }

    return null;
  }

  /**
   * Set data in cache with automatic compression and size management
   */
  async set<T>(key: string, data: T, config: CacheConfig = CACHE_CONFIGS.events): Promise<void> {
    const serializedData = config.compression ? this.compress(data) : data;
    const size = this.estimateSize(serializedData);
    
    const entry: CacheEntry<T> = {
      data: serializedData,
      timestamp: Date.now(),
      ttl: config.ttl,
      hits: 0,
      size,
      key
    };

    await this.setInCache(key, entry, config.strategy);

    // Update memory tracking
    if (config.strategy === 'memory') {
      this.currentMemorySize += size;
      this.enforceMemoryLimit(config);
    }
  }

  /**
   * Intelligent cache invalidation based on data relationships
   */
  async invalidate(pattern: string | RegExp, reason: 'create' | 'update' | 'delete' = 'update'): Promise<void> {
    const keysToInvalidate: string[] = [];

    // Check memory cache
    for (const key of this.memoryCache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keysToInvalidate.push(key);
      }
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.matchesPattern(key, pattern)) {
          keysToInvalidate.push(key);
        }
      }
    }

    // Invalidate all matching keys
    for (const key of keysToInvalidate) {
      await this.delete(key);
    }

    // Invalidate related caches based on data relationships
    await this.invalidateRelated(pattern, reason);
  }

  /**
   * Preload critical data for improved perceived performance
   */
  async preload(keys: Array<{ key: string; config: CacheConfig; fetcher: () => Promise<any> }>): Promise<void> {
    const preloadPromises = keys.map(async ({ key, config, fetcher }) => {
      const exists = await this.has(key, config.strategy);
      if (!exists) {
        try {
          const data = await fetcher();
          await this.set(key, data, config);
        } catch (error) {
          console.warn(`Preload failed for ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): CacheStats {
    const hitRate = this.stats.operations > 0 ? this.stats.hits / this.stats.operations : 0;
    
    let oldestEntry = Date.now();
    let newestEntry = 0;
    
    for (const entry of this.memoryCache.values()) {
      oldestEntry = Math.min(oldestEntry, entry.timestamp);
      newestEntry = Math.max(newestEntry, entry.timestamp);
    }

    return {
      hitRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      cacheSize: this.memoryCache.size,
      memoryUsage: this.currentMemorySize,
      oldestEntry: oldestEntry === Date.now() ? 0 : oldestEntry,
      newestEntry
    };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.currentMemorySize = 0;
    
    if (typeof window !== 'undefined') {
      // Clear cache-related localStorage items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  // Private methods

  private async getFromCache<T>(key: string, strategy: CacheStrategy): Promise<CacheEntry<T> | null> {
    switch (strategy) {
      case 'memory':
        return this.memoryCache.get(key) || null;
      
      case 'localStorage':
        if (typeof window === 'undefined') return null;
        const item = localStorage.getItem(`cache:${key}`);
        return item ? JSON.parse(item) : null;
      
      case 'sessionStorage':
        if (typeof window === 'undefined') return null;
        const sessionItem = sessionStorage.getItem(`cache:${key}`);
        return sessionItem ? JSON.parse(sessionItem) : null;
      
      default:
        return null;
    }
  }

  private async setInCache<T>(key: string, entry: CacheEntry<T>, strategy: CacheStrategy): Promise<void> {
    switch (strategy) {
      case 'memory':
        this.memoryCache.set(key, entry);
        break;
      
      case 'localStorage':
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
          } catch (error) {
            console.warn('localStorage cache failed:', error);
          }
        }
        break;
      
      case 'sessionStorage':
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry));
          } catch (error) {
            console.warn('sessionStorage cache failed:', error);
          }
        }
        break;
    }
  }

  private async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache:${key}`);
      sessionStorage.removeItem(`cache:${key}`);
    }
  }

  private async has(key: string, strategy: CacheStrategy): Promise<boolean> {
    const entry = await this.getFromCache(key, strategy);
    return entry !== null && !this.isExpired(entry);
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        this.currentMemorySize -= entry.size;
      }
    }

    // Clean localStorage cache
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache:')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item);
              if (this.isExpired(entry)) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            keysToRemove.push(key); // Remove corrupted entries
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  private enforceMemoryLimit(config: CacheConfig): void {
    if (this.currentMemorySize <= this.maxMemorySize) return;

    // Sort by last access time and remove oldest entries
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    while (this.currentMemorySize > this.maxMemorySize && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this.memoryCache.delete(key);
      this.currentMemorySize -= entry.size;
    }
  }

  private matchesPattern(key: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return key.includes(pattern);
    }
    return pattern.test(key);
  }

  private async invalidateRelated(pattern: string | RegExp, reason: string): Promise<void> {
    // Define data relationships for smart invalidation
    const relationships: Record<string, string[]> = {
      'events': ['monthView', 'weekView', 'dayView', 'listView'],
      'templates': ['eventForm'],
      'userPreferences': ['calendarSettings']
    };

    const patternStr = pattern.toString();
    for (const [dataType, related] of Object.entries(relationships)) {
      if (patternStr.includes(dataType)) {
        for (const relatedType of related) {
          await this.invalidate(relatedType, reason);
        }
      }
    }
  }

  private compress<T>(data: T): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.warn('Compression failed:', error);
      return JSON.stringify(data);
    }
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key && event.key.startsWith('cache:')) {
      // Invalidate memory cache when localStorage changes in other tabs
      const cacheKey = event.key.replace('cache:', '');
      this.memoryCache.delete(cacheKey);
    }
  }
}

// Export singleton instance
export const calendarCache = new CalendarCache();

// Hook for React components
export function useCalendarCache() {
  return {
    cache: calendarCache,
    get: calendarCache.get.bind(calendarCache),
    set: calendarCache.set.bind(calendarCache),
    invalidate: calendarCache.invalidate.bind(calendarCache),
    preload: calendarCache.preload.bind(calendarCache),
    getStats: calendarCache.getStats.bind(calendarCache)
  };
}

// Cache key generators
export const generateCacheKey = {
  events: (filters?: any) => {
    const baseKey = 'events';
    if (!filters) return baseKey;
    
    const filterHash = btoa(JSON.stringify(filters)).slice(0, 8);
    return `${baseKey}:${filterHash}`;
  },
  
  monthView: (date: string, timezone: string) => 
    `monthView:${date}:${timezone}`,
  
  weekView: (date: string, timezone: string) => 
    `weekView:${date}:${timezone}`,
  
  dayView: (date: string, timezone: string) => 
    `dayView:${date}:${timezone}`,
  
  templates: (type?: string) => 
    type ? `templates:${type}` : 'templates:all',
  
  recurringEvents: (seriesId: string) => 
    `recurring:${seriesId}`,
  
  userPreferences: (userId: string) => 
    `preferences:${userId}`
};