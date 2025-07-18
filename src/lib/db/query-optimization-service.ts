import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export interface QueryOptions {
  batchSize?: number;
  useCache?: boolean;
  cacheTTL?: number;
  timeout?: number;
}

export interface PaginationOptions {
  cursor?: string;
  take?: number;
  skip?: number;
}

export interface QueryPerformanceMetrics {
  queryCount: number;
  totalDuration: number;
  averageDuration: number;
  slowQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

export class QueryOptimizationService {
  private static instance: QueryOptimizationService;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private metrics: QueryPerformanceMetrics = {
    queryCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    slowQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private constructor() {}

  static getInstance(): QueryOptimizationService {
    if (!QueryOptimizationService.instance) {
      QueryOptimizationService.instance = new QueryOptimizationService();
    }
    return QueryOptimizationService.instance;
  }

  /**
   * Optimized batch fetching with automatic chunking
   */
  async batchFetch<T>(
    prisma: PrismaClient,
    model: any,
    ids: string[],
    options: QueryOptions & { include?: any; select?: any } = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    
    if (ids.length === 0) return [];

    // Check cache first
    const cacheKey = `batch:${model.name}:${JSON.stringify({ ids, include: options.include, select: options.select })}`;
    if (options.useCache) {
      const cached = this.getCachedResult<T[]>(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        return cached;
      }
      this.metrics.cacheMisses++;
    }

    try {
      const batchSize = options.batchSize || 100;
      const batches: string[][] = [];
      
      // Split IDs into batches
      for (let i = 0; i < ids.length; i += batchSize) {
        batches.push(ids.slice(i, i + batchSize));
      }

      // Execute batches in parallel
      const batchPromises = batches.map(batchIds => 
        model.findMany({
          where: { id: { in: batchIds } },
          include: options.include,
          select: options.select,
        })
      );

      const results = await Promise.all(batchPromises);
      const flatResults = results.flat();

      // Cache results
      if (options.useCache) {
        this.setCachedResult(cacheKey, flatResults, options.cacheTTL || 300);
      }

      this.updateMetrics(startTime);
      return flatResults;

    } catch (error) {
      logger.error('Batch fetch failed', error as Error, {
        model: model.name,
        idsCount: ids.length,
        batchSize: options.batchSize,
      });
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Optimized cursor-based pagination
   */
  async cursorPaginate<T>(
    prisma: PrismaClient,
    model: any,
    options: PaginationOptions & {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    } = {}
  ): Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }> {
    const startTime = Date.now();
    
    try {
      const take = options.take || 10;
      const orderBy = options.orderBy || { createdAt: 'desc' };

      const queryOptions: any = {
        where: options.where,
        orderBy,
        take: take + 1, // Fetch one extra to check if there are more
        include: options.include,
        select: options.select,
      };

      // Add cursor if provided
      if (options.cursor) {
        queryOptions.cursor = { id: options.cursor };
        queryOptions.skip = 1;
      }

      const results = await model.findMany(queryOptions);
      
      const hasMore = results.length > take;
      const data = hasMore ? results.slice(0, -1) : results;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

      this.updateMetrics(startTime);

      return {
        data,
        nextCursor,
        hasMore,
      };

    } catch (error) {
      logger.error('Cursor pagination failed', error as Error, {
        model: model.name,
        cursor: options.cursor,
        take: options.take,
      });
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Optimized aggregation queries
   */
  async aggregateWithCache<T>(
    prisma: PrismaClient,
    model: any,
    aggregation: any,
    options: QueryOptions & { where?: any } = {}
  ): Promise<T> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `aggregate:${model.name}:${JSON.stringify({ aggregation, where: options.where })}`;
    if (options.useCache) {
      const cached = this.getCachedResult<T>(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        return cached;
      }
      this.metrics.cacheMisses++;
    }

    try {
      const result = await model.aggregate({
        where: options.where,
        ...aggregation,
      });

      // Cache results
      if (options.useCache) {
        this.setCachedResult(cacheKey, result, options.cacheTTL || 300);
      }

      this.updateMetrics(startTime);
      return result;

    } catch (error) {
      logger.error('Aggregation query failed', error as Error, {
        model: model.name,
        aggregation: JSON.stringify(aggregation),
      });
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Optimized search with full-text search capabilities
   */
  async searchWithFullText<T>(
    prisma: PrismaClient,
    model: any,
    searchTerm: string,
    searchFields: string[],
    options: QueryOptions & {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      take?: number;
    } = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      // Build search conditions
      const searchConditions = searchFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      }));

      const where = {
        ...options.where,
        OR: searchConditions,
      };

      const results = await model.findMany({
        where,
        orderBy: options.orderBy || { createdAt: 'desc' },
        include: options.include,
        select: options.select,
        take: options.take || 50,
      });

      this.updateMetrics(startTime);
      return results;

    } catch (error) {
      logger.error('Full-text search failed', error as Error, {
        model: model.name,
        searchTerm,
        searchFields: searchFields.join(','),
      });
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Optimized bulk operations
   */
  async bulkUpsert<T>(
    prisma: PrismaClient,
    model: any,
    data: any[],
    options: QueryOptions & {
      uniqueFields: string[];
      updateFields: string[];
    } = { uniqueFields: ['id'], updateFields: [] }
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      const batchSize = options.batchSize || 100;
      const results: T[] = [];

      // Process in batches
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        const batchPromises = batch.map(item => {
          const where = options.uniqueFields.reduce((acc, field) => {
            acc[field] = item[field];
            return acc;
          }, {} as any);

          const updateData = options.updateFields.length > 0
            ? options.updateFields.reduce((acc, field) => {
                if (item[field] !== undefined) {
                  acc[field] = item[field];
                }
                return acc;
              }, {} as any)
            : item;

          return model.upsert({
            where,
            update: updateData,
            create: item,
          });
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add small delay between batches to prevent overwhelming the database
        if (i + batchSize < data.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      this.updateMetrics(startTime);
      return results;

    } catch (error) {
      logger.error('Bulk upsert failed', error as Error, {
        model: model.name,
        itemCount: data.length,
        batchSize: options.batchSize,
      });
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Optimized relation loading to prevent N+1 queries
   */
  async loadRelations<T>(
    prisma: PrismaClient,
    items: any[],
    relations: {
      [key: string]: {
        model: any;
        localField: string;
        foreignField: string;
        include?: any;
        select?: any;
      };
    }
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      const enrichedItems = [...items];

      // Load each relation
      for (const [relationName, config] of Object.entries(relations)) {
        const foreignIds = items
          .map(item => item[config.localField])
          .filter(id => id !== null && id !== undefined);

        if (foreignIds.length === 0) continue;

        // Fetch related data
        const relatedData = await this.batchFetch(
          prisma,
          config.model,
          foreignIds,
          {
            include: config.include,
            select: config.select,
          }
        );

        // Create lookup map
        const relatedMap = new Map();
        relatedData.forEach(item => {
          relatedMap.set(item[config.foreignField], item);
        });

        // Enrich items with related data
        enrichedItems.forEach(item => {
          const relatedId = item[config.localField];
          if (relatedId && relatedMap.has(relatedId)) {
            item[relationName] = relatedMap.get(relatedId);
          }
        });
      }

      this.updateMetrics(startTime);
      return enrichedItems;

    } catch (error) {
      logger.error('Relation loading failed', error as Error, {
        itemCount: items.length,
        relations: Object.keys(relations).join(','),
      });
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Cache management methods
   */
  private getCachedResult<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedResult<T>(key: string, data: T, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  /**
   * Performance monitoring
   */
  private updateMetrics(startTime: number): void {
    const duration = Date.now() - startTime;
    this.metrics.queryCount++;
    this.metrics.totalDuration += duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.queryCount;
    
    if (duration > 1000) {
      this.metrics.slowQueries++;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): QueryPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache and reset metrics
   */
  clearCache(): void {
    this.cache.clear();
    this.metrics = {
      queryCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; expiry: number; size: number }>;
  } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests) * 100 : 0;

    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      expiry: value.expiry,
      size: JSON.stringify(value.data).length,
    }));

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      entries,
    };
  }
}