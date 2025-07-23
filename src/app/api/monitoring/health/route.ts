import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive system health
    const systemHealth = await monitoringService.getSystemHealth();
    
    // Get monitoring system health
    const monitoringHealth = await monitoringService.healthCheck();
    
    // Determine overall health
    const isHealthy = systemHealth.overall === 'healthy' && monitoringHealth.healthy;
    const statusCode = isHealthy ? 200 : 503;
    
    const response = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      system: systemHealth,
      monitoring: monitoringHealth,
      uptime: systemHealth.uptime,
      version: process.env.npm_package_version || '1.0.0',
    };
    
    // Log health check
    logger.info('System health check performed', {
      overall: systemHealth.overall,
      components: Object.keys(systemHealth.components).length,
      alerts: systemHealth.alerts.active,
      monitoring: monitoringHealth.healthy,
    });
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': isHealthy ? 'pass' : 'fail',
      },
    });
    
  } catch (error) {
    logger.error('System health check failed', error as Error);
    
    return NextResponse.json(
      {
        healthy: false,
        error: 'System health check failed',
        timestamp: new Date().toISOString(),
        monitoring: {
          healthy: false,
          components: {},
          uptime: 0,
          lastMetricsCollection: 0,
        },
      },
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'fail',
        },
      }
    );
  }
}