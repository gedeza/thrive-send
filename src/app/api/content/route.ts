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
  title: z.string()
    .min(3, 'Please enter a title (at least 3 characters)')
    .max(100, 'Title is too long (maximum 100 characters)'),
  type: z.enum(['ARTICLE', 'BLOG', 'SOCIAL', 'EMAIL'] as const, {
    errorMap: () => ({ message: 'Please select a valid content type' })
  }),
  content: z.string()
    .min(10, 'Please enter some content (at least 10 characters)')
    .refine((val) => val.trim().length > 0, {
      message: 'Please enter some content'
    }),
  excerpt: z.string()
    .max(200, 'Excerpt is too long (maximum 200 characters)')
    .optional(),
  tags: z.array(z.string())
    .max(5, 'You can add up to 5 tags')
    .default([]),
  media: z.array(z.any()).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] as const).default('DRAFT'),
  scheduledAt: z.string().datetime().optional(),
  slug: z.string().min(1, 'Please enter a slug').optional(),
}).catchall(z.any());

const querySchema = z.object({
  type: z.enum(['ARTICLE', 'BLOG', 'SOCIAL', 'EMAIL'] as const).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] as const).optional(),
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
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    // If user doesn't exist in our database, create them
    // This handles cases where the webhook might not have fired or failed
    if (!user) {
      console.log('User not found in database, attempting to create:', clerkId);
      
      try {
        // We'll create a minimal user record - this should ideally be handled by webhooks
        // but this provides a fallback for development/testing
        user = await prisma.user.create({
          data: {
            clerkId,
            email: `user-${clerkId}@temp.local`, // Temporary email - should be updated by webhook
            firstName: 'User',
            lastName: 'Account',
            role: 'CONTENT_CREATOR', // Default role
          }
        });
        console.log('Created fallback user record:', user.id);
      } catch (createError) {
        console.error('Failed to create fallback user:', createError);
        return NextResponse.json({ 
          error: 'User account setup incomplete', 
          details: 'Please contact support to complete your account setup'
        }, { status: 500 });
      }
    }

    const body = await request.json();
    console.log('API received body:', body);
    
    try {
      // Transform the request body to use uppercase enum values
      const transformedBody = {
        ...body,
        type: body.type?.toUpperCase(),
        status: body.status?.toUpperCase() || 'DRAFT'
      };
      
      const validatedData = contentSchema.parse(transformedBody);
      console.log('Validation successful:', validatedData);

      try {
        // Generate slug from title if not provided
        const slug = validatedData.slug || validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Check if slug already exists
        const existingContent = await prisma.content.findUnique({
          where: { slug }
        });

        const finalSlug = existingContent ? `${slug}-${Date.now()}` : slug;

        const content = await prisma.content.create({
          data: {
            title: validatedData.title,
            slug: finalSlug,
            type: validatedData.type,
            status: validatedData.status,
            content: validatedData.content,
            excerpt: validatedData.excerpt,
            media: validatedData.media ? JSON.stringify(validatedData.media) : undefined,
            tags: validatedData.tags,
            authorId: user.id,
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