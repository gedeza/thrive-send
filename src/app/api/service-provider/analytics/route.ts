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

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and verify access
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMembers: { include: { organization: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find organization
    let organization = await db.organization.findFirst({
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
    const hasAccess = user.organizationMembers.some(member => 
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

    // Get real analytics data from database
    const [
      clients,
      contentAnalytics,
      campaigns,
      templates,
      totalRevenue
    ] = await Promise.all([
      // Get clients data
      db.client.findMany({
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
      }),
      
      // Get content analytics aggregated
      db.content.aggregate({
        where: {
          organizationId: organization.id,
          createdAt: { gte: startDate }
        },
        _sum: {
          views: true,
          clicks: true,
          shares: true,
          likes: true
        },
        _avg: {
          engagementRate: true,
          conversionRate: true
        },
        _count: true
      }),
      
      // Get campaigns data  
      db.campaign.findMany({
        where: {
          organizationId: organization.id,
          createdAt: { gte: startDate }
        },
        include: {
          _count: {
            select: { content: true }
          }
        }
      }),
      
      // Get templates usage
      db.contentTemplate.aggregate({
        where: {
          organizationId: organization.id,
          createdAt: { gte: startDate }
        },
        _count: true
      }),
      
      // Calculate revenue (using campaign budgets as proxy)
      db.campaign.aggregate({
        where: {
          organizationId: organization.id,
          createdAt: { gte: startDate }
        },
        _sum: {
          budget: true
        }
      })
    ]);

    // Process real client analytics data from database
    const clientAnalytics: Record<string, any> = {};

    // Process each client with real database data
    for (const client of clients) {
      // Get client-specific content analytics
      const clientContentAnalytics = await db.content.aggregate({
        where: {
          clientId: client.id,
          createdAt: { gte: startDate }
        },
        _sum: {
          views: true,
          clicks: true,
          shares: true,
          likes: true
        },
        _avg: {
          engagementRate: true,
          conversionRate: true
        },
        _count: {
          _all: true
        }
      });

      // Get content type distribution for this client
      const contentTypes = await db.content.groupBy({
        by: ['type'],
        where: {
          clientId: client.id,
          createdAt: { gte: startDate }
        },
        _count: {
          _all: true
        }
      });

      // Get top performing content for this client
      const topContent = await db.content.findMany({
        where: {
          clientId: client.id,
          publishedAt: { not: null },
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          title: true,
          type: true,
          publishedAt: true,
          views: true,
          clicks: true,
          engagementRate: true
        },
        orderBy: [
          { views: 'desc' },
          { engagementRate: 'desc' }
        ],
        take: 5
      });

      // Get performance data for this client
      const performanceData = await getClientPerformanceData(client.id, startDate, now);

      clientAnalytics[client.id] = {
        clientId: client.id,
        clientName: client.name,
        clientType: client.industry || 'business',
        contentMetrics: {
          totalContent: clientContentAnalytics._count._all,
          publishedContent: await db.content.count({
            where: {
              clientId: client.id,
              status: 'PUBLISHED',
              createdAt: { gte: startDate }
            }
          }),
          draftContent: await db.content.count({
            where: {
              clientId: client.id,
              status: 'DRAFT',
              createdAt: { gte: startDate }
            }
          }),
          contentTypes: contentTypes.reduce((acc, type) => {
            acc[type.type.toLowerCase()] = type._count._all;
            return acc;
          }, {} as Record<string, number>),
          avgEngagementRate: clientContentAnalytics._avg.engagementRate || 0,
          totalViews: clientContentAnalytics._sum.views || 0,
          totalClicks: clientContentAnalytics._sum.clicks || 0,
          conversionRate: clientContentAnalytics._avg.conversionRate || 0
        },
        performanceData,
        topContent: topContent.map(content => ({
          id: content.id,
          title: content.title,
          type: content.type.toLowerCase(),
          publishedAt: content.publishedAt?.toISOString(),
          views: content.views || 0,
          engagement: content.engagementRate || 0,
          clicks: content.clicks || 0
        }))
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