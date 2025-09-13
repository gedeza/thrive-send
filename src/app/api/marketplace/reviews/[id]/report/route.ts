import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reportSchema = z.object({
  reason: z.enum(['inappropriate', 'spam', 'fake', 'offensive', 'other']),
  description: z.string().max(500).optional(),
});

// POST /api/marketplace/reviews/[id]/report - Report a review
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
    const { reason, description } = reportSchema.parse(body);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if review exists
    const review = await db.marketplaceReview.findUnique({
      where: { id: reviewId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            organizationId: true
          }
        }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Create a report using the existing Report model
    // Note: The existing Report model seems to be campaign-focused,
    // but we can adapt it for marketplace reviews
    const report = await db.report.create({
      data: {
        type: 'marketplace_review',
        description: `Review Report - Reason: ${reason}${description ? `. Details: ${description}` : ''}`,
        metadata: {
          reviewId,
          listingId: review.listingId,
          listingTitle: review.listing.title,
          reason,
          reportedBy: user.id,
          reportedAt: new Date().toISOString(),
        },
        // Using organizationId from the listing for proper context
        organizationId: review.listing.organizationId,
        userId: user.id,
      }
    });

    // In a full implementation, you might also:
    // 1. Send notification to moderators
    // 2. Automatically hide review if multiple reports
    // 3. Create a dedicated ReviewReport model for better tracking

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Review has been reported for moderation'
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
      { error: 'Failed to report review' },
      { status: 500 }
    );
  }
}