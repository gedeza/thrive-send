import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeoutMs: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  queryTimeoutMs: number;
  statementTimeoutMs: number;
  ssl?: {
    rejectUnauthorized: boolean;
  };
  retryAttempts: number;
  retryDelay: number;
}

export class EnhancedConnectionPool {
  private static instance: EnhancedConnectionPool;
  private prisma: PrismaClient;
  private config: DatabaseConfig;
  private connectionStats: {
    activeConnections: number;
    totalQueries: number;
    slowQueries: number;
    failedQueries: number;
    averageResponseTime: number;
    lastResponseTime: number;
  };

  private constructor(config: DatabaseConfig) {
    this.config = config;
    this.connectionStats = {
      activeConnections: 0,
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
    };

    this.initializePrismaClient();
  }

  static getInstance(config?: DatabaseConfig): EnhancedConnectionPool {
    if (!EnhancedConnectionPool.instance) {
      if (!config) {
        throw new Error('Database config required for first initialization');
      }
      EnhancedConnectionPool.instance = new EnhancedConnectionPool(config);
    }
    return EnhancedConnectionPool.instance;
  }

  private initializePrismaClient(): void {
    try {
      // Build optimized connection string
      const connectionString = this.buildConnectionString();
      
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
        log: this.getLogLevel(),
        errorFormat: 'pretty',
      });

      // Add query logging middleware
      this.prisma.$use(async (params, next) => {
        const startTime = Date.now();
        this.connectionStats.activeConnections++;

        try {
          const result = await next(params);
          const duration = Date.now() - startTime;
          
          this.updateStats(duration, false);
          this.logSlowQuery(params, duration);
          
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          this.updateStats(duration, true);
          
          logger.error('Database query failed', error as Error, {
            model: params.model,
            action: params.action,
            duration,
            args: JSON.stringify(params.args).substring(0, 500),
          });
          
          throw error;
        } finally {
          this.connectionStats.activeConnections--;
        }
      });

      // Test connection
      this.testConnection();
      
      logger.info('Enhanced database connection pool initialized', {
        maxConnections: this.config.maxConnections,
        minConnections: this.config.minConnections,
        connectionTimeout: this.config.connectionTimeoutMs,
        queryTimeout: this.config.queryTimeoutMs,
      });

    } catch (error) {
      logger.error('Failed to initialize enhanced connection pool', error as Error);
      throw error;
    }
  }

  private buildConnectionString(): string {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Parse existing URL
    const url = new URL(baseUrl);
    const params = new URLSearchParams(url.search);

    // Add connection pool parameters
    params.set('connection_limit', this.config.maxConnections.toString());
    params.set('pool_timeout', Math.floor(this.config.acquireTimeoutMs / 1000).toString());
    params.set('connect_timeout', Math.floor(this.config.connectionTimeoutMs / 1000).toString());
    params.set('statement_timeout', Math.floor(this.config.statementTimeoutMs / 1000).toString());
    params.set('query_timeout', Math.floor(this.config.queryTimeoutMs / 1000).toString());
    params.set('prepared_statements', 'true');
    params.set('statement_cache_size', '100');
    params.set('application_name', 'thrive-send');

    // Add SSL configuration for production
    if (this.config.ssl) {
      params.set('sslmode', 'require');
    }

    // Rebuild URL
    url.search = params.toString();
    
    return url.toString();
  }

  private getLogLevel(): string[] {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    switch (nodeEnv) {
      case 'production':
        return ['error'];
      case 'development':
        return ['query', 'error', 'warn'];
      case 'test':
        return ['error'];
      default:
        return ['error', 'warn'];
    }
  }

  private updateStats(duration: number, failed: boolean): void {
    this.connectionStats.totalQueries++;
    this.connectionStats.lastResponseTime = duration;
    
    if (failed) {
      this.connectionStats.failedQueries++;
    }
    
    if (duration > 1000) { // 1 second threshold
      this.connectionStats.slowQueries++;
    }
    
    // Update average response time
    this.connectionStats.averageResponseTime = 
      (this.connectionStats.averageResponseTime + duration) / 2;
  }

  private logSlowQuery(params: any, duration: number): void {
    const threshold = process.env.SLOW_QUERY_THRESHOLD 
      ? parseInt(process.env.SLOW_QUERY_THRESHOLD) 
      : 1000;

    if (duration > threshold) {
      logger.warn('Slow database query detected', {
        model: params.model,
        action: params.action,
        duration,
        threshold,
        args: JSON.stringify(params.args).substring(0, 200),
      });
    }
  }

  private async testConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection test successful');
    } catch (error) {
      logger.error('Database connection test failed', error as Error);
      throw error;
    }
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  public getConnectionStats(): typeof this.connectionStats {
    return { ...this.connectionStats };
  }

  public getHealthStatus(): {
    healthy: boolean;
    stats: typeof this.connectionStats;
    config: DatabaseConfig;
  } {
    const stats = this.getConnectionStats();
    const healthy = stats.activeConnections < this.config.maxConnections * 0.8;
    
    return {
      healthy,
      stats,
      config: this.config,
    };
  }

  public async executeHealthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - startTime;
      
      const healthy = duration < 5000; // 5 second threshold
      
      logger.info('Database health check completed', {
        healthy,
        duration,
        connectionStats: this.getConnectionStats(),
      });
      
      return healthy;
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return false;
    }
  }

  public async closeConnections(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Failed to close database connections', error as Error);
    }
  }

  public async resetStats(): Promise<void> {
    this.connectionStats = {
      activeConnections: 0,
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
    };
    
    logger.info('Database connection stats reset');
  }
}

// Default configuration factory
export function createDatabaseConfig(): DatabaseConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  const baseConfig: DatabaseConfig = {
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '2'),
    connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    acquireTimeoutMs: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000'),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT || '60000'),
    queryTimeoutMs: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
    statementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
  };

  // Environment-specific optimizations
  switch (nodeEnv) {
    case 'production':
      return {
        ...baseConfig,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '30'),
        minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '5'),
        ssl: {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        },
      };
    
    case 'development':
      return {
        ...baseConfig,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
        minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '2'),
      };
    
    case 'test':
      return {
        ...baseConfig,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '5'),
        minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '1'),
        connectionTimeoutMs: 5000,
        queryTimeoutMs: 10000,
      };
    
    default:
      return baseConfig;
  }
}