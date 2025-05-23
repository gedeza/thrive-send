import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Validation schema for template creation
const TemplateCreateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  category: z.string().min(1, { message: 'Category is required' }),
  status: z.string().default("DRAFT"),
  previewImage: z.string().nullable().optional(),
  organizationId: z.string().min(1, 'Organization is required'),
});

// GET: List templates
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");
    const category = url.searchParams.get("category");

    // Build WHERE filter
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (category) where.category = category;

    const templates = await db.campaignTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { id: true, name: true } },
        User: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new template
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const validatedData = TemplateCreateSchema.parse(data);

    // Create template
    const template = await db.campaignTemplate.create({
      data: {
        ...validatedData,
        authorId: userId,
        lastUpdated: new Date(),
      },
      include: {
        organization: { select: { id: true, name: true } },
        User: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 