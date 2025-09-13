import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateListingSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  type: z.enum(['TEMPLATE', 'CONTENT', 'SERVICE', 'TOOL']).optional(),
  price: z.number().min(0.01).optional(),
  currency: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
});

// GET /api/marketplace/listings/[id] - Get a specific listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listing = await db.marketplaceListing.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, imageUrl: true }
        },
        organization: {
          select: { id: true, name: true, imageUrl: true }
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, firstName: true, lastName: true, imageUrl: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        boosts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true, purchases: true }
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = listing.reviews.length > 0 
      ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
      : 0;

    const enrichedListing = {
      ...listing,
      averageRating,
      reviewCount: listing._count.reviews,
      purchaseCount: listing._count.purchases
    };

    return NextResponse.json(enrichedListing);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/listings/[id] - Update a listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateListingSchema.parse(body);

    // Check if user owns this listing
    const existingListing = await db.marketplaceListing.findUnique({
      where: { id: params.id }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.createdById !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this listing' },
        { status: 403 }
      );
    }

    // Prepare metadata update
    const metadataUpdate: any = {};
    if (validatedData.category) {
      metadataUpdate.category = validatedData.category;
    }
    if (validatedData.tags) {
      metadataUpdate.tags = validatedData.tags;
    }

    // Update the listing
    const updatedListing = await db.marketplaceListing.update({
      where: { id: params.id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.price && { price: validatedData.price }),
        ...(validatedData.currency && { currency: validatedData.currency }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(Object.keys(metadataUpdate).length > 0 && {
          metadata: {
            ...((existingListing.metadata as any) || {}),
            ...metadataUpdate
          }
        }),
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, imageUrl: true }
        },
        organization: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json(updatedListing);
  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/listings/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns this listing
    const existingListing = await db.marketplaceListing.findUnique({
      where: { id: params.id }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.createdById !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this listing' },
        { status: 403 }
      );
    }

    // Check if listing has purchases
    const purchaseCount = await db.marketplacePurchase.count({
      where: { listingId: params.id }
    });

    if (purchaseCount > 0) {
      // Instead of deleting, mark as inactive
      const updatedListing = await db.marketplaceListing.update({
        where: { id: params.id },
        data: { status: 'INACTIVE' }
      });
      
      return NextResponse.json({
        message: 'Listing marked as inactive due to existing purchases',
        listing: updatedListing
      });
    }

    // Safe to delete if no purchases
    await db.marketplaceListing.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Listing deleted successfully'
    });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}