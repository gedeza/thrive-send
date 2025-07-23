import { PrismaClient } from '@prisma/client';
import { ReadReplicaManager } from './read-replica-manager';
import { logger } from '../utils/logger';
import { monitoringService } from '../monitoring/index';

export interface QueryContext {
  operation: string;
  userId?: string;
  organizationId?: string;
  region?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  readOnly: boolean;
  preferPrimary?: boolean;
  timeout?: number;
}

export interface DatabaseRouterConfig {
  enableReadReplicas: boolean;
  defaultPriority: 'low' | 'medium' | 'high' | 'critical';
  queryTimeout: number;
  retryAttempts: number;
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
}

export class DatabaseRouter {
  private static instance: DatabaseRouter;
  private replicaManager: ReadReplicaManager;
  private config: DatabaseRouterConfig;
  private circuitBreakerState: Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }> = new Map();

  private constructor(replicaManager: ReadReplicaManager, config: DatabaseRouterConfig) {
    this.replicaManager = replicaManager;
    this.config = config;
  }

  static getInstance(
    replicaManager?: ReadReplicaManager, 
    config?: DatabaseRouterConfig
  ): DatabaseRouter {
    if (!DatabaseRouter.instance) {
      if (!replicaManager || !config) {
        throw new Error('Database router requires replica manager and config for initialization');
      }
      DatabaseRouter.instance = new DatabaseRouter(replicaManager, config);
    }
    return DatabaseRouter.instance;
  }

  /**
   * Execute database query with intelligent routing
   */
  async executeQuery<T>(
    query: (client: PrismaClient) => Promise<T>,
    context: Partial<QueryContext> = {}
  ): Promise<T> {
    const fullContext: QueryContext = {
      operation: 'unknown',
      priority: this.config.defaultPriority,
      readOnly: true,
      timeout: this.config.queryTimeout,
      ...context,
    };

    const startTime = Date.now();
    
    try {
      // Check circuit breaker
      if (this.config.circuitBreaker.enabled) {
        const breakerCheck = this.checkCircuitBreaker(fullContext);
        if (!breakerCheck.allowed) {
          throw new Error(`Circuit breaker open for ${fullContext.operation}`);
        }
      }

      let result: T;
      
      if (fullContext.readOnly && this.config.enableReadReplicas) {
        // Route read query to replica
        result = await this.replicaManager.executeRead(query, {
          operation: fullContext.operation,
          preferPrimary: fullContext.preferPrimary,
          region: fullContext.region,
          retries: this.config.retryAttempts,
        });
      } else {
        // Route write query to primary
        result = await this.replicaManager.executeWrite(query, {
          operation: fullContext.operation,
          retries: this.config.retryAttempts,
        });
      }

      const duration = Date.now() - startTime;
      
      // Record successful query metrics
      this.recordQueryMetrics(fullContext, duration, true);
      
      // Update circuit breaker on success
      if (this.config.circuitBreaker.enabled) {
        this.updateCircuitBreaker(fullContext, true);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed query metrics
      this.recordQueryMetrics(fullContext, duration, false);
      
      // Update circuit breaker on failure
      if (this.config.circuitBreaker.enabled) {
        this.updateCircuitBreaker(fullContext, false);
      }

      logger.error('Database query failed', error as Error, {
        context: fullContext,
        duration,
      });

      throw error;
    }
  }

  /**
   * Prisma-like interface for common operations
   */
  createDatabaseProxy(): DatabaseProxy {
    return new DatabaseProxy(this);
  }

  /**
   * Health check for database router
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    routing: boolean;
    replicas: any;
    circuitBreakers: any;
  }> {
    try {
      const replicaHealth = await this.replicaManager.healthCheck();
      
      const circuitBreakers: any = {};
      this.circuitBreakerState.forEach((state, key) => {
        circuitBreakers[key] = state.state;
      });

      const routingHealthy = replicaHealth.healthy;

      return {
        healthy: routingHealthy,
        routing: this.config.enableReadReplicas,
        replicas: replicaHealth,
        circuitBreakers,
      };

    } catch (error) {
      logger.error('Database router health check failed', error as Error);
      return {
        healthy: false,
        routing: false,
        replicas: null,
        circuitBreakers: {},
      };
    }
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(): {
    connections: any;
    replicas: any;
    circuitBreakers: number;
    performance: {
      averageQueryTime: number;
      replicaUsage: number;
      errorRate: number;
    };
  } {
    const connectionStats = this.replicaManager.getConnectionStats();
    const replicaStatus = this.replicaManager.getReplicaStatus();
    
    // Get circuit breaker count
    const circuitBreakerCount = Array.from(this.circuitBreakerState.values())
      .filter(state => state.state === 'open').length;

    return {
      connections: connectionStats,
      replicas: replicaStatus,
      circuitBreakers: circuitBreakerCount,
      performance: {
        averageQueryTime: replicaStatus.summary.averageResponseTime,
        replicaUsage: connectionStats.replicaUsagePercentage,
        errorRate: 0, // Would be calculated from metrics
      },
    };
  }

  // Private helper methods

  private recordQueryMetrics(context: QueryContext, duration: number, success: boolean): void {
    monitoringService.recordTiming('db_query_routed', duration, {
      operation: context.operation,
      priority: context.priority,
      readOnly: context.readOnly.toString(),
      success: success.toString(),
    });

    if (!success) {
      monitoringService.recordMetric('db_query_error_routed', 1, {
        operation: context.operation,
        priority: context.priority,
      });
    }
  }

  private checkCircuitBreaker(context: QueryContext): { allowed: boolean; reason?: string } {
    const key = `${context.operation}-${context.priority}`;
    const state = this.circuitBreakerState.get(key);

    if (!state) {
      // Initialize circuit breaker state
      this.circuitBreakerState.set(key, {
        failures: 0,
        lastFailure: 0,
        state: 'closed',
      });
      return { allowed: true };
    }

    const now = Date.now();

    switch (state.state) {
      case 'open':
        if (now - state.lastFailure > this.config.circuitBreaker.resetTimeout) {
          state.state = 'half-open';
          return { allowed: true };
        }
        return { 
          allowed: false, 
          reason: `Circuit breaker open for ${key}` 
        };

      case 'half-open':
        return { allowed: true };

      default: // closed
        return { allowed: true };
    }
  }

  private updateCircuitBreaker(context: QueryContext, success: boolean): void {
    const key = `${context.operation}-${context.priority}`;
    let state = this.circuitBreakerState.get(key);

    if (!state) {
      state = {
        failures: 0,
        lastFailure: 0,
        state: 'closed',
      };
      this.circuitBreakerState.set(key, state);
    }

    if (success) {
      if (state.state === 'half-open') {
        state.state = 'closed';
        state.failures = 0;
      }
    } else {
      state.failures++;
      state.lastFailure = Date.now();

      if (state.failures >= this.config.circuitBreaker.failureThreshold) {
        state.state = 'open';
        
        logger.warn('Circuit breaker opened', {
          key,
          failures: state.failures,
          threshold: this.config.circuitBreaker.failureThreshold,
        });

        monitoringService.recordMetric('db_circuit_breaker_opened', 1, {
          operation: context.operation,
          priority: context.priority,
        });
      }
    }
  }
}

/**
 * Database proxy that provides Prisma-like interface with routing
 */
export class DatabaseProxy {
  private router: DatabaseRouter;

  constructor(router: DatabaseRouter) {
    this.router = router;
  }

  /**
   * User operations
   */
  get user() {
    return {
      findUnique: (args: any) => this.router.executeQuery(
        (client) => client.user.findUnique(args),
        { operation: 'user_find_unique', readOnly: true }
      ),
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.user.findMany(args),
        { operation: 'user_find_many', readOnly: true }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.user.create(args),
        { operation: 'user_create', readOnly: false, priority: 'high' }
      ),
      update: (args: any) => this.router.executeQuery(
        (client) => client.user.update(args),
        { operation: 'user_update', readOnly: false, priority: 'medium' }
      ),
      delete: (args: any) => this.router.executeQuery(
        (client) => client.user.delete(args),
        { operation: 'user_delete', readOnly: false, priority: 'high' }
      ),
      count: (args: any = {}) => this.router.executeQuery(
        (client) => client.user.count(args),
        { operation: 'user_count', readOnly: true, priority: 'low' }
      ),
    };
  }

  /**
   * Organization operations
   */
  get organization() {
    return {
      findUnique: (args: any) => this.router.executeQuery(
        (client) => client.organization.findUnique(args),
        { operation: 'organization_find_unique', readOnly: true }
      ),
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.organization.findMany(args),
        { operation: 'organization_find_many', readOnly: true }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.organization.create(args),
        { operation: 'organization_create', readOnly: false, priority: 'high' }
      ),
      update: (args: any) => this.router.executeQuery(
        (client) => client.organization.update(args),
        { operation: 'organization_update', readOnly: false, priority: 'medium' }
      ),
    };
  }

  /**
   * Campaign operations
   */
  get campaign() {
    return {
      findUnique: (args: any) => this.router.executeQuery(
        (client) => client.campaign.findUnique(args),
        { operation: 'campaign_find_unique', readOnly: true }
      ),
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.campaign.findMany(args),
        { operation: 'campaign_find_many', readOnly: true }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.campaign.create(args),
        { operation: 'campaign_create', readOnly: false, priority: 'high' }
      ),
      update: (args: any) => this.router.executeQuery(
        (client) => client.campaign.update(args),
        { operation: 'campaign_update', readOnly: false, priority: 'medium' }
      ),
      delete: (args: any) => this.router.executeQuery(
        (client) => client.campaign.delete(args),
        { operation: 'campaign_delete', readOnly: false, priority: 'medium' }
      ),
    };
  }

  /**
   * Content operations
   */
  get content() {
    return {
      findUnique: (args: any) => this.router.executeQuery(
        (client) => client.content.findUnique(args),
        { operation: 'content_find_unique', readOnly: true }
      ),
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.content.findMany(args),
        { operation: 'content_find_many', readOnly: true }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.content.create(args),
        { operation: 'content_create', readOnly: false, priority: 'medium' }
      ),
      update: (args: any) => this.router.executeQuery(
        (client) => client.content.update(args),
        { operation: 'content_update', readOnly: false, priority: 'medium' }
      ),
    };
  }

  /**
   * Analytics operations (prefer replicas for read-heavy operations)
   */
  get analytics() {
    return {
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.analytics.findMany(args),
        { operation: 'analytics_find_many', readOnly: true, priority: 'low' }
      ),
      aggregate: (args: any) => this.router.executeQuery(
        (client) => client.analytics.aggregate(args),
        { operation: 'analytics_aggregate', readOnly: true, priority: 'low' }
      ),
      groupBy: (args: any) => this.router.executeQuery(
        (client) => client.analytics.groupBy(args),
        { operation: 'analytics_group_by', readOnly: true, priority: 'low' }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.analytics.create(args),
        { operation: 'analytics_create', readOnly: false, priority: 'low' }
      ),
      createMany: (args: any) => this.router.executeQuery(
        (client) => client.analytics.createMany(args),
        { operation: 'analytics_create_many', readOnly: false, priority: 'low' }
      ),
    };
  }

  /**
   * Contact operations
   */
  get contact() {
    return {
      findUnique: (args: any) => this.router.executeQuery(
        (client) => client.contact.findUnique(args),
        { operation: 'contact_find_unique', readOnly: true }
      ),
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.contact.findMany(args),
        { operation: 'contact_find_many', readOnly: true }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.contact.create(args),
        { operation: 'contact_create', readOnly: false, priority: 'medium' }
      ),
      createMany: (args: any) => this.router.executeQuery(
        (client) => client.contact.createMany(args),
        { operation: 'contact_create_many', readOnly: false, priority: 'medium' }
      ),
      update: (args: any) => this.router.executeQuery(
        (client) => client.contact.update(args),
        { operation: 'contact_update', readOnly: false, priority: 'low' }
      ),
      updateMany: (args: any) => this.router.executeQuery(
        (client) => client.contact.updateMany(args),
        { operation: 'contact_update_many', readOnly: false, priority: 'low' }
      ),
    };
  }

  /**
   * Template operations
   */
  get template() {
    return {
      findUnique: (args: any) => this.router.executeQuery(
        (client) => client.template.findUnique(args),
        { operation: 'template_find_unique', readOnly: true }
      ),
      findMany: (args: any = {}) => this.router.executeQuery(
        (client) => client.template.findMany(args),
        { operation: 'template_find_many', readOnly: true }
      ),
      create: (args: any) => this.router.executeQuery(
        (client) => client.template.create(args),
        { operation: 'template_create', readOnly: false, priority: 'medium' }
      ),
      update: (args: any) => this.router.executeQuery(
        (client) => client.template.update(args),
        { operation: 'template_update', readOnly: false, priority: 'medium' }
      ),
    };
  }

  /**
   * Raw query operations
   */
  $queryRaw(query: any, ...values: any[]) {
    return this.router.executeQuery(
      (client) => client.$queryRaw(query, ...values),
      { operation: 'raw_query', readOnly: true, priority: 'medium', preferPrimary: true }
    );
  }

  $executeRaw(query: any, ...values: any[]) {
    return this.router.executeQuery(
      (client) => client.$executeRaw(query, ...values),
      { operation: 'raw_execute', readOnly: false, priority: 'high', preferPrimary: true }
    );
  }

  /**
   * Transaction operations (always use primary)
   */
  $transaction(queries: any[], options?: any) {
    return this.router.executeQuery(
      (client) => client.$transaction(queries, options),
      { operation: 'transaction', readOnly: false, priority: 'critical', preferPrimary: true }
    );
  }
}

// Export default configuration
export const createDatabaseRouterConfig = (): DatabaseRouterConfig => ({
  enableReadReplicas: process.env.DB_READ_REPLICAS_ENABLED === 'true',
  defaultPriority: (process.env.DB_DEFAULT_PRIORITY as any) || 'medium',
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '2'),
  circuitBreaker: {
    enabled: process.env.DB_CIRCUIT_BREAKER_ENABLED === 'true',
    failureThreshold: parseInt(process.env.DB_CIRCUIT_BREAKER_THRESHOLD || '5'),
    resetTimeout: parseInt(process.env.DB_CIRCUIT_BREAKER_RESET_TIMEOUT || '60000'),
  },
});