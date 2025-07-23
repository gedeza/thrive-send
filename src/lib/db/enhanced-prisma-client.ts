import { PrismaClient } from '@prisma/client';
import { EnhancedConnectionPool, createDatabaseConfig } from './enhanced-connection-pool';
import { QueryOptimizationService } from './query-optimization-service';
import { logger } from '../utils/logger';

export class EnhancedPrismaClient {
  private static instance: EnhancedPrismaClient;
  private connectionPool: EnhancedConnectionPool;
  private queryOptimizer: QueryOptimizationService;
  private prisma: PrismaClient;

  private constructor() {
    this.initializeClient();
  }

  static getInstance(): EnhancedPrismaClient {
    if (!EnhancedPrismaClient.instance) {
      EnhancedPrismaClient.instance = new EnhancedPrismaClient();
    }
    return EnhancedPrismaClient.instance;
  }

  private initializeClient(): void {
    try {
      // Initialize connection pool
      const dbConfig = createDatabaseConfig();
      this.connectionPool = EnhancedConnectionPool.getInstance(dbConfig);
      this.prisma = this.connectionPool.getPrismaClient();

      // Initialize query optimizer
      this.queryOptimizer = QueryOptimizationService.getInstance();

      logger.info('Enhanced Prisma client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize enhanced Prisma client', error as Error);
      throw error;
    }
  }

  /**
   * Get the underlying Prisma client
   */
  getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Optimized batch fetching
   */
  async batchFetch<T>(
    model: any,
    ids: string[],
    options: {
      include?: any;
      select?: any;
      useCache?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<T[]> {
    return this.queryOptimizer.batchFetch(this.prisma, model, ids, options);
  }

  /**
   * Optimized cursor pagination
   */
  async cursorPaginate<T>(
    model: any,
    options: {
      cursor?: string;
      take?: number;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    } = {}
  ): Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }> {
    return this.queryOptimizer.cursorPaginate(this.prisma, model, options);
  }

  /**
   * Optimized aggregation with caching
   */
  async aggregateWithCache<T>(
    model: any,
    aggregation: any,
    options: {
      where?: any;
      useCache?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<T> {
    return this.queryOptimizer.aggregateWithCache(this.prisma, model, aggregation, options);
  }

  /**
   * Full-text search optimization
   */
  async searchWithFullText<T>(
    model: any,
    searchTerm: string,
    searchFields: string[],
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      take?: number;
    } = {}
  ): Promise<T[]> {
    return this.queryOptimizer.searchWithFullText(
      this.prisma,
      model,
      searchTerm,
      searchFields,
      options
    );
  }

  /**
   * Bulk upsert operations
   */
  async bulkUpsert<T>(
    model: any,
    data: any[],
    options: {
      uniqueFields?: string[];
      updateFields?: string[];
      batchSize?: number;
    } = {}
  ): Promise<T[]> {
    return this.queryOptimizer.bulkUpsert(this.prisma, model, data, {
      uniqueFields: options.uniqueFields || ['id'],
      updateFields: options.updateFields || [],
      batchSize: options.batchSize || 100,
    });
  }

  /**
   * Load relations efficiently (prevents N+1 queries)
   */
  async loadRelations<T>(
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
    return this.queryOptimizer.loadRelations(this.prisma, items, relations);
  }

  /**
   * Campaign-specific optimized queries
   */
  async getCampaignDashboard(
    organizationId: string,
    filters: {
      status?: string[];
      goalType?: string[];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ) {
    const where: any = { organizationId };
    
    if (filters.status?.length) {
      where.status = { in: filters.status };
    }
    
    if (filters.goalType?.length) {
      where.goalType = { in: filters.goalType };
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.cursorPaginate(this.prisma.campaign, {
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 20,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
        analytics: {
          select: {
            id: true,
            totalRecipients: true,
            emailsSent: true,
            emailsFailed: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Content workflow optimized queries
   */
  async getContentWorkflow(
    organizationId: string,
    filters: {
      authorId?: string;
      status?: string[];
      type?: string[];
      limit?: number;
    } = {}
  ) {
    const where: any = { organizationId };
    
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }
    
    if (filters.status?.length) {
      where.status = { in: filters.status };
    }
    
    if (filters.type?.length) {
      where.type = { in: filters.type };
    }

    return this.cursorPaginate(this.prisma.content, {
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 20,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        approvals: {
          select: {
            id: true,
            status: true,
            assignedTo: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Analytics optimized queries
   */
  async getAnalyticsDashboard(
    organizationId: string,
    filters: {
      campaignId?: string;
      startDate?: Date;
      endDate?: Date;
      metricTypes?: string[];
    } = {}
  ) {
    const where: any = { organizationId };
    
    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }
    
    if (filters.metricTypes?.length) {
      where.metricType = { in: filters.metricTypes };
    }

    return this.aggregateWithCache(
      this.prisma.analytics,
      {
        _sum: {
          totalRecipients: true,
          emailsSent: true,
          emailsFailed: true,
          opens: true,
          clicks: true,
        },
        _avg: {
          openRate: true,
          clickRate: true,
          conversionRate: true,
        },
        _count: {
          id: true,
        },
      },
      {
        where,
        useCache: true,
        cacheTTL: 300, // 5 minutes
      }
    );
  }

  /**
   * Health check and monitoring
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    connectionPool: any;
    queryOptimizer: any;
  }> {
    try {
      const isHealthy = await this.connectionPool.executeHealthCheck();
      const poolStats = this.connectionPool.getHealthStatus();
      const queryMetrics = this.queryOptimizer.getMetrics();
      const cacheStats = this.queryOptimizer.getCacheStats();

      return {
        healthy: isHealthy,
        connectionPool: poolStats,
        queryOptimizer: {
          metrics: queryMetrics,
          cache: cacheStats,
        },
      };
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return {
        healthy: false,
        connectionPool: null,
        queryOptimizer: null,
      };
    }
  }

  /**
   * Performance monitoring
   */
  getPerformanceMetrics(): {
    connection: any;
    queries: any;
    cache: any;
  } {
    return {
      connection: this.connectionPool.getConnectionStats(),
      queries: this.queryOptimizer.getMetrics(),
      cache: this.queryOptimizer.getCacheStats(),
    };
  }

  /**
   * Clear caches and reset metrics
   */
  async resetMetrics(): Promise<void> {
    await this.connectionPool.resetStats();
    this.queryOptimizer.clearCache();
    logger.info('Database metrics and caches reset');
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      await this.connectionPool.closeConnections();
      logger.info('Enhanced Prisma client shutdown completed');
    } catch (error) {
      logger.error('Failed to shutdown enhanced Prisma client', error as Error);
    }
  }
}

// Export singleton instance
export const enhancedPrisma = EnhancedPrismaClient.getInstance();

// Export for backward compatibility
export const prisma = enhancedPrisma.getClient();