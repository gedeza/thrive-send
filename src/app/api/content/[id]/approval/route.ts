import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NotificationService } from '@/lib/services/notification-service';
import { ContentStatus, ApprovalStep } from '@prisma/client';

// Validation schemas
const approvalSchema = z.object({
  status: z.nativeEnum(ContentStatus),
  step: z.nativeEnum(ApprovalStep),
  comment: z.string().optional(),
  assignedTo: z.string().optional(),
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
            user: true,
          },
        },
        history: {
          include: {
            user: true,
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

// POST /api/content/[id]/approval
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
    const approvalData = approvalSchema.parse(body);

    // Check if content exists and user has permission
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    if (content.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Create or update approval
    const approval = await prisma.contentApproval.upsert({
      where: { contentId: params.id },
      create: {
        contentId: params.id,
        status: approvalData.status,
        currentStep: approvalData.step,
        createdBy: userId,
        assignedTo: approvalData.assignedTo,
        comments: approvalData.comment ? {
          create: [{
            content: approvalData.comment,
            userId: userId,
          }],
        } : undefined,
        history: {
          create: [{
            status: approvalData.status,
            step: approvalData.step,
            comment: approvalData.comment,
            userId: userId,
          }],
        },
      },
      update: {
        status: approvalData.status,
        currentStep: approvalData.step,
        assignedTo: approvalData.assignedTo,
        comments: approvalData.comment ? {
          create: [{
            content: approvalData.comment,
            userId: userId,
          }],
        } : undefined,
        history: {
          create: [{
            status: approvalData.status,
            step: approvalData.step,
            comment: approvalData.comment,
            userId: userId,
          }],
        },
      },
      include: {
        comments: {
          include: {
            user: true,
          },
        },
        history: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update content status
    await prisma.content.update({
      where: { id: params.id },
      data: {
        status: approvalData.status === ContentStatus.APPROVED ? ContentStatus.PUBLISHED : approvalData.status,
      },
    });

    // Send notification
    if (approvalData.assignedTo) {
      await NotificationService.notifyReviewAssigned(params.id, approvalData.assignedTo);
    }

    return NextResponse.json(approval);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating approval:', error);
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