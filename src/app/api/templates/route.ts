import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Zod schema for template validation
const templateSchema = z.object({
  id: z.string().optional(), // Accept optional client-provided ID
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  content: z.string().optional(),
});

// GET /api/templates - fetch all templates for the organization with AI enhancements
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check for enhanced mode (includes AI data)
    const { searchParams } = new URL(req.url);
    const enhanced = searchParams.get('enhanced') === 'true';
    const context = searchParams.get('context');
    const limit = parseInt(searchParams.get('limit') || '50');

    let templates;
    
    if (enhanced) {
      // Fetch templates with AI enhancements
      templates = await db.template.findMany({
        where: {
          organizationId: orgId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          _count: {
            select: {
              templateUsages: true
            }
          },
          templateUsages: {
            where: {
              userId: userId, // User's own usage
            },
            take: 1,
            orderBy: {
              timestamp: 'desc'
            }
          }
        },
        orderBy: [
          { aiRecommended: 'desc' }, // AI recommended first
          { performanceScore: 'desc' }, // Then by performance
          { lastUpdated: 'desc' } // Finally by recency
        ],
        take: limit,
      });

      // Transform data to include AI enhancements
      const enhancedTemplates = templates.map(template => ({
        ...template,
        usageCount: template._count.templateUsages,
        lastUsedByUser: template.templateUsages[0]?.timestamp || null,
        engagementRate: template.performanceScore ? template.performanceScore * 0.2 : 0, // Simulated
        aiRecommended: template.aiRecommended || false,
        performanceScore: template.performanceScore || 0,
        // Remove internal fields
        _count: undefined,
        templateUsages: undefined,
      }));

      return NextResponse.json(enhancedTemplates);
    } else {
      // Standard template fetch
      templates = await db.template.findMany({
        where: {
          organizationId: orgId,
        },
        orderBy: {
          lastUpdated: 'desc',
        },
        take: limit,
      });

      return NextResponse.json(templates);
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/templates - create a new template
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Received template data:", body); // Debug log

    try {
      const validatedData = templateSchema.parse(body);
      console.log("Validated template data:", validatedData); // Debug log

      // Use client-provided ID if available and valid, otherwise generate with nanoid
      const templateId = validatedData.id && validatedData.id.length > 0 
        ? validatedData.id 
        : nanoid();

      const template = await db.template.create({
        data: {
          id: templateId,
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
          status: validatedData.status,
          content: validatedData.content,
          organizationId: orgId,
          authorId: userId,
          lastUpdated: new Date(),
        },
        include: {
          author: true,
          organization: true,
        },
      });

      console.log("Created template:", template); // Debug log
      return NextResponse.json(template);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/:id - update a template
export async function PUT(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = templateSchema.parse(body);

    const template = await db.template.update({
      where: {
        id: body.id,
        organizationId: orgId,
      },
      data: validatedData,
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/templates/:id - delete a template
export async function DELETE(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 });
    }

    await db.template.delete({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
