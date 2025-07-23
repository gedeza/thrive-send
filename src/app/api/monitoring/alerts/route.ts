import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity')?.split(',');
    const metric = searchParams.get('metric')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '50');
    const history = searchParams.get('history') === 'true';
    
    let alerts;
    
    if (history) {
      // Get alert history with filters
      const timeRange = {
        start: Date.now() - 86400000, // Last 24 hours
        end: Date.now(),
      };
      
      alerts = monitoringService.getAlertStats(timeRange);
    } else {
      // Get active alerts with filters
      const filters: any = {};
      if (severity) filters.severity = severity;
      if (metric) filters.metric = metric;
      
      alerts = monitoringService.getActiveAlerts(filters).slice(0, limit);
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      filters: { severity, metric, limit, history },
      alerts,
    };
    
    logger.info('Alerts retrieved', {
      count: Array.isArray(alerts) ? alerts.length : 'stats',
      filters: { severity, metric, history },
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    logger.error('Failed to retrieve alerts', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve alerts',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, duration } = body;
    
    if (!action || !alertId) {
      return NextResponse.json(
        { error: 'Action and alertId are required' },
        { status: 400 }
      );
    }
    
    let result: boolean;
    let message: string;
    
    switch (action) {
      case 'silence':
        if (!duration) {
          return NextResponse.json(
            { error: 'Duration is required for silence action' },
            { status: 400 }
          );
        }
        // This would integrate with alert manager
        result = true; // Mock result
        message = `Alert ${alertId} silenced for ${duration}ms`;
        break;
        
      case 'resolve':
        // This would integrate with alert manager
        result = true; // Mock result
        message = `Alert ${alertId} resolved`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
    
    const response = {
      success: result,
      action,
      alertId,
      message,
      timestamp: new Date().toISOString(),
    };
    
    logger.info('Alert action performed', {
      action,
      alertId,
      success: result,
    });
    
    return NextResponse.json(response, {
      status: result ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    logger.error('Alert action failed', error as Error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Alert action failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}