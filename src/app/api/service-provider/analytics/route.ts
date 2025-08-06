import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

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

    // DEVELOPMENT MODE: Allow testing without authentication
    // TODO: Remove this in production
    if (!userId) {
      console.log('🚧 DEV MODE: Service Provider Analytics - No auth required');
    }

    // 🚀 SERVICE PROVIDER ANALYTICS - Demo Implementation
    const now = new Date();
    const timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    const daysBack = timeRanges[timeRange as keyof typeof timeRanges] || 30;

    // Generate realistic demo data based on clients
    const clientAnalytics = {
      'demo-client-1': {
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        clientType: 'government',
        contentMetrics: {
          totalContent: 45,
          publishedContent: 42,
          draftContent: 3,
          contentTypes: {
            email: 18,
            social: 15,
            blog: 12
          },
          avgEngagementRate: 8.4,
          totalViews: 12500,
          totalClicks: 1050,
          conversionRate: 4.2
        },
        performanceData: generatePerformanceData(daysBack, 'government'),
        topContent: [
          {
            id: 'content-1',
            title: 'City Council Meeting Updates',
            type: 'email',
            publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            views: 2100,
            engagement: 12.5,
            clicks: 263
          },
          {
            id: 'content-2', 
            title: 'Community Event Announcement',
            type: 'social',
            publishedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            views: 1800,
            engagement: 9.7,
            clicks: 175
          }
        ]
      },
      'demo-client-2': {
        clientId: 'demo-client-2',
        clientName: 'TechStart Inc.',
        clientType: 'business',
        contentMetrics: {
          totalContent: 38,
          publishedContent: 35,
          draftContent: 3,
          contentTypes: {
            email: 12,
            social: 18,
            blog: 8
          },
          avgEngagementRate: 12.7,
          totalViews: 18900,
          totalClicks: 2400,
          conversionRate: 6.8
        },
        performanceData: generatePerformanceData(daysBack, 'business'),
        topContent: [
          {
            id: 'content-3',
            title: 'Product Launch Campaign',
            type: 'social',
            publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            views: 3200,
            engagement: 18.4,
            clicks: 589
          },
          {
            id: 'content-4',
            title: 'Tech Industry Insights',
            type: 'blog',
            publishedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            views: 2800,
            engagement: 15.2,
            clicks: 426
          }
        ]
      },
      'demo-client-3': {
        clientId: 'demo-client-3',
        clientName: 'Local Coffee Co.',
        clientType: 'business',
        contentMetrics: {
          totalContent: 32,
          publishedContent: 29,
          draftContent: 3,
          contentTypes: {
            email: 10,
            social: 16,
            blog: 6
          },
          avgEngagementRate: 6.8,
          totalViews: 8900,
          totalClicks: 605,
          conversionRate: 3.2
        },
        performanceData: generatePerformanceData(daysBack, 'local'),
        topContent: [
          {
            id: 'content-5',
            title: 'Seasonal Coffee Menu',
            type: 'social',
            publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            views: 1500,
            engagement: 8.9,
            clicks: 134
          },
          {
            id: 'content-6',
            title: 'Community Partnership News',
            type: 'email',
            publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            views: 1200,
            engagement: 7.3,
            clicks: 88
          }
        ]
      }
    };

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

      console.log('📊 Client-specific analytics requested:', {
        clientId,
        contentCount: clientData.contentMetrics.totalContent,
        avgEngagement: clientData.contentMetrics.avgEngagementRate
      });

      return NextResponse.json(response);
    }

    // Return cross-client analytics for comparison
    const allClientsData = Object.values(clientAnalytics);
    
    // Calculate aggregate metrics
    const aggregateMetrics = {
      totalClients: allClientsData.length,
      totalContent: allClientsData.reduce((sum, client) => sum + client.contentMetrics.totalContent, 0),
      totalPublishedContent: allClientsData.reduce((sum, client) => sum + client.contentMetrics.publishedContent, 0),
      averageEngagement: allClientsData.reduce((sum, client) => sum + client.contentMetrics.avgEngagementRate, 0) / allClientsData.length,
      totalViews: allClientsData.reduce((sum, client) => sum + client.contentMetrics.totalViews, 0),
      totalClicks: allClientsData.reduce((sum, client) => sum + client.contentMetrics.totalClicks, 0),
      averageConversionRate: allClientsData.reduce((sum, client) => sum + client.contentMetrics.conversionRate, 0) / allClientsData.length
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

    console.log('📊 Cross-client analytics requested:', {
      clientCount: allClientsData.length,
      totalContent: aggregateMetrics.totalContent,
      avgEngagement: aggregateMetrics.averageEngagement.toFixed(1)
    });

    return NextResponse.json(response);

    // TODO: Replace with actual database queries when schema is ready
    /*
    const analytics = await prisma.contentAnalytics.aggregate({
      where: {
        content: {
          organizationId: organizationId,
          ...(clientId && clientId !== 'all' && { clientId }),
          createdAt: {
            gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
          }
        }
      },
      _sum: {
        views: true,
        clicks: true,
        shares: true,
        likes: true,
        comments: true
      },
      _avg: {
        engagementRate: true,
        conversionRate: true
      }
    });

    return NextResponse.json({
      analytics,
      timeRange,
      clientId
    });
    */

  } catch (error) {
    console.error('❌ Service provider analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate realistic performance data
function generatePerformanceData(days: number, clientType: 'government' | 'business' | 'local') {
  const baseMetrics = {
    government: { views: 400, engagement: 8, clicks: 32 },
    business: { views: 600, engagement: 12, clicks: 72 },
    local: { views: 200, engagement: 6, clicks: 12 }
  };

  const base = baseMetrics[clientType];
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic variance
    const variance = 0.3;
    const viewsVariance = (Math.random() - 0.5) * variance;
    const engagementVariance = (Math.random() - 0.5) * variance;
    const clicksVariance = (Math.random() - 0.5) * variance;

    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.round(base.views * (1 + viewsVariance)),
      engagement: parseFloat((base.engagement * (1 + engagementVariance)).toFixed(1)),
      clicks: Math.round(base.clicks * (1 + clicksVariance)),
      impressions: Math.round(base.views * 1.8 * (1 + viewsVariance)),
      reach: Math.round(base.views * 0.7 * (1 + viewsVariance))
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