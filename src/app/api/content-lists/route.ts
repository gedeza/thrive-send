import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const contentListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long (maximum 100 characters)'),
  description: z.string().max(500, 'Description is too long (maximum 500 characters)').optional(),
});

// GET /api/content-lists
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all content lists for the user
    const lists = await prisma.ContentList.findMany({
      where: {
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      lists,
      total: lists.length,
    });
  } catch (error) {
    console.error('Error fetching content lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/content-lists
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = contentListSchema.parse(body);

    // Create the content list
    const contentList = await prisma.ContentList.create({
      data: {
        ...validatedData,
        ownerId: userId,
        organizationId: orgId || '', // If orgId is null, use empty string (this should be handled better in production)
      },
    });

    return NextResponse.json(contentList);
  } catch (error) {
    console.error('Error creating content list:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 