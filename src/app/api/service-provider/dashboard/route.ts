import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Enhanced interfaces from TDD
interface ServiceProviderMetrics {
  totalClients: number;
  activeClients: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  marketplaceRevenue: number;
  teamUtilization: number;
  avgClientSatisfaction: number;
  
  // Enhanced metrics
  monthlyRecurringRevenue: number;
  averageClientValue: number;
  churnRate: number;
  growthRate: number;
}

interface ClientSummary {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'startup' | 'creator';
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED';
  logoUrl?: string;
  performanceScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  activeCampaigns: number;
  engagementRate: number;
  monthlyBudget: number;
  lastActivity: Date;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  clientId?: string;
  clientName?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface DashboardResponse {
  organizationId: string;
  organizationName: string;
  organizationType: 'service_provider' | 'enterprise';
  metrics: ServiceProviderMetrics;
  clientSummary: ClientSummary[];
  recentActivity: Activity[];
  performanceTrends: any[];
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // OPTIMIZED: Single query to get organization, user access, and all related data
    const [orgExists, user] = await Promise.all([
      // Organization lookup with fallback
      organizationId.startsWith('org_') 
        ? db.organization.findUnique({ where: { clerkOrganizationId: organizationId } })
        : db.organization.findUnique({ where: { id: organizationId } }),
      
      // User lookup
      db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    ]);

    if (!orgExists || !user) {
      return NextResponse.json({ 
        error: !orgExists ? 'Organization not found' : 'User not found' 
      }, { status: 404 });
    }

    const dbOrganizationId = orgExists.id;

    // OPTIMIZED: Single comprehensive query for all dashboard data
    const [userMembership, dashboardData] = await Promise.all([
      // User access verification
      db.organizationMember.findFirst({
        where: { userId: user.id, organizationId: dbOrganizationId },
        select: { id: true }
      }),
      
      // Single query for all dashboard data with optimized includes
      db.organization.findUnique({
        where: { id: dbOrganizationId },
        select: {
          id: true,
          name: true,
          type: true,
          campaigns: {
            select: {
              id: true,
              name: true,
              status: true,
              budget: true,
              createdAt: true,
              clientId: true,
              client: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          content: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
          },
          members: {
            select: { id: true },
            take: 1
          },
          clients: {
            select: {
              id: true,
              name: true,
              status: true,
              industry: true,
              monthlyBudget: true,
              updatedAt: true,
              campaigns: {
                where: { status: 'active' },
                select: { 
                  id: true,
                  content: {
                    where: {
                      publishedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      }
                    },
                    select: { 
                      id: true, 
                      updatedAt: true,
                      analytics: {
                        select: { engagementRate: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!dashboardData) {
      return NextResponse.json({ error: 'Dashboard data not found' }, { status: 404 });
    }

    // OPTIMIZED: Calculate metrics from single query result
    const clients = dashboardData.clients;
    const campaigns = dashboardData.campaigns;
    const content = dashboardData.content;
    
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const publishedContent = content.filter(c => c.status === 'PUBLISHED').length;

    const metrics: ServiceProviderMetrics = {
      totalClients: clients.length,
      activeClients: clients.filter(client => client.status === 'ACTIVE').length,
      totalCampaigns,
      activeCampaigns,
      totalRevenue: 15250, // Demo calculation
      marketplaceRevenue: 2280, // Demo calculation
      teamUtilization: 89, // Demo calculation
      avgClientSatisfaction: 4.3, // Demo calculation
      
      // Enhanced metrics
      monthlyRecurringRevenue: 12500,
      averageClientValue: 5083,
      churnRate: 2.1,
      growthRate: 12.5,
    };

    // OPTIMIZED: Process client summary from existing data
    const clientSummary: ClientSummary[] = clients.map(client => {
      const activeCampaigns = client.campaigns.length;
      
      // Get all content from all campaigns
      const allContent = client.campaigns.flatMap(campaign => campaign.content);
      const avgEngagement = allContent.length > 0 
        ? allContent.reduce((sum, content) => sum + (content.analytics?.engagementRate || 0), 0) / allContent.length
        : 0;
      const lastActivity = allContent.length > 0
        ? new Date(Math.max(...allContent.map(c => new Date(c.updatedAt).getTime())))
        : new Date(client.updatedAt);
      
      return {
        id: client.id,
        name: client.name,
        type: (client.industry as any) || 'business',
        status: client.status as 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED',
        performanceScore: Math.min(95, Math.max(65, avgEngagement * 20 + activeCampaigns * 2)),
        trendDirection: avgEngagement > 5 ? 'up' : avgEngagement > 3 ? 'stable' : 'down',
        activeCampaigns,
        engagementRate: avgEngagement,
        monthlyBudget: Number(client.monthlyBudget || 0),
        lastActivity
      };
    });

    // OPTIMIZED: Build recent activities from existing data (no additional queries)
    const recentActivity: Activity[] = [
      // Recent campaigns (already filtered and sorted)
      ...campaigns
        .filter(campaign => campaign.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .slice(0, 5)
        .map(campaign => ({
          id: `campaign-${campaign.id}`,
          type: 'campaign_created',
          description: `New campaign "${campaign.name}" created`,
          clientId: campaign.clientId || 'unknown',
          clientName: campaign.client?.name || 'Unknown Client',
          timestamp: campaign.createdAt,
          severity: 'success' as const
        })),
      
      // Recent content (already filtered and sorted)
      ...content
        .filter(item => item.updatedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .slice(0, 5)
        .map(item => ({
          id: `content-${item.id}`,
          type: item.status === 'PUBLISHED' ? 'content_published' : 
                item.status === 'PENDING_REVIEW' ? 'approval_pending' : 'content_updated',
          description: item.status === 'PUBLISHED' 
            ? `Content "${item.title}" published successfully`
            : item.status === 'PENDING_REVIEW'
            ? `Content "${item.title}" awaiting approval`
            : `Content "${item.title}" updated`,
          clientId: undefined,
          clientName: undefined,
          timestamp: item.updatedAt,
          severity: item.status === 'PUBLISHED' ? 'success' as const :
                   item.status === 'PENDING_REVIEW' ? 'warning' as const : 'info' as const
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    // Generate demo performance trends
    const performanceTrends = [
      { date: '2025-01-01', clients: 3, campaigns: 20, revenue: 12000 },
      { date: '2025-01-02', clients: 3, campaigns: 22, revenue: 12500 },
      { date: '2025-01-03', clients: 3, campaigns: 25, revenue: 13200 },
      { date: '2025-01-04', clients: 3, campaigns: 25, revenue: 15250 },
    ];

    const response: DashboardResponse = {
      organizationId: dashboardData.id,
      organizationName: dashboardData.name,
      organizationType: (dashboardData.type as 'service_provider' | 'enterprise') || 'service_provider',
      metrics,
      clientSummary,
      recentActivity,
      performanceTrends,
    };

    // Add cache headers for improved performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        'X-Response-Time': Date.now() - request.headers.get('x-start-time') || '0'
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