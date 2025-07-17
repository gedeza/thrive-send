import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

// PATCH /api/content/[id] - For partial updates (used by ContentForm)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'User not found or not part of any organization' }, { status: 404 });
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
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Transform the request body to match our schema
    const transformedData = {
      ...body,
      type: body.type?.toUpperCase() || content.type,
      status: body.status?.toUpperCase() || content.status,
    };

    // Only update fields that are provided
    const updateData: any = {};
    
    if (transformedData.title !== undefined) updateData.title = transformedData.title;
    if (transformedData.type !== undefined) updateData.type = transformedData.type;
    if (transformedData.content !== undefined) updateData.content = transformedData.content;
    if (transformedData.excerpt !== undefined) updateData.excerpt = transformedData.excerpt;
    if (transformedData.tags !== undefined) updateData.tags = transformedData.tags;
    if (transformedData.media !== undefined) {
      updateData.media = transformedData.media ? JSON.stringify(transformedData.media) : null;
    }
    if (transformedData.status !== undefined) updateData.status = transformedData.status;
    if (transformedData.scheduledAt !== undefined) {
      updateData.scheduledAt = transformedData.scheduledAt ? new Date(transformedData.scheduledAt) : null;
    }
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const updatedContent = await prisma.content.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error in PATCH /api/content/[id]:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid content data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/content/[id] - For complete updates (legacy support)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'User not found or not part of any organization' }, { status: 404 });
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
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Transform the request body to match our schema
    const transformedData = {
      ...body,
      type: body.type?.toUpperCase() || 'BLOG',
      status: body.status?.toUpperCase() || 'DRAFT',
    };

    const updatedContent = await prisma.content.update({
      where: {
        id: params.id,
      },
      data: {
        title: transformedData.title,
        type: transformedData.type,
        content: transformedData.content,
        excerpt: transformedData.excerpt,
        tags: transformedData.tags || [],
        media: transformedData.media ? JSON.stringify(transformedData.media) : null,
        status: transformedData.status,
        scheduledAt: transformedData.scheduledAt ? new Date(transformedData.scheduledAt) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error in PUT /api/content/[id]:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid content data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/content/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'User not found or not part of any organization' }, { status: 404 });
    }

    const organizationId = user.organizationMemberships[0].organizationId;

    // Get all users in the same organization
    const organizationMembers = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true }
    });

    const memberUserIds = organizationMembers.map(member => member.user.id);

    // Find content that belongs to the organization
    const content = await prisma.content.findFirst({
      where: {
        id: params.id,
        authorId: { in: memberUserIds }, // Must be in the same organization
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found or access denied' }, { status: 404 });
    }

    // For security, only allow deletion by content author or admin
    // Check if user is author or has admin permissions
    const canDelete = content.authorId === user.id || user.role === 'ADMIN';
    
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own content' }, { status: 403 });
    }

    // Delete related calendar events first (if any)
    try {
      await prisma.calendarEvent.deleteMany({
        where: {
          contentId: params.id,
        },
      });
    } catch (calendarError) {
      console.warn('Failed to delete related calendar events:', calendarError);
      // Continue with content deletion even if calendar cleanup fails
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}