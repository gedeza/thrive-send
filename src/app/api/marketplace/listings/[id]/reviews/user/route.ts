import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/listings/[id]/reviews/user - Get current user's review for a listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find user's review for this listing
    const userReview = await prisma.marketplaceReview.findFirst({
      where: {
        listingId: listingId,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!userReview) {
      return NextResponse.json(
        { hasReview: false, review: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasReview: true,
      review: {
        id: userReview.id,
        rating: userReview.rating,
        comment: userReview.comment,
        createdAt: userReview.createdAt,
        updatedAt: userReview.updatedAt,
        user: userReview.user
      }
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}