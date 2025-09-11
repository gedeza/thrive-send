import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBoostSchema = z.object({
  listingId: z.string(),
  type: z.enum(['FEATURED', 'PROMOTED', 'PRIORITY', 'SPONSORED']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().min(1),
  targetAudience: z.object({
    demographics: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
  }).optional(),
});

// GET /api/marketplace/boosts - Get boosts for user's listings
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const listingId = searchParams.get('listingId');

    const where: any = {
      listing: {
        createdById: userId
      }
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (listingId) {
      where.listingId = listingId;
    }

    const boosts = await prisma.boost.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            currency: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate boost performance metrics
    const enrichedBoosts = await Promise.all(
      boosts.map(async (boost) => {
        // TODO: Add actual analytics data from boost performance
        const metrics = {
          impressions: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 50) + 10,
          conversions: Math.floor(Math.random() * 5) + 1,
          spent: Math.floor(Math.random() * boost.metadata?.budget || 100)
        };

        return {
          ...boost,
          metrics
        };
      })
    );

    return NextResponse.json({ boosts: enrichedBoosts });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch boosts' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/boosts - Create a new boost
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBoostSchema.parse(body);

    // Verify user owns the listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: validatedData.listingId }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.createdById !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to boost this listing' },
        { status: 403 }
      );
    }

    // Check for overlapping active boosts
    const overlappingBoosts = await prisma.boost.findMany({
      where: {
        listingId: validatedData.listingId,
        status: 'ACTIVE',
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(validatedData.startDate) } },
              { endDate: { gte: new Date(validatedData.startDate) } }
            ]
          },
          {
            AND: [
              { startDate: { lte: new Date(validatedData.endDate) } },
              { endDate: { gte: new Date(validatedData.endDate) } }
            ]
          }
        ]
      }
    });

    if (overlappingBoosts.length > 0) {
      return NextResponse.json(
        { error: 'Boost period overlaps with existing active boost' },
        { status: 400 }
      );
    }

    // Create the boost
    const boost = await prisma.boost.create({
      data: {
        listingId: validatedData.listingId,
        type: validatedData.type,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        status: 'ACTIVE',
        metadata: {
          budget: validatedData.budget,
          targetAudience: validatedData.targetAudience,
          costPerClick: calculateCostPerClick(validatedData.type),
          estimatedReach: calculateEstimatedReach(validatedData.budget, validatedData.type)
        }
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            currency: true
          }
        }
      }
    });

    return NextResponse.json(boost, { status: 201 });
  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create boost' },
      { status: 500 }
    );
  }
}

// Helper functions for boost calculations
function calculateCostPerClick(boostType: string): number {
  const baseCosts = {
    FEATURED: 0.50,
    PROMOTED: 0.75,
    PRIORITY: 1.00,
    SPONSORED: 1.25
  };
  return baseCosts[boostType as keyof typeof baseCosts] || 0.50;
}

function calculateEstimatedReach(budget: number, boostType: string): number {
  const cpc = calculateCostPerClick(boostType);
  const clicks = budget / cpc;
  const impressionMultiplier = {
    FEATURED: 20,
    PROMOTED: 25,
    PRIORITY: 30,
    SPONSORED: 35
  };
  return Math.floor(clicks * (impressionMultiplier[boostType as keyof typeof impressionMultiplier] || 20));
}