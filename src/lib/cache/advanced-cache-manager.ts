// Optional Redis import - graceful degradation if not available
let createClient: any = null;
let RedisClientType: any = null;

try {
  const redis = require('redis');
  createClient = redis.createClient;
  RedisClientType = redis.RedisClientType;
} catch (error) {
  // Redis not available - will use memory-only caching
  console.warn('Redis not available, using memory-only caching');
}
import { logger } from '../utils/logger';

export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  defaultTTL: number;
  maxMemoryItems: number;
  enableCompression: boolean;
  enableAnalytics: boolean;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
  metadata?: any;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  memoryUsage: number;
  redisConnected: boolean;
  totalItems: number;
}

export class AdvancedCacheManager {
  private static instance: AdvancedCacheManager | null = null;
  private redisClient: any = null;
  private memoryCache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    memoryUsage: 0,
    redisConnected: false,
    totalItems: 0
  };

  private constructor(config: CacheConfig) {
    this.config = config;
    this.initializeRedis();
    this.startCleanupTimer();
  }

  public static getInstance(config: CacheConfig): AdvancedCacheManager {
    if (!AdvancedCacheManager.instance) {
      AdvancedCacheManager.instance = new AdvancedCacheManager(config);
    }
    return AdvancedCacheManager.instance;
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (!createClient) {
        logger.warn('Redis not available, using memory-only caching');
        this.stats.redisConnected = false;
        return;
      }

      this.redisClient = createClient({
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port,
        },
        password: this.config.redis.password,
        database: this.config.redis.db || 0,
      });

      this.redisClient.on('error', (err: any) => {
        logger.error('Redis Client Error', err);
        this.stats.redisConnected = false;
      });

      this.redisClient.on('connect', () => {
        logger.info('Connected to Redis');
        this.stats.redisConnected = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis', error);
      this.stats.redisConnected = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && this.isItemValid(memoryItem)) {
        this.stats.hits++;
        return memoryItem.data as T;
      }

      // Try Redis if available
      if (this.redisClient && this.stats.redisConnected) {
        const redisData = await this.redisClient.get(key);
        if (redisData) {
          const parsed = JSON.parse(redisData) as CacheItem<T>;
          if (this.isItemValid(parsed)) {
            this.stats.hits++;
            // Store in memory cache for faster access
            this.setMemoryCache(key, parsed);
            return parsed.data;
          }
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      this.stats.misses++;
      return null;
    }
  }

  public async set<T>(key: string, data: T, ttl?: number): Promise<boolean> {
    try {
      const effectiveTTL = ttl || this.config.defaultTTL;
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: effectiveTTL,
        compressed: false,
        metadata: {
          size: this.estimateSize(data),
          type: typeof data
        }
      };

      // Set in memory cache
      this.setMemoryCache(key, item);

      // Set in Redis if available
      if (this.redisClient && this.stats.redisConnected) {
        await this.redisClient.setEx(key, Math.floor(effectiveTTL / 1000), JSON.stringify(item));
      }

      this.stats.sets++;
      this.updateMemoryUsage();
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      // Delete from memory cache
      this.memoryCache.delete(key);

      // Delete from Redis if available
      if (this.redisClient && this.stats.redisConnected) {
        await this.redisClient.del(key);
      }

      this.stats.deletes++;
      this.updateMemoryUsage();
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  public async clear(): Promise<boolean> {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear Redis if available
      if (this.redisClient && this.stats.redisConnected) {
        await this.redisClient.flushDb();
      }

      this.updateMemoryUsage();
      return true;
    } catch (error) {
      logger.error('Cache clear error', error);
      return false;
    }
  }

  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      let deletedCount = 0;

      // Handle memory cache
      const keysToDelete: string[] = [];
      for (const key of this.memoryCache.keys()) {
        if (this.matchesPattern(key, pattern)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        this.memoryCache.delete(key);
        deletedCount++;
      });

      // Handle Redis if available
      if (this.redisClient && this.stats.redisConnected) {
        const redisKeys = await this.redisClient.keys(pattern);
        if (redisKeys.length > 0) {
          await this.redisClient.del(redisKeys);
          deletedCount += redisKeys.length;
        }
      }

      this.updateMemoryUsage();
      return deletedCount;
    } catch (error) {
      logger.error('Cache invalidate pattern error', { pattern, error });
      return 0;
    }
  }

  public getStats(): CacheStats {
    this.updateMemoryUsage();
    return { ...this.stats };
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    redis: boolean;
    memory: boolean;
    stats: CacheStats;
  }> {
    const memoryHealthy = this.memoryCache.size < this.config.maxMemoryItems;
    const redisHealthy = this.stats.redisConnected;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!redisHealthy && !memoryHealthy) {
      status = 'unhealthy';
    } else if (!redisHealthy || !memoryHealthy) {
      status = 'degraded';
    }

    return {
      status,
      redis: redisHealthy,
      memory: memoryHealthy,
      stats: this.getStats()
    };
  }

  private setMemoryCache<T>(key: string, item: CacheItem<T>): void {
    // Enforce memory limits
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      this.evictOldestItems();
    }

    this.memoryCache.set(key, item);
  }

  private evictOldestItems(): void {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of items
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  private isItemValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  private matchesPattern(key: string, pattern: string): boolean {
    // Simple pattern matching (convert Redis pattern to regex)
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`).test(key);
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private updateMemoryUsage(): void {
    this.stats.totalItems = this.memoryCache.size;
    this.stats.memoryUsage = Array.from(this.memoryCache.values())
      .reduce((total, item) => total + (item.metadata?.size || 0), 0);
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredItems();
    }, 60000); // Clean up every minute
  }

  private cleanupExpiredItems(): void {
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isItemValid(item)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    if (keysToDelete.length > 0) {
      logger.debug(`Cleaned up ${keysToDelete.length} expired cache items`);
      this.updateMemoryUsage();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.disconnect();
      this.stats.redisConnected = false;
    }
  }
}

export function createCacheConfig(): CacheConfig {
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    },
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300000'), // 5 minutes
    maxMemoryItems: parseInt(process.env.CACHE_MAX_MEMORY_ITEMS || '1000'),
    enableCompression: process.env.CACHE_ENABLE_COMPRESSION === 'true',
    enableAnalytics: process.env.CACHE_ENABLE_ANALYTICS !== 'false',
  };
}