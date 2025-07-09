import { NextResponse } from 'next/server';
import { subDays, format } from 'date-fns';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOptimizedAnalyticsOverview } from '@/lib/analytics/query-optimizer';
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

export const GET = withAnalyticsErrorHandler(async (request: Request) => {
  const user = await getAuthenticatedUser();
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '7d';
  const platform = searchParams.get('platform') || 'all';

  // Validate timeRange format
  const timeRangePattern = /^\d+[dwmy]$/;
  if (!timeRangePattern.test(timeRange)) {
    return AnalyticsErrorHandler.handleValidationError(
      'Invalid timeRange format. Use format like: 7d, 30d, 1w, 1m, 1y'
    );
  }

  // Validate platform
  const platformValidation = AnalyticsRequestValidator.validatePlatform(platform);
  if (!platformValidation.isValid) {
    return AnalyticsErrorHandler.handleValidationError(platformValidation.error!);
  }

  // Check user has access to analytics
  if (!user.organizationMemberships || user.organizationMemberships.length === 0) {
    return AnalyticsErrorHandler.handleAuthzError('No organization membership found');
  }

  // Validate time range (max 365 days)
  const days = parseInt(timeRange.replace(/[dwmy]/, ''));
  const unit = timeRange.slice(-1);
  let maxDays = 365;
  
  if (unit === 'w') {
    maxDays = 52; // 52 weeks
  } else if (unit === 'm') {
    maxDays = 12; // 12 months
  } else if (unit === 'y') {
    maxDays = 5; // 5 years
  }
  
  if (days > maxDays) {
    return AnalyticsErrorHandler.handleValidationError(
      `Time range too large. Maximum ${maxDays} ${unit === 'd' ? 'days' : unit === 'w' ? 'weeks' : unit === 'm' ? 'months' : 'years'} allowed`
    );
  }

  try {
    // Use optimized analytics overview query
    const analyticsData = await getOptimizedAnalyticsOverview({
      userId: user.id,
      clerkId: user.clerkId,
      timeRange,
      platform
    });

    // Check if we have any data
    if (!analyticsData || analyticsData.length === 0) {
      return AnalyticsErrorHandler.handleInsufficientDataError(
        'No analytics data found for the specified criteria'
      );
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      metadata: {
        timeRange,
        platform,
        recordCount: analyticsData.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (dbError) {
    return AnalyticsErrorHandler.handleDatabaseError(dbError as Error, 'analytics overview fetch');
  }
}); 