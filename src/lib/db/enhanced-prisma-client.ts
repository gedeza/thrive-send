/**
 * Enhanced Prisma Client with additional features
 * Provides caching, logging, and performance monitoring
 */

import { PrismaClient } from '@prisma/client';

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
}

export class EnhancedPrismaClient extends PrismaClient {
  private queryMetrics: QueryMetrics[] = [];
  private maxMetrics = 1000;
  
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
    
    this.setupLogging();
  }
  
  private setupLogging() {
    this.$on('query', (e) => {
      const metric: QueryMetrics = {
        query: e.query,
        duration: e.duration,
        timestamp: new Date(),
      };
      
      this.queryMetrics.push(metric);
      
      // Keep only recent metrics
      if (this.queryMetrics.length > this.maxMetrics) {
        this.queryMetrics = this.queryMetrics.slice(-this.maxMetrics);
      }
      
      // Log slow queries
      if (e.duration > 1000) {
        console.warn(`Slow query detected (${e.duration}ms):`, e.query);
      }
    });
    
    this.$on('error', (e) => {
      console.error('Prisma error:', e);
    });
  }
  
  getQueryMetrics() {
    const totalQueries = this.queryMetrics.length;
    const avgDuration = totalQueries > 0 
      ? this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries 
      : 0;
    
    const slowQueries = this.queryMetrics.filter(m => m.duration > 1000).length;
    
    return {
      totalQueries,
      averageDuration: Math.round(avgDuration * 100) / 100,
      slowQueries,
      recentQueries: this.queryMetrics.slice(-10),
    };
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const enhancedPrisma = new EnhancedPrismaClient();
export default enhancedPrisma;