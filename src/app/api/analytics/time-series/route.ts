import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOptimizedTimeSeriesData } from '@/lib/analytics/query-optimizer';
import { 
  AnalyticsErrorHandler, 
  AnalyticsRequestValidator, 
  withAnalyticsErrorHandler 
} from '@/lib/analytics/error-handler';

// Helper function to get authenticated user with proper error handling
async function getAuthenticatedUser() {
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
}

// GET: Return time series data for a specific metric using optimized queries
export const GET = withAnalyticsErrorHandler(async (request: Request) => {
  const user = await getAuthenticatedUser();
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric') || 'views';
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const interval = searchParams.get('interval') || 'day';

  // Validate metric
  const metricValidation = AnalyticsRequestValidator.validateMetric(metric);
  if (!metricValidation.isValid) {
    return AnalyticsErrorHandler.handleValidationError(metricValidation.error!);
  }

  // Validate interval
  const intervalValidation = AnalyticsRequestValidator.validateTimeframe(interval);
  if (!intervalValidation.isValid) {
    return AnalyticsErrorHandler.handleValidationError(intervalValidation.error!);
  }

  // Validate date range if provided
  let startDate: Date;
  let endDate: Date;
  
  if (start || end) {
    const dateValidation = AnalyticsRequestValidator.validateDateRange(start, end);
    if (!dateValidation.isValid) {
      return AnalyticsErrorHandler.handleValidationError(dateValidation.error!);
    }
    startDate = dateValidation.startDate!;
    endDate = dateValidation.endDate!;
  } else {
    // Parse date range or use default (last 7 days)
    endDate = new Date();
    startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Additional validation - check for reasonable date range
  const daysDiff = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return AnalyticsErrorHandler.handleValidationError(
      'Date range cannot exceed 365 days for time series data'
    );
  }

  // Check user has access to analytics
  if (!user.organizationMemberships || user.organizationMemberships.length === 0) {
    return AnalyticsErrorHandler.handleAuthzError('No organization membership found');
  }

  try {
    // Use optimized time series query
    const timeSeriesData = await getOptimizedTimeSeriesData({
      userId: user.id,
      clerkId: user.clerkId,
      metric,
      interval,
      startDate,
      endDate
    });

    // Check if we have any data
    if (!timeSeriesData.datasets || timeSeriesData.datasets.length === 0) {
      return AnalyticsErrorHandler.handleInsufficientDataError(
        'No time series data found for the specified metric and date range'
      );
    }

    // Check if all data points are zero
    const hasData = timeSeriesData.datasets.some(dataset => 
      dataset.data.some(value => value > 0)
    );
    
    if (!hasData) {
      return AnalyticsErrorHandler.handleInsufficientDataError(
        'No activity data found for the specified metric and date range'
      );
    }
    
    return NextResponse.json({
      success: true,
      data: timeSeriesData,
      metadata: {
        metric,
        interval,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataPoints: timeSeriesData.labels.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (dbError) {
    return AnalyticsErrorHandler.handleDatabaseError(dbError as Error, 'time series fetch');
  }
}); 