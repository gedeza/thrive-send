import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Simple in-memory storage for demo boosts when database is unavailable
const sessionBoosts = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Demo boost products
    const demoBoosts = [
      {
        id: 'boost-1',
        name: 'Municipal Engagement Pro',
        type: 'engagement',
        category: 'Government',
        description: 'Specialized boost for government communications with citizen engagement focus',
        price: 299,
        originalPrice: 399,
        duration: '30 days',
        features: [
          'Targeted citizen demographics',
          'Peak hour optimization',
          'Community event promotion',
          'Public notice amplification',
          'Feedback collection boost'
        ],
        metrics: {
          averageIncrease: '+285%',
          successRate: 94,
          clientsUsed: 127
        },
        clientTypes: ['municipality', 'government'],
        popularity: 'bestseller',
        rating: 4.9,
        reviews: 89,
        estimatedROI: '340%',
        isRecommended: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boost-2',
        name: 'Business Growth Accelerator',
        type: 'conversion',
        category: 'Business',
        description: 'Drive conversions and sales for business clients with advanced targeting',
        price: 459,
        duration: '45 days',
        features: [
          'Purchase intent targeting',
          'Competitor audience reach',
          'Shopping behavior optimization',
          'Local business promotion',
          'Call-to-action enhancement'
        ],
        metrics: {
          averageIncrease: '+420%',
          successRate: 89,
          clientsUsed: 203
        },
        clientTypes: ['business', 'startup'],
        popularity: 'hot',
        rating: 4.7,
        reviews: 156,
        estimatedROI: '520%',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boost-3',
        name: 'Startup Viral Launch',
        type: 'reach',
        category: 'Startup',
        description: 'Maximum exposure for startup launches and product announcements',
        price: 199,
        originalPrice: 249,
        duration: '14 days',
        features: [
          'Viral content optimization',
          'Influencer network reach',
          'Trending hashtag boost',
          'Launch event promotion',
          'Investor audience targeting'
        ],
        metrics: {
          averageIncrease: '+650%',
          successRate: 91,
          clientsUsed: 78
        },
        clientTypes: ['startup', 'creator'],
        popularity: 'trending',
        rating: 4.8,
        reviews: 67,
        estimatedROI: '280%',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boost-4',
        name: 'Premium Brand Authority',
        type: 'premium',
        category: 'Branding',
        description: 'Elite positioning for high-end clients requiring luxury market reach',
        price: 899,
        duration: '60 days',
        features: [
          'Premium audience targeting',
          'Luxury market positioning',
          'Thought leadership boost',
          'Executive network reach',
          'Brand authority signals'
        ],
        metrics: {
          averageIncrease: '+180%',
          successRate: 96,
          clientsUsed: 34
        },
        clientTypes: ['business', 'executive'],
        popularity: 'new',
        rating: 4.9,
        reviews: 23,
        estimatedROI: '450%',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boost-5',
        name: 'Community Awareness Campaign',
        type: 'awareness',
        category: 'Social Impact',
        description: 'Build awareness for community initiatives and social causes',
        price: 149,
        duration: '21 days',
        features: [
          'Community targeting',
          'Social cause alignment',
          'Local media boost',
          'Volunteer recruitment',
          'Donation drive support'
        ],
        metrics: {
          averageIncrease: '+320%',
          successRate: 87,
          clientsUsed: 165
        },
        clientTypes: ['municipality', 'nonprofit'],
        popularity: 'hot',
        rating: 4.6,
        reviews: 112,
        estimatedROI: '210%',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    let databaseBoosts: any[] = [];
    
    try {
      console.log('Attempting to fetch marketplace boosts from database...');
      
      databaseBoosts = await prisma.boostProduct.findMany({
        where: {
          isActive: true,
          ...(type && type !== 'all' ? { type } : {}),
          ...(category && category !== 'all' ? { category } : {})
        },
        orderBy: [
          { isRecommended: 'desc' },
          { popularity: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      // Transform database data to match frontend interface
      databaseBoosts = databaseBoosts.map((boost: any) => ({
        id: boost.id,
        name: boost.name,
        type: boost.type,
        category: boost.category,
        description: boost.description,
        price: Number(boost.price),
        originalPrice: boost.originalPrice ? Number(boost.originalPrice) : undefined,
        duration: boost.duration,
        features: boost.features,
        metrics: boost.metrics,
        clientTypes: boost.clientTypes,
        popularity: boost.popularity,
        rating: Number(boost.rating),
        reviews: boost.reviews,
        estimatedROI: boost.estimatedROI,
        isRecommended: boost.isRecommended,
        createdAt: boost.createdAt.toISOString(),
        updatedAt: boost.updatedAt.toISOString()
      }));

      console.log(`Found ${databaseBoosts.length} boost products in database`);
      
    } catch (dbError) {
      console.warn('Database unavailable for marketplace boosts, using demo mode:', dbError);
      databaseBoosts = [];
    }

    // Filter boosts based on query parameters
    let filteredBoosts = databaseBoosts.length > 0 ? databaseBoosts : demoBoosts;

    if (type && type !== 'all') {
      filteredBoosts = filteredBoosts.filter((boost: any) => boost.type === type);
    }

    if (category && category !== 'all') {
      filteredBoosts = filteredBoosts.filter((boost: any) => boost.category === category);
    }

    console.log(`Returning ${filteredBoosts.length} marketplace boosts`);
    
    return NextResponse.json(filteredBoosts);

  } catch (error) {
    console.error('Service provider marketplace boosts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      boostId, 
      clientId, 
      organizationId,
      paymentMethod,
      billingAddress,
      notes
    } = body;

    // Validate required fields
    if (!boostId || !clientId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: boostId, clientId, organizationId' },
        { status: 400 }
      );
    }

    let purchaseResponse: any;

    try {
      console.log('Attempting to create boost purchase in database...');
      
      // 1. Validate the boost exists and is available
      const boostProduct = await prisma.boostProduct.findFirst({
        where: {
          id: boostId,
          isActive: true
        }
      });

      if (!boostProduct) {
        return NextResponse.json(
          { error: 'Boost product not found or inactive' },
          { status: 404 }
        );
      }

      // 2. Verify client belongs to organization
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          organizationId: organizationId
        }
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found or access denied' },
          { status: 404 }
        );
      }

      // 3. Calculate expiration date based on duration
      const durationMatch = boostProduct.duration.match(/(\d+)\s*(day|week|month)s?/i);
      const expiresAt = new Date();
      
      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        
        switch(unit) {
          case 'day':
            expiresAt.setDate(expiresAt.getDate() + amount);
            break;
          case 'week':
            expiresAt.setDate(expiresAt.getDate() + (amount * 7));
            break;
          case 'month':
            expiresAt.setMonth(expiresAt.getMonth() + amount);
            break;
        }
      } else {
        // Default to 30 days
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      // 4. Create purchase record
      purchaseResponse = await prisma.boostPurchase.create({
        data: {
          boostProductId: boostId,
          clientId,
          organizationId,
          userId,
          status: 'active',
          price: boostProduct.price,
          duration: boostProduct.duration,
          expiresAt,
          performance: {
            impressions: 0,
            engagements: 0,
            conversions: 0,
            roi: 0
          },
          paymentMethod,
          billingAddress,
          notes
        },
        include: {
          boostProduct: {
            select: {
              name: true,
              type: true,
              category: true
            }
          },
          client: {
            select: {
              name: true,
              type: true
            }
          }
        }
      });

      // 5. Create revenue record
      await prisma.marketplaceRevenue.create({
        data: {
          organizationId,
          clientId,
          revenueType: 'boost',
          amount: boostProduct.price,
          commissionRate: 0.15, // 15% commission
          transactionDate: new Date(),
          description: `Boost purchase: ${boostProduct.name}`,
          metadata: {
            boostPurchaseId: purchaseResponse.id,
            boostProductId: boostId,
            duration: boostProduct.duration
          }
        }
      });

      // Transform response
      purchaseResponse = {
        id: purchaseResponse.id,
        boostId,
        clientId,
        organizationId,
        userId,
        status: purchaseResponse.status,
        purchaseDate: purchaseResponse.purchaseDate.toISOString(),
        price: Number(purchaseResponse.price),
        duration: purchaseResponse.duration,
        expiresAt: purchaseResponse.expiresAt.toISOString(),
        performance: purchaseResponse.performance,
        paymentMethod: purchaseResponse.paymentMethod,
        billingAddress: purchaseResponse.billingAddress,
        notes: purchaseResponse.notes,
        boostProduct: {
          name: purchaseResponse.boostProduct.name,
          type: purchaseResponse.boostProduct.type,
          category: purchaseResponse.boostProduct.category
        },
        client: {
          name: purchaseResponse.client.name,
          type: purchaseResponse.client.type
        }
      };

      console.log('Boost purchase created successfully:', {
        purchaseId: purchaseResponse.id,
        boostName: purchaseResponse.boostProduct.name,
        clientName: purchaseResponse.client.name,
        price: purchaseResponse.price,
        expiresAt: purchaseResponse.expiresAt
      });

    } catch (dbError) {
      console.warn('Database unavailable, creating demo purchase:', dbError);
      
      // Fallback: Create a demo purchase response
      purchaseResponse = {
        id: `purchase-${Date.now()}`,
        boostId,
        clientId,
        organizationId,
        userId,
        status: 'active',
        purchaseDate: new Date().toISOString(),
        price: 299, // Would be fetched from boost data
        duration: '30 days',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        performance: {
          impressions: 0,
          engagements: 0,
          conversions: 0,
          roi: 0
        },
        paymentMethod,
        billingAddress,
        notes
      };

      // Store in session-based storage
      const sessionKey = `${organizationId}-${userId}`;
      const existingPurchases = sessionBoosts.get(sessionKey) || [];
      existingPurchases.push(purchaseResponse);
      sessionBoosts.set(sessionKey, existingPurchases);

      console.log('Demo boost purchase created:', {
        purchaseId: purchaseResponse.id,
        sessionKey,
        purchasesInSession: existingPurchases.length,
        boostId: purchaseResponse.boostId,
        clientId: purchaseResponse.clientId,
        price: purchaseResponse.price
      });
    }
    
    return NextResponse.json({
      success: true,
      purchase: purchaseResponse,
      message: `Boost activated successfully for client!`,
      demoMode: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating boost purchase:', error);
    return NextResponse.json(
      { error: 'Failed to purchase boost' },
      { status: 500 }
    );
  }
}