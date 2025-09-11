import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/analytics - Get marketplace analytics
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '30d';
    const type = searchParams.get('type');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build where clause for user's listings
    const whereClause: any = {
      createdById: userId,
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    if (type && type !== 'all') {
      whereClause.type = type.toUpperCase();
    }

    // Get listings overview
    const [
      totalListings,
      activeListings,
      totalViews,
      totalRevenue,
      recentPurchases,
      topListings
    ] = await Promise.all([
      // Total listings count
      prisma.marketplaceListing.count({
        where: { createdById: userId }
      }),
      
      // Active listings count
      prisma.marketplaceListing.count({
        where: { 
          createdById: userId,
          status: 'ACTIVE'
        }
      }),
      
      // Total views (mock data for now - would need analytics table)
      Promise.resolve(Math.floor(Math.random() * 10000) + 1000),
      
      // Total revenue from purchases
      prisma.marketplacePurchase.aggregate({
        where: {
          listing: { createdById: userId },
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Recent purchases
      prisma.marketplacePurchase.findMany({
        where: {
          listing: { createdById: userId },
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        include: {
          listing: {
            select: { id: true, title: true, price: true, currency: true }
          },
          buyer: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Top performing listings
      prisma.marketplaceListing.findMany({
        where: { createdById: userId },
        include: {
          purchases: {
            where: {
              status: 'COMPLETED',
              createdAt: {
                gte: startDate,
                lte: now
              }
            }
          },
          reviews: {
            select: { rating: true }
          },
          _count: {
            select: { purchases: true, reviews: true }
          }
        },
        take: 5
      })
    ]);

    // Calculate metrics for top listings
    const enrichedTopListings = topListings.map(listing => {
      const completedPurchases = listing.purchases.filter(p => p.status === 'COMPLETED');
      const totalRevenue = completedPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
      const averageRating = listing.reviews.length > 0
        ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
        : 0;

      return {
        id: listing.id,
        title: listing.title,
        type: listing.type,
        price: listing.price,
        currency: listing.currency,
        totalRevenue,
        totalSales: completedPurchases.length,
        averageRating,
        reviewCount: listing._count.reviews,
        // Mock data for views - would need analytics tracking
        views: Math.floor(Math.random() * 1000) + 50,
        conversionRate: completedPurchases.length > 0 
          ? ((completedPurchases.length / (Math.floor(Math.random() * 1000) + 50)) * 100).toFixed(2)
          : '0.00'
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Generate time series data for charts (mock implementation)
    const generateTimeSeriesData = (days: number) => {
      const data = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 100) + 20,
          clicks: Math.floor(Math.random() * 50) + 5,
          sales: Math.floor(Math.random() * 10),
          revenue: Math.floor(Math.random() * 500) + 50
        });
      }
      return data;
    };

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const timeSeriesData = generateTimeSeriesData(days);

    // Calculate period-over-period growth
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousRevenue = await prisma.marketplacePurchase.aggregate({
      where: {
        listing: { createdById: userId },
        status: 'COMPLETED',
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      },
      _sum: { amount: true }
    });

    const currentRevenue = totalRevenue._sum.amount || 0;
    const prevRevenue = previousRevenue._sum.amount || 0;
    const revenueGrowth = prevRevenue > 0 
      ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      : currentRevenue > 0 ? '100.0' : '0.0';

    return NextResponse.json({
      overview: {
        totalListings,
        activeListings,
        totalViews,
        totalRevenue: currentRevenue,
        totalSales: totalRevenue._count,
        averageOrderValue: totalRevenue._count > 0 
          ? (currentRevenue / totalRevenue._count).toFixed(2)
          : '0.00',
        revenueGrowth: parseFloat(revenueGrowth)
      },
      timeSeriesData,
      topListings: enrichedTopListings,
      recentPurchases: recentPurchases.map(purchase => ({
        id: purchase.id,
        amount: purchase.amount,
        currency: purchase.currency,
        createdAt: purchase.createdAt,
        listing: purchase.listing,
        buyer: {
          name: `${purchase.buyer.firstName} ${purchase.buyer.lastName}`.trim()
        }
      })),
      categoryBreakdown: [
        { category: 'Templates', count: Math.floor(totalListings * 0.4), revenue: currentRevenue * 0.45 },
        { category: 'Content', count: Math.floor(totalListings * 0.3), revenue: currentRevenue * 0.35 },
        { category: 'Services', count: Math.floor(totalListings * 0.2), revenue: currentRevenue * 0.15 },
        { category: 'Tools', count: Math.floor(totalListings * 0.1), revenue: currentRevenue * 0.05 }
      ]
    });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}