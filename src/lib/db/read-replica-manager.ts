import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { monitoringService } from '../monitoring/index';

export interface ReadReplicaConfig {
  primary: {
    url: string;
    maxConnections: number;
    connectionTimeout: number;
  };
  replicas: ReplicaConfig[];
  loadBalancing: {
    strategy: 'round-robin' | 'least-connections' | 'weighted' | 'geographic';
    healthCheckInterval: number;
    failoverTimeout: number;
    retryAttempts: number;
  };
  routing: {
    defaultToReplica: boolean;
    writeOperations: string[];
    replicaOnlyOperations: string[];
    primaryPreferredOperations: string[];
  };
}

export interface ReplicaConfig {
  id: string;
  name: string;
  url: string;
  weight: number;
  region?: string;
  maxConnections: number;
  connectionTimeout: number;
  enabled: boolean;
  priority: number;
}

export interface ReplicaStatus {
  id: string;
  healthy: boolean;
  lastCheck: number;
  responseTime: number;
  connectionCount: number;
  errorCount: number;
  lastError?: string;
}

export interface ConnectionStats {
  total: number;
  primary: number;
  replicas: number;
  distribution: { [replicaId: string]: number };
}

export class ReadReplicaManager {
  private static instance: ReadReplicaManager;
  private config: ReadReplicaConfig;
  private primaryClient: PrismaClient;
  private replicaClients: Map<string, PrismaClient> = new Map();
  private replicaStatus: Map<string, ReplicaStatus> = new Map();
  private connectionStats: ConnectionStats;
  private currentReplicaIndex: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor(config: ReadReplicaConfig) {
    this.config = config;
    this.connectionStats = {
      total: 0,
      primary: 0,
      replicas: 0,
      distribution: {},
    };
    
    this.initializeConnections();
    this.startHealthChecks();
  }

  static getInstance(config?: ReadReplicaConfig): ReadReplicaManager {
    if (!ReadReplicaManager.instance) {
      if (!config) {
        throw new Error('Read replica configuration required for first initialization');
      }
      ReadReplicaManager.instance = new ReadReplicaManager(config);
    }
    return ReadReplicaManager.instance;
  }

  /**
   * Get appropriate client for read operation
   */
  getReadClient(options: {
    operation?: string;
    preferPrimary?: boolean;
    region?: string;
    userId?: string;
    organizationId?: string;
  } = {}): PrismaClient {
    const {
      operation,
      preferPrimary = false,
      region,
    } = options;

    // Check if operation should always use primary
    if (preferPrimary || this.shouldUsePrimary(operation)) {
      this.connectionStats.primary++;
      monitoringService.recordMetric('db_connection_primary', 1, {
        operation: operation || 'unknown',
      });
      return this.primaryClient;
    }

    // Get best replica for read operation
    const replica = this.selectReplica(region);
    if (replica) {
      this.connectionStats.replicas++;
      this.connectionStats.distribution[replica.id] = 
        (this.connectionStats.distribution[replica.id] || 0) + 1;
      
      monitoringService.recordMetric('db_connection_replica', 1, {
        operation: operation || 'unknown',
        replica: replica.id,
      });
      
      return this.replicaClients.get(replica.id)!;
    }

    // Fallback to primary if no healthy replicas
    logger.warn('No healthy replicas available, using primary', { operation });
    this.connectionStats.primary++;
    monitoringService.recordMetric('db_connection_primary_fallback', 1, {
      operation: operation || 'unknown',
    });
    
    return this.primaryClient;
  }

  /**
   * Get primary client for write operations
   */
  getWriteClient(): PrismaClient {
    this.connectionStats.primary++;
    monitoringService.recordMetric('db_connection_primary_write', 1);
    return this.primaryClient;
  }

