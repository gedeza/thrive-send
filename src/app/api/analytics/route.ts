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

// Add POST method for comprehensive analytics (temporary fix for missing endpoint)
export const POST = async (request: Request) => {
  try {
    console.log('📊 POST Analytics comprehensive (fallback) endpoint called');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Generate comprehensive demo analytics data
    const analyticsData = {
      metrics: {
        totalViews: 45230 + Math.floor(Math.random() * 10000),
        totalReach: 36800 + Math.floor(Math.random() * 8000),
        totalConversions: 1847 + Math.floor(Math.random() * 500),
        engagementRate: `${(4.2 + Math.random() * 2).toFixed(1)}%`,
        viewsChange: 12.3 + Math.random() * 5,
        reachChange: 8.7 + Math.random() * 4,
        conversionsChange: 15.2 + Math.random() * 8,
        engagementChange: 3.4 + Math.random() * 3
      },
      charts: {
        performanceTrend: generatePerformanceTrend(),
        platformPerformance: generatePlatformPerformance(),
        activityHeatmap: generateActivityHeatmap()
      },
      audience: body.include?.audience ? {
        deviceDistribution: [
          { name: 'Mobile', value: 65, color: '#3b82f6' },
          { name: 'Desktop', value: 28, color: '#10b981' },
          { name: 'Tablet', value: 7, color: '#f59e0b' }
        ],
        demographics: [
          { ageGroup: '18-24', users: 2450, percentage: 18.5 },
          { ageGroup: '25-34', users: 4200, percentage: 31.7 },
          { ageGroup: '35-44', users: 3800, percentage: 28.8 },
          { ageGroup: '45-54', users: 2100, percentage: 15.9 },
          { ageGroup: '55+', users: 680, percentage: 5.1 }
        ]
      } : undefined,
      engagement: body.include?.engagement ? {
        engagementTrend: generateEngagementTrend()
      } : undefined,
      revenue: body.include?.revenue ? {
        totalRevenue: '$47,650',
        conversionRate: '4.8%',
        avgOrderValue: '$387',
        revenueChange: 12.5 + Math.random() * 5,
        conversionChange: 2.3 + Math.random() * 2,
        aovChange: 8.7 + Math.random() * 3,
        revenueTrend: generateRevenueTrend()
      } : undefined
    };

    console.log('✅ Comprehensive analytics data generated successfully');

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString(),
      fallback: true
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

// Helper functions for generating demo data
function generatePerformanceTrend() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      views: 800 + Math.floor(Math.random() * 400),
      engagement: 3.5 + Math.random() * 2,
      conversions: 20 + Math.floor(Math.random() * 15)
    });
  }
  return data;
}

function generatePlatformPerformance() {
  const platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'];
  return platforms.map(platform => ({
    platform,
    views: 5000 + Math.floor(Math.random() * 8000),
    engagement: 2.5 + Math.random() * 4,
    reach: 4000 + Math.floor(Math.random() * 6000)
  }));
}

function generateActivityHeatmap() {
  const heatmapLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50);
  
  return [{
    labels: heatmapLabels,
    datasets: [{
      label: 'Activity',
      data: heatmapData
    }]
  }];
}

function generateEngagementTrend() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      likes: 150 + Math.floor(Math.random() * 100),
      comments: 25 + Math.floor(Math.random() * 20),
      shares: 35 + Math.floor(Math.random() * 30),
      engagementRate: 3.5 + Math.random() * 2
    });
  }
  return data;
}

function generateRevenueTrend() {
  const data = [];
  for (let i = 0; i < 12; i++) {
    data.push({
      week: `Week ${i + 1}`,
      revenue: 2500 + Math.floor(Math.random() * 1500),
      orders: 15 + Math.floor(Math.random() * 10),
      date: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  return data;
}