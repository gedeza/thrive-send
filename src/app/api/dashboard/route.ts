import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getAnalyticsAggregator } from '@/lib/analytics/data-aggregator';

// Enhanced interfaces for main dashboard
interface DashboardMetrics {
  totalSubscribers: number;
  subscriberGrowth: number;
  averageOpenRate: number;
  averageClickRate: number;
  activeCampaigns: number;
  scheduledCampaigns: number;
  totalContent: number;
  publishedContent: number;
  pendingApprovals: number;
  engagementRate: number;
  deliveryRate: number;
  unsubscribeRate: number;
}

interface CampaignSummary {
  id: string;
  name: string;
  type: string;
  status: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriberGrowthData {
  month: string;
  count: number;
  date: string;
  growth: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  entityName: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface DashboardResponse {
  organizationId: string;
  organizationName: string;
  metrics: DashboardMetrics;
  campaigns: CampaignSummary[];
  subscriberGrowth: SubscriberGrowthData[];
  recentActivity: RecentActivity[];
  performanceInsights: {
    bestPerformingCampaign: string | null;
    recommendedSendTime: string;
    audienceSegmentPerformance: any[];
  };
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const dateRange = searchParams.get('dateRange') || '30d';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and organization
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine organization to use
    let dbOrganizationId: string;
    let organization;

    if (organizationId) {
      // Use provided organization ID (for service providers)
      organization = organizationId.startsWith('org_') 
        ? await db.organization.findUnique({ where: { clerkOrganizationId: organizationId } })
        : await db.organization.findUnique({ where: { id: organizationId } });
    } else {
      // Use user's primary organization
      const membership = await db.organizationMember.findFirst({
        where: { userId: user.id },
        include: { organization: true }
      });
      organization = membership?.organization;
    }

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    dbOrganizationId = organization.id;

    // Verify user has access to this organization
    const userMembership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: dbOrganizationId,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate date range for queries
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // OPTIMIZED: Single comprehensive query for all dashboard data
    const [dashboardData, analyticsData] = await Promise.all([
      // Core dashboard data
      db.organization.findUnique({
        where: { id: dbOrganizationId },
        select: {
          id: true,
          name: true,
          campaigns: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              content: {
                select: {
                  id: true,
                  analytics: {
                    select: {
                      totalSent: true,
                      opened: true,
                      clicked: true,
                      delivered: true,
                      unsubscribed: true,
                    }
                  }
                }
              }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
          },
          content: {
            where: {
              createdAt: {
                gte: startDate
              }
            },
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              analytics: {
                select: {
                  totalSent: true,
                  opened: true,
                  clicked: true,
                  delivered: true,
                }
              }
            },
            orderBy: { updatedAt: 'desc' }
          },
          audiences: {
            select: {
              id: true,
              subscribers: {
                select: {
                  id: true,
                  createdAt: true,
                  status: true
                }
              }
            }
          }
        }
      }),

      // Analytics aggregation
      db.contentAnalytics.aggregate({
        where: {
          content: {
            organizationId: dbOrganizationId,
            createdAt: {
              gte: startDate
            }
          }
        },
        _sum: {
          totalSent: true,
          opened: true,
          clicked: true,
          delivered: true,
          unsubscribed: true,
        },
        _avg: {
          openRate: true,
          clickRate: true,
          deliveryRate: true,
          unsubscribeRate: true,
        }
      })
    ]);

    if (!dashboardData) {
      return NextResponse.json({ error: 'Organization data not found' }, { status: 404 });
    }

    // Process campaign data
    const campaigns = dashboardData.campaigns;
    const content = dashboardData.content;
    
    // Calculate total subscribers across all audiences
    const totalSubscribers = dashboardData.audiences.reduce((total, audience) => {
      return total + audience.subscribers.filter(sub => sub.status === 'ACTIVE').length;
    }, 0);

