import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest } from 'next/server';

// Validation schemas
const contentTypes = ['article', 'blog', 'social', 'email'] as const;
type ContentType = typeof contentTypes[number];

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contentType: z.enum(contentTypes),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()),
  preheaderText: z.string().max(100, 'Preheader text must be less than 100 characters'),
  publishDate: z.string().optional(),
  status: z.enum(['draft', 'published']),
  mediaUrls: z.array(z.string().url()).optional(),
});

const querySchema = z.object({
  status: z.enum(['draft', 'published']).optional(),
  contentType: z.enum(['article', 'blog', 'social', 'email']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// GET /api/content
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = querySchema.parse(query);

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    const where = {
      userId,
      ...(validatedQuery.status && { status: validatedQuery.status }),
      ...(validatedQuery.contentType && { contentType: validatedQuery.contentType }),
    };

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      content,
      total,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
    });
  } catch (error) {
    console.error('Error in GET /api/content:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid query parameters', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/content
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const data = {
      title: formData.get('title'),
      contentType: formData.get('contentType'),
      content: formData.get('content'),
      tags: JSON.parse(formData.get('tags') as string),
      preheaderText: formData.get('preheaderText'),
      publishDate: formData.get('publishDate'),
      status: formData.get('status'),
      mediaUrls: JSON.parse(formData.get('mediaUrls') as string || '[]'),
    };

    const validatedData = contentSchema.parse(data);

    const content = await prisma.content.create({
      data: {
        ...validatedData,
        userId,
        publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : null,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in POST /api/content:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid content data', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 