import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/marketplace/clients - Get user's clients for boost purchase
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: dbUser.id,
        organizationId
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get clients that user has access to
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        industry: true,
        logoUrl: true,
        monthlyBudget: true,
        contractStartDate: true,
        contractEndDate: true,
        // Include recent boost purchases for context
        boostPurchases: {
          take: 3,
          orderBy: { purchaseDate: 'desc' },
          select: {
            id: true,
            purchaseDate: true,
            status: true,
            boostProduct: {
              select: {
                name: true,
                type: true
              }
            }
          }
        },
        // Include basic analytics for client context
        analytics: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            engagementRate: true,
            totalBudget: true,
            usedBudget: true,
            roi: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Transform data for frontend
    const transformedClients = clients.map(client => {
      const latestAnalytics = client.analytics[0];
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        type: client.type,
        industry: client.industry,
        logoUrl: client.logoUrl,
        monthlyBudget: client.monthlyBudget ? parseFloat(client.monthlyBudget.toString()) : null,
        contractPeriod: {
          start: client.contractStartDate,
          end: client.contractEndDate
        },
        recentBoosts: client.boostPurchases.map(purchase => ({
          id: purchase.id,
          productName: purchase.boostProduct.name,
          productType: purchase.boostProduct.type,
          purchaseDate: purchase.purchaseDate,
          status: purchase.status
        })),
        performance: latestAnalytics ? {
          engagementRate: parseFloat(latestAnalytics.engagementRate.toString()),
          budgetUtilization: latestAnalytics.totalBudget > 0 
            ? (parseFloat(latestAnalytics.usedBudget.toString()) / parseFloat(latestAnalytics.totalBudget.toString())) * 100
            : 0,
          roi: parseFloat(latestAnalytics.roi.toString())
        } : null,
        eligibleForBoosts: true, // Could add logic here to check boost eligibility
        recommendedBoostTypes: getRecommendedBoostTypes(client.type, client.industry, latestAnalytics)
      };
    });

    return NextResponse.json({
      clients: transformedClients,
      total: transformedClients.length
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to recommend boost types based on client profile
 */
function getRecommendedBoostTypes(clientType: string, industry: string | null, analytics: any): string[] {
  const recommendations: string[] = [];

  // Base recommendations by client type
  switch (clientType) {
    case 'municipality':
    case 'government':
      recommendations.push('awareness', 'engagement');
      break;
    case 'business':
    case 'enterprise':
      recommendations.push('conversion', 'reach');
      break;
    case 'startup':
    case 'creator':
      recommendations.push('reach', 'engagement');
      break;
    case 'nonprofit':
      recommendations.push('awareness', 'engagement');
      break;
    default:
      recommendations.push('engagement');
  }

  // Adjust based on performance if available
  if (analytics) {
    const engagementRate = parseFloat(analytics.engagementRate?.toString() || '0');
    const roi = parseFloat(analytics.roi?.toString() || '0');

    if (engagementRate < 2) {
      recommendations.unshift('engagement');
    }
    
    if (roi < 100) {
      recommendations.push('conversion');
    }

    if (engagementRate > 5 && roi > 200) {
      recommendations.push('premium');
    }
  }

  // Industry-specific recommendations
  if (industry) {
    switch (industry.toLowerCase()) {
      case 'retail':
      case 'ecommerce':
        recommendations.push('conversion');
        break;
      case 'healthcare':
      case 'education':
        recommendations.push('awareness');
        break;
      case 'technology':
      case 'saas':
        recommendations.push('reach', 'conversion');
        break;
    }
  }

  // Remove duplicates and return top 3
  return [...new Set(recommendations)].slice(0, 3);
}