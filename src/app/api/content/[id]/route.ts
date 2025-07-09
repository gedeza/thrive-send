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
// Replace getAuth with the standard auth() function for consistency
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user and their organization membership (similar to main content API)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizationMemberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user || user.organizationMemberships.length === 0) {
      return NextResponse.json({ message: 'User not found or not part of any organization' }, { status: 404 });
    }

    const organizationId = user.organizationMemberships[0].organizationId;

    // Get all users in the same organization
    const organizationMembers = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true }
    });

    const memberUserIds = organizationMembers.map(member => member.user.id);

    const content = await prisma.content.findFirst({
      where: {
        id: params.id,
        authorId: { in: memberUserIds }, // Filter by organization members instead of just userId
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

    // Get user and their organization membership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizationMemberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user || user.organizationMemberships.length === 0) {
      return NextResponse.json({ message: 'User not found or not part of any organization' }, { status: 404 });
    }

    const organizationId = user.organizationMemberships[0].organizationId;

    // Get all users in the same organization
    const organizationMembers = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true }
    });

    const memberUserIds = organizationMembers.map(member => member.user.id);

    const content = await prisma.content.findFirst({
      where: {
        id: params.id,
        authorId: { in: memberUserIds }, // Filter by organization members
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
    const { userId: clerkId } = getAuth(request);
    if (!clerkId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from our database using their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // First, check if the content exists
    const content = await prisma.content.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    // Check if the user is the author (authorization) - now comparing database user IDs
    if (content.authorId !== user.id) {
      return NextResponse.json({ message: 'Forbidden: You can only delete your own content' }, { status: 403 });
    }

    // Delete the content
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