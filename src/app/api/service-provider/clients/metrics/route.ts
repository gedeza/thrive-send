import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // For demo purposes, return demo metrics immediately
    const demoMetrics = {
      totalClients: 3,
      activeClients: 3,
      newClientsThisMonth: 1,
      clientGrowth: 25,
      averagePerformanceScore: 85,
      topPerformingClients: [
        { id: 'demo-client-1', name: 'City of Springfield', performanceScore: 92, logoUrl: null },
        { id: 'demo-client-2', name: 'TechStart Inc.', performanceScore: 88, logoUrl: null },
        { id: 'demo-client-3', name: 'Local Coffee Co.', performanceScore: 76, logoUrl: null }
      ],
      projects: {
        total: 4,
        active: 2,
        completed: 1,
        completionRate: 75,
      },
      clientsByType: {
        'MUNICIPALITY': 1,
        'STARTUP': 1,
        'BUSINESS': 1,
      },
      clientsByStatus: {
        active: 3,
        inactive: 0,
      },
    };
    
    return NextResponse.json({
      data: demoMetrics,
    });

    // TODO: Re-enable database queries later when schema is stable  
    /*
    // Get all clients for metrics calculation
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        campaigns: {
          where: {
            status: { in: ['ACTIVE', 'SCHEDULED', 'COMPLETED'] },
          },
        },
        projects: {
          where: {
            status: { in: ['ACTIVE', 'PLANNED', 'COMPLETED'] },
          },
        },
        _count: {
          select: {
            campaigns: true,
            projects: true,
          },
        },
      },
    });
    
    // Calculate aggregated metrics
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
    
    // Calculate new clients this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newClientsThisMonth = clients.filter(c => c.createdAt > oneMonthAgo).length;
    
    // Calculate client growth rate
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const clientsTwoMonthsAgo = clients.filter(c => c.createdAt < oneMonthAgo).length;
    const clientGrowth = clientsTwoMonthsAgo > 0 
      ? Math.round(((totalClients - clientsTwoMonthsAgo) / clientsTwoMonthsAgo) * 100)
      : 0;

    // Calculate average performance score (placeholder algorithm)
    const performanceScores = clients.map(client => {
      const activeCampaigns = client.campaigns.filter(c => c.status === 'ACTIVE').length;
      const totalCampaigns = client._count.campaigns;
      const activeProjects = client.projects.filter(p => p.status === 'ACTIVE').length;

      const campaignScore = Math.min((activeCampaigns / Math.max(totalCampaigns, 1)) * 40, 40);
      const projectScore = Math.min(activeProjects * 3, 30);
      const timeScore = Math.max(30 - Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)), 0);
      
      return Math.min(campaignScore + projectScore + timeScore, 100);
    });

    const averagePerformanceScore = performanceScores.length > 0 
      ? Math.round(performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length)
      : 0;

    // Get top performing clients
    const clientsWithScores = clients.map((client, index) => ({
      ...client,
      performanceScore: performanceScores[index],
    }));

    const topPerformingClients = clientsWithScores
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5)
      .map(client => ({
        id: client.id,
        name: client.name,
        performanceScore: client.performanceScore,
        logoUrl: client.logoUrl,
      }));

    // Calculate projects metrics
    const allCampaigns = clients.flatMap(c => c.campaigns);
    const activeCampaignsCount = allCampaigns.filter(c => c.status === 'ACTIVE').length;
    const completedCampaignsCount = allCampaigns.filter(c => c.status === 'COMPLETED').length;
    const totalCampaignsCount = allCampaigns.length;
    const completionRate = totalCampaignsCount > 0 
      ? Math.round((completedCampaignsCount / totalCampaignsCount) * 100)
      : 0;

    const metrics = {
      totalClients,
      activeClients,
      newClientsThisMonth,
      clientGrowth,
      averagePerformanceScore,
      topPerformingClients,
      projects: {
        total: totalCampaignsCount,
        active: activeCampaignsCount,
        completed: completedCampaignsCount,
        completionRate,
      },
      clientsByType: clients.reduce((acc, client) => {
        const type = client.industry || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      clientsByStatus: {
        active: activeClients,
        inactive: totalClients - activeClients,
      },
    };

    // For demo purposes, if no clients exist, return demo metrics
    if (totalClients === 0) {
      const demoMetrics = {
        totalClients: 3,
        activeClients: 3,
        newClientsThisMonth: 1,
        clientGrowth: 25,
        averagePerformanceScore: 85,
        topPerformingClients: [
          { id: 'demo-client-1', name: 'City of Springfield', performanceScore: 92, logoUrl: null },
          { id: 'demo-client-2', name: 'TechStart Inc.', performanceScore: 88, logoUrl: null },
          { id: 'demo-client-3', name: 'Local Coffee Co.', performanceScore: 76, logoUrl: null }
        ],
        projects: {
          total: 4,
          active: 2,
          completed: 1,
          completionRate: 75,
        },
        clientsByType: {
          'MUNICIPALITY': 1,
          'STARTUP': 1,
          'BUSINESS': 1,
        },
        clientsByStatus: {
          active: 3,
          inactive: 0,
        },
      };
      
      return NextResponse.json({
        data: demoMetrics,
      });
    }

    return NextResponse.json({
      data: metrics,
    });
    */ // End of commented database code

  } catch (error) {
    console.error('Error fetching service provider client metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client metrics' },
      { status: 500 }
    );
  }
}