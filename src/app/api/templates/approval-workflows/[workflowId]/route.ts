import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Approval action schema
const ApprovalActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes']),
  message: z.string().optional(),
  changesRequested: z.array(z.string()).optional(),
  approverId: z.string().min(1, "Approver ID is required")
});

// PATCH: Handle approval actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflowId } = params;
    const body = await request.json();
    const validatedData = ApprovalActionSchema.parse(body);

    // Find the workflow
    const workflow = await db.templateApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        template: true,
        organization: true,
        requester: true,
        approver: true
      }
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Verify user has approval permissions
    const approverMembership = await db.organizationMember.findFirst({
      where: {
        organizationId: workflow.organizationId,
        user: { clerkId: session.userId },
        role: { in: ['ADMIN', 'APPROVER', 'REVIEWER'] }
      },
      include: { user: true }
    });

    if (!approverMembership) {
      return NextResponse.json({ error: "Access denied - insufficient permissions" }, { status: 403 });
    }

    // Check if workflow is still pending
    if (workflow.status !== 'pending') {
      return NextResponse.json({ 
        error: "This workflow has already been processed" 
      }, { status: 409 });
    }

    // Verify approver matches (if workflow has specific approver assigned)
    if (workflow.approverId && workflow.approverId !== approverMembership.userId) {
      // Allow admins to override
      if (approverMembership.role !== 'ADMIN') {
        return NextResponse.json({ 
          error: "This workflow is assigned to a different approver" 
        }, { status: 403 });
      }
    }

    // Prepare update data
    const now = new Date();
    const updateData: any = {
      status: validatedData.action === 'approve' ? 'approved' : 
              validatedData.action === 'reject' ? 'rejected' : 'needs_changes',
      approverId: approverMembership.userId,
      approvalMessage: validatedData.message,
      updatedAt: now
    };

    // Set appropriate timestamp
    if (validatedData.action === 'approve') {
      updateData.approvedAt = now;
    } else if (validatedData.action === 'reject') {
      updateData.rejectedAt = now;
    }

    // Add changes requested if applicable
    if (validatedData.action === 'request_changes' && validatedData.changesRequested) {
      updateData.changesRequested = validatedData.changesRequested;
    }

    // Update the workflow
    const updatedWorkflow = await db.templateApprovalWorkflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update template status based on approval action
    let newTemplateStatus;
    switch (validatedData.action) {
      case 'approve':
        newTemplateStatus = 'PUBLISHED';
        break;
      case 'reject':
        newTemplateStatus = 'ARCHIVED';
        break;
      case 'request_changes':
        newTemplateStatus = 'DRAFT';
        break;
    }

    await db.template.update({
      where: { id: workflow.templateId },
      data: { 
        status: newTemplateStatus,
        updatedAt: now
      }
    });

    // Track the approval action for analytics
    await db.templateUsage.create({
      data: {
        templateId: workflow.templateId,
        userId: approverMembership.userId,
        organizationId: workflow.organizationId,
        context: 'approval_workflow',
        action: validatedData.action,
        source: 'approval_system',
        metadata: {
          workflow_id: workflowId,
          action_type: validatedData.action,
          has_message: !!validatedData.message,
          changes_count: validatedData.changesRequested?.length || 0
        }
      }
    }).catch(error => {
      // Non-blocking - log error but don't fail the request
      console.error("", _error);
    });

    // TODO: Send notifications to requester
    // This would integrate with your notification system

    return NextResponse.json({
      ...updatedWorkflow,
      message: `Template ${validatedData.action}d successfully`
    });

  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to process approval action" },
      { status: 500 }
    );
  }
}

// GET: Fetch specific workflow details
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflowId } = params;

    const workflow = await db.templateApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            content: true,
            description: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Verify user has access to this workflow
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: workflow.organizationId,
        user: { clerkId: session.userId }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(workflow);

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

// DELETE: Cancel/delete workflow (only by requester or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflowId } = params;

    const workflow = await db.templateApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        requester: true,
        template: true
      }
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Verify user can delete this workflow
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: workflow.organizationId,
        user: { clerkId: session.userId }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Only requester or admin can delete
    const canDelete = membership.userId === workflow.requesterId || 
                     membership.role === 'ADMIN';

    if (!canDelete) {
      return NextResponse.json({ 
        error: "Only the requester or admin can cancel this workflow" 
      }, { status: 403 });
    }

    // Can only delete pending workflows
    if (workflow.status !== 'pending') {
      return NextResponse.json({ 
        error: "Only pending workflows can be cancelled" 
      }, { status: 409 });
    }

    // Delete the workflow
    await db.templateApprovalWorkflow.delete({
      where: { id: workflowId }
    });

    // Reset template status to DRAFT
    await db.template.update({
      where: { id: workflow.templateId },
      data: { status: 'DRAFT' }
    });

    return NextResponse.json({ 
      message: "Approval workflow cancelled successfully" 
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to cancel workflow" },
      { status: 500 }
    );
  }
}