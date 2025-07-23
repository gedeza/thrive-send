import { NextRequest, NextResponse } from 'next/server';
import { rateLimitService } from '@/lib/rate-limiting/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get detailed rate limiting metrics
    const metrics = await rateLimitService.getMetrics();
    
    const response = {
      timestamp: new Date().toISOString(),
      metrics,
    };
    
    logger.info('Rate limiting metrics retrieved', {
      totalRequests: metrics.totalRequests,
      blockedPercentage: metrics.blockedPercentage,
      avgResponseTime: metrics.avgResponseTime,
      activeRules: metrics.activeRules,
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    logger.error('Failed to retrieve rate limiting metrics', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve rate limiting metrics',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}