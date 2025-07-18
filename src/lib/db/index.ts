import { ReadReplicaManager, createReadReplicaConfig } from './read-replica-manager';
import { DatabaseRouter, createDatabaseRouterConfig } from './database-router';
import { enhancedPrisma } from './enhanced-prisma-client';
import { logger } from '../utils/logger';

// Global database instances
let globalReadReplicaManager: ReadReplicaManager | null = null;
let globalDatabaseRouter: DatabaseRouter | null = null;
let globalDatabaseProxy: any | null = null;

/**
 * Initialize the database system with read replicas
 */
export function initializeDatabase(): {
  replicaManager: ReadReplicaManager;
  databaseRouter: DatabaseRouter;
  databaseProxy: any;
} {
  if (!globalReadReplicaManager) {
    const replicaConfig = createReadReplicaConfig();
    globalReadReplicaManager = ReadReplicaManager.getInstance(replicaConfig);
    
    const routerConfig = createDatabaseRouterConfig();
    globalDatabaseRouter = DatabaseRouter.getInstance(globalReadReplicaManager, routerConfig);
    
    globalDatabaseProxy = globalDatabaseRouter.createDatabaseProxy();
    
    logger.info('Database system initialized with read replicas', {
      replicas: replicaConfig.replicas.length,
      loadBalancing: replicaConfig.loadBalancing.strategy,
      enableRouting: routerConfig.enableReadReplicas,
    });
  }

  return {
    replicaManager: globalReadReplicaManager,
    databaseRouter: globalDatabaseRouter!,
    databaseProxy: globalDatabaseProxy,
  };
}

/**
 * Get the read replica manager instance
 */
export function getReadReplicaManager(): ReadReplicaManager {
  if (!globalReadReplicaManager) {
    const { replicaManager } = initializeDatabase();
    return replicaManager;
  }
  return globalReadReplicaManager;
}

/**
 * Get the database router instance
 */
export function getDatabaseRouter(): DatabaseRouter {
  if (!globalDatabaseRouter) {
    const { databaseRouter } = initializeDatabase();
    return databaseRouter;
  }
  return globalDatabaseRouter;
}

/**
 * Get the database proxy (Prisma-like interface with routing)
 */
export function getDatabaseProxy(): any {
  if (!globalDatabaseProxy) {
    const { databaseProxy } = initializeDatabase();
    return databaseProxy;
  }
  return globalDatabaseProxy;
}

/**
 * Database service with high-level operations
 */
export class DatabaseService {
  private router: DatabaseRouter;
  private proxy: any;

  constructor() {
    const { databaseRouter, databaseProxy } = initializeDatabase();
    this.router = databaseRouter;
    this.proxy = databaseProxy;
  }

  /**
   * Get database proxy for standard operations
   */
  getProxy(): any {
    return this.proxy;
  }

  /**
   * Execute custom query with intelligent routing
   */
  async executeQuery<T>(
    query: (client: any) => Promise<T>,
    options: {
      operation?: string;
      readOnly?: boolean;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      region?: string;
      userId?: string;
      organizationId?: string;
    } = {}
  ): Promise<T> {
    return this.router.executeQuery(query, {
      operation: options.operation || 'custom',
      readOnly: options.readOnly !== false,
      priority: options.priority || 'medium',
      region: options.region,
      userId: options.userId,
      organizationId: options.organizationId,
    });
  }

