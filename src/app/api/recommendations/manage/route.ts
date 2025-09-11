import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { 
  NewsletterRecommendation, 
  CreateRecommendationRequest,
  RecommendationStatus,
  RecommendationType,
  PaginatedResponse 
} from '@/types/recommendation';

// Recommendation Management API
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
    const status = searchParams.get('status') as RecommendationStatus;
    const type = searchParams.get('type') as RecommendationType;
    const newsletterId = searchParams.get('newsletterId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Build where clause
    const where: any = {
      OR: [
        {
          fromNewsletter: {
            organizationId,
          },
        },
        {
          toNewsletter: {
            organizationId,
          },
        },
      ],
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (newsletterId) {
      where.OR = [
        { fromNewsletterId: newsletterId },
        { toNewsletterId: newsletterId },
      ];
    }

    // Get total count for pagination
    const total = await prisma.newsletterRecommendation?.count({ where }) || 0;

    // Get recommendations with relations
    const recommendations = await prisma.newsletterRecommendation?.findMany({
      where,
      include: {
        fromNewsletter: {
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            categories: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        toNewsletter: {
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            categories: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        performance: {
          where: {
            periodStart: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: {
            periodStart: 'desc',
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { updatedAt: 'desc' },
      ],
    }) || [];

    const response: PaginatedResponse<NewsletterRecommendation> = {
      data: recommendations as NewsletterRecommendation[],
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
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
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

    const body: CreateRecommendationRequest = await request.json();
    const { fromNewsletterId, toNewsletterId, type, priority, endDate, metadata } = body;

    if (!fromNewsletterId || !toNewsletterId) {
      return NextResponse.json(
        { error: 'Both newsletter IDs are required' },
        { status: 400 }
      );
    }

    if (fromNewsletterId === toNewsletterId) {
      return NextResponse.json(
        { error: 'Cannot recommend newsletter to itself' },
        { status: 400 }
      );
    }

    // Verify user has access to the from newsletter
    const fromNewsletter = await prisma.newsletter?.findFirst({
      where: {
        id: fromNewsletterId,
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

    if (!fromNewsletter) {
      return NextResponse.json(
        { error: 'Source newsletter not found or unauthorized' },
        { status: 404 }
      );
    }

    // Verify target newsletter exists and is active
    const toNewsletter = await prisma.newsletter?.findFirst({
      where: {
        id: toNewsletterId,
        isActiveForRecommendations: true,
      },
      include: {
        organization: true,
      },
    });

    if (!toNewsletter) {
      return NextResponse.json(
        { error: 'Target newsletter not found or not available for recommendations' },
        { status: 404 }
      );
    }

    // Check if recommendation already exists
    const existingRecommendation = await prisma.newsletterRecommendation?.findFirst({
      where: {
        fromNewsletterId,
        toNewsletterId,
      },
    });

    if (existingRecommendation) {
      return NextResponse.json(
        { error: 'Recommendation already exists' },
        { status: 409 }
      );
    }

    // Calculate audience overlap (simple approximation)
    const overlap = calculateAudienceOverlap(fromNewsletter.categories, toNewsletter.categories);
    const estimatedReach = Math.floor(fromNewsletter.subscriberCount * 0.1); // 10% estimated reach

    // Create recommendation
    const recommendation = await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId,
        toNewsletterId,
        type: type || RecommendationType.ONE_WAY,
        priority: priority || 5,
        status: RecommendationStatus.ACTIVE,
        endDate: endDate ? new Date(endDate) : undefined,
        targetAudienceOverlap: overlap,
        estimatedReach,
        metadata: metadata || {},
      },
      include: {
        fromNewsletter: {
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            categories: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        toNewsletter: {
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            categories: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If this is a mutual recommendation, create the reverse recommendation
    if (type === RecommendationType.MUTUAL) {
      await prisma.newsletterRecommendation?.create({
        data: {
          fromNewsletterId: toNewsletterId,
          toNewsletterId: fromNewsletterId,
          type: RecommendationType.MUTUAL,
          priority: priority || 5,
          status: RecommendationStatus.PENDING_APPROVAL,
          endDate: endDate ? new Date(endDate) : undefined,
          targetAudienceOverlap: overlap,
          estimatedReach: Math.floor(toNewsletter.subscriberCount * 0.1),
          metadata: { 
            ...metadata, 
            mutualRecommendationId: recommendation?.id,
            autoGenerated: true 
          },
        },
      });
    }

    return NextResponse.json(recommendation, { status: 201 });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('id');

    if (!recommendationId) {
      return NextResponse.json({ error: 'Recommendation ID required' }, { status: 400 });
    }

    const body = await request.json();

    // Verify user has access to this recommendation
    const existingRecommendation = await prisma.newsletterRecommendation?.findFirst({
      where: {
        id: recommendationId,
        OR: [
          {
            fromNewsletter: {
              organization: {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
          {
            toNewsletter: {
              organization: {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!existingRecommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update recommendation
    const recommendation = await prisma.newsletterRecommendation?.update({
      where: { id: recommendationId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        fromNewsletter: {
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            categories: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        toNewsletter: {
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            categories: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        performance: {
          orderBy: {
            periodStart: 'desc',
          },
          take: 5,
        },
      },
    });

    return NextResponse.json(recommendation);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
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
    const recommendationId = searchParams.get('id');

    if (!recommendationId) {
      return NextResponse.json({ error: 'Recommendation ID required' }, { status: 400 });
    }

    // Verify user has access to this recommendation
    const existingRecommendation = await prisma.newsletterRecommendation?.findFirst({
      where: {
        id: recommendationId,
        fromNewsletter: {
          organization: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
    });

    if (!existingRecommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found or unauthorized' },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as ended to preserve historical data
    await prisma.newsletterRecommendation?.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.ENDED,
        endDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to end recommendation' },
      { status: 500 }
    );
  }
}

// Helper function to calculate audience overlap
function calculateAudienceOverlap(categories1: string[], categories2: string[]): number {
  if (!categories1.length || !categories2.length) return 0;
  
  const intersection = categories1.filter(cat => categories2.includes(cat));
  const union = [...new Set([...categories1, ...categories2])];
  
  return Math.round((intersection.length / union.length) * 100);
}