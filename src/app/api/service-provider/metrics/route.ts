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

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get user's database ID and verify organization access (same pattern as audience API)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Apply same organization lookup logic as audience API
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
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: dbOrganizationId,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: dbOrganizationId },
      include: {
        clients: {
          where: { status: 'ACTIVE' },
          include: {
            _count: {
              select: {
                campaigns: true,
                content: true,
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
      client._count.campaigns > 0 || client._count.content > 0
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