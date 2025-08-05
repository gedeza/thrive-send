import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { 
  Newsletter, 
  CreateNewsletterRequest, 
  NewsletterFilters,
  PaginationParams,
  PaginatedResponse 
} from '@/types/recommendation';

// Newsletter Management API
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const categories = searchParams.get('categories')?.split(',') || [];
    const minSubscribers = searchParams.get('minSubscribers') ? parseInt(searchParams.get('minSubscribers')!) : undefined;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Build where clause
    const where: any = {
      organizationId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActiveForRecommendations = isActive === 'true';
    }

    if (categories.length > 0) {
      where.categories = {
        hasSome: categories,
      };
    }

    if (minSubscribers !== undefined) {
      where.subscriberCount = {
        gte: minSubscribers,
      };
    }

    // Get total count for pagination
    const total = await prisma.newsletter?.count({ where }) || 0;

    // Get newsletters with relations
    const newsletters = await prisma.newsletter?.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        outgoingRecommendations: {
          where: { status: 'ACTIVE' },
          include: {
            toNewsletter: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        incomingRecommendations: {
          where: { status: 'ACTIVE' },
          include: {
            fromNewsletter: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { subscriberCount: 'desc' },
        { updatedAt: 'desc' },
      ],
    }) || [];

    const response: PaginatedResponse<Newsletter> = {
      data: newsletters as Newsletter[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateNewsletterRequest = await request.json();
    const { title, description, clientId, categories, targetAudience, subscriberCount } = body;

    if (!title || !clientId) {
      return NextResponse.json(
        { error: 'Title and client ID are required' },
        { status: 400 }
      );
    }

    // Verify client belongs to the user's organization
    const client = await prisma.client?.findFirst({
      where: {
        id: clientId,
        organization: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        organization: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create newsletter
    const newsletter = await prisma.newsletter?.create({
      data: {
        title,
        description,
        clientId,
        organizationId: client.organizationId,
        categories: categories || [],
        targetAudience: targetAudience || {},
        subscriberCount: subscriberCount || 0,
        isActiveForRecommendations: true,
        recommendationWeight: 1.0,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  }
}

// Newsletter-specific operations
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newsletterId = searchParams.get('id');

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID required' }, { status: 400 });
    }

    const body = await request.json();

    // Verify ownership
    const existingNewsletter = await prisma.newsletter?.findFirst({
      where: {
        id: newsletterId,
        organization: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!existingNewsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update newsletter
    const newsletter = await prisma.newsletter?.update({
      where: { id: newsletterId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        outgoingRecommendations: {
          where: { status: 'ACTIVE' },
          include: {
            toNewsletter: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        incomingRecommendations: {
          where: { status: 'ACTIVE' },
          include: {
            fromNewsletter: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newsletterId = searchParams.get('id');

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID required' }, { status: 400 });
    }

    // Verify ownership
    const existingNewsletter = await prisma.newsletter?.findFirst({
      where: {
        id: newsletterId,
        organization: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!existingNewsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete newsletter (cascades to recommendations and matches)
    await prisma.newsletter?.delete({
      where: { id: newsletterId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter' },
      { status: 500 }
    );
  }
}