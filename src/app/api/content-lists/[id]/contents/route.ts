import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const associateContentSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentListId = params.id;
    
    // Verify that the content list exists and belongs to the user
    const contentList = await prisma.contentList.findFirst({
      where: {
        id: contentListId,
        OR: [
          { ownerId: userId },
          { 
            organization: {
              members: {
                some: {
                  userId
                }
              }
            } 
          }
        ]
      },
    });

    if (!contentList) {
      return NextResponse.json({ error: 'Content list not found or access denied' }, { status: 404 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = associateContentSchema.parse(body);

    // Verify that the content exists
    const content = await prisma.content.findUnique({
      where: { id: validatedData.contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if the content is already in the list
    const existingAssociation = await prisma.contentListItem.findFirst({
      where: {
        contentListId: contentListId,
        contentId: validatedData.contentId,
      },
    });

    if (existingAssociation) {
      return NextResponse.json({ 
        message: 'Content is already in this list',
        association: existingAssociation 
      });
    }

    // Create the association
    const association = await prisma.contentListItem.create({
      data: {
        contentId: validatedData.contentId,
        contentListId: contentListId,
      },
    });

    return NextResponse.json({ 
      message: 'Content added to list successfully',
      association
    });
  } catch (error) {
    console.error('Error associating content with list:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentListId = params.id;
    
    // Verify that the content list exists and belongs to the user
    const contentList = await prisma.contentList.findFirst({
      where: {
        id: contentListId,
        OR: [
          { ownerId: userId },
          { 
            organization: {
              members: {
                some: {
                  userId
                }
              }
            } 
          }
        ]
      },
    });

    if (!contentList) {
      return NextResponse.json({ error: 'Content list not found or access denied' }, { status: 404 });
    }

    // Get all content in the list
    const contents = await prisma.contentListItem.findMany({
      where: {
        contentListId: contentListId,
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            status: true,
            excerpt: true,
            tags: true,
            scheduledAt: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({ 
      contents: contents.map(item => item.content),
      totalCount: contents.length,
    });
  } catch (error) {
    console.error('Error fetching content list contents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentListId = params.id;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }
    
    // Verify that the content list exists and belongs to the user
    const contentList = await prisma.contentList.findFirst({
      where: {
        id: contentListId,
        OR: [
          { ownerId: userId },
          { 
            organization: {
              members: {
                some: {
                  userId
                }
              }
            } 
          }
        ]
      },
    });

    if (!contentList) {
      return NextResponse.json({ error: 'Content list not found or access denied' }, { status: 404 });
    }

    // Delete the association
    await prisma.contentListItem.deleteMany({
      where: {
        contentListId: contentListId,
        contentId: contentId,
      },
    });

    return NextResponse.json({ 
      message: 'Content removed from list successfully' 
    });
  } catch (error) {
    console.error('Error removing content from list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 