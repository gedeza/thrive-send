import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getOptimizedAnalytics,
  getOptimizedAnalyticsOverview,
  getOptimizedTimeSeriesData
} from '@/lib/analytics/query-optimizer';
import { 
  AnalyticsErrorHandler, 
  AnalyticsRequestValidator, 
  withAnalyticsErrorHandler 
} from '@/lib/analytics/error-handler';
import { analyticsCacheManager } from '@/lib/analytics/cache-manager';

/**
 * Unified Analytics API - Consolidates multiple analytics endpoints into single calls
 * Reduces network overhead and improves performance by batching requests
 */

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }
    
    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId },
      include: {
        organizationMemberships: {
          select: {
            organizationId: true,
            role: true
          }
        }
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

// Interface for unified analytics request
interface UnifiedAnalyticsRequest {
  include: {
    metrics?: boolean;
    overview?: boolean;
    timeSeries?: {
      metric: string;
      interval?: string;
    }[];
    audience?: boolean;
    engagement?: boolean;
    performance?: boolean;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  timeframe?: string;
  platform?: string;
  campaignId?: string;
}

// Interface for unified analytics response
interface UnifiedAnalyticsResponse {
  success: boolean;
  data: {
    metrics?: any;
    overview?: any;
    timeSeries?: Record<string, any>;
    audience?: any;
    engagement?: any;
    performance?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    executionTime: number;
    cacheStatus: Record<string, 'hit' | 'miss'>;
  };
}

/**
 * POST: Unified Analytics Endpoint
 * Handles multiple analytics requests in a single call
 */
export const POST = withAnalyticsErrorHandler(async (request: Request) => {
  const startTime = performance.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const user = await getAuthenticatedUser();
  
  // Parse and validate request body
  let requestBody: UnifiedAnalyticsRequest;
  try {
    const body = await request.json();
    
    // Validate request body structure
    if (!body || typeof body !== 'object') {
      return AnalyticsErrorHandler.handleValidationError('Request body must be a valid JSON object');
    }
    
    requestBody = body;
  } catch (_error) {
    console.error("", _error);
    return AnalyticsErrorHandler.handleValidationError('Invalid JSON in request body');
  }

  const { include, dateRange, timeframe = '7d', platform = 'all', campaignId } = requestBody;

  // Validate required fields
  if (!include || typeof include !== 'object' || Object.keys(include).length === 0) {
    return AnalyticsErrorHandler.handleValidationError(
      'At least one data type must be included in the request'
    );
  }

  // Validate date range if provided
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  
  if (dateRange) {
    const dateValidation = AnalyticsRequestValidator.validateDateRange(
      dateRange.startDate,
      dateRange.endDate
    );
    if (!dateValidation.isValid) {
      return AnalyticsErrorHandler.handleValidationError(dateValidation.error!);
    }
    startDate = dateValidation.startDate;
    endDate = dateValidation.endDate;
  }

  // Validate platform if provided
  if (platform !== 'all') {
    const platformValidation = AnalyticsRequestValidator.validatePlatform(platform);
    if (!platformValidation.isValid) {
      return AnalyticsErrorHandler.handleValidationError(platformValidation.error!);
    }
  }

  // Check user has access to analytics
  if (!user.organizationMemberships || user.organizationMemberships.length === 0) {
    console.warn(`User ${user.clerkId} has no organization memberships`);
    return AnalyticsErrorHandler.handleAuthzError('No organization membership found');
  }

  // Prepare response structure
  const response: UnifiedAnalyticsResponse = {
    success: true,
    data: {},
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      executionTime: 0,
      cacheStatus: {}
    }
  };

  // Execute requests in parallel for better performance
  const promises: Promise<any>[] = [];
  const promiseKeys: string[] = [];

  // Common parameters for all requests
  const commonParams = {
    userId: user.id,
    clerkId: user.clerkId,
    startDate,
    endDate,
    timeframe,
    campaignId
  };

  try {
    // Metrics request
    if (include.metrics) {
      const cacheKey = `unified_metrics_${JSON.stringify(commonParams)}`;
      try {
        const cached = await analyticsCacheManager.get('METRICS', commonParams);
        
        if (cached) {
          response.data.metrics = cached;
          response.metadata.cacheStatus.metrics = 'hit';
        } else {
          promises.push(getOptimizedAnalytics(commonParams));
          promiseKeys.push('metrics');
          response.metadata.cacheStatus.metrics = 'miss';
        }
      } catch (cacheError) {
        console.error('Cache error for metrics:', cacheError);
        // Continue without cache if cache fails
        promises.push(getOptimizedAnalytics(commonParams));
        promiseKeys.push('metrics');
        response.metadata.cacheStatus.metrics = 'miss';
      }
    }

    // Overview request
    if (include.overview) {
      const overviewParams = { ...commonParams, timeRange: timeframe, platform };
      const cached = await analyticsCacheManager.get('OVERVIEW', overviewParams);
      
      if (cached) {
        response.data.overview = cached;
        response.metadata.cacheStatus.overview = 'hit';
      } else {
        promises.push(getOptimizedAnalyticsOverview(overviewParams));
        promiseKeys.push('overview');
        response.metadata.cacheStatus.overview = 'miss';
      }
    }

    // Time series requests
    if (include.timeSeries && include.timeSeries.length > 0) {
      response.data.timeSeries = {};
      
      for (const tsRequest of include.timeSeries) {
        // Validate metric
        const metricValidation = AnalyticsRequestValidator.validateMetric(tsRequest.metric);
        if (!metricValidation.isValid) {
          return AnalyticsErrorHandler.handleValidationError(metricValidation.error!);
        }
        
        // Validate interval if provided
        const interval = tsRequest.interval || 'day';
        const intervalValidation = AnalyticsRequestValidator.validateTimeframe(interval);
        if (!intervalValidation.isValid) {
          return AnalyticsErrorHandler.handleValidationError(intervalValidation.error!);
        }
        
        const tsParams = { ...commonParams, metric: tsRequest.metric, interval };
        const cacheKey = `timeseries_${tsRequest.metric}_${interval}`;
        const cached = await analyticsCacheManager.get('TIME_SERIES', tsParams);
        
        if (cached) {
          response.data.timeSeries[tsRequest.metric] = cached;
          response.metadata.cacheStatus[cacheKey] = 'hit';
        } else {
          promises.push(getOptimizedTimeSeriesData(tsParams));
          promiseKeys.push(`timeSeries.${tsRequest.metric}`);
          response.metadata.cacheStatus[cacheKey] = 'miss';
        }
      }
    }

    // Audience, engagement, and performance requests
    // These use the same analytics service functions but with different parameters
    
    if (include.audience) {
      // Reuse overview data for audience insights
      const audienceParams = { ...commonParams, timeRange: timeframe, platform };
      const cached = await analyticsCacheManager.get('AUDIENCE', audienceParams);
      
      if (cached) {
        response.data.audience = cached;
        response.metadata.cacheStatus.audience = 'hit';
      } else {
        promises.push(getOptimizedAnalyticsOverview(audienceParams));
        promiseKeys.push('audience');
        response.metadata.cacheStatus.audience = 'miss';
      }
    }

    if (include.engagement) {
      const engagementParams = { ...commonParams, metric: 'engagement', interval: 'day' };
      const cached = await analyticsCacheManager.get('TIME_SERIES', engagementParams);
      
      if (cached) {
        response.data.engagement = cached;
        response.metadata.cacheStatus.engagement = 'hit';
      } else {
        promises.push(getOptimizedTimeSeriesData(engagementParams));
        promiseKeys.push('engagement');
        response.metadata.cacheStatus.engagement = 'miss';
      }
    }

    if (include.performance) {
      const performanceParams = { ...commonParams, metric: 'conversions', interval: 'day' };
      const cached = await analyticsCacheManager.get('TIME_SERIES', performanceParams);
      
      if (cached) {
        response.data.performance = cached;
        response.metadata.cacheStatus.performance = 'hit';
      } else {
        promises.push(getOptimizedTimeSeriesData(performanceParams));
        promiseKeys.push('performance');
        response.metadata.cacheStatus.performance = 'miss';
      }
    }

    // Execute all promises in parallel
    if (promises.length > 0) {
      const results = await Promise.all(promises);
      
      // Map results back to response structure
      results.forEach((result, index) => {
        const key = promiseKeys[index];
        
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          if (!response.data[parent as keyof typeof response.data]) {
            (response.data as any)[parent] = {};
          }
          (response.data as any)[parent][child] = result;
        } else {
          (response.data as any)[key] = result;
        }
      });
      
      // Cache the results
      results.forEach((result, index) => {
        const key = promiseKeys[index];
        if (key === 'metrics') {
          analyticsCacheManager.set('METRICS', commonParams, result);
        } else if (key === 'overview' || key === 'audience') {
          const params = { ...commonParams, timeRange: timeframe, platform };
          analyticsCacheManager.set('OVERVIEW', params, result);
        } else if (key.startsWith('timeSeries.')) {
          const metric = key.split('.')[1];
          const params = { ...commonParams, metric, interval: 'day' };
          analyticsCacheManager.set('TIME_SERIES', params, result);
        } else if (key === 'engagement' || key === 'performance') {
          const metric = key === 'engagement' ? 'engagement' : 'conversions';
          const params = { ...commonParams, metric, interval: 'day' };
          analyticsCacheManager.set('TIME_SERIES', params, result);
        }
      });
    }

    // Calculate execution time
    const executionTime = performance.now() - startTime;
    response.metadata.executionTime = Math.round(executionTime);

    // Log performance metrics
    console.log(`Unified Analytics API - Request: ${requestId}, Execution: ${executionTime.toFixed(2)}ms, Cache Hits: ${Object.values(response.metadata.cacheStatus).filter(status => status === 'hit').length}/${Object.keys(response.metadata.cacheStatus).length}`);

    return NextResponse.json(response);
    
  } catch (dbError) {
    console.error('Unified analytics API error:', dbError);
    
    // Check if it's a database error
    if (dbError instanceof Error && (dbError.message.includes('P') || dbError.message.includes('database'))) {
      return AnalyticsErrorHandler.handleDatabaseError(dbError, 'unified analytics fetch');
    }
    
    // Check if it's an authentication error
    if (dbError instanceof Error && (dbError.message.includes('authenticated') || dbError.message.includes('not found'))) {
      return AnalyticsErrorHandler.handleAuthError(dbError.message);
    }
    
    // Default to internal server error
    return AnalyticsErrorHandler.handleInternalError(dbError as Error, 'unified analytics fetch');
  }
});

