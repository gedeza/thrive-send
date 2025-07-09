// Redis import - fallback gracefully if not available
let Redis: any = null;
try {
  Redis = require('ioredis').Redis;
} catch (e) {
  console.warn('Redis not available, using memory cache only');
}

/**
 * Analytics Cache Manager
 * Implements smart caching for analytics queries with automatic invalidation
 */

// Cache configuration
const CACHE_CONFIG = {
  // Cache durations in seconds
  METRICS_CACHE_DURATION: 300, // 5 minutes
  TIME_SERIES_CACHE_DURATION: 600, // 10 minutes
  OVERVIEW_CACHE_DURATION: 180, // 3 minutes
  AUDIENCE_CACHE_DURATION: 900, // 15 minutes
  
  // Cache key prefixes
  METRICS_PREFIX: 'analytics:metrics:',
  TIME_SERIES_PREFIX: 'analytics:time-series:',
  OVERVIEW_PREFIX: 'analytics:overview:',
  AUDIENCE_PREFIX: 'analytics:audience:',
  
  // Cache invalidation patterns
  USER_PATTERN: 'analytics:*:user:',
  ORG_PATTERN: 'analytics:*:org:',
  CAMPAIGN_PATTERN: 'analytics:*:campaign:',
} as const;

// In-memory cache fallback for when Redis is not available
class MemoryCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

export class AnalyticsCacheManager {
  private redis: Redis | null = null;
  private memoryCache = new MemoryCache();
  private isRedisAvailable = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (Redis && process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        
        // Test connection
        await this.redis.ping();
        this.isRedisAvailable = true;
        console.log('Redis cache initialized successfully');
      } else {
        console.log('Redis URL not configured or Redis not available, using memory cache');
      }
    } catch (error) {
      console.warn('Redis initialization failed, falling back to memory cache:', error);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Generate a cache key for analytics data
   */
  private generateCacheKey(
    type: keyof typeof CACHE_CONFIG,
    params: Record<string, any>
  ): string {
    const prefix = CACHE_CONFIG[`${type.toUpperCase()}_PREFIX` as keyof typeof CACHE_CONFIG];
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return `${prefix}${sortedParams}`;
  }

  /**
   * Get cached data
   */
  async get<T>(type: string, params: Record<string, any>): Promise<T | null> {
    const cacheKey = this.generateCacheKey(type as keyof typeof CACHE_CONFIG, params);
    
    try {
      if (this.isRedisAvailable && this.redis) {
        const cached = await this.redis.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
      } else {
        return this.memoryCache.get(cacheKey);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set<T>(
    type: string,
    params: Record<string, any>,
    data: T,
    customTtl?: number
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(type as keyof typeof CACHE_CONFIG, params);
    const ttl = customTtl || CACHE_CONFIG[`${type.toUpperCase()}_CACHE_DURATION` as keyof typeof CACHE_CONFIG];
    
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(cacheKey, ttl, JSON.stringify(data));
      } else {
        this.memoryCache.set(cacheKey, data, ttl);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(type: string, params: Record<string, any>): Promise<void> {
    const cacheKey = this.generateCacheKey(type as keyof typeof CACHE_CONFIG, params);
    
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(cacheKey);
      } else {
        this.memoryCache.delete(cacheKey);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        this.memoryCache.deletePattern(pattern);
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  /**
   * Invalidate all cache for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`*user:${userId}*`);
  }

  /**
   * Invalidate all cache for an organization
   */
  async invalidateOrganizationCache(orgId: string): Promise<void> {
    await this.invalidatePattern(`*org:${orgId}*`);
  }

  /**
   * Invalidate all cache for a campaign
   */
  async invalidateCampaignCache(campaignId: string): Promise<void> {
    await this.invalidatePattern(`*campaign:${campaignId}*`);
  }

  /**
   * Clear all analytics cache
   */
  async clearAll(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushdb();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    provider: 'redis' | 'memory';
    isAvailable: boolean;
    keyCount?: number;
    memoryUsage?: number;
  }> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const info = await this.redis.info('memory');
        const keyCount = await this.redis.dbsize();
        const memoryMatch = info.match(/used_memory:(\d+)/);
        const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;
        
        return {
          provider: 'redis',
          isAvailable: true,
          keyCount,
          memoryUsage,
        };
      } else {
        return {
          provider: 'memory',
          isAvailable: true,
          keyCount: this.memoryCache['cache'].size,
        };
      }
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        provider: this.isRedisAvailable ? 'redis' : 'memory',
        isAvailable: false,
      };
    }
  }

  /**
   * Cleanup and close connections
   */
  async cleanup(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      this.memoryCache.destroy();
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Export singleton instance
export const analyticsCacheManager = new AnalyticsCacheManager();

/**
 * Decorator function for caching analytics API responses
 */
export function withAnalyticsCache<T extends any[], R>(
  cacheType: string,
  getTtl?: (args: T) => number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const params = args[0] || {};
      const ttl = getTtl ? getTtl(args) : undefined;
      
      // Try to get from cache first
      const cached = await analyticsCacheManager.get<R>(cacheType, params);
      if (cached) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await analyticsCacheManager.set(cacheType, params, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Helper function to create cache-aware API handlers
 */
export function createCachedApiHandler<T>(
  cacheType: string,
  handler: (params: any) => Promise<T>,
  ttl?: number
) {
  return async function(params: any): Promise<T> {
    // Try to get from cache first
    const cached = await analyticsCacheManager.get<T>(cacheType, params);
    if (cached) {
      return cached;
    }

    // Execute handler
    const result = await handler(params);
    
    // Cache the result
    await analyticsCacheManager.set(cacheType, params, result, ttl);
    
    return result;
  };
}