import { AdvancedCacheManager } from './advanced-cache-manager';
import { logger } from '../utils/logger';

export interface CacheStrategy {
  name: string;
  description: string;
  pattern: string;
  ttl: number;
  invalidationRules: string[];
  warmingEnabled: boolean;
}

export interface CacheWarmingConfig {
  enabled: boolean;
  scheduleInterval: number; // in milliseconds
  strategies: string[];
}

export class CacheStrategies {
  private cacheManager: AdvancedCacheManager;
  private strategies: Map<string, CacheStrategy> = new Map();
  private warmingConfig: CacheWarmingConfig;

  constructor(cacheManager: AdvancedCacheManager, warmingConfig: CacheWarmingConfig) {
    this.cacheManager = cacheManager;
    this.warmingConfig = warmingConfig;
    this.initializeStrategies();
    this.startCacheWarming();
  }

  private initializeStrategies(): void {
    // Organization data - Critical for multi-tenancy
    this.strategies.set('organization', {
      name: 'Organization Data',
      description: 'Cache organization data for multi-tenant operations',
      pattern: 'org:*',
      ttl: 3600, // 1 hour
      invalidationRules: ['org:*', 'user:*:orgs'],
      warmingEnabled: true,
    });

    // User data - Frequently accessed
    this.strategies.set('user', {
      name: 'User Data',
      description: 'Cache user profiles and preferences',
      pattern: 'user:*',
      ttl: 1800, // 30 minutes
      invalidationRules: ['user:*', 'org:*:users'],
      warmingEnabled: true,
    });

    // Campaign data - High-frequency reads during execution
    this.strategies.set('campaign', {
      name: 'Campaign Data',
      description: 'Cache campaign configurations and status',
      pattern: 'campaign:*',
      ttl: 900, // 15 minutes
      invalidationRules: ['campaign:*', 'org:*:campaigns'],
      warmingEnabled: true,
    });

    // Content data - Read-heavy for approvals
    this.strategies.set('content', {
      name: 'Content Data',
      description: 'Cache content items and metadata',
      pattern: 'content:*',
      ttl: 1800, // 30 minutes
      invalidationRules: ['content:*', 'campaign:*:content'],
      warmingEnabled: false, // Too variable to warm effectively
    });

    // Analytics data - Expensive aggregations
    this.strategies.set('analytics', {
      name: 'Analytics Data',
      description: 'Cache analytics aggregations and reports',
      pattern: 'analytics:*',
      ttl: 600, // 10 minutes
      invalidationRules: ['analytics:*'],
      warmingEnabled: false, // Real-time data
    });

    // Contact lists - Large datasets
    this.strategies.set('contacts', {
      name: 'Contact Lists',
      description: 'Cache contact lists and segments',
      pattern: 'contacts:*',
      ttl: 2700, // 45 minutes
      invalidationRules: ['contacts:*', 'org:*:contacts'],
      warmingEnabled: true,
    });

    // Templates - Rarely change
    this.strategies.set('templates', {
      name: 'Email Templates',
      description: 'Cache email templates and designs',
      pattern: 'template:*',
      ttl: 7200, // 2 hours
      invalidationRules: ['template:*', 'org:*:templates'],
      warmingEnabled: true,
    });

    // API responses - Reduce database load
    this.strategies.set('api', {
      name: 'API Responses',
      description: 'Cache API responses for frequently accessed endpoints',
      pattern: 'api:*',
      ttl: 300, // 5 minutes
      invalidationRules: ['api:*'],
      warmingEnabled: false, // Too dynamic
    });

    // Static data - Configuration and settings
    this.strategies.set('static', {
      name: 'Static Data',
      description: 'Cache static configuration and settings',
      pattern: 'static:*',
      ttl: 10800, // 3 hours
      invalidationRules: ['static:*'],
      warmingEnabled: true,
    });

    // Session data - User authentication state
    this.strategies.set('session', {
      name: 'Session Data',
      description: 'Cache user session information',
      pattern: 'session:*',
      ttl: 3600, // 1 hour
      invalidationRules: ['session:*', 'user:*:sessions'],
      warmingEnabled: false, // Security sensitive
    });

    logger.info('Cache strategies initialized', { 
      strategiesCount: this.strategies.size,
      strategies: Array.from(this.strategies.keys())
    });
  }

