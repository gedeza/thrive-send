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
    
    // Get the user to check organization membership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get organization IDs the user belongs to
    const organizationIds = user.organizationMemberships.map(m => m.organizationId);

    // Verify that the content exists and user has access
    const content = await db.content.findFirst({
      where: {
        id: contentId,
        authorId: user.id, // Use internal user ID, not Clerk ID
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found or access denied' }, { status: 404 });
    }

    // Get all lists that contain this content and belong to user's organizations
    const contentLists = await db.contentList.findMany({
      where: {
        AND: [
          {
            items: {
              some: {
                contentId: contentId,
              },
            },
          },
          {
            OR: [
              { ownerId: user.id }, // Lists owned by the user
              { organizationId: { in: organizationIds } }, // Lists in user's organizations
            ],
          },
        ],
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
  } catch (_error) {
    console.error('Error fetching content lists for content:', {
      contentId: params.id,
      userId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}