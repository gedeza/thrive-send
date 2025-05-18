import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest } from 'next/server';

// Validation schema
const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contentType: z.enum(['article', 'blog', 'social', 'email']),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()),
  preheaderText: z.string().max(100, 'Preheader text must be less than 100 characters'),
  publishDate: z.string().optional(),
  status: z.enum(['draft', 'published']),
  mediaUrls: z.array(z.string().url()).optional(),
});

// GET /api/content/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.content.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in GET /api/content/[id]:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/content/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.content.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
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

    const updatedContent = await prisma.content.update({
      where: {
        id: params.id,
      },
      data: {
        ...validatedData,
        publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : null,
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error in PUT /api/content/[id]:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid content data', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/content/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.content.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    await prisma.content.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/content/[id]:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 