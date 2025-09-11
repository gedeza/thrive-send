import { NextRequest, NextResponse } from 'next/server';
import { rateLimitService } from '@/lib/rate-limiting/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get rate limiter health status
    const healthStatus = await rateLimitService.healthCheck();
    
    // Get rate limiting metrics
    const metrics = await rateLimitService.getMetrics();
    
    // Determine overall health
    const isHealthy = healthStatus.healthy;
    const statusCode = isHealthy ? 200 : 503;
    
    const response = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      rateLimiter: {
        redis: healthStatus.redis,
        circuitBreakers: healthStatus.circuitBreakers,
        metrics: healthStatus.metrics,
      },
      performance: {
        totalRequests: metrics.totalRequests,
        allowedRequests: metrics.allowedRequests,
        blockedRequests: metrics.blockedRequests,
        blockedPercentage: metrics.blockedPercentage,
        avgResponseTime: metrics.avgResponseTime,
        activeRules: metrics.activeRules,
      },
    };
    
    // Log health check
    logger.info('Rate limiter health check performed', {
      healthy: isHealthy,
      redis: healthStatus.redis,
      totalRequests: metrics.totalRequests,
      blockedPercentage: metrics.blockedPercentage,
    });
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (_error) {
    logger.error('Rate limiter health check failed', error as Error);
    
    return NextResponse.json(
      {
        healthy: false,
        error: 'Rate limiter health check failed',
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