import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { format } from 'date-fns';

// Validation schemas
const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  campaignId: z.string().optional(),
  timeframe: z.enum(['day', 'week', 'month', 'year']).default('month'),
  export: z.enum(['csv', 'json']).optional(),
  filters: z.record(z.string()).optional(),
});

const analyticsCreateSchema = z.object({
  timestamp: z.string().optional(),
  campaignId: z.string(),
  views: z.number().min(0),
  engagements: z.number().min(0),
  conversions: z.number().min(0),
  revenue: z.number().min(0),
  likes: z.number().min(0),
  comments: z.number().min(0),
  shares: z.number().min(0),
  follows: z.number().min(0),
  new_followers: z.number().min(0),
});

// Helper function to format data for export
const formatDataForExport = (data: any[], format: 'csv' | 'json') => {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  // CSV format
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      campaignId: searchParams.get('campaignId'),
      timeframe: searchParams.get('timeframe') || 'month',
      export: searchParams.get('export') as 'csv' | 'json' | undefined,
      filters: Object.fromEntries(
        Array.from(searchParams.entries())
          .filter(([key]) => key.startsWith('filter_'))
          .map(([key, value]) => [key.replace('filter_', ''), value])
      ),
    };

    const validatedParams = analyticsQuerySchema.parse(queryParams);

    // Default date range if not provided (last 30 days)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const startDate = validatedParams.startDate ? new Date(validatedParams.startDate) : defaultStartDate;
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : defaultEndDate;

    // Build where clause with filters
    const whereClause = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
      ...(validatedParams.campaignId && { campaignId: validatedParams.campaignId }),
      ...(validatedParams.filters && Object.entries(validatedParams.filters).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }), {})),
    };

    // Fetch analytics data from database
    const analyticsData = await prisma.analytics.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Handle data export
    if (validatedParams.export) {
      const formattedData = formatDataForExport(analyticsData, validatedParams.export);
      const headers = new Headers();
      headers.set('Content-Type', validatedParams.export === 'csv' ? 'text/csv' : 'application/json');
      headers.set('Content-Disposition', `attachment; filename=analytics-${format(new Date(), 'yyyy-MM-dd')}.${validatedParams.export}`);
      return new NextResponse(formattedData, { headers });
    }

    // Process data for metrics
    const totalViews = analyticsData.reduce((sum, record) => sum + record.views, 0);
    const totalEngagements = analyticsData.reduce((sum, record) => sum + record.engagements, 0);
    const totalConversions = analyticsData.reduce((sum, record) => sum + record.conversions, 0);
    const totalRevenue = analyticsData.reduce((sum, record) => sum + record.revenue, 0);
    
    // Calculate period-over-period changes
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);

    const previousPeriodData = await prisma.analytics.findMany({
      where: {
        timestamp: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
        ...(validatedParams.campaignId && { campaignId: validatedParams.campaignId }),
      },
    });

    const previousTotalViews = previousPeriodData.reduce((sum, record) => sum + record.views, 0);
    const previousTotalEngagements = previousPeriodData.reduce((sum, record) => sum + record.engagements, 0);
    const previousTotalConversions = previousPeriodData.reduce((sum, record) => sum + record.conversions, 0);
    const previousTotalRevenue = previousPeriodData.reduce((sum, record) => sum + record.revenue, 0);

    // Calculate percentage changes
    const calculatePercentChange = (current: number, previous: number) => 
      previous === 0 ? 0 : ((current - previous) / previous) * 100;

    // Group data by timeframe for charts
    const groupedData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${validatedParams.timeframe}, timestamp) as period,
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
      WHERE timestamp BETWEEN ${startDate} AND ${endDate}
      ${validatedParams.campaignId ? `AND "campaignId" = ${validatedParams.campaignId}` : ''}
      GROUP BY period
      ORDER BY period ASC
    `;

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

    // Format chart data
    const formatDateLabel = (date: Date, timeframe: string) => {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: timeframe === 'month' ? 'short' : undefined,
        day: timeframe === 'day' ? 'numeric' : undefined,
        week: timeframe === 'week' ? 'numeric' : undefined,
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
          analyticsData.reduce((sum, record) => sum + record.likes, 0),
          analyticsData.reduce((sum, record) => sum + record.comments, 0),
          analyticsData.reduce((sum, record) => sum + record.shares, 0),
          analyticsData.reduce((sum, record) => sum + record.follows, 0),
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

// Route handler for POST requests to create analytics entries
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const data = await request.json();
    const validatedData = analyticsCreateSchema.parse(data);

    // Create analytics entry
    const result = await prisma.analytics.create({
      data: {
        timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date(),
        campaignId: validatedData.campaignId,
        views: validatedData.views,
        engagements: validatedData.engagements,
        conversions: validatedData.conversions,
        revenue: validatedData.revenue,
        likes: validatedData.likes,
        comments: validatedData.comments,
        shares: validatedData.shares,
        follows: validatedData.follows,
        new_followers: validatedData.new_followers,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analytics API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors }, 
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create analytics entry' }, 
      { status: 500 }
    );
  }
}