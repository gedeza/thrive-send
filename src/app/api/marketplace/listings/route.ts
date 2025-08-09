import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const listingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  type: z.enum(['TEMPLATE', 'CONTENT', 'SERVICE', 'TOOL']),
  price: z.number().min(0.01),
  currency: z.string().default('USD'),
  category: z.string(),
  tags: z.array(z.string()).max(10),
});

// GET /api/marketplace/listings - Get all marketplace listings (public access for browsing)
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    // Allow public browsing of marketplace listings - no auth required for GET

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    if (category) {
      where.metadata = {
        path: ['category'],
        equals: category
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        // TODO: Add rating calculation
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // For now, return demo data since database tables might not exist yet
    const demoListings = [
      {
        id: 'boost-1',
        name: 'Premium Social Media Boost',
        description: 'Increase your social media engagement with our premium boost package',
        type: 'CONTENT',
        category: 'social-media',
        price: 299.99,
        currency: 'USD',
        rating: 4.8,
        reviews: 24,
        isActive: true,
        provider: {
          name: 'BoostPro Marketing',
          verified: true,
          rating: 4.9
        }
      },
      {
        id: 'boost-2',
        name: 'Blog Content Enhancement',
        description: 'Professional blog optimization and content enhancement services',
        type: 'TEMPLATE',
        category: 'blog',
        price: 199.99,
        currency: 'USD',
        rating: 4.7,
        reviews: 18,
        isActive: true,
        provider: {
          name: 'ContentCraft Studios',
          verified: true,
          rating: 4.8
        }
      }
    ];

    // Return demo data for development
    const total = demoListings.length;

    // Return demo listings with proper structure
    const enrichedListings = demoListings;

    return NextResponse.json({
      listings: enrichedListings,
      pagination: {
        page: 1,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Marketplace listings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/listings - Create a new marketplace listing
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = listingSchema.parse(body);

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json(
        { error: 'User must belong to an organization' },
        { status: 400 }
      );
    }

    const organizationId = user.organizations[0].id;

    // Create the listing
    const listing = await prisma.marketplaceListing.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        price: validatedData.price,
        currency: validatedData.currency,
        status: 'ACTIVE',
        metadata: {
          category: validatedData.category,
          tags: validatedData.tags,
        },
        createdById: userId,
        organizationId,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, imageUrl: true }
        },
        organization: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    // Error logged by error handling service
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}