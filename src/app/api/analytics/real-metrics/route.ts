import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createRealAnalyticsService } from '@/lib/services/real-analytics-service';
import { z } from 'zod';

// Request validation schema
const metricsRequestSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  clientId: z.string().optional(),
  organizationId: z.string(),
});

/**
 * GET /api/analytics/real-metrics
 * Returns real analytics metrics from database
 * Replaces mock data with actual client and content performance data
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const clientId = searchParams.get('clientId');

    // Validate required parameters
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Validate request parameters
    const validationResult = metricsRequestSchema.safeParse({
      organizationId,
      startDate,
      endDate,
      clientId,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Create date range filter if dates provided
    const dateRange = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } : undefined;

    // Create analytics service instance
    const analyticsService = createRealAnalyticsService(organizationId);

    // Fetch real metrics from database
    const [dashboardMetrics, clientMetrics, performanceTrend] = await Promise.all([
      analyticsService.getDashboardMetrics(dateRange),
      analyticsService.getClientMetrics(clientId, dateRange),
      analyticsService.getPerformanceTrend(dateRange),
    ]);

    // Return comprehensive analytics data
    return NextResponse.json({
      success: true,
      data: {
        overview: dashboardMetrics,
        clients: clientMetrics,
        trends: performanceTrend,
        timestamp: new Date().toISOString(),
        source: 'database', // Indicates this is real data, not mock
      },
    });

  } catch (error) {
    console.error('Error fetching real analytics metrics:', error);
    
    // Return structured error response
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics metrics',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/real-metrics
 * Create or update analytics data
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, clientId, metrics } = body;

    if (!organizationId || !clientId || !metrics) {
      return NextResponse.json(
        { error: 'Organization ID, Client ID, and metrics are required' },
        { status: 400 }
      );
    }

    // This endpoint could be used to update analytics data
    // For now, we'll return success to indicate the endpoint is ready
    return NextResponse.json({
      success: true,
      message: 'Analytics update endpoint ready for implementation',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating analytics metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics metrics' },
      { status: 500 }
    );
  }
}