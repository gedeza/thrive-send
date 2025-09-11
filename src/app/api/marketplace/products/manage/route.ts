import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BoostProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.enum(['engagement', 'conversion', 'reach', 'premium', 'awareness']),
  category: z.enum(['Government', 'Business', 'Startup', 'Branding', 'Social Impact']),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  duration: z.string().min(1),
  features: z.array(z.string()).min(1),
  clientTypes: z.array(z.string()).min(1),
  estimatedROI: z.string().optional(),
  isRecommended: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

/**
 * GET /api/marketplace/products/manage - Get organization's boost products
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: dbUser.id,
        organizationId
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get organization's boost products
    const products = await prisma.boostProduct.findMany({
      where: {
        organizationId
      },
      include: {
        purchases: {
          select: {
            id: true,
            status: true,
            purchaseDate: true,
            price: true
          }
        },
        _count: {
          select: {
            purchases: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Calculate analytics for each product
    const productsWithAnalytics = products.map(product => {
      const totalPurchases = product._count.purchases;
      const totalRevenue = product.purchases.reduce((sum, purchase) => 
        sum + parseFloat(purchase.price.toString()), 0
      );
      const activePurchases = product.purchases.filter(p => p.status === 'active').length;

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRevenue = product.purchases
        .filter(p => p.purchaseDate >= thirtyDaysAgo)
        .reduce((sum, purchase) => sum + parseFloat(purchase.price.toString()), 0);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        price: parseFloat(product.price.toString()),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : null,
        duration: product.duration,
        features: product.features,
        clientTypes: product.clientTypes,
        popularity: product.popularity,
        rating: parseFloat(product.rating.toString()),
        reviews: product.reviews,
        estimatedROI: product.estimatedROI,
        isRecommended: product.isRecommended,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        analytics: {
          totalPurchases,
          totalRevenue,
          activePurchases,
          monthlyRevenue,
          conversionRate: totalPurchases > 0 ? (activePurchases / totalPurchases) * 100 : 0
        }
      };
    });

    return NextResponse.json({
      products: productsWithAnalytics,
      total: productsWithAnalytics.length
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/products/manage - Create new boost product
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const organizationId = body.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Validate input
    const validatedData = BoostProductSchema.parse(body);

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to organization and appropriate role
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: dbUser.id,
        organizationId,
        role: {
          in: ['ADMIN', 'PUBLISHER', 'APPROVER'] // Only higher-level roles can create products
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create the boost product
    const product = await prisma.boostProduct.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        category: validatedData.category,
        price: validatedData.price,
        originalPrice: validatedData.originalPrice,
        duration: validatedData.duration,
        features: validatedData.features,
        clientTypes: validatedData.clientTypes,
        estimatedROI: validatedData.estimatedROI,
        isRecommended: validatedData.isRecommended,
        isActive: validatedData.isActive,
        organizationId,
        metrics: {
          created_by: dbUser.id,
          created_at: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        price: parseFloat(product.price.toString()),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : null,
        duration: product.duration,
        features: product.features,
        clientTypes: product.clientTypes,
        popularity: product.popularity,
        rating: parseFloat(product.rating.toString()),
        reviews: product.reviews,
        estimatedROI: product.estimatedROI,
        isRecommended: product.isRecommended,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    }, { status: 201 });

  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/products/manage - Update boost product
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, organizationId, ...updateData } = body;

    if (!productId || !organizationId) {
      return NextResponse.json({ error: 'Product ID and Organization ID required' }, { status: 400 });
    }

    // Validate input
    const validatedData = BoostProductSchema.partial().parse(updateData);

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to organization and the product belongs to them
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: dbUser.id,
        organizationId,
        role: {
          in: ['ADMIN', 'PUBLISHER', 'APPROVER']
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify product exists and belongs to organization
    const existingProduct = await prisma.boostProduct.findFirst({
      where: {
        id: productId,
        organizationId
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update the product
    const updatedProduct = await prisma.boostProduct.update({
      where: { id: productId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        type: updatedProduct.type,
        category: updatedProduct.category,
        price: parseFloat(updatedProduct.price.toString()),
        originalPrice: updatedProduct.originalPrice ? parseFloat(updatedProduct.originalPrice.toString()) : null,
        duration: updatedProduct.duration,
        features: updatedProduct.features,
        clientTypes: updatedProduct.clientTypes,
        popularity: updatedProduct.popularity,
        rating: parseFloat(updatedProduct.rating.toString()),
        reviews: updatedProduct.reviews,
        estimatedROI: updatedProduct.estimatedROI,
        isRecommended: updatedProduct.isRecommended,
        isActive: updatedProduct.isActive,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt
      }
    });

  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/products/manage - Delete boost product
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const organizationId = url.searchParams.get('organizationId');

    if (!productId || !organizationId) {
      return NextResponse.json({ error: 'Product ID and Organization ID required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has admin access
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: dbUser.id,
        organizationId,
        role: 'ADMIN' // Only admins can delete products
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if product has active purchases
    const activePurchases = await prisma.boostPurchase.count({
      where: {
        boostProductId: productId,
        status: 'active'
      }
    });

    if (activePurchases > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete product with active purchases. Deactivate instead.' 
      }, { status: 400 });
    }

    // Delete the product (this will also handle cascading deletes)
    await prisma.boostProduct.delete({
      where: {
        id: productId,
        organizationId // Extra safety check
      }
    });

    return NextResponse.json({ success: true });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}