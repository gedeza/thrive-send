import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/db/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const component = searchParams.get('component');
    
    // Get comprehensive database statistics
    const dbStats = databaseService.getStats();
    
    let response: unknown;
    
    if (component) {
      // Return specific component stats
      switch (component) {
        case 'routing':
          response = {
            component: 'routing',
            timestamp: new Date().toISOString(),
            statistics: dbStats.routing,
          };
          break;
        case 'replicas':
          response = {
            component: 'replicas',
            timestamp: new Date().toISOString(),
            statistics: dbStats.replicas,
          };
          break;
        case 'enhanced':
          response = {
            component: 'enhanced',
            timestamp: new Date().toISOString(),
            statistics: dbStats.enhanced,
          };
          break;
        default:
          return NextResponse.json(
            { error: 'Unknown component' },
            { status: 400 }
          );
      }
    } else {
      // Return all statistics
      response = {
        timestamp: new Date().toISOString(),
        statistics: dbStats,
      };
    }
    
    logger.info('Database statistics retrieved', {
      component: component || 'all',
      routing: !!dbStats.routing,
      replicas: !!dbStats.replicas,
      enhanced: !!dbStats.enhanced,
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (_error) {
    logger.error('Failed to retrieve database statistics', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve database statistics',
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