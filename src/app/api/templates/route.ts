import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Zod schema for template validation
const templateSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  content: z.array(z.any()).optional().or(z.string().optional()),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'draft', 'published', 'archived']).default('DRAFT'),
  previewImage: z.string().optional(),
  organizationId: z.string().min(1, { message: "Organization ID is required" }),
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

/**
 * GET - Retrieve templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId') || '';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Check if user has access to this organization
    const hasAccess = await verifyOrganizationAccess(session.user.id, organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Build where clause for filtering
    const whereClause: any = { organizationId };
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    // Fetch templates with author info
    const templates = await prisma.template.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform the data for frontend
    const transformedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      status: template.status,
      lastUpdated: template.updatedAt.toISOString(),
      status: template.status.toLowerCase(),
      organizationId: template.organizationId,
      createdAt: template.createdAt.toISOString(),
      previewImage: template.previewImage,
      author: template.author.firstName && template.author.lastName
        ? `${template.author.firstName} ${template.author.lastName}`
        : template.author.email,
      authorId: template.author.id,
    }));

    return NextResponse.json(transformedTemplates);

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' }, 
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    
    // Convert status to uppercase to match DB schema
    if (data.status) {
      data.status = data.status.toUpperCase();
    }
    
    // Validate data
    const validatedData = templateSchema.safeParse({
      ...data,
      status: data.status || 'DRAFT'
    });
    if (!validatedData.success) {
      return NextResponse.json({ 
        error: 'Invalid template data',
        details: validatedData.error.format() 
      }, { status: 400 });
    }

    // Check if user has access to this organization
    const hasAccess = await verifyOrganizationAccess(session.user.id, data.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Create the template
    const newTemplate = await prisma.template.create({
      data: {
        name: data.name,
        content: Array.isArray(data.content) ? JSON.stringify(data.content) : (data.content || ''),
        description: data.description || '',
        category: data.category,
        status: data.status,
        previewImage: data.previewImage,
        organizationId: data.organizationId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Format response
    const response = {
      id: newTemplate.id,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      status: newTemplate.status.toLowerCase(),
      content: Array.isArray(data.content) ? data.content : newTemplate.content,
      lastUpdated: newTemplate.updatedAt.toISOString(),
      createdAt: newTemplate.createdAt.toISOString(),
      author: newTemplate.author.firstName && newTemplate.author.lastName
        ? `${newTemplate.author.firstName} ${newTemplate.author.lastName}`
        : newTemplate.author.email,
      authorId: newTemplate.author.id,
      previewImage: newTemplate.previewImage,
      organizationId: newTemplate.organizationId,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an existing template
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    
    // Validate template ID
    if (!data.id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Find the template
    const existingTemplate = await prisma.template.findUnique({
      where: { id: data.id },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user has access to this organization
    const hasAccess = await verifyOrganizationAccess(session.user.id, existingTemplate.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Validate update data (excluding id and organizationId which shouldn't change)
    const updateSchema = templateSchema.omit({ organizationId: true }).partial();
    const validatedData = updateSchema.safeParse(data);
    
    if (!validatedData.success) {
      return NextResponse.json({ 
        error: 'Invalid template data',
        details: validatedData.error.format() 
      }, { status: 400 });
    }

    // Update the template
    const updatedTemplate = await prisma.template.update({
      where: { id: data.id },
      data: {
        name: data.name,
        content: Array.isArray(data.content) ? JSON.stringify(data.content) : data.content,
        description: data.description,
        category: data.category,
        status: data.status,
        previewImage: data.previewImage,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Format response
    const response = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      category: updatedTemplate.category,
      status: updatedTemplate.status.toLowerCase(),
      content: Array.isArray(data.content) ? data.content : updatedTemplate.content,
      lastUpdated: updatedTemplate.updatedAt.toISOString(),
      createdAt: updatedTemplate.createdAt.toISOString(),
      author: updatedTemplate.author.firstName && updatedTemplate.author.lastName
        ? `${updatedTemplate.author.firstName} ${updatedTemplate.author.lastName}`
        : updatedTemplate.author.email,
      authorId: updatedTemplate.author.id,
      previewImage: updatedTemplate.previewImage,
      organizationId: updatedTemplate.organizationId,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a template
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get template ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Find the template
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user has access to this organization
    const hasAccess = await verifyOrganizationAccess(session.user.id, template.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Delete the template
    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' }, 
      { status: 500 }
    );
  }
}
