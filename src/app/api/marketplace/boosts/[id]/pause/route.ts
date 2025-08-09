import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST /api/marketplace/boosts/[id]/pause - Pause an active boost
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boostId = params.id;

    // Find the boost and verify ownership
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

    // Verify user has access to this boost through organization membership
    const hasAccess = boost.listing.organization.members.some(
      member => member.user.clerkId === userId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if boost can be paused
    if (boost.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot pause boost with status: ${boost.status}` },
        { status: 400 }
      );
    }

    // Update boost status to PAUSED
    const updatedBoost = await prisma.boost.update({
      where: { id: boostId },
      data: { 
        status: 'PAUSED',
        // Store pause timestamp in metadata for tracking
        metadata: {
          ...(boost.metadata as object || {}),
          pausedAt: new Date().toISOString(),
          pausedBy: userId
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

    return NextResponse.json({
      message: 'Boost paused successfully',
      boost: updatedBoost
    });
  } catch (error) {
    console.error('Pause boost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/marketplace/boosts/[id]/resume - Resume a paused boost
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

    // Find the boost and verify ownership
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

    // Verify user has access
    const hasAccess = boost.listing.organization.members.some(
      member => member.user.clerkId === userId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if boost can be resumed
    if (boost.status !== 'PAUSED') {
      return NextResponse.json(
        { error: `Cannot resume boost with status: ${boost.status}` },
        { status: 400 }
      );
    }

    // Check if boost hasn't expired
    const now = new Date();
    const endDate = new Date(boost.endDate);
    
    if (now >= endDate) {
      // Update to EXPIRED if past end date
      await prisma.boost.update({
        where: { id: boostId },
        data: { status: 'EXPIRED' }
      });
      
      return NextResponse.json(
        { error: 'Cannot resume boost: campaign has expired' },
        { status: 400 }
      );
    }

    // Resume boost (set back to ACTIVE)
    const updatedBoost = await prisma.boost.update({
      where: { id: boostId },
      data: { 
        status: 'ACTIVE',
        // Update metadata to track resume
        metadata: {
          ...(boost.metadata as object || {}),
          resumedAt: new Date().toISOString(),
          resumedBy: userId,
          // Remove pausedAt since it's no longer paused
          pausedAt: undefined
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

    return NextResponse.json({
      message: 'Boost resumed successfully',
      boost: updatedBoost
    });
  } catch (error) {
    console.error('Resume boost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}