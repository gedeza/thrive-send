import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const voteSchema = z.object({
  helpful: z.boolean(),
});

// POST /api/marketplace/reviews/[id]/vote - Vote on review helpfulness
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.id;
    const body = await request.json();
    const { helpful } = voteSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if review exists
    const review = await prisma.marketplaceReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Prevent users from voting on their own reviews
    if (review.reviewerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    // For now, we'll just return success since we don't have a votes table
    // In a full implementation, you would:
    // 1. Create a ReviewVote model to track votes
    // 2. Check if user already voted and update/create accordingly
    // 3. Update review helpful/notHelpful counts

    // Mock response for now
    return NextResponse.json({
      success: true,
      message: helpful ? 'Marked as helpful' : 'Marked as not helpful'
    });

  } catch (error) {
    console.error('Error voting on review:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}