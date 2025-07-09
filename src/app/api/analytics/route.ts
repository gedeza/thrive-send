import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOptimizedAnalytics } from '@/lib/analytics/query-optimizer';
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

// GET: Return analytics data from database using optimized queries
export const GET = withAnalyticsErrorHandler(async (request: Request) => {
  const user = await getAuthenticatedUser();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const timeframe = searchParams.get('timeframe') || '7d';

  // Validate date range if provided
  if (startDate || endDate) {
    const dateValidation = AnalyticsRequestValidator.validateDateRange(startDate, endDate);
    if (!dateValidation.isValid) {
      return AnalyticsErrorHandler.handleValidationError(dateValidation.error!);
    }
  }

  // Validate timeframe format
  const timeframePattern = /^\d+[dwmy]$/;
  if (!timeframePattern.test(timeframe)) {
    return AnalyticsErrorHandler.handleValidationError(
      'Invalid timeframe format. Use format like: 7d, 30d, 1w, 1m, 1y'
    );
  }

  // Check user has access to analytics
  if (!user.organizationMemberships || user.organizationMemberships.length === 0) {
    return AnalyticsErrorHandler.handleAuthzError('No organization membership found');
  }

  try {
    // Use optimized analytics query that solves N+1 problem
    const analyticsData = await getOptimizedAnalytics({
      userId: user.id,
      clerkId: user.clerkId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeframe
    });

    // Check if we have any data
    if (!analyticsData.summary || analyticsData.summary.totalContent === 0) {
      return AnalyticsErrorHandler.handleInsufficientDataError(
        'No analytics data found for the specified time period'
      );
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString(),
    });
  } catch (dbError) {
    return AnalyticsErrorHandler.handleDatabaseError(dbError as Error, 'analytics fetch');
  }
});