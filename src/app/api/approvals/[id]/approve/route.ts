import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ContentStatus, ApprovalStep } from '@prisma/client';
import { CampaignEmailService } from '@/lib/services/campaign-email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await getAuth(request);
    if (!clerkId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Update the approval status
    const approval = await prisma.contentApproval.update({
      where: {
        id: params.id,
      },
      data: {
        status: ContentStatus.APPROVED,
        currentStep: ApprovalStep.APPROVAL,
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

    // Create approval history entry
    await prisma.approvalHistory.create({
      data: {
        approvalId: approval.id,
        status: ContentStatus.APPROVED,
        step: ApprovalStep.APPROVAL,
        comment: 'Content approved',
        createdBy: user.id,
      },
    });

    // 🚀 NEW: Trigger email queue integration when content is approved
    try {
      await CampaignEmailService.onContentApproved(approval.content.id, {
        id: approval.id,
        userId: user.id,
        approvedAt: new Date(),
        contentType: approval.content.type,
      });
    } catch (emailError) {
      // Log error but don't fail the approval
      console.error('Failed to trigger email queue after approval:', emailError);
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error approving content:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 