/**
 * GET: Health check and API documentation
 */
export const GET = withAnalyticsErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'health') {
    // Health check endpoint
    const cacheStats = await analyticsCacheManager.getStats();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: cacheStats,
      endpoints: {
        unified: '/api/analytics/unified',
        metrics: '/api/analytics',
        overview: '/api/analytics/overview',
        timeSeries: '/api/analytics/time-series'
      }
    });
  }
  
  if (action === 'docs') {
    // API documentation
    return NextResponse.json({
      success: true,
      documentation: {
        endpoint: '/api/analytics/unified',
        method: 'POST',
        description: 'Unified analytics endpoint that consolidates multiple data requests',
        requestBody: {
          include: {
            metrics: 'boolean - Include basic metrics',
            overview: 'boolean - Include analytics overview',
            timeSeries: 'array - Time series requests with metric and interval',
            audience: 'boolean - Include audience data',
            engagement: 'boolean - Include engagement data',
            performance: 'boolean - Include performance data'
          },
          dateRange: {
            startDate: 'string - ISO date string',
            endDate: 'string - ISO date string'
          },
          timeframe: 'string - Time frame like 7d, 30d (optional)',
          platform: 'string - Platform filter (optional)',
          campaignId: 'string - Campaign ID filter (optional)'
        },
        example: {
          include: {
            metrics: true,
            overview: true,
            timeSeries: [
              { metric: 'views', interval: 'day' },
              { metric: 'engagement', interval: 'day' }
            ],
            audience: true
          },
          dateRange: {
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-31T23:59:59Z'
          },
          timeframe: '30d',
          platform: 'all'
        }
      }
    });
  }
  
  return AnalyticsErrorHandler.handleValidationError(
    'Invalid action. Use ?action=health or ?action=docs'
  );
});