  /**
   * Analytics queries (optimized for read replicas)
   */
  async getAnalyticsData(
    organizationId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      campaignId?: string;
      metricTypes?: string[];
    } = {}
  ): Promise<any> {
    return this.executeQuery(
      async (client) => {
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

        return client.analytics.aggregate({
          where,
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
        });
      },
      {
        operation: 'analytics_dashboard',
        readOnly: true,
        priority: 'low',
        organizationId,
      }
    );
  }

  /**
   * Campaign dashboard data (optimized for read replicas)
   */
  async getCampaignDashboard(
    organizationId: string,
    filters: {
      status?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any> {
    return this.executeQuery(
      async (client) => {
        const where: any = { organizationId };
        
        if (filters.status?.length) {
          where.status = { in: filters.status };
        }

        return client.campaign.findMany({
          where,
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
                openRate: true,
                clickRate: true,
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: filters.limit || 20,
          skip: filters.offset || 0,
        });
      },
      {
        operation: 'campaign_dashboard',
        readOnly: true,
        priority: 'medium',
        organizationId,
      }
    );
  }

  /**
   * Contact search (optimized for read replicas)
   */
  async searchContacts(
    organizationId: string,
    searchTerm: string,
    filters: {
      tags?: string[];
      listIds?: string[];
      limit?: number;
    } = {}
  ): Promise<any> {
    return this.executeQuery(
      async (client) => {
        const where: any = {
          organizationId,
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        };
        
        if (filters.tags?.length) {
          where.tags = { hasSome: filters.tags };
        }
        
        if (filters.listIds?.length) {
          where.listMemberships = {
            some: {
              listId: { in: filters.listIds },
            },
          };
        }

        return client.contact.findMany({
          where,
          include: {
            listMemberships: {
              include: {
                list: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: filters.limit || 50,
        });
      },
      {
        operation: 'contact_search',
        readOnly: true,
        priority: 'medium',
        organizationId,
      }
    );
  }

  /**
   * Bulk contact operations (writes to primary)
   */
  async bulkCreateContacts(
    organizationId: string,
    contacts: any[],
    options: {
      skipDuplicates?: boolean;
      updateOnDuplicate?: boolean;
    } = {}
  ): Promise<any> {
    return this.executeQuery(
      async (client) => {
        if (options.skipDuplicates) {
          return client.contact.createMany({
            data: contacts.map(contact => ({
              ...contact,
              organizationId,
            })),
            skipDuplicates: true,
          });
        } else {
          // Use individual upsert operations for update on duplicate
          const results = [];
          for (const contact of contacts) {
            const result = await client.contact.upsert({
              where: {
                email_organizationId: {
                  email: contact.email,
                  organizationId,
                },
              },
              update: options.updateOnDuplicate ? contact : {},
              create: {
                ...contact,
                organizationId,
              },
            });
            results.push(result);
          }
          return results;
        }
      },
      {
        operation: 'contact_bulk_create',
        readOnly: false,
        priority: 'medium',
        organizationId,
      }
    );
  }

  /**
   * Performance reports (heavily optimized for read replicas)
   */
  async getPerformanceReport(
    organizationId: string,
    timeRange: {
      startDate: Date;
      endDate: Date;
    },
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    return this.executeQuery(
      async (client) => {
        // Use raw query for complex aggregations
        return client.$queryRaw`
          SELECT 
            DATE_TRUNC(${groupBy}, created_at) as period,
            COUNT(*) as total_campaigns,
            SUM(total_recipients) as total_recipients,
            SUM(emails_sent) as emails_sent,
            SUM(emails_failed) as emails_failed,
            AVG(open_rate) as avg_open_rate,
            AVG(click_rate) as avg_click_rate,
            AVG(conversion_rate) as avg_conversion_rate
          FROM "Analytics"
          WHERE organization_id = ${organizationId}
            AND created_at >= ${timeRange.startDate}
            AND created_at <= ${timeRange.endDate}
          GROUP BY period
          ORDER BY period
        `;
      },
      {
        operation: 'performance_report',
        readOnly: true,
        priority: 'low',
        organizationId,
      }
    );
  }

  /**
   * Health check for database system
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    enhanced: any;
    routing: any;
    replicas: any;
  }> {
    try {
      const [enhancedHealth, routingHealth] = await Promise.all([
        enhancedPrisma.healthCheck(),
        this.router.healthCheck(),
      ]);

      const overall = enhancedHealth.healthy && routingHealth.healthy;

      return {
        healthy: overall,
        enhanced: enhancedHealth,
        routing: routingHealth,
        replicas: routingHealth.replicas,
      };

    } catch (error) {
      logger.error('Database service health check failed', error as Error);
      return {
        healthy: false,
        enhanced: null,
        routing: null,
        replicas: null,
      };
    }
  }

  /**
   * Get comprehensive database statistics
   */
  getStats(): {
    routing: any;
    replicas: any;
    enhanced: any;
  } {
    return {
      routing: this.router.getRoutingStats(),
      replicas: getReadReplicaManager().getConnectionStats(),
      enhanced: enhancedPrisma.getPerformanceMetrics(),
    };
  }
}

/**
 * Convenience functions for specific use cases
 */

/**
 * Analytics-optimized database operations
 */
export const analyticsDb = {
  async getMetrics(organizationId: string, filters: any = {}) {
    const dbService = new DatabaseService();
    return dbService.getAnalyticsData(organizationId, filters);
  },

  async getReports(organizationId: string, timeRange: any, groupBy: 'day' | 'week' | 'month' = 'day') {
    const dbService = new DatabaseService();
    return dbService.getPerformanceReport(organizationId, timeRange, groupBy);
  },

  async getCampaignPerformance(organizationId: string, campaignId: string) {
    const proxy = getDatabaseProxy();
    return proxy.analytics.findMany({
      where: { organizationId, campaignId },
      orderBy: { createdAt: 'desc' },
    });
  },
};

/**
 * Campaign-optimized database operations
 */
export const campaignDb = {
  async getDashboard(organizationId: string, filters: any = {}) {
    const dbService = new DatabaseService();
    return dbService.getCampaignDashboard(organizationId, filters);
  },

  async getActive(organizationId: string) {
    const proxy = getDatabaseProxy();
    return proxy.campaign.findMany({
      where: { 
        organizationId, 
        status: { in: ['ACTIVE', 'SCHEDULED'] } 
      },
      include: {
        content: true,
        analytics: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async create(organizationId: string, campaignData: any) {
    const proxy = getDatabaseProxy();
    return proxy.campaign.create({
      data: {
        ...campaignData,
        organizationId,
      },
      include: {
        content: true,
      },
    });
  },
};

/**
 * Contact-optimized database operations
 */
export const contactDb = {
  async search(organizationId: string, searchTerm: string, filters: any = {}) {
    const dbService = new DatabaseService();
    return dbService.searchContacts(organizationId, searchTerm, filters);
  },

  async bulkImport(organizationId: string, contacts: any[], options: any = {}) {
    const dbService = new DatabaseService();
    return dbService.bulkCreateContacts(organizationId, contacts, options);
  },

  async getByList(organizationId: string, listId: string, limit: number = 100) {
    const proxy = getDatabaseProxy();
    return proxy.contact.findMany({
      where: {
        organizationId,
        listMemberships: {
          some: { listId },
        },
      },
      take: limit,
    });
  },
};

// Export singleton database service
export const databaseService = new DatabaseService();

// Export all database classes and functions
export { 
  ReadReplicaManager, 
  DatabaseRouter,
  createReadReplicaConfig,
  createDatabaseRouterConfig 
};

// For backward compatibility, export enhanced prisma
export { enhancedPrisma };

// Export the standard proxy as default database interface
export const db = getDatabaseProxy();