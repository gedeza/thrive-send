import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Zod schema for partial update
const templateUpdateSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }).optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  previewImage: z.string().optional(),
});

/**
 * Verify user has access to the specified organization
 */
async function verifyOrganizationAccess(userId: string, organizationId: string) {
  const orgMembership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      }
    }
  });
  return !!orgMembership;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        author: {
          select: { firstName: true, lastName: true, email: true },
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Organization access check
    const hasAccess = await verifyOrganizationAccess(session.user.id, template.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied to this organization" }, { status: 403 });
    }

    const formattedTemplate = {
      id: template.id,
      name: template.name,
      description: template.description || "",
      category: template.category,
      status: template.status,
      content: template.content || "",
      lastUpdated: template.updatedAt.toISOString(),
      createdAt: template.createdAt.toISOString(),
      author: template.author.firstName && template.author.lastName
        ? `${template.author.firstName} ${template.author.lastName}`
        : template.author.email,
      authorId: template.authorId,
      previewImage: template.previewImage || null,
      organizationId: template.organizationId,
    };

    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Organization access check
    const hasAccess = await verifyOrganizationAccess(session.user.id, existingTemplate.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied to this organization" }, { status: 403 });
    }

    // Validate update data
    const parsed = templateUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: "Invalid template data",
        details: parsed.error.format()
      }, { status: 400 });
    }

    const updateData = { ...parsed.data, updatedAt: new Date() };

    // Update in DB
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { firstName: true, lastName: true, email: true },
        }
      }
    });

    const formattedTemplate = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description || "",
      category: updatedTemplate.category,
      status: updatedTemplate.status,
      content: updatedTemplate.content || "",
      lastUpdated: updatedTemplate.updatedAt.toISOString(),
      createdAt: updatedTemplate.createdAt.toISOString(),
      author: updatedTemplate.author.firstName && updatedTemplate.author.lastName
        ? `${updatedTemplate.author.firstName} ${updatedTemplate.author.lastName}`
        : updatedTemplate.author.email,
      authorId: updatedTemplate.authorId,
      previewImage: updatedTemplate.previewImage || null,
      organizationId: updatedTemplate.organizationId,
    };

    return NextResponse.json(formattedTemplate);

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Organization access check
    const hasAccess = await verifyOrganizationAccess(session.user.id, existingTemplate.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied to this organization" }, { status: 403 });
    }

    await prisma.template.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}