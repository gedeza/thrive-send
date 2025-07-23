import { AdvancedCacheManager, createCacheConfig } from './advanced-cache-manager';
import { CacheStrategies, createWarmingConfig } from './cache-strategies';
import { logger } from '../utils/logger';

// Global cache instance
let globalCacheManager: AdvancedCacheManager | null = null;
let globalCacheStrategies: CacheStrategies | null = null;

/**
 * Initialize the global cache system
 */
export function initializeCache(): {
  cacheManager: AdvancedCacheManager;
  cacheStrategies: CacheStrategies;
} {
  if (!globalCacheManager) {
    const config = createCacheConfig();
    globalCacheManager = AdvancedCacheManager.getInstance(config);
    
    const warmingConfig = createWarmingConfig();
    globalCacheStrategies = new CacheStrategies(globalCacheManager, warmingConfig);
    
    logger.info('Global cache system initialized', {
      redisHost: config.redis.host,
      redisPort: config.redis.port,
      defaultTTL: config.defaultTTL,
      maxMemoryItems: config.maxMemoryItems,
      warmingEnabled: warmingConfig.enabled,
    });
  }

  return {
    cacheManager: globalCacheManager,
    cacheStrategies: globalCacheStrategies!,
  };
}

/**
 * Get the global cache manager instance
 */
export function getCacheManager(): AdvancedCacheManager {
  if (!globalCacheManager) {
    const { cacheManager } = initializeCache();
    return cacheManager;
  }
  return globalCacheManager;
}

/**
 * Get the global cache strategies instance
 */
export function getCacheStrategies(): CacheStrategies {
  if (!globalCacheStrategies) {
    const { cacheStrategies } = initializeCache();
    return cacheStrategies;
  }
  return globalCacheStrategies;
}

/**
 * High-level cache operations with automatic strategy selection
 */
export class CacheService {
  private cacheStrategies: CacheStrategies;

  constructor() {
    this.cacheStrategies = getCacheStrategies();
  }

  /**
   * Organization-specific caching
   */
  async getOrganization<T>(orgId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('organization', orgId, fallback);
  }

  async setOrganization<T>(orgId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('organization', orgId, data, { ttl });
  }

  async invalidateOrganization(orgId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('organization', { orgId });
  }

  /**
   * User-specific caching
   */
  async getUser<T>(userId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('user', userId, fallback);
  }

  async setUser<T>(userId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('user', userId, data, { ttl });
  }

  async invalidateUser(userId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('user', { userId });
  }

  /**
   * Campaign-specific caching
   */
  async getCampaign<T>(campaignId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('campaign', campaignId, fallback);
  }

  async setCampaign<T>(campaignId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('campaign', campaignId, data, { ttl });
  }

  async invalidateCampaign(campaignId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('campaign', { campaignId });
  }

  /**
   * Content-specific caching
   */
  async getContent<T>(contentId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('content', contentId, fallback);
  }

  async setContent<T>(contentId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('content', contentId, data, { ttl });
  }

  async invalidateContent(contentId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('content', { contentId });
  }

  /**
   * Analytics-specific caching
   */
  async getAnalytics<T>(key: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('analytics', key, fallback);
  }

  async setAnalytics<T>(key: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('analytics', key, data, { ttl });
  }

  async invalidateAnalytics(key?: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('analytics', { key });
  }

  /**
   * Contact lists caching
   */
  async getContacts<T>(listId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('contacts', listId, fallback);
  }

  async setContacts<T>(listId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('contacts', listId, data, { ttl });
  }

  async invalidateContacts(listId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('contacts', { listId });
  }

  /**
   * Template caching
   */
  async getTemplate<T>(templateId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('templates', templateId, fallback);
  }

  async setTemplate<T>(templateId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('templates', templateId, data, { ttl });
  }

  async invalidateTemplate(templateId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('templates', { templateId });
  }

  /**
   * API response caching
   */
  async getAPIResponse<T>(endpoint: string, params: string, fallback?: () => Promise<T>): Promise<T | null> {
    const key = `${endpoint}:${params}`;
    return this.cacheStrategies.get('api', key, fallback);
  }

  async setAPIResponse<T>(endpoint: string, params: string, data: T, ttl?: number): Promise<boolean> {
    const key = `${endpoint}:${params}`;
    return this.cacheStrategies.set('api', key, data, { ttl });
  }

  async invalidateAPIResponse(endpoint: string, params?: string): Promise<number> {
    const key = params ? `${endpoint}:${params}` : endpoint;
    return this.cacheStrategies.invalidateStrategy('api', { key });
  }

  /**
   * Static data caching
   */
  async getStaticData<T>(key: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('static', key, fallback);
  }

  async setStaticData<T>(key: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('static', key, data, { ttl });
  }

  async invalidateStaticData(key: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('static', { key });
  }

  /**
   * Session data caching
   */
  async getSession<T>(sessionId: string, fallback?: () => Promise<T>): Promise<T | null> {
    return this.cacheStrategies.get('session', sessionId, fallback);
  }

  async setSession<T>(sessionId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.set('session', sessionId, data, { ttl });
  }

  async invalidateSession(sessionId: string): Promise<number> {
    return this.cacheStrategies.invalidateStrategy('session', { sessionId });
  }

  /**
   * Batch operations
   */
  async batchGetCampaigns<T>(campaignIds: string[]): Promise<{ [key: string]: T | null }> {
    return this.cacheStrategies.batchGet('campaign', campaignIds);
  }

  async batchSetCampaigns<T>(campaigns: { [key: string]: T }, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.batchSet('campaign', campaigns, { ttl });
  }

  async batchGetContacts<T>(listIds: string[]): Promise<{ [key: string]: T | null }> {
    return this.cacheStrategies.batchGet('contacts', listIds);
  }

  async batchSetContacts<T>(contacts: { [key: string]: T }, ttl?: number): Promise<boolean> {
    return this.cacheStrategies.batchSet('contacts', contacts, { ttl });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    return this.cacheStrategies.getStrategyStats();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const cacheManager = getCacheManager();
    return cacheManager.healthCheck();
  }
}

// Export singleton cache service
export const cacheService = new CacheService();

// Export all cache-related classes and functions
export { 
  AdvancedCacheManager, 
  CacheStrategies, 
  createCacheConfig,
  createWarmingConfig 
};
export type { CacheStrategy, CacheWarmingConfig };