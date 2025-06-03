import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// GET /api/content/[id]/lists
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentId = params.id;
    
    // Verify that the content exists and belongs to the user
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        OR: [
          { authorId: userId },
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

    if (!content) {
      return NextResponse.json({ error: 'Content not found or access denied' }, { status: 404 });
    }

    // Get all lists that contain this content
    const contentLists = await prisma.contentList.findMany({
      where: {
        items: {
          some: {
            contentId: contentId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        organizationId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ 
      lists: contentLists,
      totalCount: contentLists.length,
    });
  } catch (error) {
    console.error('Error fetching content lists for content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}