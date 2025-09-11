import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NotificationService } from '@/lib/services/notification-service';

// Validation schemas
const mediaItemSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT']),
  url: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
});

// GET /api/content/[id]/media
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const mediaItems = await prisma.mediaItem.findMany({
      where: { contentId: params.id },
      include: {
        versions: true,
        usage: true,
      },
    });

    return NextResponse.json(mediaItems);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content/[id]/media
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const mediaData = mediaItemSchema.parse(body);

    // Check if content exists and user has permission
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    if (content.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Create media item
    const mediaItem = await prisma.mediaItem.create({
      data: {
        ...mediaData,
        contentId: params.id,
        versions: {
          create: {
            url: mediaData.url,
            type: mediaData.type,
            metadata: mediaData.metadata,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    // Update content
    await prisma.content.update({
      where: { id: params.id },
      data: {
        mediaItems: {
          connect: { id: mediaItem.id },
        },
      },
    });

    return NextResponse.json(mediaItem);
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/content/[id]/media/[mediaId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if content exists and user has permission
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    if (content.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Delete media item and its versions
    await prisma.mediaItem.delete({
      where: { id: params.mediaId },
    });

    return NextResponse.json({ message: 'Media item deleted successfully' });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 