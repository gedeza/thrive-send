import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : undefined;
    const campaignId = searchParams.get('campaignId') || undefined;
    const timeframe = searchParams.get('timeframe') || 'month';
    
    // Default date range if not provided (last 30 days)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    // Fetch analytics data from database
    const analyticsData = await prisma.analytics.findMany({
      where: {
        timestamp: {
          gte: startDate || defaultStartDate,
          lte: endDate || defaultEndDate,
        },
        ...(campaignId && { campaignId }),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Process data for metrics
    const totalViews = analyticsData.reduce((sum, record) => sum + record.views, 0);
    const totalEngagements = analyticsData.reduce((sum, record) => sum + record.engagements, 0);
    const totalConversions = analyticsData.reduce((sum, record) => sum + record.conversions, 0);
    const totalRevenue = analyticsData.reduce((sum, record) => sum + record.revenue, 0);
    
    // Calculate month-over-month changes (simplified example)
    // In a real implementation, you would compare with previous period's data
    
    // Group data by month/week/day based on timeframe for charts
    let groupedData;
    
    if (timeframe === 'day') {
      groupedData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', timestamp) as period,
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
        WHERE timestamp BETWEEN ${startDate || defaultStartDate} AND ${endDate || defaultEndDate}
        ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
        GROUP BY period
        ORDER BY period ASC
      `;
    } else if (timeframe === 'week') {
      groupedData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', timestamp) as period,
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
        WHERE timestamp BETWEEN ${startDate || defaultStartDate} AND ${endDate || defaultEndDate}
        ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
        GROUP BY period
        ORDER BY period ASC
      `;
    } else if (timeframe === 'year') {
      groupedData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('year', timestamp) as period,
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
        WHERE timestamp BETWEEN ${startDate || defaultStartDate} AND ${endDate || defaultEndDate}
        ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
        GROUP BY period
        ORDER BY period ASC
      `;
    } else {
      // Default to monthly
      groupedData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', timestamp) as period,
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
        WHERE timestamp BETWEEN ${startDate || defaultStartDate} AND ${endDate || defaultEndDate}
        ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
        GROUP BY period
        ORDER BY period ASC
      `;
    }

    // Format data for response
    const metrics = [
      {
        title: "Total Views",
        value: totalViews.toLocaleString(),
        comparison: "+12% from last month", // In a real app, calculate this dynamically
        percentChange: 12,
      },
      {
        title: "Engagement Rate",
        value: totalViews > 0 ? `${Math.round((totalEngagements / totalViews) * 100)}%` : "0%",
        comparison: "+8% from last month",
        percentChange: 8,
      },
      {
        title: "Conversion Rate",
        value: totalEngagements > 0 ? `${Math.round((totalConversions / totalEngagements) * 100)}%` : "0%",
        comparison: "+4% from last month",
        percentChange: 4,
      },
      {
        title: "Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        comparison: "+2% from last month",
        percentChange: 2,
      },
    ];

    // Format audience growth data (bar chart)
    const audienceGrowthData = {
      labels: (groupedData as any[]).map(d => 
        new Date(d.period).toLocaleString('default', { 
          [timeframe === 'year' ? 'year' : timeframe === 'month' ? 'month' : timeframe === 'week' ? 'week' : 'day']: 
          timeframe === 'year' ? 'numeric' : timeframe === 'month' ? 'short' : 'numeric' 
        })
      ),
      datasets: [{
        label: "New Users",
        data: (groupedData as any[]).map(d => Number(d.new_followers)),
        backgroundColor: ["#1976d2", "#43a047", "#1976d2", "#43a047", "#1976d2", "#43a047"],
      }],
    };

    // Format engagement breakdown data (pie chart)
    const totalLikes = analyticsData.reduce((sum, record) => sum + record.likes, 0);
    const totalComments = analyticsData.reduce((sum, record) => sum + record.comments, 0);
    const totalShares = analyticsData.reduce((sum, record) => sum + record.shares, 0);
    const totalFollows = analyticsData.reduce((sum, record) => sum + record.follows, 0);
    
    const engagementPieData = {
      labels: ["Likes", "Comments", "Shares", "Follows"],
      datasets: [{
        label: "Engagement",
        data: [totalLikes, totalComments, totalShares, totalFollows],
        backgroundColor: ["#1976d2", "#43a047", "#fbc02d", "#e53935"],
      }],
    };

    // Format performance trends data (line chart)
    const performanceLineData = {
      labels: (groupedData as any[]).map(d => 
        new Date(d.period).toLocaleString('default', { 
          [timeframe === 'year' ? 'year' : timeframe === 'month' ? 'month' : timeframe === 'week' ? 'week' : 'day']: 
          timeframe === 'year' ? 'numeric' : timeframe === 'month' ? 'short' : 'numeric' 
        })
      ),
      datasets: [{
        label: "Engagement Trend",
        data: (groupedData as any[]).map(d => Number(d.engagements)),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.2)",
        tension: 0.35,
        fill: true,
      }],
    };

    // Return formatted analytics data
    return NextResponse.json({
      metrics,
      audienceGrowthData,
      engagementPieData,
      performanceLineData,
      timeframe,
      dateRange: {
        from: startDate || defaultStartDate,
        to: endDate || defaultEndDate,
      },
    });

  } catch (error) {
    console.error('Analytics API error:', error);
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

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Create analytics entry
    const result = await prisma.analytics.create({
      data: {
        timestamp: data.timestamp || new Date(),
        campaignId: data.campaignId,
        views: data.views || 0,
        engagements: data.engagements || 0,
        conversions: data.conversions || 0,
        revenue: data.revenue || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        follows: data.follows || 0,
        new_followers: data.new_followers || 0,
        platform: data.platform,
        type: data.type,
        audience_age: data.audience_age,
        audience_gender: data.audience_gender,
        audience_location: data.audience_location,
        clientId: data.clientId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to create analytics entry' }, 
      { status: 500 }
    );
  }
}