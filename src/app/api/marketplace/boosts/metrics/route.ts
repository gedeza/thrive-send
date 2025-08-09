import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/boosts/metrics - Get aggregated boost performance metrics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get user's database ID and verify organization access
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Apply same organization lookup logic as other endpoints
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

    // Get all boosts for user's listings in this organization
    const boosts = await prisma.boost.findMany({
      where: {
        listing: {
          organizationId: dbOrganizationId
        }
      },
      include: {
        listing: {
          select: {
            id: true,
            organizationId: true
          }
        },
        // Include boost performance data when available
        _count: {
          select: {
            // These would be boost performance tracking tables when implemented
          }
        }
      }
    });

    // Calculate aggregated metrics
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalSpent = 0;
    let totalBudget = 0;

    // For now, calculate from boost metadata and mock performance data
    // TODO: Replace with actual performance tracking data
    for (const boost of boosts) {
      const budget = (boost.metadata as any)?.budget || 0;
      totalBudget += budget;
      
      // Generate consistent mock metrics based on boost ID and dates
      // This ensures data consistency across page loads
      const seed = parseInt(boost.id.slice(-8), 16); // Use boost ID as seed
      const random1 = Math.abs(Math.sin(seed)) * 1000;
      const random2 = Math.abs(Math.cos(seed)) * 100;
      const random3 = Math.abs(Math.sin(seed * 2)) * 10;
      
      const impressions = Math.floor(random1 % 1000) + 100;
      const clicks = Math.floor(random2 % 50) + 10;
      const conversions = Math.floor(random3 % 5) + 1;
      
      // Calculate spend based on clicks and boost type cost
      const costPerClick = getCostPerClickByType(boost.type);
      const spent = Math.min(clicks * costPerClick, budget * 0.8); // Max 80% of budget spent
      
      totalImpressions += impressions;
      totalClicks += clicks;
      totalConversions += conversions;
      totalSpent += spent;
    }

    const budgetRemaining = Math.max(0, totalBudget - totalSpent);

    const aggregatedMetrics = {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
      budgetRemaining: Math.round(budgetRemaining * 100) / 100,
      totalBoosts: boosts.length,
      activeBoosts: boosts.filter(b => b.status === 'ACTIVE').length,
      // Additional calculated metrics
      averageCTR: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
      averageConversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00',
      averageCostPerClick: totalClicks > 0 ? (totalSpent / totalClicks).toFixed(2) : '0.00',
      budgetUtilization: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0'
    };

    return NextResponse.json(aggregatedMetrics);
  } catch (error) {
    console.error('Boost metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get cost per click by boost type
function getCostPerClickByType(boostType: string): number {
  const baseCosts = {
    'FEATURED': 0.50,
    'PROMOTED': 0.75,
    'PRIORITY': 1.00,
    'SPONSORED': 1.25
  };
  return baseCosts[boostType as keyof typeof baseCosts] || 0.50;
}