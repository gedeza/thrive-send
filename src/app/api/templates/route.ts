import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Zod schema for template validation
const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  content: z.string().optional(),
});

// GET /api/templates - fetch all templates for the organization
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const templates = await prisma.template.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    return NextResponse.json(templates);
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

      const template = await prisma.template.create({
        data: {
          id: Math.random().toString(36).substring(2, 9), // Generate a random ID
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

    const template = await prisma.template.update({
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

    await prisma.template.delete({
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
