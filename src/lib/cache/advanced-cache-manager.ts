import Redis from 'ioredis';
import { logger } from '../utils/logger';

interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  defaultTTL: number;
  maxMemoryItems: number;
  compressionThreshold: number;
  enableMetrics: boolean;
}

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
  size?: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalRequests: number;
  averageResponseTime: number;
  memoryUsage: number;
  redisConnections: number;
}

export class AdvancedCacheManager {
  private static instance: AdvancedCacheManager;
  private redis: Redis;
  private memoryCache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private compressionEnabled: boolean;

  private constructor(config: CacheConfig) {
    this.config = config;
    this.compressionEnabled = config.compressionThreshold > 0;
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      redisConnections: 0,
    };

    this.initializeRedis();
    this.startMetricsCollection();
  }

  static getInstance(config?: CacheConfig): AdvancedCacheManager {
    if (!AdvancedCacheManager.instance) {
      if (!config) {
        throw new Error('Cache configuration required for first initialization');
      }
      AdvancedCacheManager.instance = new AdvancedCacheManager(config);
    }
    return AdvancedCacheManager.instance;
  }

  private initializeRedis(): void {
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      keyPrefix: this.config.redis.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      },
    });

    this.redis.on('connect', () => {
      logger.info('Redis cache connected successfully');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis cache connection error', error);
    });

    this.redis.on('ready', () => {
      logger.info('Redis cache ready');
      this.metrics.redisConnections++;
    });
  }

  /**
   * Get cached data with fallback to multiple layers
   */
  async get<T = any>(key: string, options: {
    useMemoryCache?: boolean;
    useRedis?: boolean;
    deserialize?: boolean;
  } = {}): Promise<T | null> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const {
        useMemoryCache = true,
        useRedis = true,
        deserialize = true,
      } = options;

      // Try memory cache first
      if (useMemoryCache) {
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem && !this.isExpired(memoryItem)) {
          this.metrics.hits++;
          this.updateResponseTime(startTime);
          return memoryItem.data;
        }
      }

      // Try Redis cache
      if (useRedis) {
        const redisData = await this.redis.get(key);
        if (redisData) {
          let data: T;
          
          if (deserialize) {
            data = await this.deserializeData(redisData);
          } else {
            data = redisData as T;
          }

          // Store in memory cache for faster access
          if (useMemoryCache) {
            this.setMemoryCache(key, data, this.config.defaultTTL);
          }

          this.metrics.hits++;
          this.updateResponseTime(startTime);
          return data;
        }
      }

      this.metrics.misses++;
      this.updateResponseTime(startTime);
      return null;

    } catch (error) {
      logger.error('Cache get operation failed', error as Error, { key });
      this.metrics.misses++;
      this.updateResponseTime(startTime);
      return null;
    }
  }

  /**
   * Set cached data with automatic compression and TTL
   */
  async set<T = any>(key: string, data: T, options: {
    ttl?: number;
    useMemoryCache?: boolean;
    useRedis?: boolean;
    compress?: boolean;
    serialize?: boolean;
  } = {}): Promise<boolean> {
    const startTime = Date.now();
    this.metrics.sets++;

    try {
      const {
        ttl = this.config.defaultTTL,
        useMemoryCache = true,
        useRedis = true,
        compress = true,
        serialize = true,
      } = options;

      // Set in memory cache
      if (useMemoryCache) {
        this.setMemoryCache(key, data, ttl);
      }

      // Set in Redis cache
      if (useRedis) {
        let serializedData: string;
        
        if (serialize) {
          serializedData = await this.serializeData(data, compress);
        } else {
          serializedData = data as string;
        }

        if (ttl > 0) {
          await this.redis.setex(key, ttl, serializedData);
        } else {
          await this.redis.set(key, serializedData);
        }
      }

      this.updateResponseTime(startTime);
      return true;

    } catch (error) {
      logger.error('Cache set operation failed', error as Error, { key });
      this.updateResponseTime(startTime);
      return false;
    }
  }

  /**
   * Delete cached data from all layers
   */
  async delete(key: string): Promise<boolean> {
    this.metrics.deletes++;

    try {
      // Delete from memory cache
      const memoryDeleted = this.memoryCache.delete(key);
      
      // Delete from Redis cache
      const redisDeleted = await this.redis.del(key);

      return memoryDeleted || redisDeleted > 0;

    } catch (error) {
      logger.error('Cache delete operation failed', error as Error, { key });
      return false;
    }
  }

  /**
   * Multi-get operation for batch fetching
   */
  async mget<T = any>(keys: string[], options: {
    useMemoryCache?: boolean;
    useRedis?: boolean;
    deserialize?: boolean;
  } = {}): Promise<{ [key: string]: T | null }> {
    const startTime = Date.now();
    const result: { [key: string]: T | null } = {};
    const {
      useMemoryCache = true,
      useRedis = true,
      deserialize = true,
    } = options;

    try {
      // Try memory cache first
      const missingKeys: string[] = [];
      
      if (useMemoryCache) {
        for (const key of keys) {
          const memoryItem = this.memoryCache.get(key);
          if (memoryItem && !this.isExpired(memoryItem)) {
            result[key] = memoryItem.data;
            this.metrics.hits++;
          } else {
            missingKeys.push(key);
            this.metrics.misses++;
          }
        }
      } else {
        missingKeys.push(...keys);
      }

      // Fetch missing keys from Redis
      if (useRedis && missingKeys.length > 0) {
        const redisResults = await this.redis.mget(...missingKeys);
        
        for (let i = 0; i < missingKeys.length; i++) {
          const key = missingKeys[i];
          const redisData = redisResults[i];
          
          if (redisData) {
            let data: T;
            
            if (deserialize) {
              data = await this.deserializeData(redisData);
            } else {
              data = redisData as T;
            }

            result[key] = data;
            
            // Store in memory cache
            if (useMemoryCache) {
              this.setMemoryCache(key, data, this.config.defaultTTL);
            }
            
            this.metrics.hits++;
          } else {
            result[key] = null;
            this.metrics.misses++;
          }
        }
      }

      this.metrics.totalRequests += keys.length;
      this.updateResponseTime(startTime);
      return result;

    } catch (error) {
      logger.error('Cache mget operation failed', error as Error, { keys });
      
      // Return null for all keys on error
      for (const key of keys) {
        result[key] = null;
      }
      
      this.metrics.totalRequests += keys.length;
      this.updateResponseTime(startTime);
      return result;
    }
  }

  /**
   * Multi-set operation for batch storing
   */
  async mset<T = any>(data: { [key: string]: T }, options: {
    ttl?: number;
    useMemoryCache?: boolean;
    useRedis?: boolean;
    compress?: boolean;
    serialize?: boolean;
  } = {}): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const {
        ttl = this.config.defaultTTL,
        useMemoryCache = true,
        useRedis = true,
        compress = true,
        serialize = true,
      } = options;

      const keys = Object.keys(data);
      
      // Set in memory cache
      if (useMemoryCache) {
        for (const key of keys) {
          this.setMemoryCache(key, data[key], ttl);
        }
      }

      // Set in Redis cache
      if (useRedis) {
        const pipeline = this.redis.pipeline();
        
        for (const key of keys) {
          let serializedData: string;
          
          if (serialize) {
            serializedData = await this.serializeData(data[key], compress);
          } else {
            serializedData = data[key] as string;
          }

          if (ttl > 0) {
            pipeline.setex(key, ttl, serializedData);
          } else {
            pipeline.set(key, serializedData);
          }
        }
        
        await pipeline.exec();
      }

      this.metrics.sets += keys.length;
      this.updateResponseTime(startTime);
      return true;

    } catch (error) {
      logger.error('Cache mset operation failed', error as Error);
      this.updateResponseTime(startTime);
      return false;
    }
  }

  /**
   * Cache warming - preload frequently accessed data
   */
  async warmCache(dataLoader: () => Promise<{ [key: string]: any }>, options: {
    ttl?: number;
    compress?: boolean;
  } = {}): Promise<void> {
    try {
      logger.info('Starting cache warming process');
      
      const data = await dataLoader();
      const keys = Object.keys(data);
      
      await this.mset(data, {
        ttl: options.ttl || this.config.defaultTTL * 2, // Longer TTL for warmed data
        compress: options.compress !== false,
      });
      
      logger.info('Cache warming completed', { keysWarmed: keys.length });
      
    } catch (error) {
      logger.error('Cache warming failed', error as Error);
    }
  }

  /**
   * Intelligent cache invalidation
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      // Get all keys matching pattern
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      // Delete from Redis
      const redisDeleted = await this.redis.del(...keys);
      
      // Delete from memory cache
      let memoryDeleted = 0;
      for (const key of keys) {
        const cleanKey = key.replace(this.config.redis.keyPrefix, '');
        if (this.memoryCache.delete(cleanKey)) {
          memoryDeleted++;
        }
      }
      
      logger.info('Cache invalidation completed', { 
        pattern, 
        redisDeleted, 
        memoryDeleted 
      });
      
      return redisDeleted;
      
    } catch (error) {
      logger.error('Cache invalidation failed', error as Error, { pattern });
      return 0;
    }
  }

  /**
   * Get cache statistics and health
   */
  getMetrics(): CacheMetrics & {
    hitRate: number;
    missRate: number;
    memoryCacheSize: number;
    redisStatus: string;
  } {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;
    
    const missRate = this.metrics.totalRequests > 0 
      ? (this.metrics.misses / this.metrics.totalRequests) * 100 
      : 0;

    // Calculate memory usage
    let memoryUsage = 0;
    for (const [, item] of this.memoryCache) {
      memoryUsage += item.size || this.estimateSize(item.data);
    }

    return {
      ...this.metrics,
      hitRate: Number(hitRate.toFixed(2)),
      missRate: Number(missRate.toFixed(2)),
      memoryCacheSize: this.memoryCache.size,
      redisStatus: this.redis.status,
      memoryUsage,
    };
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      
      // Clear Redis cache (only keys with our prefix)
      const keys = await this.redis.keys(`${this.config.redis.keyPrefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      // Reset metrics
      this.metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        evictions: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        redisConnections: this.metrics.redisConnections,
      };
      
      logger.info('All caches cleared');
      
    } catch (error) {
      logger.error('Failed to clear caches', error as Error);
    }
  }

  /**
   * Health check for cache system
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    redis: boolean;
    memoryCache: boolean;
    metrics: any;
  }> {
    try {
      // Test Redis connection
      const redisPing = await this.redis.ping();
      const redisHealthy = redisPing === 'PONG';
      
      // Test memory cache
      const testKey = '_health_check_';
      this.memoryCache.set(testKey, { data: 'test', timestamp: Date.now(), ttl: 60 });
      const memoryHealthy = this.memoryCache.has(testKey);
      this.memoryCache.delete(testKey);
      
      const overall = redisHealthy && memoryHealthy;
      
      return {
        healthy: overall,
        redis: redisHealthy,
        memoryCache: memoryHealthy,
        metrics: this.getMetrics(),
      };
      
    } catch (error) {
      logger.error('Cache health check failed', error as Error);
      return {
        healthy: false,
        redis: false,
        memoryCache: false,
        metrics: this.getMetrics(),
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.memoryCache.clear();
      await this.redis.quit();
      logger.info('Cache manager shutdown completed');
    } catch (error) {
      logger.error('Failed to shutdown cache manager', error as Error);
    }
  }

  // Private helper methods

  private setMemoryCache<T>(key: string, data: T, ttl: number): void {
    // Evict old items if at capacity
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        this.metrics.evictions++;
      }
    }

    const size = this.estimateSize(data);
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      size,
    });
  }

  private isExpired(item: CacheItem): boolean {
    if (item.ttl <= 0) return false; // No expiration
    return Date.now() - item.timestamp > item.ttl;
  }

  private async serializeData<T>(data: T, compress: boolean): Promise<string> {
    try {
      const serialized = JSON.stringify(data);
      
      if (compress && this.compressionEnabled && serialized.length > this.config.compressionThreshold) {
        // In a real implementation, you'd use a compression library like zlib
        // For now, we'll just return the serialized data
        return serialized;
      }
      
      return serialized;
    } catch (error) {
      logger.error('Failed to serialize data', error as Error);
      throw error;
    }
  }

  private async deserializeData<T>(data: string): Promise<T> {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Failed to deserialize data', error as Error);
      throw error;
    }
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate in bytes
    } catch {
      return 0;
    }
  }

  private updateResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) return;

    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);
  }

  private collectMetrics(): void {
    // Update memory usage
    let memoryUsage = 0;
    for (const [, item] of this.memoryCache) {
      memoryUsage += item.size || this.estimateSize(item.data);
    }
    this.metrics.memoryUsage = memoryUsage;

    // Log metrics if enabled
    if (this.config.enableMetrics) {
      logger.info('Cache metrics collected', this.getMetrics());
    }
  }
}

// Export default configuration
export const createCacheConfig = (): CacheConfig => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_CACHE_DB || '1'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'thrive:cache:',
  },
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1 hour
  maxMemoryItems: parseInt(process.env.CACHE_MAX_MEMORY_ITEMS || '10000'),
  compressionThreshold: parseInt(process.env.CACHE_COMPRESSION_THRESHOLD || '1024'), // 1KB
  enableMetrics: process.env.CACHE_ENABLE_METRICS === 'true',
});