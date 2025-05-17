import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Validation schema for analytics query parameters
const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeframe: z.enum(['day', 'week', 'month', 'year']).default('month'),
  campaignId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      timeframe: url.searchParams.get('timeframe') || 'month',
      campaignId: url.searchParams.get('campaignId'),
    };

    const validatedParams = analyticsQuerySchema.parse(queryParams);

    // Set default date range if not provided
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date();
    const startDate = validatedParams.startDate ? new Date(validatedParams.startDate) : new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1); // Default to last month if no start date

    // Fetch analytics data
    const analyticsData = await prisma.analytics.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(validatedParams.campaignId && { campaignId: validatedParams.campaignId }),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate metrics
    const totalViews = analyticsData.reduce((sum, record) => sum + (record.views || 0), 0);
    const totalEngagements = analyticsData.reduce((sum, record) => sum + (record.engagements || 0), 0);
    const totalConversions = analyticsData.reduce((sum, record) => sum + (record.conversions || 0), 0);
    const totalRevenue = analyticsData.reduce((sum, record) => sum + (record.revenue || 0), 0);

    // Calculate period-over-period changes
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);

    const previousPeriodData = await prisma.analytics.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
        ...(validatedParams.campaignId && { campaignId: validatedParams.campaignId }),
      },
    });

    const previousTotalViews = previousPeriodData.reduce((sum, record) => sum + (record.views || 0), 0);
    const previousTotalEngagements = previousPeriodData.reduce((sum, record) => sum + (record.engagements || 0), 0);
    const previousTotalConversions = previousPeriodData.reduce((sum, record) => sum + (record.conversions || 0), 0);
    const previousTotalRevenue = previousPeriodData.reduce((sum, record) => sum + (record.revenue || 0), 0);

    // Calculate percentage changes
    const calculatePercentChange = (current: number, previous: number) => 
      previous === 0 ? 0 : ((current - previous) / previous) * 100;

    // Format metrics with period-over-period changes
    const metrics = [
      {
        title: "Total Views",
        value: totalViews.toLocaleString(),
        comparison: `${calculatePercentChange(totalViews, previousTotalViews).toFixed(1)}% from previous period`,
        percentChange: calculatePercentChange(totalViews, previousTotalViews),
      },
      {
        title: "Engagement Rate",
        value: totalViews > 0 ? `${Math.round((totalEngagements / totalViews) * 100)}%` : "0%",
        comparison: `${calculatePercentChange(totalEngagements, previousTotalEngagements).toFixed(1)}% from previous period`,
        percentChange: calculatePercentChange(totalEngagements, previousTotalEngagements),
      },
      {
        title: "Conversion Rate",
        value: totalEngagements > 0 ? `${Math.round((totalConversions / totalEngagements) * 100)}%` : "0%",
        comparison: `${calculatePercentChange(totalConversions, previousTotalConversions).toFixed(1)}% from previous period`,
        percentChange: calculatePercentChange(totalConversions, previousTotalConversions),
      },
      {
        title: "Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        comparison: `${calculatePercentChange(totalRevenue, previousTotalRevenue).toFixed(1)}% from previous period`,
        percentChange: calculatePercentChange(totalRevenue, previousTotalRevenue),
      },
    ];

    // Group data by timeframe for charts
    const groupedData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${validatedParams.timeframe}, "createdAt") as period,
        SUM(views) as views,
        SUM(engagements) as engagements,
        SUM(conversions) as conversions,
        SUM(revenue) as revenue,
        SUM(likes) as likes,
        SUM(comments) as comments,
        SUM(shares) as shares,
        SUM(follows) as follows,
        SUM(new_followers) as new_followers
      FROM "Analytics"
      WHERE "createdAt" BETWEEN ${startDate} AND ${endDate}
      ${validatedParams.campaignId ? `AND "campaignId" = ${validatedParams.campaignId}` : ''}
      GROUP BY period
      ORDER BY period ASC
    `;

    // Format chart data
    const formatDateLabel = (date: Date, timeframe: string) => {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: timeframe === 'month' ? 'short' : undefined,
        day: timeframe === 'day' ? 'numeric' : undefined,
      };
      return new Date(date).toLocaleString('default', options);
    };

    const audienceGrowthData = {
      labels: (groupedData as any[]).map(d => formatDateLabel(d.period, validatedParams.timeframe)),
      datasets: [{
        label: "New Users",
        data: (groupedData as any[]).map(d => Number(d.new_followers)),
        backgroundColor: ["#1976d2", "#43a047", "#1976d2", "#43a047", "#1976d2", "#43a047"],
      }],
    };

    const engagementPieData = {
      labels: ["Likes", "Comments", "Shares", "Follows"],
      datasets: [{
        label: "Engagement",
        data: [
          analyticsData.reduce((sum, record) => sum + (record.likes || 0), 0),
          analyticsData.reduce((sum, record) => sum + (record.comments || 0), 0),
          analyticsData.reduce((sum, record) => sum + (record.shares || 0), 0),
          analyticsData.reduce((sum, record) => sum + (record.follows || 0), 0),
        ],
        backgroundColor: ["#1976d2", "#43a047", "#fbc02d", "#e53935"],
      }],
    };

    const performanceLineData = {
      labels: (groupedData as any[]).map(d => formatDateLabel(d.period, validatedParams.timeframe)),
      datasets: [{
        label: "Engagement Trend",
        data: (groupedData as any[]).map(d => Number(d.engagements)),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.2)",
        tension: 0.35,
        fill: true,
      }],
    };

    return NextResponse.json({
      metrics,
      audienceGrowthData,
      engagementPieData,
      performanceLineData,
      timeframe: validatedParams.timeframe,
      dateRange: {
        from: startDate,
        to: endDate,
      },
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors }, 
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' }, 
      { status: 500 }
    );
  }
}