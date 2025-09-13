import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/marketplace/products - Get boost products for marketplace
 * Query parameters:
 * - organizationId: Filter by organization (optional)
 * - category: Filter by category (optional) 
 * - type: Filter by boost type (optional)
 * - search: Search term (optional)
 * - sortBy: Sort criteria (optional)
 * - limit: Number of results (optional)
 * - offset: Pagination offset (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    console.log('Marketplace products API: userId from auth:', userId);
    
    // For marketplace product browsing, we allow access even without authentication
    // This makes the marketplace publicly accessible for browsing

    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organizationId');
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'popularity';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    console.log('Marketplace products API: Query params:', {
      organizationId, category, type, search, sortBy, limit, offset
    });

    // Build filters - for now, show all active products
    const filters: Record<string, unknown> = {
      isActive: true
    };

    // TODO: Add organization-specific filtering later
    // if (organizationId) {
    //   filters.organizationId = organizationId;
    // }

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (type && type !== 'all') {
      filters.type = type;
    }

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build sort criteria
    let orderBy: any = {};
    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high': 
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popularity':
      default:
        // Order by popularity: bestseller > hot > trending > new
        orderBy = [
          { isRecommended: 'desc' },
          { rating: 'desc' },
          { reviews: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    // Get boost products with purchase statistics
    console.log('Marketplace products API: About to query boost products with filters:', filters);
    
    let boosts;
    try {
      boosts = await db.boostProduct.findMany({
        where: filters,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          },
          purchases: {
            select: {
              id: true,
              status: true,
              performance: true
            }
          },
          _count: {
            select: {
              purchases: true
            }
          }
        }
      });
      
      console.log('Marketplace products API: Found', boosts.length, 'boost products');
    } catch (dbError) {
      console.error('Marketplace products API: Database query failed:', dbError);
      throw dbError;
    }

    // Transform data to match frontend interface
    const transformedBoosts = boosts.map(boost => {
      const activePurchases = boost.purchases.filter(p => p.status === 'active').length;
      const totalPurchases = boost._count.purchases;
      
      // Calculate average performance from active purchases
      const activePerformances = boost.purchases
        .filter(p => p.status === 'active' && p.performance)
        .map(p => p.performance as any);
      
      const avgPerformance = activePerformances.length > 0 
        ? activePerformances.reduce((acc, perf) => ({
            impressions: (acc.impressions || 0) + (perf.impressions || 0),
            engagements: (acc.engagements || 0) + (perf.engagements || 0),
            conversions: (acc.conversions || 0) + (perf.conversions || 0),
            roi: (acc.roi || 0) + (perf.roi || 0)
          }), { impressions: 0, engagements: 0, conversions: 0, roi: 0 })
        : { impressions: 0, engagements: 0, conversions: 0, roi: 0 };

      if (activePerformances.length > 0) {
        avgPerformance.roi = avgPerformance.roi / activePerformances.length;
      }

      return {
        id: boost.id,
        name: boost.name,
        description: boost.description,
        type: boost.type,
        category: boost.category,
        price: parseFloat(boost.price.toString()),
        originalPrice: boost.originalPrice ? parseFloat(boost.originalPrice.toString()) : undefined,
        duration: boost.duration,
        features: boost.features,
        metrics: {
          averageIncrease: avgPerformance.roi > 0 ? `+${Math.round(avgPerformance.roi)}%` : '+0%',
          successRate: boost.rating ? Math.round(parseFloat(boost.rating.toString()) * 20) : 85, // Convert 5-star to percentage
          clientsUsed: totalPurchases
        },
        clientTypes: boost.clientTypes,
        popularity: boost.popularity,
        rating: parseFloat(boost.rating.toString()),
        reviews: boost.reviews,
        estimatedROI: boost.estimatedROI || `${Math.round(avgPerformance.roi)}%`,
        isRecommended: boost.isRecommended,
        provider: boost.organization ? {
          id: boost.organization.id,
          name: boost.organization.name,
          logoUrl: boost.organization.logoUrl
        } : null,
        activePurchases,
        createdAt: boost.createdAt,
        updatedAt: boost.updatedAt
      };
    });

    // Get total count for pagination
    const totalCount = await db.boostProduct.count({
      where: filters
    });

    return NextResponse.json({
      boosts: transformedBoosts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch boost products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/products - Create new boost product
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      category,
      price,
      originalPrice,
      duration,
      features,
      clientTypes,
      tags,
      estimatedROI,
      organizationId
    } = body;

    // Validate required fields
    if (!name || !description || !type || !category || !price || !duration || !features?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create user in database
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl
        }
      });
    }

    // Verify user has access to organization
    if (organizationId) {
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: dbUser.id,
          organizationId,
          serviceProviderRole: {
            in: ['OWNER', 'ADMIN', 'MANAGER']
          }
        }
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Create boost product
    const boostProduct = await db.boostProduct.create({
      data: {
        name,
        description,
        type,
        category,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        duration,
        features,
        clientTypes: clientTypes || [],
        estimatedROI,
        organizationId,
        popularity: 'new',
        isActive: true,
        metrics: {
          targetIncrease: estimatedROI || '100%',
          estimatedSuccessRate: 85
        }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      boostProduct: {
        id: boostProduct.id,
        name: boostProduct.name,
        description: boostProduct.description,
        type: boostProduct.type,
        category: boostProduct.category,
        price: parseFloat(boostProduct.price.toString()),
        originalPrice: boostProduct.originalPrice ? parseFloat(boostProduct.originalPrice.toString()) : undefined,
        duration: boostProduct.duration,
        features: boostProduct.features,
        clientTypes: boostProduct.clientTypes,
        popularity: boostProduct.popularity,
        rating: parseFloat(boostProduct.rating.toString()),
        reviews: boostProduct.reviews,
        estimatedROI: boostProduct.estimatedROI,
        isRecommended: boostProduct.isRecommended,
        provider: boostProduct.organization
      }
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to create boost product' },
      { status: 500 }
    );
  }
}