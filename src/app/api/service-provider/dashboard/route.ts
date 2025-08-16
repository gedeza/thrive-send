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

    // Enhanced metrics calculation
    const metrics: ServiceProviderMetrics = {
      totalClients: 3, // Demo data - would be calculated from client_accounts table
      activeClients: 3,
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

    // Generate demo client summary data
    const clientSummary: ClientSummary[] = [
      {
        id: 'demo-client-1',
        name: 'City of Springfield',
        type: 'municipality',
        status: 'ACTIVE',
        performanceScore: 87.5,
        trendDirection: 'up',
        activeCampaigns: 12,
        engagementRate: 4.2,
        monthlyBudget: 5000,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 'demo-client-2',
        name: 'TechStart Inc.',
        type: 'startup',
        status: 'ACTIVE',
        performanceScore: 92.1,
        trendDirection: 'up',
        activeCampaigns: 8,
        engagementRate: 6.8,
        monthlyBudget: 3000,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: 'demo-client-3',
        name: 'Local Coffee Co.',
        type: 'business',
        status: 'ACTIVE',
        performanceScore: 76.3,
        trendDirection: 'stable',
        activeCampaigns: 5,
        engagementRate: 3.9,
        monthlyBudget: 1500,
        lastActivity: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
    ];

    // Generate demo recent activity
    const recentActivity: Activity[] = [
      {
        id: 'activity-1',
        type: 'campaign_created',
        description: 'New campaign "Holiday Promotion" created',
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        severity: 'success',
      },
      {
        id: 'activity-2',
        type: 'content_published',
        description: 'Social media post published successfully',
        clientId: 'demo-client-2',
        clientName: 'TechStart Inc.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        severity: 'success',
      },
      {
        id: 'activity-3',
        type: 'approval_pending',
        description: 'Content awaiting approval from client',
        clientId: 'demo-client-3',
        clientName: 'Local Coffee Co.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        severity: 'warning',
      },
      {
        id: 'activity-4',
        type: 'team_assigned',
        description: 'Team member assigned to new project',
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        severity: 'info',
      },
      {
        id: 'activity-5',
        type: 'milestone_reached',
        description: 'Reached 10K followers milestone',
        clientId: 'demo-client-2',
        clientName: 'TechStart Inc.',
        timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
        severity: 'success',
      },
    ];

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