import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from './index';
import { logger } from '../utils/logger';

export interface CacheMiddlewareConfig {
  enabled: boolean;
  defaultTTL: number;
  skipPatterns: string[];
  cacheHeaders: boolean;
  varyHeaders: string[];
  maxAge: number;
  staleWhileRevalidate: number;
}

export interface CacheableRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  user?: any;
  params?: any;
}

export interface CacheContext {
  key: string;
  strategy: string;
  ttl: number;
  tags: string[];
  vary: string[];
}

export class CacheMiddleware {
  private config: CacheMiddlewareConfig;

  constructor(config: CacheMiddlewareConfig) {
    this.config = config;
  }

  /**
   * Next.js API route caching middleware
   */
  withCache(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    options: {
      strategy?: string;
      ttl?: number;
      keyGenerator?: (req: NextRequest, context: any) => string;
      shouldCache?: (req: NextRequest, res: NextResponse) => boolean;
      tags?: string[];
      vary?: string[];
    } = {}
  ) {
    return async (req: NextRequest, context: any): Promise<NextResponse> => {
      // Skip caching if disabled or method not cacheable
      if (!this.config.enabled || !this.isCacheableMethod(req.method)) {
        return handler(req, context);
      }

      // Check skip patterns
      if (this.shouldSkipCaching(req.url)) {
        return handler(req, context);
      }

      try {
        const cacheContext = this.buildCacheContext(req, context, options);
        
        // Try to get from cache
        const cachedResponse = await this.getCachedResponse(cacheContext);
        if (cachedResponse) {
          logger.debug('Cache hit for API route', { 
            url: req.url, 
            key: cacheContext.key,
            strategy: cacheContext.strategy,
          });
          return this.buildCachedResponse(cachedResponse, cacheContext);
        }

        // Execute handler
        const response = await handler(req, context);

        // Cache the response if conditions are met
        if (this.shouldCacheResponse(req, response, options)) {
          await this.cacheResponse(cacheContext, response);
          logger.debug('Response cached for API route', { 
            url: req.url, 
            key: cacheContext.key,
            strategy: cacheContext.strategy,
          });
        }

        return this.addCacheHeaders(response, cacheContext);

      } catch (_error) {
        logger.error('Cache middleware error', error as Error, { url: req.url });
        return handler(req, context);
      }
    };
  }

  /**
   * React component data caching wrapper
   */
  async withDataCache<T>(
    dataFetcher: () => Promise<T>,
    options: {
      strategy: string;
      key: string;
      ttl?: number;
      tags?: string[];
      fallback?: T;
    }
  ): Promise<T> {
    const {
      strategy,
      key,
      ttl,
      tags = [],
      fallback,
    } = options;

    try {
      // Try to get from cache first
      const cachedData = await this.getCachedData<T>(strategy, key);
      if (cachedData !== null) {
        logger.debug('Cache hit for component data', { strategy, key });
        return cachedData;
      }

      // Fetch fresh data
      const freshData = await dataFetcher();
      
      // Cache the fresh data
      await this.setCachedData(strategy, key, freshData, ttl);
      
      logger.debug('Fresh data cached for component', { strategy, key });
      return freshData;

    } catch (_error) {
      logger.error('Data cache error', error as Error, { strategy, key });
      
      // Return fallback if available
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw _error;
    }
  }

  /**
   * Cache invalidation based on tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const invalidationPromises = tags.map(tag => 
        cacheService.invalidateAPIResponse('*', tag)
      );

      await Promise.all(invalidationPromises);
      
      logger.info('Cache invalidated by tags', { tags });

    } catch (_error) {
      logger.error('Cache invalidation by tags failed', error as Error, { tags });
    }
  }

  /**
   * Cache invalidation based on URL patterns
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      await cacheService.invalidateAPIResponse(pattern);
      logger.info('Cache invalidated by pattern', { pattern });

    } catch (_error) {
      logger.error('Cache invalidation by pattern failed', error as Error, { pattern });
    }
  }

  /**
   * Preload cache for specific routes
   */
  async preloadCache(routes: Array<{
    url: string;
    strategy: string;
    dataFetcher: () => Promise<any>;
    ttl?: number;
  }>): Promise<void> {
    try {
      const preloadPromises = routes.map(async (route) => {
        const key = this.generateCacheKey(route.url, {});
        const data = await route.dataFetcher();
        
        return this.setCachedData(
          route.strategy,
          key,
          data,
          route.ttl || this.config.defaultTTL
        );
      });

      await Promise.all(preloadPromises);
      
      logger.info('Cache preloading completed', { routeCount: routes.length });

    } catch (_error) {
      logger.error('Cache preloading failed', error as Error);
    }
  }

  // Private helper methods

  private isCacheableMethod(method: string): boolean {
    return ['GET', 'HEAD'].includes(method.toUpperCase());
  }

  private shouldSkipCaching(url: string): boolean {
    return this.config.skipPatterns.some(pattern => 
      new RegExp(pattern).test(url)
    );
  }

  private buildCacheContext(
    req: NextRequest,
    context: any,
    options: RequestInit
  ): CacheContext {
    const strategy = options.strategy || 'api';
    const key = options.keyGenerator 
      ? options.keyGenerator(req, context)
      : this.generateCacheKey(req.url, context);
    
    const ttl = options.ttl || this.config.defaultTTL;
    const tags = options.tags || [];
    const vary = options.vary || this.config.varyHeaders;

    return {
      key,
      strategy,
      ttl,
      tags,
      vary,
    };
  }

