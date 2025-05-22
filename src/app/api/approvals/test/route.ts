import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ContentStatus, ApprovalStep } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await getAuth(request);
    if (!clerkId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find or create the user
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Create a test content with a unique slug
    const timestamp = Date.now();
    const content = await prisma.content.create({
      data: {
        title: `Test Content ${timestamp}`,
        type: 'POST',
        slug: `test-content-${timestamp}`,
        content: 'This is a test content for approval workflow.',
        status: 'DRAFT',
        authorId: user.id,
      },
    });

    // Create a test approval
    const approval = await prisma.contentApproval.create({
      data: {
        contentId: content.id,
        status: ContentStatus.PENDING_REVIEW,
        currentStep: ApprovalStep.REVIEW,
        createdBy: user.id,
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error creating test approval:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 