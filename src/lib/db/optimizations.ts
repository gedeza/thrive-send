import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Connection pool configuration
const poolConfig = {
  max: 5, // Maximum number of clients in the pool
  min: 1, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a custom Prisma client with connection management
class OptimizedPrismaClient extends PrismaClient {
  private static instance: OptimizedPrismaClient;
  private pool: Pool;

  private constructor() {
    super({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Initialize connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ...poolConfig,
    });

    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  public static getInstance(): OptimizedPrismaClient {
    if (!OptimizedPrismaClient.instance) {
      OptimizedPrismaClient.instance = new OptimizedPrismaClient();
    }
    return OptimizedPrismaClient.instance;
  }

  // Override $connect to use connection pooling
  async $connect() {
    try {
      await super.$connect();
      // Test pool connection
      const client = await this.pool.connect();
      client.release();
    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  }

  // Override $disconnect to properly close pool
  async $disconnect() {
    try {
      await super.$disconnect();
      await this.pool.end();
    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  }

  // Add query optimization methods
  async optimizeQuery<T>(query: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await query();
      const duration = Date.now() - start;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected (${duration}ms)`);
      }
      
      return result;
    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  }
}

// Export singleton instance
export const prisma = OptimizedPrismaClient.getInstance();

// Query optimization helpers
export const queryOptimizations = {
  // Batch operations
  async batchOperation<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(operations.map(op => prisma.optimizeQuery(op)));
  },

  // Pagination helper
  async paginatedQuery<T>(
    query: (skip: number, take: number) => Promise<T[]>,
    page: number,
    pageSize: number
  ): Promise<{ data: T[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.optimizeQuery(() => query(skip, pageSize)),
      prisma.optimizeQuery(() => query(0, 0).then(results => results.length))
    ]);
    return { data, total };
  },

  // Cache helper
  async withCache<T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = 300 // 5 minutes default TTL
  ): Promise<T> {
    // Implement caching logic here
    return prisma.optimizeQuery(query);
  }
};

// Connection management
export const connectionManager = {
  async checkConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (_error) {
      console.error("", _error);
      return false;
    }
  },

  async reconnect() {
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      return true;
    } catch (_error) {
      console.error("", _error);
      return false;
    }
  }
}; 