  private generateCacheKey(url: string, context: any): string {
    try {
      const urlObj = new URL(url, 'http://localhost');
      const pathname = urlObj.pathname;
      const search = urlObj.search;
      
      // Include context params in cache key
      const contextStr = context.params 
        ? JSON.stringify(context.params)
        : '';
      
      return `${pathname}${search}:${contextStr}`;
    } catch {
      return url;
    }
  }

  private async getCachedResponse(context: CacheContext): Promise<any> {
    try {
      return await cacheService.getAPIResponse(
        context.strategy,
        context.key
      );
    } catch (_error) {
      logger.error('Failed to get cached response', error as Error, { context });
      return null;
    }
  }

  private async getCachedData<T>(strategy: string, key: string): Promise<T | null> {
    try {
      switch (strategy) {
        case 'organization':
          return await cacheService.getOrganization<T>(key);
        case 'user':
          return await cacheService.getUser<T>(key);
        case 'campaign':
          return await cacheService.getCampaign<T>(key);
        case 'content':
          return await cacheService.getContent<T>(key);
        case 'analytics':
          return await cacheService.getAnalytics<T>(key);
        case 'contacts':
          return await cacheService.getContacts<T>(key);
        case 'templates':
          return await cacheService.getTemplate<T>(key);
        case 'static':
          return await cacheService.getStaticData<T>(key);
        case 'session':
          return await cacheService.getSession<T>(key);
        default:
          return await cacheService.getAPIResponse<T>(strategy, key);
      }
    } catch (_error) {
      logger.error('Failed to get cached data', error as Error, { strategy, key });
      return null;
    }
  }

  private async setCachedData<T>(
    strategy: string,
    key: string,
    data: T,
    ttl?: number
  ): Promise<boolean> {
    try {
      switch (strategy) {
        case 'organization':
          return await cacheService.setOrganization(key, data, ttl);
        case 'user':
          return await cacheService.setUser(key, data, ttl);
        case 'campaign':
          return await cacheService.setCampaign(key, data, ttl);
        case 'content':
          return await cacheService.setContent(key, data, ttl);
        case 'analytics':
          return await cacheService.setAnalytics(key, data, ttl);
        case 'contacts':
          return await cacheService.setContacts(key, data, ttl);
        case 'templates':
          return await cacheService.setTemplate(key, data, ttl);
        case 'static':
          return await cacheService.setStaticData(key, data, ttl);
        case 'session':
          return await cacheService.setSession(key, data, ttl);
        default:
          return await cacheService.setAPIResponse(strategy, key, data, ttl);
      }
    } catch (_error) {
      logger.error('Failed to set cached data', error as Error, { strategy, key });
      return false;
    }
  }

  private shouldCacheResponse(
    req: NextRequest,
    res: NextResponse,
    options: RequestInit
  ): boolean {
    // Check if response is successful
    if (!res.ok) {
      return false;
    }

    // Check custom shouldCache function
    if (options.shouldCache && !options.shouldCache(req, res)) {
      return false;
    }

    // Check for cache-control headers that prevent caching
    const cacheControl = res.headers.get('cache-control');
    if (cacheControl && cacheControl.includes('no-cache')) {
      return false;
    }

    return true;
  }

  private async cacheResponse(context: CacheContext, response: NextResponse): Promise<void> {
    try {
      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };

      await cacheService.setAPIResponse(
        context.strategy,
        context.key,
        responseData,
        context.ttl
      );

    } catch (_error) {
      logger.error('Failed to cache response', error as Error, { context });
    }
  }

  private buildCachedResponse(cachedData: any, context: CacheContext): NextResponse {
    const response = new NextResponse(cachedData.body, {
      status: cachedData.status,
      statusText: cachedData.statusText,
      headers: cachedData.headers,
    });

    return this.addCacheHeaders(response, context, true);
  }

  private addCacheHeaders(
    response: NextResponse,
    context: CacheContext,
    fromCache: boolean = false
  ): NextResponse {
    if (!this.config.cacheHeaders) {
      return response;
    }

    // Add cache status header
    response.headers.set('X-Cache-Status', fromCache ? 'HIT' : 'MISS');
    response.headers.set('X-Cache-Strategy', context.strategy);

    // Add cache-control headers
    if (context.ttl > 0) {
      const cacheControl = [
        `max-age=${this.config.maxAge}`,
        `s-maxage=${context.ttl}`,
        `stale-while-revalidate=${this.config.staleWhileRevalidate}`,
      ].join(', ');
      
      response.headers.set('Cache-Control', cacheControl);
    }

    // Add vary headers
    if (context.vary.length > 0) {
      response.headers.set('Vary', context.vary.join(', '));
    }

    // Add ETag for cache validation
    if (context.key) {
      const etag = `"${Buffer.from(context.key).toString('base64').slice(0, 16)}"`;
      response.headers.set('ETag', etag);
    }

    return response;
  }
}

// Export default middleware configuration
export const createCacheMiddlewareConfig = (): CacheMiddlewareConfig => ({
  enabled: process.env.CACHE_MIDDLEWARE_ENABLED !== 'false',
  defaultTTL: parseInt(process.env.CACHE_MIDDLEWARE_TTL || '300'), // 5 minutes
  skipPatterns: [
    '/api/auth/.*',
    '/api/webhooks/.*',
    '/api/admin/.*',
    '.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$',
  ],
  cacheHeaders: process.env.CACHE_HEADERS_ENABLED !== 'false',
  varyHeaders: ['Authorization', 'X-Organization-Id'],
  maxAge: parseInt(process.env.CACHE_MAX_AGE || '60'), // 1 minute
  staleWhileRevalidate: parseInt(process.env.CACHE_STALE_WHILE_REVALIDATE || '300'), // 5 minutes
});

// Export singleton cache middleware
export const cacheMiddleware = new CacheMiddleware(createCacheMiddlewareConfig());