  /**
   * Execute read query with automatic routing
   */
  async executeRead<T>(
    query: (client: PrismaClient) => Promise<T>,
    options: {
      operation?: string;
      preferPrimary?: boolean;
      region?: string;
      retries?: number;
    } = {}
  ): Promise<T> {
    const {
      operation = 'read',
      retries = 2,
    } = options;

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = this.getReadClient({
          ...options,
          operation,
        });

        const result = await query(client);
        const duration = Date.now() - startTime;

        // Record successful query metrics
        monitoringService.recordTiming('db_read_query', duration, {
          operation,
          attempt: attempt.toString(),
        });

        return result;

      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;

        logger.error('Read query failed', error as Error, {
          operation,
          attempt,
          duration,
        });

        // Record failed query metrics
        monitoringService.recordMetric('db_read_query_error', 1, {
          operation,
          attempt: attempt.toString(),
        });

        // On last attempt or for certain errors, don't retry
        if (attempt === retries || this.isFatalError(error as Error)) {
          break;
        }

        // Wait before retry (exponential backoff)
        await this.sleep(Math.pow(2, attempt) * 100);
      }
    }

    // All retries failed
    monitoringService.recordMetric('db_read_query_failed', 1, {
      operation,
      retries: retries.toString(),
    });

    throw lastError || new Error('Read query failed after retries');
  }

  /**
   * Execute write query on primary
   */
  async executeWrite<T>(
    query: (client: PrismaClient) => Promise<T>,
    options: {
      operation?: string;
      retries?: number;
    } = {}
  ): Promise<T> {
    const {
      operation = 'write',
      retries = 1,
    } = options;

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = this.getWriteClient();
        const result = await query(client);
        const duration = Date.now() - startTime;

        // Record successful write metrics
        monitoringService.recordTiming('db_write_query', duration, {
          operation,
          attempt: attempt.toString(),
        });

        return result;

      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;

        logger.error('Write query failed', error as Error, {
          operation,
          attempt,
          duration,
        });

        // Record failed query metrics
        monitoringService.recordMetric('db_write_query_error', 1, {
          operation,
          attempt: attempt.toString(),
        });

        // Don't retry write operations by default
        if (attempt === retries || this.isFatalError(error as Error)) {
          break;
        }

        await this.sleep(Math.pow(2, attempt) * 100);
      }
    }

    // All retries failed
    monitoringService.recordMetric('db_write_query_failed', 1, {
      operation,
      retries: retries.toString(),
    });

    throw lastError || new Error('Write query failed after retries');
  }

  /**
   * Get replica status and health information
   */
  getReplicaStatus(): {
    primary: { healthy: boolean; responseTime: number };
    replicas: ReplicaStatus[];
    summary: {
      totalReplicas: number;
      healthyReplicas: number;
      averageResponseTime: number;
    };
  } {
    const replicas = Array.from(this.replicaStatus.values());
    const healthyReplicas = replicas.filter(r => r.healthy);
    const averageResponseTime = replicas.length > 0
      ? replicas.reduce((sum, r) => sum + r.responseTime, 0) / replicas.length
      : 0;

    return {
      primary: {
        healthy: true, // We assume primary is always healthy
        responseTime: 0, // Would be measured in practice
      },
      replicas,
      summary: {
        totalReplicas: replicas.length,
        healthyReplicas: healthyReplicas.length,
        averageResponseTime: Number(averageResponseTime.toFixed(2)),
      },
    };
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): ConnectionStats & {
    healthyReplicas: number;
    totalQueries: number;
    replicaUsagePercentage: number;
  } {
    const status = this.getReplicaStatus();
    const totalQueries = this.connectionStats.primary + this.connectionStats.replicas;
    const replicaUsagePercentage = totalQueries > 0
      ? (this.connectionStats.replicas / totalQueries) * 100
      : 0;

    return {
      ...this.connectionStats,
      total: totalQueries,
      healthyReplicas: status.summary.healthyReplicas,
      totalQueries,
      replicaUsagePercentage: Number(replicaUsagePercentage.toFixed(2)),
    };
  }

  /**
   * Force health check on all replicas
   */
  async forceHealthCheck(): Promise<void> {
    logger.info('Forcing health check on all replicas');
    await this.performHealthChecks();
  }

  /**
   * Add new replica configuration
   */
  async addReplica(replicaConfig: ReplicaConfig): Promise<boolean> {
    try {
      // Initialize new replica client
      const client = new PrismaClient({
        datasources: {
          db: {
            url: replicaConfig.url,
          },
        },
        log: ['error', 'warn'],
      });

      // Test connection
      await client.$connect();
      
      // Add to collections
      this.replicaClients.set(replicaConfig.id, client);
      this.config.replicas.push(replicaConfig);
      this.connectionStats.distribution[replicaConfig.id] = 0;
      
      // Initialize status
      this.replicaStatus.set(replicaConfig.id, {
        id: replicaConfig.id,
        healthy: true,
        lastCheck: Date.now(),
        responseTime: 0,
        connectionCount: 0,
        errorCount: 0,
      });

      logger.info('Replica added successfully', {
        replicaId: replicaConfig.id,
        name: replicaConfig.name,
      });

      return true;

    } catch (error) {
      logger.error('Failed to add replica', error as Error, {
        replicaId: replicaConfig.id,
      });
      return false;
    }
  }

  /**
   * Remove replica from configuration
   */
  async removeReplica(replicaId: string): Promise<boolean> {
    try {
      const client = this.replicaClients.get(replicaId);
      if (client) {
        await client.$disconnect();
        this.replicaClients.delete(replicaId);
      }

      this.replicaStatus.delete(replicaId);
      this.config.replicas = this.config.replicas.filter(r => r.id !== replicaId);
      delete this.connectionStats.distribution[replicaId];

      logger.info('Replica removed successfully', { replicaId });
      return true;

    } catch (error) {
      logger.error('Failed to remove replica', error as Error, { replicaId });
      return false;
    }
  }

  /**
   * Health check for read replica system
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    primary: boolean;
    replicas: {
      total: number;
      healthy: number;
      critical: boolean;
    };
    performance: {
      averageResponseTime: number;
      replicaUsage: number;
    };
  }> {
    try {
      // Check primary connection
      const primaryHealthy = await this.checkConnection(this.primaryClient);
      
      // Get replica status
      const replicaStatus = this.getReplicaStatus();
      const connectionStats = this.getConnectionStats();
      
      // Determine if situation is critical (no healthy replicas)
      const criticalSituation = replicaStatus.summary.healthyReplicas === 0 && 
                               replicaStatus.summary.totalReplicas > 0;
      
      // Overall health: primary must be healthy, and either we have healthy replicas or none configured
      const overallHealthy = primaryHealthy && 
                            (replicaStatus.summary.totalReplicas === 0 || 
                             replicaStatus.summary.healthyReplicas > 0);

      return {
        healthy: overallHealthy,
        primary: primaryHealthy,
        replicas: {
          total: replicaStatus.summary.totalReplicas,
          healthy: replicaStatus.summary.healthyReplicas,
          critical: criticalSituation,
        },
        performance: {
          averageResponseTime: replicaStatus.summary.averageResponseTime,
          replicaUsage: connectionStats.replicaUsagePercentage,
        },
      };

    } catch (error) {
      logger.error('Read replica health check failed', error as Error);
      return {
        healthy: false,
        primary: false,
        replicas: { total: 0, healthy: 0, critical: true },
        performance: { averageResponseTime: 0, replicaUsage: 0 },
      };
    }
  }

  // Private helper methods

  private initializeConnections(): void {
    try {
      // Initialize primary connection
      this.primaryClient = new PrismaClient({
        datasources: {
          db: {
            url: this.config.primary.url,
          },
        },
        log: ['error', 'warn'],
      });

      // Initialize replica connections
      for (const replicaConfig of this.config.replicas) {
        if (!replicaConfig.enabled) continue;

        const client = new PrismaClient({
          datasources: {
            db: {
              url: replicaConfig.url,
            },
          },
          log: ['error', 'warn'],
        });

        this.replicaClients.set(replicaConfig.id, client);
        this.connectionStats.distribution[replicaConfig.id] = 0;
        
        // Initialize status
        this.replicaStatus.set(replicaConfig.id, {
          id: replicaConfig.id,
          healthy: false,
          lastCheck: 0,
          responseTime: 0,
          connectionCount: 0,
          errorCount: 0,
        });
      }

      logger.info('Read replica connections initialized', {
        primary: 'configured',
        replicas: this.replicaClients.size,
      });

    } catch (error) {
      logger.error('Failed to initialize read replica connections', error as Error);
      throw error;
    }
  }

  private shouldUsePrimary(operation?: string): boolean {
    if (!operation) return this.config.routing.defaultToReplica === false;

    // Check if it's a write operation
    if (this.config.routing.writeOperations.includes(operation)) {
      return true;
    }

    // Check if it's a primary-preferred operation
    if (this.config.routing.primaryPreferredOperations.includes(operation)) {
      return true;
    }

    // Check if it's explicitly a replica-only operation
    if (this.config.routing.replicaOnlyOperations.includes(operation)) {
      return false;
    }

    return !this.config.routing.defaultToReplica;
  }

  private selectReplica(preferredRegion?: string): ReplicaConfig | null {
    const healthyReplicas = this.config.replicas.filter(replica => {
      const status = this.replicaStatus.get(replica.id);
      return replica.enabled && status?.healthy;
    });

    if (healthyReplicas.length === 0) {
      return null;
    }

    // Filter by region if specified
    let candidates = healthyReplicas;
    if (preferredRegion) {
      const regionalReplicas = healthyReplicas.filter(r => r.region === preferredRegion);
      if (regionalReplicas.length > 0) {
        candidates = regionalReplicas;
      }
    }

    // Apply load balancing strategy
    switch (this.config.loadBalancing.strategy) {
      case 'round-robin':
        return this.selectRoundRobin(candidates);
      case 'least-connections':
        return this.selectLeastConnections(candidates);
      case 'weighted':
        return this.selectWeighted(candidates);
      case 'geographic':
        return this.selectGeographic(candidates, preferredRegion);
      default:
        return candidates[0];
    }
  }

  private selectRoundRobin(replicas: ReplicaConfig[]): ReplicaConfig {
    const replica = replicas[this.currentReplicaIndex % replicas.length];
    this.currentReplicaIndex++;
    return replica;
  }

  private selectLeastConnections(replicas: ReplicaConfig[]): ReplicaConfig {
    return replicas.reduce((least, current) => {
      const leastConnections = this.connectionStats.distribution[least.id] || 0;
      const currentConnections = this.connectionStats.distribution[current.id] || 0;
      return currentConnections < leastConnections ? current : least;
    });
  }

  private selectWeighted(replicas: ReplicaConfig[]): ReplicaConfig {
    const totalWeight = replicas.reduce((sum, r) => sum + r.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const replica of replicas) {
      currentWeight += replica.weight;
      if (random <= currentWeight) {
        return replica;
      }
    }
    
    return replicas[0];
  }

  private selectGeographic(replicas: ReplicaConfig[], preferredRegion?: string): ReplicaConfig {
    // Sort by priority, then by region preference
    const sorted = replicas.sort((a, b) => {
      if (preferredRegion) {
        const aRegionMatch = a.region === preferredRegion;
        const bRegionMatch = b.region === preferredRegion;
        if (aRegionMatch && !bRegionMatch) return -1;
        if (!aRegionMatch && bRegionMatch) return 1;
      }
      return a.priority - b.priority;
    });
    
    return sorted[0];
  }

  private startHealthChecks(): void {
    const interval = this.config.loadBalancing.healthCheckInterval;
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, interval);

    // Perform initial health check
    setTimeout(() => {
      this.performHealthChecks();
    }, 1000);

    logger.info('Read replica health checks started', {
      interval: interval / 1000 + 's',
    });
  }

  private async performHealthChecks(): Promise<void> {
    const checks = this.config.replicas.map(async (replica) => {
      if (!replica.enabled) return;

      const client = this.replicaClients.get(replica.id);
      if (!client) return;

      const status = this.replicaStatus.get(replica.id)!;
      
      try {
        const startTime = Date.now();
        await this.checkConnection(client);
        const responseTime = Date.now() - startTime;

        status.healthy = true;
        status.lastCheck = Date.now();
        status.responseTime = responseTime;
        status.lastError = undefined;

        // Record health check metrics
        monitoringService.recordMetric('db_replica_health_check', 1, {
          replica: replica.id,
          status: 'healthy',
        });

        monitoringService.recordTiming('db_replica_response_time', responseTime, {
          replica: replica.id,
        });

      } catch (error) {
        status.healthy = false;
        status.lastCheck = Date.now();
        status.errorCount++;
        status.lastError = (error as Error).message;

        logger.warn('Replica health check failed', error as Error, {
          replicaId: replica.id,
          name: replica.name,
        });

        // Record health check metrics
        monitoringService.recordMetric('db_replica_health_check', 1, {
          replica: replica.id,
          status: 'unhealthy',
        });

        monitoringService.recordMetric('db_replica_error', 1, {
          replica: replica.id,
        });
      }
    });

    await Promise.all(checks);
  }

  private async checkConnection(client: PrismaClient): Promise<boolean> {
    try {
      // Simple query to test connection
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private isFatalError(error: Error): boolean {
    const fatalPatterns = [
      'authentication failed',
      'database does not exist',
      'connection refused',
      'timeout',
    ];
    
    const message = error.message.toLowerCase();
    return fatalPatterns.some(pattern => message.includes(pattern));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      // Disconnect all clients
      await this.primaryClient.$disconnect();
      
      const disconnectPromises = Array.from(this.replicaClients.values()).map(
        client => client.$disconnect()
      );
      await Promise.all(disconnectPromises);

      logger.info('Read replica manager shutdown completed');

    } catch (error) {
      logger.error('Failed to shutdown read replica manager', error as Error);
    }
  }
}

// Export default configuration
export const createReadReplicaConfig = (): ReadReplicaConfig => ({
  primary: {
    url: process.env.DATABASE_URL || '',
    maxConnections: parseInt(process.env.DB_PRIMARY_MAX_CONNECTIONS || '20'),
    connectionTimeout: parseInt(process.env.DB_PRIMARY_TIMEOUT || '10000'),
  },
  replicas: [
    // Example replica configurations
    ...(process.env.DATABASE_READ_REPLICA_1_URL ? [{
      id: 'replica-1',
      name: 'Read Replica 1',
      url: process.env.DATABASE_READ_REPLICA_1_URL,
      weight: 1,
      region: process.env.DB_REPLICA_1_REGION || 'us-east-1',
      maxConnections: parseInt(process.env.DB_REPLICA_1_MAX_CONNECTIONS || '15'),
      connectionTimeout: parseInt(process.env.DB_REPLICA_1_TIMEOUT || '10000'),
      enabled: process.env.DB_REPLICA_1_ENABLED !== 'false',
      priority: 1,
    }] : []),
    ...(process.env.DATABASE_READ_REPLICA_2_URL ? [{
      id: 'replica-2',
      name: 'Read Replica 2',
      url: process.env.DATABASE_READ_REPLICA_2_URL,
      weight: 1,
      region: process.env.DB_REPLICA_2_REGION || 'us-west-2',
      maxConnections: parseInt(process.env.DB_REPLICA_2_MAX_CONNECTIONS || '15'),
      connectionTimeout: parseInt(process.env.DB_REPLICA_2_TIMEOUT || '10000'),
      enabled: process.env.DB_REPLICA_2_ENABLED !== 'false',
      priority: 2,
    }] : []),
  ],
  loadBalancing: {
    strategy: (process.env.DB_LOAD_BALANCING_STRATEGY as any) || 'round-robin',
    healthCheckInterval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000'),
    failoverTimeout: parseInt(process.env.DB_FAILOVER_TIMEOUT || '5000'),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '2'),
  },
  routing: {
    defaultToReplica: process.env.DB_DEFAULT_TO_REPLICA === 'true',
    writeOperations: [
      'create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 
      'deleteMany', 'executeRaw', 'queryRaw'
    ],
    replicaOnlyOperations: [
      'analytics', 'reports', 'dashboard', 'export', 'search'
    ],
    primaryPreferredOperations: [
      'transaction', 'migration', 'admin'
    ],
  },
});