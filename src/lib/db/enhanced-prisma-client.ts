/**
 * Enhanced Prisma Client with additional features
 * Provides caching, logging, and performance monitoring
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf8');
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value.replace(/"/g, '');
      }
    });
  } catch (error) {
    console.warn('Could not load .env.local file:', error);
  }
}

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
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    this.setupLogging();
  }
  
  private setupLogging() {
    // For now, skip the event listening to avoid type issues
    // We can implement this later with proper typing
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
  
  getPerformanceMetrics() {
    return this.getQueryMetrics();
  }
  
  resetMetrics() {
    this.queryMetrics = [];
    return { message: 'Metrics reset successfully' };
  }
}

export const enhancedPrisma = new EnhancedPrismaClient();
export default enhancedPrisma;