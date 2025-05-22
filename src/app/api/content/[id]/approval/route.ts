import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NotificationService } from '@/lib/services/notification-service';

// Validation schemas
const submitSchema = z.object({
  assignedTo: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED']),
  comment: z.string().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});

// GET /api/content/[id]/approval
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const approval = await prisma.contentApproval.findUnique({
      where: { contentId: params.id },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        history: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error fetching approval:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content/[id]/approval/submit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignedTo } = submitSchema.parse(body);

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id: params.id },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    // Create or update approval
    const approval = await prisma.contentApproval.upsert({
      where: { contentId: params.id },
      create: {
        contentId: params.id,
        status: 'PENDING_REVIEW',
        currentStep: 'REVIEW',
        createdBy: userId,
        assignedTo,
        history: {
          create: {
            status: 'PENDING_REVIEW',
            step: 'REVIEW',
            createdBy: userId,
          },
        },
      },
      update: {
        status: 'PENDING_REVIEW',
        currentStep: 'REVIEW',
        assignedTo,
        history: {
          create: {
            status: 'PENDING_REVIEW',
            step: 'REVIEW',
            createdBy: userId,
          },
        },
      },
    });

    // Send notifications
    await NotificationService.notifyContentSubmitted(params.id, userId);
    if (assignedTo) {
      await NotificationService.notifyReviewAssigned(params.id, assignedTo);
    }

    return NextResponse.json(approval);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error submitting for approval:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/content/[id]/approval/status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, comment } = statusSchema.parse(body);

    const approval = await prisma.contentApproval.findUnique({
      where: { contentId: params.id },
      include: {
        content: true,
      },
    });

    if (!approval) {
      return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
    }

    // Update approval status
    const updatedApproval = await prisma.contentApproval.update({
      where: { id: approval.id },
      data: {
        status,
        currentStep: getNextStep(status),
        history: {
          create: {
            status,
            step: getNextStep(status),
            comment,
            createdBy: userId,
          },
        },
      },
    });

    // Send appropriate notifications based on status
    switch (status) {
      case 'CHANGES_REQUESTED':
        await NotificationService.notifyFeedbackProvided(params.id, approval.createdBy);
        break;
      case 'REJECTED':
        await NotificationService.notifyApprovalRejected(params.id, approval.createdBy);
        break;
      case 'PUBLISHED':
        await NotificationService.notifyContentPublished(params.id, approval.createdBy);
        break;
      default:
        await NotificationService.notifyStatusChanged(params.id, approval.createdBy, status);
    }

    return NextResponse.json(updatedApproval);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating approval status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine next step based on status
function getNextStep(status: string): 'CREATION' | 'REVIEW' | 'APPROVAL' | 'PUBLICATION' {
  switch (status) {
    case 'DRAFT':
      return 'CREATION';
    case 'PENDING_REVIEW':
    case 'IN_REVIEW':
    case 'CHANGES_REQUESTED':
      return 'REVIEW';
    case 'APPROVED':
    case 'REJECTED':
      return 'APPROVAL';
    case 'PUBLISHED':
    case 'ARCHIVED':
      return 'PUBLICATION';
    default:
      return 'CREATION';
  }
} 