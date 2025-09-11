import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

// GET /api/marketplace/listings/[id]/reviews - Get reviews for a listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sort') || 'newest';

    // Build order by clause based on sort parameter
    let orderBy: any = { createdAt: 'desc' }; // newest (default)
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        // Would need to add helpful count to schema for this to work properly
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch reviews with reviewer information
    const reviews = await prisma.marketplaceReview.findMany({
      where: { listingId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy
    });

    // Calculate review statistics
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0,
      ratingDistribution: {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length,
      }
    };

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      reviewer: {
        id: review.reviewer.id,
        firstName: review.reviewer.firstName,
        lastName: review.reviewer.lastName,
        email: review.reviewer.email,
      },
      // Mock data for features not yet in schema
      helpful: Math.floor(Math.random() * 10),
      notHelpful: Math.floor(Math.random() * 3),
      isVerifiedPurchase: Math.random() > 0.7,
      isEdited: review.updatedAt > review.createdAt,
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      stats
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/listings/[id]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listingId = params.id;
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if listing exists
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if user already reviewed this listing
    const existingReview = await prisma.marketplaceReview.findFirst({
      where: {
        listingId,
        reviewerId: user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this listing' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.marketplaceReview.create({
      data: {
        listingId,
        reviewerId: user.id,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        reviewer: review.reviewer,
      }
    }, { status: 201 });

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/listings/[id]/reviews - Update existing review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listingId = params.id;
    const body = await request.json();
    const { reviewId, ...reviewData } = body;
    const validatedData = reviewSchema.parse(reviewData);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the review and verify ownership
    const existingReview = await prisma.marketplaceReview.findFirst({
      where: {
        id: reviewId,
        listingId,
        reviewerId: user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview = await prisma.marketplaceReview.update({
      where: { id: reviewId },
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        createdAt: updatedReview.createdAt.toISOString(),
        updatedAt: updatedReview.updatedAt.toISOString(),
        reviewer: updatedReview.reviewer,
      }
    });

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}