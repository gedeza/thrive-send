import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    const analyticsData = {
      totalPerformance,
      clientComparison,
      trendData,
      timeRange,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Cross-client analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}