import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

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

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        clients: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                campaigns: true,
                contents: true,
              },
            },
          },
        },
        campaigns: {
          where: { 
            status: { in: ['ACTIVE', 'SCHEDULED'] },
          },
        },
        _count: {
          select: {
            campaigns: true,
            clients: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Calculate metrics
    const totalClients = organization.clients.length;
    const activeClients = organization.clients.filter(client => 
      client._count.campaigns > 0 || client._count.contents > 0
    ).length;

    const activeCampaigns = organization.campaigns.filter(c => c.status === 'ACTIVE').length;
    const totalCampaigns = organization._count.campaigns;

    // Calculate revenue (placeholder - implement based on your pricing model)
    const totalRevenue = organization.clients.reduce((sum, client) => {
      return sum + (client.monthlyBudget || 0);
    }, 0);

    // Calculate team utilization (placeholder)
    const teamUtilization = Math.min(Math.round((activeClients / Math.max(totalClients, 1)) * 100), 100);

    // Calculate average client satisfaction (placeholder)
    const avgClientSatisfaction = 4.2; // This would come from actual satisfaction surveys

    // Marketplace revenue (placeholder)
    const marketplaceRevenue = Math.round(totalRevenue * 0.15); // 15% commission example

    const metrics = {
      totalClients,
      activeClients,
      activeCampaigns,
      totalCampaigns,
      totalRevenue,
      marketplaceRevenue,
      teamUtilization,
      avgClientSatisfaction,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Service provider metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}