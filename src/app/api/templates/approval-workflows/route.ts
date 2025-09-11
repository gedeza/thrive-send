import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Request approval schema
const CreateApprovalRequestSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  requesterId: z.string().min(1, "Requester ID is required"),
  approverId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  requestMessage: z.string().optional(),
});

// GET: Fetch approval workflows
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    
    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // Find the organization by Clerk ID primarily
    const organization = await db.organization.findFirst({
      where: {
        OR: [
          { clerkOrganizationId: organizationId }, // Clerk ID first
          { id: organizationId }  // Internal ID fallback
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Verify user has access to the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        user: { clerkId: session.userId }
      },
      include: { user: true }
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch approval workflows
    const workflows = await db.templateApprovalWorkflow.findMany({
      where: {
        organizationId: organization.id
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(workflows);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch approval workflows" },
      { status: 500 }
    );
  }
}

// POST: Create new approval request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateApprovalRequestSchema.parse(body);

    // Find the organization by Clerk ID primarily
    const organization = await db.organization.findFirst({
      where: {
        OR: [
          { clerkOrganizationId: validatedData.organizationId }, // Clerk ID first
          { id: validatedData.organizationId }  // Internal ID fallback
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Verify user has access to the organization
    const requesterMembership = await db.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        user: { clerkId: session.userId }
      },
      include: { user: true }
    });

    if (!requesterMembership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify template exists and belongs to the organization
    const template = await db.template.findFirst({
      where: {
        id: validatedData.templateId,
        organizationId: organization.id
      }
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Check if there's already a pending approval for this template
    const existingApproval = await db.templateApprovalWorkflow.findFirst({
      where: {
        templateId: validatedData.templateId,
        status: 'pending'
      }
    });

    if (existingApproval) {
      return NextResponse.json({ 
        error: "This template already has a pending approval request" 
      }, { status: 409 });
    }

    // Verify approver exists and has permission (if specified)
    let approver = null;
    if (validatedData.approverId) {
      approver = await db.organizationMember.findFirst({
        where: {
          organizationId: organization.id,
          userId: validatedData.approverId,
          role: { in: ['ADMIN', 'APPROVER', 'REVIEWER'] }
        },
        include: { user: true }
      });

      if (!approver) {
        return NextResponse.json({ 
          error: "Specified approver not found or doesn't have approval permissions" 
        }, { status: 400 });
      }
    }

    // Create approval workflow
    const workflow = await db.templateApprovalWorkflow.create({
      data: {
        templateId: validatedData.templateId,
        organizationId: organization.id,
        requesterId: requesterMembership.userId,
        approverId: validatedData.approverId || null,
        priority: validatedData.priority,
        requestMessage: validatedData.requestMessage,
        status: 'pending'
      },
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

    // Update template status to PENDING_APPROVAL
    await db.template.update({
      where: { id: validatedData.templateId },
      data: { status: 'PENDING_APPROVAL' }
    });

    // TODO: Send notification to approver(s)
    // This would integrate with your notification system

    return NextResponse.json(workflow, { status: 201 });
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to create approval request" },
      { status: 500 }
    );
  }
}