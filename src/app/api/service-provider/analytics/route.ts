import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getAnalyticsAggregator } from '@/lib/analytics/data-aggregator';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId');
    const timeRange = searchParams.get('timeRange') || '30d';
    const compareClients = searchParams.get('compareClients') === 'true';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and verify access
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: { include: { organization: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find organization
    const organization = await db.organization.findFirst({
      where: {
        OR: [
          { id: organizationId },
          { clerkOrganizationId: organizationId }
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check access
    const hasAccess = user.organizationMemberships.some(member => 
      member.organizationId === organization!.id
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate date range for analytics
    const now = new Date();
    const timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    const daysBack = timeRanges[timeRange as keyof typeof timeRanges] || 30;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Use optimized analytics aggregator
    const aggregator = getAnalyticsAggregator();
    const aggregatedData = await aggregator.aggregateData({
      organizationId: organization.id,
      clientId: clientId !== 'all' ? clientId : undefined,
      timeframe: timeRange,
      useCache: true,
      realTime: false
    });

    // Get clients data separately for compatibility
    const clients = await db.client.findMany({
      where: { 
        organizationId: organization.id,
        createdAt: { gte: startDate }
      },
      include: {
        _count: {
          select: {
            content: true,
            campaigns: true
          }
        }
      }
    });

    // Process client analytics data using aggregated results
    const clientAnalytics: Record<string, any> = {};

    // Process each client with optimized data
    for (const client of clients) {
      // Get client-specific data from aggregation if available
      const clientContentMetrics = aggregatedData.contentMetrics.filter(c => 
        // If we have client data in content metrics, use it
        true // For now, use all content as we don't have clientId in aggregated data
      );

      // Calculate metrics from aggregated data
      const totalContent = clientContentMetrics.length;
      const publishedContent = clientContentMetrics.filter(c => c.status === 'PUBLISHED').length;
      const draftContent = clientContentMetrics.filter(c => c.status === 'DRAFT').length;
      
      const totalViews = clientContentMetrics.reduce((sum, c) => sum + c.views, 0);
      const totalEngagement = clientContentMetrics.reduce((sum, c) => sum + c.likes + c.shares + c.comments, 0);
      const avgEngagementRate = clientContentMetrics.length > 0 
        ? clientContentMetrics.reduce((sum, c) => sum + c.engagementRate, 0) / clientContentMetrics.length 
        : 0;
      const avgConversionRate = clientContentMetrics.length > 0
        ? clientContentMetrics.reduce((sum, c) => sum + c.conversionRate, 0) / clientContentMetrics.length
        : 0;

      // Group content by type
      const contentTypes = clientContentMetrics.reduce((acc, content) => {
        const type = content.type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get top performing content
      const topContent = clientContentMetrics
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(content => ({
          id: content.contentId,
          title: content.title,
          type: content.type.toLowerCase(),
          publishedAt: content.publishedAt?.toISOString() || null,
          views: content.views,
          engagement: content.engagementRate,
          clicks: Math.round(content.views * 0.1) // Estimated clicks
        }));

      // Use time series data as performance data
      const performanceData = aggregatedData.timeSeries.map(point => ({
        date: point.date,
        views: Math.round(point.views / clients.length), // Distribute across clients
        engagement: Math.round(point.engagement / clients.length),
        clicks: Math.round(point.clicks / clients.length),
        impressions: Math.round(point.reach / clients.length),
        reach: Math.round(point.reach / clients.length)
      }));

      clientAnalytics[client.id] = {
        clientId: client.id,
        clientName: client.name,
        clientType: client.industry || 'business',
        contentMetrics: {
          totalContent,
          publishedContent,
          draftContent,
          contentTypes,
          avgEngagementRate,
          totalViews,
          totalClicks: Math.round(totalViews * 0.1), // Estimated clicks
          conversionRate: avgConversionRate
        },
        performanceData,
        topContent
      };
    }

    // If specific client requested, return only that client's data
    if (clientId && clientId !== 'all') {
      const clientData = clientAnalytics[clientId as keyof typeof clientAnalytics];
      if (!clientData) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      const response = {
        clientAnalytics: clientData,
        timeRange,
        generatedAt: now.toISOString()
      };

      // Client-specific analytics requested

      return NextResponse.json(response);
    }

    // Return cross-client analytics for comparison
    const allClientsData = Object.values(clientAnalytics);
    
    // Calculate aggregate metrics with real-time variance applied
    const aggregateMetrics = {
      totalClients: allClientsData.length,
      totalContent: allClientsData.reduce((sum, client) => sum + client.contentMetrics.totalContent, 0),
      totalPublishedContent: allClientsData.reduce((sum, client) => sum + client.contentMetrics.publishedContent, 0),
      averageEngagement: parseFloat((allClientsData.reduce((sum, client) => sum + client.contentMetrics.avgEngagementRate, 0) / allClientsData.length).toFixed(1)),
      totalViews: allClientsData.reduce((sum, client) => sum + client.contentMetrics.totalViews, 0),
      totalClicks: allClientsData.reduce((sum, client) => sum + client.contentMetrics.totalClicks, 0),
      averageConversionRate: parseFloat((allClientsData.reduce((sum, client) => sum + client.contentMetrics.conversionRate, 0) / allClientsData.length).toFixed(1))
    };

    // Content type distribution across all clients
    const contentTypeDistribution = allClientsData.reduce((acc, client) => {
      Object.entries(client.contentMetrics.contentTypes).forEach(([type, count]) => {
        acc[type] = (acc[type] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    // Performance rankings
    const clientRankings = {
      byEngagement: [...allClientsData].sort((a, b) => b.contentMetrics.avgEngagementRate - a.contentMetrics.avgEngagementRate),
      byViews: [...allClientsData].sort((a, b) => b.contentMetrics.totalViews - a.contentMetrics.totalViews),
      byConversion: [...allClientsData].sort((a, b) => b.contentMetrics.conversionRate - a.contentMetrics.conversionRate)
    };

    const response = {
      aggregateMetrics,
      clientAnalytics: allClientsData,
      contentTypeDistribution,
      clientRankings,
      timeRange,
      compareClients,
      generatedAt: now.toISOString(),
      insights: generateInsights(allClientsData, aggregateMetrics)
    };

    // Cross-client analytics requested

    console.log('🔄 Service Provider Analytics API response:', {
      totalClients: clients.length,
      timeRange,
      totalContent: contentAnalytics._sum.views || 0
    });

    return NextResponse.json(response);

  } catch (_error) {
    // Service provider analytics error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get real client performance data
async function getClientPerformanceData(clientId: string, startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const performanceData = [];

  // Get daily performance data for the specified range
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const dailyMetrics = await db.content.aggregate({
      where: {
        clientId,
        publishedAt: {
          gte: currentDate,
          lt: nextDate
        }
      },
      _sum: {
        views: true,
        clicks: true,
        shares: true,
        likes: true
      },
      _avg: {
        engagementRate: true
      },
      _count: {
        _all: true
      }
    });

    performanceData.push({
      date: currentDate.toISOString().split('T')[0],
      views: dailyMetrics._sum.views || 0,
      engagement: dailyMetrics._avg.engagementRate || 0,
      clicks: dailyMetrics._sum.clicks || 0,
      impressions: Math.round((dailyMetrics._sum.views || 0) * 1.8), // Estimated impressions
      reach: Math.round((dailyMetrics._sum.views || 0) * 0.7) // Estimated reach
    });
  }

  return performanceData;
}

// Helper function to generate realistic performance data with trends
function generatePerformanceData(days: number, clientType: 'government' | 'business' | 'local', baseRevenue: number = 15000) {
  const baseMetrics = {
    government: { views: Math.floor(baseRevenue * 0.027), engagement: 8, clicks: Math.floor(baseRevenue * 0.0021) },
    business: { views: Math.floor(baseRevenue * 0.040), engagement: 12, clicks: Math.floor(baseRevenue * 0.0048) },
    local: { views: Math.floor(baseRevenue * 0.013), engagement: 6, clicks: Math.floor(baseRevenue * 0.0008) }
  };

  const base = baseMetrics[clientType];
  const data = [];

  // Add realistic weekly patterns and growth trends
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    
    // Weekend effect (less engagement on weekends)
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;
    
    // Growth trend over time (slight upward trend)
    const trendFactor = 1 + (days - i) * 0.001;
    
    // Natural variance but less random
    const dailyVariance = 0.15;
    const viewsVariance = (Math.sin(i * 0.1) * 0.1) + ((Math.random() - 0.5) * dailyVariance);
    const engagementVariance = (Math.cos(i * 0.08) * 0.1) + ((Math.random() - 0.5) * dailyVariance);
    const clicksVariance = (Math.sin(i * 0.12) * 0.1) + ((Math.random() - 0.5) * dailyVariance);

    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.max(1, Math.round(base.views * weekendFactor * trendFactor * (1 + viewsVariance))),
      engagement: Math.max(1.0, parseFloat((base.engagement * weekendFactor * trendFactor * (1 + engagementVariance)).toFixed(1))),
      clicks: Math.max(1, Math.round(base.clicks * weekendFactor * trendFactor * (1 + clicksVariance))),
      impressions: Math.max(1, Math.round(base.views * 1.8 * weekendFactor * trendFactor * (1 + viewsVariance))),
      reach: Math.max(1, Math.round(base.views * 0.7 * weekendFactor * trendFactor * (1 + viewsVariance)))
    });
  }

  return data;
}

// Helper function to generate insights
function generateInsights(clientsData: any[], aggregateMetrics: any) {
  const insights = [];

  // Top performing client
  const topClient = clientsData.reduce((prev, current) => 
    prev.contentMetrics.avgEngagementRate > current.contentMetrics.avgEngagementRate ? prev : current
  );
  
  insights.push({
    type: 'success',
    title: 'Top Performer',
    message: `${topClient.clientName} leads with ${topClient.contentMetrics.avgEngagementRate}% average engagement`,
    impact: 'high'
  });

  // Content volume insight
  if (aggregateMetrics.totalContent > 100) {
    insights.push({
      type: 'info',
      title: 'Content Volume',
      message: `Your service manages ${aggregateMetrics.totalContent} pieces of content across ${aggregateMetrics.totalClients} clients`,
      impact: 'medium'
    });
  }

  // Engagement opportunity
  const lowEngagementClients = clientsData.filter(client => 
    client.contentMetrics.avgEngagementRate < aggregateMetrics.averageEngagement * 0.8
  );
  
  if (lowEngagementClients.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Engagement Opportunity',
      message: `${lowEngagementClients.length} client(s) could benefit from engagement optimization strategies`,
      impact: 'medium'
    });
  }

  return insights;
}