    // Calculate subscriber growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const subscribersThirtyDaysAgo = dashboardData.audiences.reduce((total, audience) => {
      return total + audience.subscribers.filter(sub => 
        sub.status === 'ACTIVE' && sub.createdAt <= thirtyDaysAgo
      ).length;
    }, 0);

    const subscriberGrowth = subscribersThirtyDaysAgo > 0 
      ? ((totalSubscribers - subscribersThirtyDaysAgo) / subscribersThirtyDaysAgo) * 100 
      : 0;

    // Count active and scheduled campaigns
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
    const scheduledCampaigns = campaigns.filter(c => c.status === 'SCHEDULED').length;
    
    // Count content metrics
    const totalContent = content.length;
    const publishedContent = content.filter(c => c.status === 'PUBLISHED').length;
    const pendingApprovals = content.filter(c => c.status === 'PENDING_REVIEW').length;

    // Build metrics object
    const metrics: DashboardMetrics = {
      totalSubscribers,
      subscriberGrowth: Math.round(subscriberGrowth * 100) / 100,
      averageOpenRate: analyticsData._avg.openRate || 0,
      averageClickRate: analyticsData._avg.clickRate || 0,
      activeCampaigns,
      scheduledCampaigns,
      totalContent,
      publishedContent,
      pendingApprovals,
      engagementRate: analyticsData._avg.clickRate || 0,
      deliveryRate: analyticsData._avg.deliveryRate || 0,
      unsubscribeRate: analyticsData._avg.unsubscribeRate || 0,
    };

    // Build campaign summaries
    const campaignSummaries: CampaignSummary[] = campaigns.slice(0, 5).map(campaign => {
      // Aggregate analytics across all content in the campaign
      const analytics = campaign.content.reduce((acc, content) => {
        if (content.analytics) {
          acc.sent += content.analytics.totalSent || 0;
          acc.opened += content.analytics.opened || 0;
          acc.clicked += content.analytics.clicked || 0;
          acc.delivered += content.analytics.delivered || 0;
        }
        return acc;
      }, { sent: 0, opened: 0, clicked: 0, delivered: 0 });

      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type || 'EMAIL',
        status: campaign.status,
        sent: analytics.sent,
        opened: analytics.opened,
        clicked: analytics.clicked,
        openRate: analytics.sent > 0 ? (analytics.opened / analytics.sent) * 100 : 0,
        clickRate: analytics.sent > 0 ? (analytics.clicked / analytics.sent) * 100 : 0,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      };
    });

    // Generate subscriber growth data for the last 6 months
    const subscriberGrowthData: SubscriberGrowthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const subscribersAtMonth = dashboardData.audiences.reduce((total, audience) => {
        return total + audience.subscribers.filter(sub => 
          sub.status === 'ACTIVE' && 
          sub.createdAt <= monthEnd
        ).length;
      }, 0);

      const previousMonthSubscribers = i === 5 ? 0 : subscriberGrowthData[subscriberGrowthData.length - 1]?.count || 0;
      const growth = previousMonthSubscribers > 0 
        ? ((subscribersAtMonth - previousMonthSubscribers) / previousMonthSubscribers) * 100 
        : 0;

      subscriberGrowthData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        count: subscribersAtMonth,
        date: monthStart.toISOString().split('T')[0],
        growth: Math.round(growth * 100) / 100,
      });
    }

    // Build recent activity from campaigns and content
    const recentActivity: RecentActivity[] = [
      // Recent campaigns
      ...campaigns.filter(c => c.createdAt >= startDate).slice(0, 3).map(campaign => ({
        id: `campaign-${campaign.id}`,
        type: 'campaign_created',
        description: `New ${campaign.type.toLowerCase()} campaign created`,
        entityName: campaign.name,
        timestamp: campaign.createdAt,
        status: campaign.status === 'ACTIVE' ? 'success' as const : 'info' as const
      })),
      
      // Recent content
      ...content.filter(c => c.status === 'PUBLISHED').slice(0, 3).map(item => ({
        id: `content-${item.id}`,
        type: 'content_published',
        description: `${item.type} content published`,
        entityName: item.title,
        timestamp: item.updatedAt,
        status: 'success' as const
      })),
      
      // Pending approvals
      ...content.filter(c => c.status === 'PENDING_REVIEW').slice(0, 2).map(item => ({
        id: `approval-${item.id}`,
        type: 'approval_pending',
        description: `${item.type} content awaiting review`,
        entityName: item.title,
        timestamp: item.updatedAt,
        status: 'warning' as const
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    // Performance insights
    const bestPerformingCampaign = campaignSummaries.length > 0 
      ? campaignSummaries.reduce((best, current) => 
          current.openRate > best.openRate ? current : best
        ).name
      : null;

    const response: DashboardResponse = {
      organizationId: organization.id,
      organizationName: organization.name,
      metrics,
      campaigns: campaignSummaries,
      subscriberGrowth: subscriberGrowthData,
      recentActivity,
      performanceInsights: {
        bestPerformingCampaign,
        recommendedSendTime: 'Tuesday at 10:00 AM', // Could be calculated from analytics
        audienceSegmentPerformance: [], // Could be populated with segment data
      },
    };

    // Add cache headers for improved performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}