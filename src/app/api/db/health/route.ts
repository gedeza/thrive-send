import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/db/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive database health
    const dbHealth = await databaseService.healthCheck();
    
    // Get database statistics
    const dbStats = databaseService.getStats();
    
    // Determine overall health
    const isHealthy = dbHealth.healthy;
    const statusCode = isHealthy ? 200 : 503;
    
    const response = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      database: {
        enhanced: dbHealth.enhanced,
        routing: dbHealth.routing,
        replicas: dbHealth.replicas,
      },
      statistics: {
        routing: dbStats.routing,
        replicas: dbStats.replicas,
        enhanced: dbStats.enhanced,
      },
    };
    
    // Log health check
    logger.info('Database health check performed', {
      healthy: isHealthy,
      enhanced: dbHealth.enhanced?.healthy,
      routing: dbHealth.routing?.healthy,
      replicasCount: dbHealth.replicas?.total || 0,
      healthyReplicas: dbHealth.replicas?.healthy || 0,
    });
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-DB-Health': isHealthy ? 'healthy' : 'unhealthy',
      },
    });
    
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    
    return NextResponse.json(
      {
        healthy: false,
        error: 'Database health check failed',
        timestamp: new Date().toISOString(),
        database: {
          enhanced: null,
          routing: null,
          replicas: null,
        },
      },
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-DB-Health': 'unhealthy',
        },
      }
    );
  }
}