import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate date range
    const daysMap: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    
    const days = daysMap[timeRange] || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get clients with their performance data
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        campaigns: {
          where: {
            createdAt: { gte: startDate },
          },
        },
        contents: {
          where: {
            createdAt: { gte: startDate },
            status: { in: ['PUBLISHED', 'SCHEDULED'] },
          },
        },
      },
    });

    // Calculate total performance metrics
    const totalCampaigns = clients.reduce((sum, client) => sum + client.campaigns.length, 0);
    const totalContent = clients.reduce((sum, client) => sum + client.contents.length, 0);
    const totalRevenue = clients.reduce((sum, client) => sum + (client.monthlyBudget || 0), 0);

    // Calculate average engagement (placeholder algorithm)
    const avgEngagement = clients.length > 0 
      ? clients.reduce((sum, client) => {
          // Placeholder engagement calculation based on content activity
          const clientEngagement = Math.min(client.contents.length * 2.5 + Math.random() * 5, 15);
          return sum + clientEngagement;
        }, 0) / clients.length
      : 0;

    // Calculate growth rate (placeholder)
    const growthRate = Math.random() * 10 + 5; // Random 5-15% growth

    const totalPerformance = {
      campaigns: totalCampaigns,
      engagement: Number(avgEngagement.toFixed(1)),
      revenue: totalRevenue,
      growth: Number(growthRate.toFixed(1)),
    };

    // Prepare client comparison data
    const clientComparison = clients.map(client => {
      const campaigns = client.campaigns.length;
      const content = client.contents.length;
      const revenue = client.monthlyBudget || 0;
      
      // Calculate performance score
      const campaignScore = Math.min(campaigns * 10, 40);
      const contentScore = Math.min(content * 5, 30);
      const revenueScore = Math.min((revenue / 1000) * 2, 30);
      const performance = campaignScore + contentScore + revenueScore;
      
      // Calculate engagement rate (placeholder)
      const engagement = Math.min(content * 2.5 + Math.random() * 5, 15);

      return {
        id: client.id,
        name: client.name,
        performance: Number(performance.toFixed(1)),
        campaigns,
        engagement: Number(engagement.toFixed(1)),
        revenue,
      };
    }).sort((a, b) => b.performance - a.performance);

    // Generate trend data (placeholder)
    const trendData = [];
    const periodsMap: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 12, // 12 weeks for 90 days
      '1y': 12, // 12 months for 1 year
    };
    
    const periods = periodsMap[timeRange] || 30;
    const periodLength = timeRange === '90d' ? 7 : timeRange === '1y' ? 30 : 1; // days per period

    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = new Date(Date.now() - i * periodLength * 24 * 60 * 60 * 1000);
      const periodEnd = new Date(Date.now() - (i - 1) * periodLength * 24 * 60 * 60 * 1000);
      
      // Calculate metrics for this period (placeholder)
      const periodCampaigns = Math.floor(totalCampaigns / periods + Math.random() * 5);
      const periodEngagement = avgEngagement + (Math.random() - 0.5) * 2;
      const periodRevenue = Math.floor(totalRevenue / periods + Math.random() * 1000);

      let periodLabel;
      if (timeRange === '7d') {
        periodLabel = periodStart.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeRange === '90d') {
        periodLabel = `Week ${periods - i}`;
      } else if (timeRange === '1y') {
        periodLabel = periodStart.toLocaleDateString('en-US', { month: 'short' });
      } else {
        periodLabel = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      trendData.push({
        period: periodLabel,
        campaigns: periodCampaigns,
        engagement: Number(periodEngagement.toFixed(1)),
        revenue: periodRevenue,
      });
    }

    // Transform data to match CrossClientAnalytics interface
    const crossClientAnalytics = {
      organizationId,
      aggregateMetrics: {
        totalClients: clients.length,
        totalContent: totalContent,
        totalPublishedContent: Math.floor(totalContent * 0.8), // Estimate 80% published
        averageEngagement: avgEngagement,
        totalViews: Math.floor(totalContent * 150), // Estimate views per content
        totalClicks: Math.floor(totalContent * 50), // Estimate clicks per content
        averageConversionRate: clients.length > 0 
          ? clients.reduce((sum, client) => sum + ((client.monthlyBudget || 0) / 1000), 0) / clients.length 
          : 0
      },
      clientAnalytics: clients.map(client => {
        const campaigns = client.campaigns.length;
        const content = client.contents.length;
        const engagement = content * 2.5 + Math.random() * 5;
        
        return {
          clientId: client.id,
          clientName: client.name,
          clientType: client.type?.toLowerCase() as 'municipality' | 'business' | 'startup' | 'nonprofit' || 'business',
          contentMetrics: {
            totalContent: content,
            publishedContent: Math.floor(content * 0.8),
            draftContent: Math.floor(content * 0.2),
            avgEngagementRate: engagement,
            totalViews: content * 150,
            totalClicks: content * 50,
            conversionRate: Math.random() * 5 + 2,
            contentTypeBreakdown: {
              'social': Math.floor(content * 0.6),
              'blog': Math.floor(content * 0.3),
              'email': Math.floor(content * 0.1)
            }
          },
          engagementMetrics: {
            engagementRate: engagement,
            engagementGrowth: Math.random() * 20 - 5, // -5% to +15%
            averageEngagementPerPost: engagement / Math.max(content, 1),
            peakEngagementTimes: [
              { hour: 9, day: 'Monday', engagementRate: engagement * 1.2 },
              { hour: 15, day: 'Wednesday', engagementRate: engagement * 1.1 }
            ],
            engagementByPlatform: {
              'facebook': engagement * 0.4,
              'twitter': engagement * 0.3,
              'instagram': engagement * 0.3
            },
            audienceGrowthRate: Math.random() * 15 + 5 // 5% to 20%
          },
          performanceScore: Math.min(campaigns * 10 + content * 5 + (client.monthlyBudget || 0) / 100, 100),
          healthIndicators: {
            healthScore: Math.floor(Math.random() * 30 + 70), // 70-100
            riskFactors: Math.random() > 0.8 ? [
              {
                type: 'engagement_decline' as const,
                severity: 'medium' as const,
                description: 'Engagement rate has declined over the last 30 days',
                recommendedActions: ['Review content strategy', 'Increase posting frequency']
              }
            ] : [],
            opportunities: Math.random() > 0.7 ? [
              {
                type: 'performance_improvement' as const,
                potentialValue: Math.floor(Math.random() * 1000 + 500),
                probability: Math.random() * 0.3 + 0.5, // 50-80%
                description: 'Opportunity to increase posting frequency during peak hours',
                actionPlan: ['Schedule more posts between 9-11 AM', 'Focus on high-engagement content types']
              }
            ] : [],
            retentionRisk: Math.random() > 0.8 ? 'high' as const : Math.random() > 0.5 ? 'medium' as const : 'low' as const,
            satisfactionScore: Math.random() * 2 + 3, // 3-5
            engagementTrend: Math.random() > 0.6 ? 'up' as const : Math.random() > 0.3 ? 'stable' as const : 'down' as const
          },
          trendDirection: Math.random() > 0.6 ? 'up' as const : Math.random() > 0.3 ? 'stable' as const : 'down' as const
        };
      }),
      clientRankings: {
        byEngagement: clientComparison.find(c => c.metric === 'Engagement Rate')?.clients.map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          rank: c.rank,
          score: c.value,
          rankChange: Math.floor(Math.random() * 3 - 1), // -1, 0, or 1
          performanceIndicators: [
            {
              metric: 'engagement',
              value: c.value,
              benchmark: 3.5,
              status: c.value > 5 ? 'excellent' as const : c.value > 3.5 ? 'good' as const : 'average' as const,
              trend: c.change > 0 ? 'improving' as const : c.change < 0 ? 'declining' as const : 'stable' as const
            }
          ]
        })) || [],
        byGrowth: clientComparison.find(c => c.metric === 'Growth Rate')?.clients.map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          rank: c.rank,
          score: c.value,
          rankChange: Math.floor(Math.random() * 3 - 1),
          performanceIndicators: [
            {
              metric: 'growth',
              value: c.value,
              benchmark: 10,
              status: c.value > 20 ? 'excellent' as const : c.value > 10 ? 'good' as const : 'average' as const,
              trend: 'improving' as const
            }
          ]
        })) || [],
        byRevenue: clientComparison.find(c => c.metric === 'Total Revenue')?.clients.map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          rank: c.rank,
          score: c.value,
          rankChange: Math.floor(Math.random() * 3 - 1),
          performanceIndicators: [
            {
              metric: 'revenue',
              value: c.value,
              benchmark: 5000,
              status: c.value > 10000 ? 'excellent' as const : c.value > 5000 ? 'good' as const : 'average' as const,
              trend: 'stable' as const
            }
          ]
        })) || [],
        byOverallPerformance: clients.map((client, index) => ({
          clientId: client.id,
          clientName: client.name,
          rank: index + 1,
          score: Math.floor(Math.random() * 30 + 70),
          rankChange: Math.floor(Math.random() * 3 - 1),
          performanceIndicators: [
            {
              metric: 'overall',
              value: Math.floor(Math.random() * 30 + 70),
              benchmark: 60,
              status: 'good' as const,
              trend: 'stable' as const
            }
          ]
        }))
      },
      contentTypeDistribution: {
        'social': Math.floor(totalContent * 0.6),
        'blog': Math.floor(totalContent * 0.3),
        'email': Math.floor(totalContent * 0.1)
      },
      platformDistribution: {
        'facebook': Math.floor(totalContent * 0.4),
        'twitter': Math.floor(totalContent * 0.3),
        'instagram': Math.floor(totalContent * 0.3)
      },
      insights: [
        {
          id: 'insight-1',
          type: 'success' as const,
          title: 'Strong Cross-Client Performance',
          message: 'All clients are performing above industry benchmarks for engagement.',
          impact: 'high' as const,
          actionRequired: false,
          recommendedActions: []
        },
        {
          id: 'insight-2',
          type: 'info' as const,
          title: 'Growth Opportunity',
          message: 'Consider increasing posting frequency during peak engagement hours.',
          impact: 'medium' as const,
          actionRequired: true,
          recommendedActions: ['Schedule more posts between 9-11 AM', 'Focus on high-engagement content types']
        }
      ],
      trendAnalysis: [
        {
          metric: 'engagement',
          trend: 'up' as const,
          changePercent: avgEngagement > 5 ? 15.2 : 8.5,
          timeframe: timeRange,
          confidence: 0.85,
          factors: ['Improved content quality', 'Better posting times', 'Increased audience engagement']
        },
        {
          metric: 'reach',
          trend: 'stable' as const,
          changePercent: 2.1,
          timeframe: timeRange,
          confidence: 0.72,
          factors: ['Consistent posting schedule', 'Platform algorithm changes']
        },
        {
          metric: 'conversions',
          trend: 'up' as const,
          changePercent: 12.8,
          timeframe: timeRange,
          confidence: 0.91,
          factors: ['Improved call-to-action placement', 'Better targeting', 'Enhanced landing pages']
        }
      ]
    };

    return NextResponse.json(crossClientAnalytics);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}