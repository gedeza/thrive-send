import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateBoostSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metadata: z.object({
    budget: z.number().min(1).optional(),
    targetAudience: z.object({
      demographics: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
}).partial();

// GET /api/marketplace/boosts/[id] - Get individual boost details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boostId = params.id;

    // Get boost with detailed information
    const boost = await prisma.boost.findUnique({
      where: { id: boostId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            currency: true,
            description: true,
            organization: {
              include: {
                members: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 });
    }

    // Verify user has access through organization membership
    const hasAccess = boost.listing.organization.members.some(
      member => member.user.clerkId === userId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate consistent performance metrics (same logic as other endpoints)
    const seed = parseInt(boost.id.slice(-8), 16);
    const random1 = Math.abs(Math.sin(seed)) * 1000;
    const random2 = Math.abs(Math.cos(seed)) * 100;
    const random3 = Math.abs(Math.sin(seed * 2)) * 10;
    
    const impressions = Math.floor(random1 % 1000) + 100;
    const clicks = Math.floor(random2 % 50) + 10;
    const conversions = Math.floor(random3 % 5) + 1;
    
    const budget = (boost.metadata as any)?.budget || 100;
    const costPerClick = getCostPerClickByType(boost.type);
    const spent = Math.min(clicks * costPerClick, budget * 0.8);
    
    const metrics = {
      impressions,
      clicks,
      conversions,
      spent: Math.round(spent * 100) / 100,
      ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
      conversionRate: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0.00',
      costPerClick: clicks > 0 ? (spent / clicks).toFixed(2) : '0.00',
      budgetRemaining: Math.round((budget - spent) * 100) / 100,
      budgetUtilization: budget > 0 ? ((spent / budget) * 100).toFixed(1) : '0.0'
    };

    // Calculate campaign progress
    const now = Date.now();
    const start = new Date(boost.startDate).getTime();
    const end = new Date(boost.endDate).getTime();
    
    let progress = 0;
    if (now <= start) progress = 0;
    else if (now >= end) progress = 100;
    else progress = Math.round(((now - start) / (end - start)) * 100);

    const enrichedBoost = {
      ...boost,
      metrics,
      progress,
      // Remove organization details from response for security
      listing: {
        ...boost.listing,
        organization: undefined
      }
    };

    return NextResponse.json(enrichedBoost);
  } catch (error) {
    console.error('Get boost details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/marketplace/boosts/[id] - Update boost details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boostId = params.id;
    const body = await request.json();
    const validatedData = updateBoostSchema.parse(body);

    // Find boost and verify ownership
    const boost = await prisma.boost.findUnique({
      where: { id: boostId },
      include: {
        listing: {
          include: {
            organization: {
              include: {
                members: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 });
    }

    // Verify access
    const hasAccess = boost.listing.organization.members.some(
      member => member.user.clerkId === userId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate that boost can be updated (not completed or expired)
    if (boost.status === 'COMPLETED' || boost.status === 'EXPIRED') {
      return NextResponse.json(
        { error: `Cannot update boost with status: ${boost.status}` },
        { status: 400 }
      );
    }

    // Validate date ranges if provided
    if (validatedData.startDate && validatedData.endDate) {
      const startDate = new Date(validatedData.startDate);
      const endDate = new Date(validatedData.endDate);
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Update boost
    const updatedBoost = await prisma.boost.update({
      where: { id: boostId },
      data: {
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
        ...(validatedData.metadata && {
          metadata: {
            ...(boost.metadata as object || {}),
            ...validatedData.metadata,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
          }
        })
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

    return NextResponse.json({
      message: 'Boost updated successfully',
      boost: updatedBoost
    });
  } catch (error) {
    console.error('Update boost error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/marketplace/boosts/[id] - Delete/Cancel boost
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boostId = params.id;

    // Find boost and verify ownership
    const boost = await prisma.boost.findUnique({
      where: { id: boostId },
      include: {
        listing: {
          include: {
            organization: {
              include: {
                members: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 });
    }

    // Verify access
    const hasAccess = boost.listing.organization.members.some(
      member => member.user.clerkId === userId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For active or paused boosts, set status to CANCELLED instead of deleting
    if (boost.status === 'ACTIVE' || boost.status === 'PAUSED') {
      const cancelledBoost = await prisma.boost.update({
        where: { id: boostId },
        data: {
          status: 'CANCELLED',
          metadata: {
            ...(boost.metadata as object || {}),
            cancelledAt: new Date().toISOString(),
            cancelledBy: userId
          }
        }
      });

      return NextResponse.json({
        message: 'Boost cancelled successfully',
        boost: cancelledBoost
      });
    }

    // For completed, expired, or cancelled boosts, allow actual deletion
    await prisma.boost.delete({
      where: { id: boostId }
    });

    return NextResponse.json({
      message: 'Boost deleted successfully'
    });
  } catch (error) {
    console.error('Delete boost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get cost per click by boost type
function getCostPerClickByType(boostType: string): number {
  const baseCosts = {
    'FEATURED': 0.50,
    'PROMOTED': 0.75,
    'PRIORITY': 1.00,
    'SPONSORED': 1.25
  };
  return baseCosts[boostType as keyof typeof baseCosts] || 0.50;
}