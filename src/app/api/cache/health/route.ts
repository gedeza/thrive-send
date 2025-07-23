import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get cache health status
    const healthStatus = await cacheService.healthCheck();
    
    // Get cache statistics
    const stats = await cacheService.getStats();
    
    // Determine overall health
    const isHealthy = healthStatus.healthy;
    const statusCode = isHealthy ? 200 : 503;
    
    const response = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      cache: {
        redis: healthStatus.redis,
        memoryCache: healthStatus.memoryCache,
        metrics: healthStatus.metrics,
      },
      statistics: stats,
    };
    
    // Log health check
    logger.info('Cache health check performed', {
      healthy: isHealthy,
      redis: healthStatus.redis,
      memoryCache: healthStatus.memoryCache,
      hitRate: healthStatus.metrics.hitRate,
    });
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    logger.error('Cache health check failed', error as Error);
    
    return NextResponse.json(
      {
        healthy: false,
        error: 'Cache health check failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}