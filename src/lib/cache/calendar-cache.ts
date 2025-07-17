'use client';

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  compress?: boolean;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  size: number;
  memoryUsage: number;
  lastCleanup: Date;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export class CalendarCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    lastCleanup: new Date(),
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private defaultConfig: CacheConfig = {}) {
    this.defaultConfig = {
      ttl: 300000, // 5 minutes
      maxSize: 100,
      storage: 'memory',
      compress: false,
      ...defaultConfig,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  private startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  private cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => this.memoryCache.delete(key));

    // If cache is still too large, remove least recently used items
    if (this.memoryCache.size > (this.defaultConfig.maxSize || 100)) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const itemsToRemove = entries.slice(0, entries.length - (this.defaultConfig.maxSize || 100));
      itemsToRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    this.stats.lastCleanup = new Date();
  }

  private getStorageKey(key: string): string {
    return `calendar-cache-${key}`;
  }

  private getStorageValue(key: string, storage: 'localStorage' | 'sessionStorage'): any {
    if (typeof window === 'undefined') return null;

    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const item = storageObj.getItem(this.getStorageKey(key));
      
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.ttl) {
        storageObj.removeItem(this.getStorageKey(key));
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('Error reading from storage:', error);
      return null;
    }
  }

  private setStorageValue(key: string, value: any, config: CacheConfig, storage: 'localStorage' | 'sessionStorage'): void {
    if (typeof window === 'undefined') return;

    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const item = {
        value,
        timestamp: Date.now(),
        ttl: config.ttl || this.defaultConfig.ttl || 300000,
      };

      storageObj.setItem(this.getStorageKey(key), JSON.stringify(item));
    } catch (error) {
      console.warn('Error writing to storage:', error);
    }
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  async get<T>(key: string, config?: CacheConfig, refreshFn?: () => Promise<T>): Promise<T | null> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && now - memoryEntry.timestamp < memoryEntry.ttl) {
      memoryEntry.accessCount++;
      memoryEntry.lastAccessed = now;
      this.stats.hits++;
      return memoryEntry.value;
    }

    // Check storage cache
    if (finalConfig.storage === 'localStorage') {
      const storageValue = this.getStorageValue(key, 'localStorage');
      if (storageValue !== null) {
        // Put back in memory cache
        this.memoryCache.set(key, {
          value: storageValue,
          timestamp: now,
          ttl: finalConfig.ttl || 300000,
          size: this.calculateSize(storageValue),
          accessCount: 1,
          lastAccessed: now,
        });
        this.stats.hits++;
        return storageValue;
      }
    }

    if (finalConfig.storage === 'sessionStorage') {
      const storageValue = this.getStorageValue(key, 'sessionStorage');
      if (storageValue !== null) {
        // Put back in memory cache
        this.memoryCache.set(key, {
          value: storageValue,
          timestamp: now,
          ttl: finalConfig.ttl || 300000,
          size: this.calculateSize(storageValue),
          accessCount: 1,
          lastAccessed: now,
        });
        this.stats.hits++;
        return storageValue;
      }
    }

    // Cache miss - try to refresh if function provided
    this.stats.misses++;
    
    if (refreshFn) {
      try {
        const freshValue = await refreshFn();
        await this.set(key, freshValue, finalConfig);
        return freshValue;
      } catch (error) {
        console.error('Error refreshing cache:', error);
        return null;
      }
    }

    return null;
  }

  async set<T>(key: string, value: T, config?: CacheConfig): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    const size = this.calculateSize(value);

    // Set in memory cache
    this.memoryCache.set(key, {
      value,
      timestamp: now,
      ttl: finalConfig.ttl || 300000,
      size,
      accessCount: 0,
      lastAccessed: now,
    });

    // Set in storage cache if configured
    if (finalConfig.storage === 'localStorage') {
      this.setStorageValue(key, value, finalConfig, 'localStorage');
    } else if (finalConfig.storage === 'sessionStorage') {
      this.setStorageValue(key, value, finalConfig, 'sessionStorage');
    }

    // Trigger cleanup if cache is getting too large
    if (this.memoryCache.size > (finalConfig.maxSize || 100)) {
      this.cleanup();
    }
  }

  async invalidate(pattern: string | RegExp, reason: 'create' | 'update' | 'delete' = 'update'): Promise<void> {
    const keysToRemove: string[] = [];

    // Find matching keys in memory cache
    for (const key of this.memoryCache.keys()) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          keysToRemove.push(key);
        }
      } else {
        if (pattern.test(key)) {
          keysToRemove.push(key);
        }
      }
    }

    // Remove from memory cache
    keysToRemove.forEach(key => this.memoryCache.delete(key));

    // Remove from storage caches
    if (typeof window !== 'undefined') {
      const storageKeys = [
        ...Object.keys(localStorage),
        ...Object.keys(sessionStorage),
      ];

      storageKeys.forEach(storageKey => {
        if (storageKey.startsWith('calendar-cache-')) {
          const cacheKey = storageKey.replace('calendar-cache-', '');
          let shouldRemove = false;

          if (typeof pattern === 'string') {
            shouldRemove = cacheKey.includes(pattern);
          } else {
            shouldRemove = pattern.test(cacheKey);
          }

          if (shouldRemove) {
            localStorage.removeItem(storageKey);
            sessionStorage.removeItem(storageKey);
          }
        }
      });
    }

    console.log(`Cache invalidated: ${keysToRemove.length} keys removed (reason: ${reason})`);
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear storage caches
    if (typeof window !== 'undefined') {
      const storageKeys = [
        ...Object.keys(localStorage),
        ...Object.keys(sessionStorage),
      ];

      storageKeys.forEach(key => {
        if (key.startsWith('calendar-cache-')) {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        }
      });
    }

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      lastCleanup: new Date(),
    };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    const missRate = total > 0 ? (this.stats.misses / total) * 100 : 0;

    let memoryUsage = 0;
    for (const entry of this.memoryCache.values()) {
      memoryUsage += entry.size;
    }

    return {
      hitRate,
      missRate,
      size: this.memoryCache.size,
      memoryUsage,
      lastCleanup: this.stats.lastCleanup,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryCache.clear();
  }
}