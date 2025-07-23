import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive dashboard data
    const dashboardData = await monitoringService.getDashboardData();
    
    const response = {
      timestamp: new Date().toISOString(),
      dashboard: dashboardData,
    };
    
    logger.info('Monitoring dashboard data retrieved', {
      systemStatus: dashboardData.system.overall,
      activeAlerts: dashboardData.alerts.alerts.active,
      uptime: dashboardData.performance.uptime,
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    logger.error('Failed to retrieve dashboard data', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve dashboard data',
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