import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/monitor';
import { logger } from '@/lib/utils/logger';

interface PerformanceMiddlewareOptions {
  slowRequestThreshold?: number; // ms
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

const defaultOptions: PerformanceMiddlewareOptions = {
  slowRequestThreshold: 1000, // 1 second
  enableLogging: process.env.NODE_ENV === 'development',
  enableMetrics: true,
};

/**
 * Performance monitoring middleware for API routes
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: PerformanceMiddlewareOptions = {}
) {
  const config = { ...defaultOptions, ...options };

  return async function performanceWrappedHandler(req: NextRequest): Promise<NextResponse> {
    const startTime = performance.now();
    const method = req.method;
    const url = new URL(req.url);
    const endpoint = url.pathname;

    // Extract user info if available
    let userId: string | undefined;
    let organizationId: string | undefined;

    try {
      // Try to extract user info from headers or auth
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        // This would depend on your auth implementation
        // For now, just log that auth is present
        userId = 'authenticated_user';
      }
    } catch (_error) {
      // Ignore auth extraction errors
    }

    let response: NextResponse;
    let status = 200;
    let error: Error | null = null;

    try {
      if (config.enableMetrics) {
        response = await performanceMonitor.timeAPIRequest(
          endpoint,
          method,
          async () => {
            return await handler(req);
          },
          userId,
          organizationId
        );
      } else {
        response = await handler(req);
      }

      status = response.status;
    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
      status = 500;
      
      // Create error response
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log performance metrics
    if (config.enableLogging) {
      const logData = {
        method,
        endpoint,
        status,
        duration: Math.round(duration),
        userId,
        organizationId,
        timestamp: new Date().toISOString(),
      };

      if (duration > config.slowRequestThreshold!) {
        logger.warn('Slow API request detected', {
          ...logData,
          slow_request: true,
        });
      } else {
        logger.info('API request completed', logData);
      }

      if (error) {
        logger.error('API request failed', {
          ...logData,
          error: error.message,
          stack: error.stack,
        });
      }
    }

    // Add performance headers
    response.headers.set('X-Response-Time', `${Math.round(duration)}ms`);
    response.headers.set('X-Timestamp', new Date().toISOString());

    // Add performance warning header for slow requests
    if (duration > config.slowRequestThreshold!) {
      response.headers.set('X-Performance-Warning', 'slow-request');
    }

    return response;
  };
}

/**
 * Database query performance monitoring
 */
export async function withQueryPerformanceMonitoring<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return performanceMonitor.timeFunction(
    `db_query_${queryName}`,
    queryFn,
    context
  );
}

/**
 * Cache operation performance monitoring
 */
export async function withCachePerformanceMonitoring<T>(
  operation: string,
  operationFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return performanceMonitor.timeFunction(
    `cache_${operation}`,
    operationFn,
    context
  );
}

/**
 * External API call performance monitoring
 */
export async function withExternalAPIPerformanceMonitoring<T>(
  serviceName: string,
  endpoint: string,
  apiFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return performanceMonitor.timeFunction(
    `external_api_${serviceName}_${endpoint.replace(/\//g, '_')}`,
    apiFn,
    {
      ...context,
      service: serviceName,
      endpoint,
    }
  );
}

/**
 * Memory usage tracking middleware
 */
export function trackMemoryUsage(context?: Record<string, any>) {
  performanceMonitor.trackMemoryUsage(context);
}

/**
 * Performance summary endpoint helper
 */
export function createPerformanceSummaryResponse(): NextResponse {
  const summary = performanceMonitor.getPerformanceSummary();
  
  return NextResponse.json({
    performance: summary,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Performance metrics export endpoint helper
 */
export function createPerformanceExportResponse(): NextResponse {
  const exportData = performanceMonitor.exportMetrics();
  
  const response = new NextResponse(exportData, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="performance-metrics-${Date.now()}.json"`,
    },
  });
  
  return response;
}

/**
 * Batch performance analysis
 */
export interface BatchPerformanceResult {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorRate: number;
  topSlowEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>;
  timeRange: { start: number; end: number };
}

export function analyzeBatchPerformance(
  timeRange: { start: number; end: number }
): BatchPerformanceResult {
  const metrics = performanceMonitor.getMetrics({
    timeRange,
    name: 'api_'
  });

  const totalRequests = metrics.length;
  const averageResponseTime = totalRequests > 0 
    ? metrics.reduce((sum, m) => sum + m.value, 0) / totalRequests 
    : 0;

  const slowRequests = metrics.filter(m => m.value > 1000).length;
  const errorRequests = metrics.filter(m => m.name.includes('_error')).length;
  const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

  // Group by endpoint
  const endpointGroups: { [key: string]: number[] } = {};
  metrics.forEach(metric => {
    const endpointName = metric.name.replace(/_error$/, '');
    if (!endpointGroups[endpointName]) {
      endpointGroups[endpointName] = [];
    }
    endpointGroups[endpointName].push(metric.value);
  });

  const topSlowEndpoints = Object.entries(endpointGroups)
    .map(([endpoint, times]) => ({
      endpoint,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      count: times.length
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 10);

  return {
    totalRequests,
    averageResponseTime,
    slowRequests,
    errorRate,
    topSlowEndpoints,
    timeRange,
  };
}

/**
 * Performance alerting
 */
export function checkPerformanceAlerts(): Array<{
  type: 'slow_endpoint' | 'high_error_rate' | 'memory_leak' | 'response_time_spike';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: unknown;
}> {
  const alerts = [];
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Check for slow endpoints
  const recentMetrics = performanceMonitor.getMetrics({
    timeRange: { start: oneHourAgo, end: now },
    name: 'api_'
  });

  const avgResponseTime = recentMetrics.length > 0
    ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
    : 0;

  if (avgResponseTime > 2000) {
    alerts.push({
      type: 'response_time_spike',
      message: `Average response time is ${Math.round(avgResponseTime)}ms (threshold: 2000ms)`,
      severity: 'high',
      data: { avgResponseTime, threshold: 2000 }
    });
  }

  // Check error rate
  const errorMetrics = recentMetrics.filter(m => m.name.includes('_error'));
  const errorRate = recentMetrics.length > 0 
    ? (errorMetrics.length / recentMetrics.length) * 100 
    : 0;

  if (errorRate > 10) {
    alerts.push({
      type: 'high_error_rate',
      message: `Error rate is ${errorRate.toFixed(1)}% (threshold: 10%)`,
      severity: 'critical',
      data: { errorRate, threshold: 10 }
    });
  }

  return alerts;
}