  /**
   * Get cached data using strategy-specific settings
   */
  async get<T>(strategy: string, key: string, fallback?: () => Promise<T>): Promise<T | null> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy', { strategy });
      return fallback ? await fallback() : null;
    }

    const cacheKey = this.buildCacheKey(strategy, key);
    
    try {
      // Try to get from cache first
      const cachedData = await this.cacheManager.get<T>(cacheKey);
      
      if (cachedData !== null) {
        logger.debug('Cache hit', { strategy, key, cacheKey });
        return cachedData;
      }

      // Cache miss - use fallback if provided
      if (fallback) {
        logger.debug('Cache miss, using fallback', { strategy, key, cacheKey });
        const data = await fallback();
        
        if (data !== null) {
          // Store in cache with strategy-specific TTL
          await this.cacheManager.set(cacheKey, data, {
            ttl: cacheStrategy.ttl,
            compress: true,
          });
        }
        
        return data;
      }

      logger.debug('Cache miss, no fallback provided', { strategy, key, cacheKey });
      return null;

    } catch (_error) {
      logger.error('Cache get operation failed', error as Error, { strategy, key });
      return fallback ? await fallback() : null;
    }
  }

  /**
   * Set cached data using strategy-specific settings
   */
  async set<T>(strategy: string, key: string, data: T, options: {
    ttl?: number;
    compress?: boolean;
  } = {}): Promise<boolean> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy', { strategy });
      return false;
    }

    const cacheKey = this.buildCacheKey(strategy, key);
    
    try {
      const result = await this.cacheManager.set(cacheKey, data, {
        ttl: options.ttl || cacheStrategy.ttl,
        compress: options.compress !== false,
      });

      logger.debug('Cache set operation', { strategy, key, cacheKey, success: result });
      return result;

    } catch (_error) {
      logger.error('Cache set operation failed', error as Error, { strategy, key });
      return false;
    }
  }

  /**
   * Delete cached data with strategy-based invalidation
   */
  async delete(strategy: string, key: string): Promise<boolean> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy', { strategy });
      return false;
    }

    const cacheKey = this.buildCacheKey(strategy, key);
    
    try {
      const result = await this.cacheManager.delete(cacheKey);
      logger.debug('Cache delete operation', { strategy, key, cacheKey, success: result });
      return result;

    } catch (_error) {
      logger.error('Cache delete operation failed', error as Error, { strategy, key });
      return false;
    }
  }

  /**
   * Invalidate cache based on strategy rules
   */
  async invalidateStrategy(strategy: string, context?: any): Promise<number> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy for invalidation', { strategy });
      return 0;
    }

    let totalInvalidated = 0;

    try {
      // Invalidate direct strategy pattern
      const directInvalidated = await this.cacheManager.invalidatePattern(
        `*:${strategy}:*`
      );
      totalInvalidated += directInvalidated;

      // Invalidate related patterns based on rules
      for (const rule of cacheStrategy.invalidationRules) {
        const ruleInvalidated = await this.cacheManager.invalidatePattern(rule);
        totalInvalidated += ruleInvalidated;
      }

      logger.info('Cache strategy invalidation completed', {
        strategy,
        totalInvalidated,
        rules: cacheStrategy.invalidationRules,
        context,
      });

      return totalInvalidated;

    } catch (_error) {
      logger.error('Cache strategy invalidation failed', error as Error, { strategy });
      return 0;
    }
  }

  /**
   * Warm cache for specific strategy
   */
  async warmStrategy(strategy: string, dataLoader: () => Promise<{ [key: string]: any }>): Promise<void> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy for warming', { strategy });
      return;
    }

    if (!cacheStrategy.warmingEnabled) {
      logger.info('Cache warming disabled for strategy', { strategy });
      return;
    }

    try {
      logger.info('Starting cache warming for strategy', { strategy });
      
      const data = await dataLoader();
      const entries = Object.entries(data);
      
      // Warm cache with strategy-specific TTL
      const warmingPromises = entries.map(([key, value]) => 
        this.set(strategy, key, value, {
          ttl: cacheStrategy.ttl * 1.5, // Longer TTL for warmed data
        })
      );

      await Promise.all(warmingPromises);
      
      logger.info('Cache warming completed for strategy', { 
        strategy, 
        itemsWarmed: entries.length 
      });

    } catch (_error) {
      logger.error('Cache warming failed for strategy', error as Error, { strategy });
    }
  }

  /**
   * Batch operations for multiple keys
   */
  async batchGet<T>(strategy: string, keys: string[]): Promise<{ [key: string]: T | null }> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy for batch get', { strategy });
      return {};
    }

    const cacheKeys = keys.map(key => this.buildCacheKey(strategy, key));
    const keyMapping = new Map<string, string>();
    
    // Create mapping from cache key to original key
    keys.forEach((key, index) => {
      keyMapping.set(cacheKeys[index], key);
    });

    try {
      const results = await this.cacheManager.mget<T>(cacheKeys);
      const finalResults: { [key: string]: T | null } = {};
      
      // Map back to original keys
      Object.entries(results).forEach(([cacheKey, value]) => {
        const originalKey = keyMapping.get(cacheKey);
        if (originalKey) {
          finalResults[originalKey] = value;
        }
      });

      return finalResults;

    } catch (_error) {
      logger.error('Cache batch get operation failed', error as Error, { strategy, keys });
      return {};
    }
  }

  /**
   * Batch set operations
   */
  async batchSet<T>(strategy: string, data: { [key: string]: T }, options: {
    ttl?: number;
    compress?: boolean;
  } = {}): Promise<boolean> {
    const cacheStrategy = this.strategies.get(strategy);
    if (!cacheStrategy) {
      logger.warn('Unknown cache strategy for batch set', { strategy });
      return false;
    }

    try {
      const cacheData: { [key: string]: T } = {};
      
      // Transform keys to cache keys
      Object.entries(data).forEach(([key, value]) => {
        const cacheKey = this.buildCacheKey(strategy, key);
        cacheData[cacheKey] = value;
      });

      const result = await this.cacheManager.mset(cacheData, {
        ttl: options.ttl || cacheStrategy.ttl,
        compress: options.compress !== false,
      });

      logger.debug('Cache batch set operation', { 
        strategy, 
        itemCount: Object.keys(data).length, 
        success: result 
      });

      return result;

    } catch (_error) {
      logger.error('Cache batch set operation failed', error as Error, { strategy });
      return false;
    }
  }

  /**
   * Get all available strategies
   */
  getStrategies(): { [key: string]: CacheStrategy } {
    const result: { [key: string]: CacheStrategy } = {};
    this.strategies.forEach((strategy, key) => {
      result[key] = strategy;
    });
    return result;
  }

  /**
   * Get cache statistics for all strategies
   */
  async getStrategyStats(): Promise<{
    overall: any;
    byStrategy: { [key: string]: any };
  }> {
    const overall = this.cacheManager.getMetrics();
    const byStrategy: { [key: string]: any } = {};

    // This would require more detailed tracking per strategy
    // For now, we'll return overall stats
    this.strategies.forEach((strategy, key) => {
      byStrategy[key] = {
        name: strategy.name,
        ttl: strategy.ttl,
        warmingEnabled: strategy.warmingEnabled,
        invalidationRules: strategy.invalidationRules.length,
      };
    });

    return {
      overall,
      byStrategy,
    };
  }

  // Private helper methods

  private buildCacheKey(strategy: string, key: string): string {
    return `${strategy}:${key}`;
  }

  private startCacheWarming(): void {
    if (!this.warmingConfig.enabled) {
      logger.info('Cache warming disabled');
      return;
    }

    logger.info('Starting cache warming scheduler', {
      interval: this.warmingConfig.scheduleInterval,
      strategies: this.warmingConfig.strategies,
    });

    // Schedule cache warming
    setInterval(async () => {
      for (const strategyName of this.warmingConfig.strategies) {
        const strategy = this.strategies.get(strategyName);
        if (strategy && strategy.warmingEnabled) {
          try {
            await this.performScheduledWarming(strategyName);
          } catch (_error) {
            logger.error('Scheduled cache warming failed', error as Error, { 
              strategy: strategyName 
            });
          }
        }
      }
    }, this.warmingConfig.scheduleInterval);
  }

  private async performScheduledWarming(strategyName: string): Promise<void> {
    // This would be implemented based on your specific data loading patterns
    // For now, we'll just log the intention
    logger.debug('Performing scheduled cache warming', { strategy: strategyName });
  }
}

// Export default warming configuration
export const createWarmingConfig = (): CacheWarmingConfig => ({
  enabled: process.env.CACHE_WARMING_ENABLED === 'true',
  scheduleInterval: parseInt(process.env.CACHE_WARMING_INTERVAL || '300000'), // 5 minutes
  strategies: (process.env.CACHE_WARMING_STRATEGIES || 'organization,user,campaign,templates,static')
    .split(',')
    .map(s => s.trim()),
});