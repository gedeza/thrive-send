import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as 'prometheus' | 'json' | 'influxdb' || 'json';
    const component = searchParams.get('component');
    
    if (component) {
      // Get specific component health
      const componentHealth = await monitoringService.getComponentHealth(component);
      
      return NextResponse.json({
        component,
        timestamp: new Date().toISOString(),
        health: componentHealth,
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
    
    // Export metrics in requested format
    const metricsData = monitoringService.exportMetrics(format);
    
    let contentType: string;
    let responseData: string | object;
    
    switch (format) {
      case 'prometheus':
        contentType = 'text/plain; version=0.0.4';
        responseData = metricsData;
        break;
      case 'influxdb':
        contentType = 'text/plain';
        responseData = metricsData;
        break;
      default:
        contentType = 'application/json';
        responseData = JSON.parse(metricsData);
        break;
    }
    
    logger.info('Metrics exported', {
      format,
      dataSize: metricsData.length,
    });
    
    if (format === 'json') {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        format,
        metrics: responseData,
      }, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else {
      return new NextResponse(responseData as string, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
    
  } catch (error) {
    logger.error('Failed to export metrics', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to export metrics',
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