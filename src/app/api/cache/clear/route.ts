import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager } from '@/lib/cache/index';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern, strategy } = body;
    
    const cacheManager = getCacheManager();
    let clearedCount = 0;
    
    if (pattern) {
      // Clear specific pattern
      clearedCount = await cacheManager.invalidatePattern(pattern);
      logger.info('Cache cleared by pattern', { pattern, clearedCount });
    } else if (strategy) {
      // Clear specific strategy
      clearedCount = await cacheManager.invalidatePattern(`*:${strategy}:*`);
      logger.info('Cache cleared by strategy', { strategy, clearedCount });
    } else {
      // Clear all cache
      await cacheManager.clearAll();
      clearedCount = -1; // Indicates full clear
      logger.info('All cache cleared');
    }
    
    return NextResponse.json({
      success: true,
      clearedCount,
      timestamp: new Date().toISOString(),
      message: clearedCount === -1 
        ? 'All cache cleared successfully'
        : `${clearedCount} cache entries cleared`,
    });
    
  } catch (_error) {
    logger.error('Cache clear operation failed', error as Error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Cache clear operation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}