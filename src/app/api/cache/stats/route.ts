import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get detailed cache statistics
    const stats = await cacheService.getStats();
    
    const response = {
      timestamp: new Date().toISOString(),
      statistics: stats,
    };
    
    logger.info('Cache statistics retrieved', {
      hitRate: stats.overall.hitRate,
      totalRequests: stats.overall.totalRequests,
      strategiesCount: Object.keys(stats.byStrategy).length,
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (_error) {
    logger.error('Failed to retrieve cache statistics', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve cache statistics',
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