import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { contentFormSchema } from '@/lib/validations/content';
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

// Validation schemas
const contentTypes = ['article', 'blog', 'social', 'email'] as const;
type ContentType = typeof contentTypes[number];

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['article', 'blog', 'social', 'email'], {
    errorMap: () => ({ message: 'Please select a valid content type' })
  }),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().optional(),
  media: z.any().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived'], {
    errorMap: () => ({ message: 'Status must be either draft, scheduled, published, or archived' })
  }),
  scheduledAt: z.string().datetime().optional(),
  slug: z.string().min(1, 'Slug is required'),
});

const querySchema = z.object({
  type: z.enum(['article', 'blog', 'social', 'email']).optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// GET /api/content
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = querySchema.parse(query);

    const page = parseInt(validatedQuery.page || '1');
    const limit = parseInt(validatedQuery.limit || '10');
    const skip = (page - 1) * limit;

    const where = {
      authorId: userId,
      ...(validatedQuery.type && { type: validatedQuery.type }),
      ...(validatedQuery.status && { status: validatedQuery.status }),
    };

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          status: true,
          content: true,
          excerpt: true,
          media: true,
          tags: true,
          scheduledAt: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      content,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/content
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from our database using their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      console.error('User not found in database:', clerkId);
      return NextResponse.json({ 
        error: 'User not found', 
        details: 'The authenticated user does not exist in our database'
      }, { status: 404 });
    }

    const body = await request.json();
    console.log('API received body:', body);
    
    try {
      const validatedData = contentSchema.parse(body);
      console.log('Validation successful:', validatedData);

      try {
        // Check if slug already exists
        const existingContent = await prisma.content.findUnique({
          where: { slug: validatedData.slug }
        });

        if (existingContent) {
          // Append a timestamp to make the slug unique
          validatedData.slug = `${validatedData.slug}-${Date.now()}`;
        }

        const content = await prisma.content.create({
          data: {
            title: validatedData.title,
            slug: validatedData.slug,
            type: validatedData.type,
            status: validatedData.status,
            content: validatedData.content,
            excerpt: validatedData.excerpt,
            media: validatedData.media ? JSON.stringify(validatedData.media) : null,
            tags: validatedData.tags,
            authorId: user.id, // Use the database user ID instead of Clerk ID
            scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
          },
        });
        console.log('Content created successfully:', content);
        return NextResponse.json(content);
      } catch (prismaError) {
        console.error('Prisma error details:', prismaError);
        return NextResponse.json({ 
          error: 'Database error', 
          details: prismaError instanceof Error ? prismaError.message : 'Unknown database error',
          code: prismaError instanceof Prisma.PrismaClientKnownRequestError ? prismaError.code : undefined
        }, { status: 500 });
      }
    } catch (validationError) {
      console.error('Validation error details:', validationError);
      if (validationError instanceof z.ZodError) {
        const errorDetails = validationError.errors.map(err => ({
          path: err.path,
          message: err.message
        }));
        console.error('Validation error details:', errorDetails);
        return NextResponse.json({ 
          error: 'Invalid content data', 
          details: errorDetails,
          receivedData: body 
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error creating content:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid content data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT /api/content/[id]
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;
    const validatedData = contentSchema.parse(data);

    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        ...validatedData,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid content data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 