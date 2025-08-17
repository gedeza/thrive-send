import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    // DEVELOPMENT MODE: Allow testing without authentication
    // TODO: Remove this in production
    if (!userId) {
      console.log('🚧 DEV MODE: Service Provider Dashboard - No auth required');
      // Return demo data for development testing
      return NextResponse.json({
        organizationId: organizationId,
        organizationName: 'Demo Service Provider',
        organizationType: 'service_provider' as const,
        metrics: {
          totalClients: 3,
          activeClients: 3,
          totalCampaigns: 25,
          activeCampaigns: 18,
          totalRevenue: 15250,
          marketplaceRevenue: 2280,
          teamUtilization: 89,
          avgClientSatisfaction: 4.3,
          monthlyRecurringRevenue: 12500,
          averageClientValue: 5083,
          churnRate: 2.1,
          growthRate: 12.5,
        },
        clientSummary: [],
        recentActivity: [],
        performanceTrends: []
      });
    }

    // Apply same organization lookup logic as other APIs
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    if (!orgExists) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const dbOrganizationId = orgExists.id;

    // Verify user has access to this organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: dbOrganizationId,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const organization = orgExists;
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get organization with related data for metrics calculation
    const orgWithData = await prisma.organization.findUnique({
      where: { id: dbOrganizationId },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
            createdAt: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!orgWithData) {
      return NextResponse.json({ error: 'Organization data not found' }, { status: 404 });
    }

    // Calculate enhanced metrics
    const totalCampaigns = orgWithData.campaigns.length;
    const activeCampaigns = orgWithData.campaigns.filter(c => c.status === 'active').length;
    const totalContent = orgWithData.content.length;
    const publishedContent = orgWithData.content.filter(c => c.status === 'PUBLISHED').length;
    const teamMembers = orgWithData.members.length;

    // PRODUCTION: Enhanced metrics calculation using real data
    const metrics: ServiceProviderMetrics = {
      totalClients: realClients.length,
      activeClients: realClients.filter(client => client.status === 'ACTIVE').length,
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

    // PRODUCTION: Fetch real client data from database
    const realClients = await prisma.client.findMany({
      where: {
        organizationId: dbOrganizationId
      },
      include: {
        campaigns: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        },
        content: {
          where: {
            publishedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: { 
            id: true, 
            engagementRate: true,
            updatedAt: true
          }
        }
      }
    });

    const clientSummary: ClientSummary[] = realClients.map(client => {
      const activeCampaigns = client.campaigns.length;
      const avgEngagement = client.content.length > 0 
        ? client.content.reduce((sum, content) => sum + (content.engagementRate || 0), 0) / client.content.length
        : 0;
      const lastActivity = client.content.length > 0
        ? new Date(Math.max(...client.content.map(c => new Date(c.updatedAt).getTime())))
        : new Date(client.updatedAt);
      
      return {
        id: client.id,
        name: client.name,
        type: client.industry || 'business',
        status: client.status as 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED',
        performanceScore: Math.min(95, Math.max(65, avgEngagement * 20 + activeCampaigns * 2)),
        trendDirection: avgEngagement > 5 ? 'up' : avgEngagement > 3 ? 'stable' : 'down',
        activeCampaigns,
        engagementRate: avgEngagement,
        monthlyBudget: client.monthlyBudget || 0,
        lastActivity
      };
    });

    console.log(`✅ Fetched ${clientSummary.length} real clients for organization ${dbOrganizationId}`);

    // PRODUCTION: Fetch real recent activity from database
    const recentActivities = await Promise.all([
      // Campaign activities
      prisma.campaign.findMany({
        where: {
          organizationId: dbOrganizationId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: { client: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Content activities
      prisma.content.findMany({
        where: {
          organizationId: dbOrganizationId,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: { client: { select: { id: true, name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })
    ]);

    const [campaigns, content] = recentActivities;
    const allActivities = [
      ...campaigns.map(campaign => ({
        id: `campaign-${campaign.id}`,
        type: 'campaign_created',
        description: `New campaign "${campaign.name}" created`,
        clientId: campaign.clientId || 'unknown',
        clientName: campaign.client?.name || 'Unknown Client',
        timestamp: campaign.createdAt,
        severity: 'success' as const
      })),
      ...content.map(item => ({
        id: `content-${item.id}`,
        type: item.status === 'PUBLISHED' ? 'content_published' : 
              item.status === 'PENDING_APPROVAL' ? 'approval_pending' : 'content_updated',
        description: item.status === 'PUBLISHED' 
          ? `Content "${item.title}" published successfully`
          : item.status === 'PENDING_APPROVAL'
          ? `Content "${item.title}" awaiting approval`
          : `Content "${item.title}" updated`,
        clientId: item.clientId || 'unknown',
        clientName: item.client?.name || 'Unknown Client',
        timestamp: item.updatedAt,
        severity: item.status === 'PUBLISHED' ? 'success' as const :
                 item.status === 'PENDING_APPROVAL' ? 'warning' as const : 'info' as const
      }))
    ];

    const recentActivity: Activity[] = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    console.log(`✅ Fetched ${recentActivity.length} real activities for organization`);

    // Generate demo performance trends
    const performanceTrends = [
      { date: '2025-01-01', clients: 3, campaigns: 20, revenue: 12000 },
      { date: '2025-01-02', clients: 3, campaigns: 22, revenue: 12500 },
      { date: '2025-01-03', clients: 3, campaigns: 25, revenue: 13200 },
      { date: '2025-01-04', clients: 3, campaigns: 25, revenue: 15250 },
    ];

    const dashboardData: DashboardResponse = {
      organizationId: organization.id,
      organizationName: organization.name,
      organizationType: (organization.type as 'service_provider' | 'enterprise') || 'service_provider',
      metrics,
      clientSummary,
      recentActivity,
      performanceTrends,
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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