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

// GET /api/marketplace/listings - Get all marketplace listings
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, imageUrl: true }
          },
          organization: {
            select: { id: true, name: true, imageUrl: true }
          },
          reviews: {
            select: { rating: true }
          },
          _count: {
            select: { reviews: true, purchases: true }
          }
        }
      }),
      prisma.marketplaceListing.count({ where })
    ]);

    // Add calculated fields
    const enrichedListings = listings.map(listing => ({
      ...listing,
      averageRating: listing.reviews.length > 0 
        ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
        : 0,
      reviewCount: listing._count.reviews,
      purchaseCount: listing._count.purchases
    }));

    return NextResponse.json({
      listings: enrichedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
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
  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
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