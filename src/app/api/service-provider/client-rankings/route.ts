import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const sortBy = searchParams.get('sortBy') || 'performance';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const userOrg = await db.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get clients with performance data
    const clients = await db.client.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        campaigns: {
          where: {
            status: { in: ['ACTIVE', 'COMPLETED'] },
          },
        },
        contents: {
          where: {
            status: { in: ['PUBLISHED', 'SCHEDULED'] },
          },
        },
        _count: {
          select: {
            campaigns: true,
            contents: true,
          },
        },
      },
    });

    // Calculate rankings for each client
    const clientRankings = clients.map(client => {
      const activeCampaigns = client.campaigns.filter(c => c.status === 'ACTIVE').length;
      const totalCampaigns = client._count.campaigns;
      const publishedContent = client.contents.filter(c => c.status === 'PUBLISHED').length;
      const revenue = client.monthlyBudget || 0;

      // Performance Score Calculation (0-100)
      const campaignScore = Math.min((activeCampaigns / Math.max(totalCampaigns, 1)) * 30, 30);
      const contentScore = Math.min(publishedContent * 2, 40);
      const revenueScore = Math.min((revenue / 10000) * 20, 20);
      const consistencyScore = Math.min(Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7)), 10);
      
      const performanceScore = campaignScore + contentScore + revenueScore + consistencyScore;

      // Engagement Rate Calculation (placeholder algorithm)
      const baseEngagement = 3.5; // Base engagement rate
      const contentBonus = Math.min(publishedContent * 0.3, 4);
      const activityBonus = Math.min(activeCampaigns * 0.5, 3);
      const randomVariation = (Math.random() - 0.5) * 2; // ±1% variation
      
      const engagementRate = baseEngagement + contentBonus + activityBonus + randomVariation;

      // Trend Calculation (placeholder)
      const trendTypes = ['up', 'down', 'stable'] as const;
      const trend = trendTypes[Math.floor(Math.random() * trendTypes.length)];
      const trendValue = trend === 'stable' 
        ? Math.random() * 2 - 1 // -1 to +1 for stable
        : trend === 'up' 
          ? Math.random() * 15 + 2  // 2-17% for up
          : -(Math.random() * 10 + 1); // -1 to -11% for down

      return {
        id: client.id,
        name: client.name,
        type: client.industry || 'General',
        performanceScore: Number(performanceScore.toFixed(1)),
        engagementRate: Number(Math.max(engagementRate, 0).toFixed(1)),
        revenue,
        campaignsActive: activeCampaigns,
        trend,
        trendValue: Number(trendValue.toFixed(1)),
        // Additional fields for sorting
        totalCampaigns,
        publishedContent,
        createdAt: client.createdAt,
      };
    });

    // Sort based on the requested criteria
    let sortedRankings;
    switch (sortBy) {
      case 'engagement':
        sortedRankings = clientRankings.sort((a, b) => b.engagementRate - a.engagementRate);
        break;
      case 'revenue':
        sortedRankings = clientRankings.sort((a, b) => b.revenue - a.revenue);
        break;
      case 'performance':
      default:
        sortedRankings = clientRankings.sort((a, b) => b.performanceScore - a.performanceScore);
        break;
    }

    // Add rank and previous rank (simulated)
    const rankedClients = sortedRankings.map((client, index) => {
      // Simulate previous rank (in real implementation, this would come from stored historical data)
      const currentRank = index + 1;
      const previousRank = currentRank + Math.floor(Math.random() * 3 - 1); // Random ±1 rank change
      
      return {
        ...client,
        rank: currentRank,
        previousRank: Math.max(previousRank, 1),
      };
    });

    return NextResponse.json(rankedClients);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}