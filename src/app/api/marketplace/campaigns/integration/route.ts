import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const campaignIntegrationSchema = z.object({
  boostPurchaseId: z.string().cuid(),
  campaignId: z.string().cuid(),
  integrationSettings: z.object({
    applyToExistingContent: z.boolean().default(false),
    boostDuration: z.string().optional(),
    targetMetrics: z.object({
      impressions: z.number().optional(),
      engagements: z.number().optional(),
      conversions: z.number().optional()
    }).optional(),
    schedulingPreference: z.enum(['immediate', 'scheduled', 'campaign_aligned']).default('campaign_aligned')
  }).optional()
});

/**
 * POST /api/marketplace/campaigns/integration - Link boost purchase to campaign
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = campaignIntegrationSchema.parse(body);
    const { boostPurchaseId, campaignId, integrationSettings } = validatedData;

    // Verify boost purchase exists and user has access
    const boostPurchase = await prisma.boostPurchase.findFirst({
      where: {
        id: boostPurchaseId,
        userId
      },
      include: {
        boostProduct: true,
        client: true,
        organization: true
      }
    });

    if (!boostPurchase) {
      return NextResponse.json({ error: 'Boost purchase not found or access denied' }, { status: 404 });
    }

    // Verify campaign exists and belongs to same organization/client
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organizationId: boostPurchase.organizationId,
        clientId: boostPurchase.clientId
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found or not associated with this client' }, { status: 404 });
    }

    // Update boost purchase with campaign integration
    const updatedPurchase = await prisma.boostPurchase.update({
      where: { id: boostPurchaseId },
      data: {
        metadata: {
          ...(boostPurchase.metadata as object || {}),
          campaignIntegration: {
            campaignId,
            integrationDate: new Date().toISOString(),
            settings: integrationSettings,
            status: 'active'
          }
        }
      },
      include: {
        boostProduct: true,
        client: true
      }
    });

    // Log integration activity
    await prisma.activity.create({
      data: {
        type: 'MARKETPLACE_CAMPAIGN_INTEGRATION',
        description: `Boost "${boostPurchase.boostProduct.name}" integrated with campaign "${campaign.name}"`,
        metadata: {
          boostPurchaseId,
          campaignId,
          clientId: boostPurchase.clientId,
          integrationSettings
        },
        userId,
        organizationId: boostPurchase.organizationId
      }
    });

    return NextResponse.json({
      success: true,
      integration: {
        id: updatedPurchase.id,
        campaignId,
        campaignName: campaign.name,
        boostProduct: {
          id: updatedPurchase.boostProduct.id,
          name: updatedPurchase.boostProduct.name,
          type: updatedPurchase.boostProduct.type
        },
        client: {
          id: updatedPurchase.client.id,
          name: updatedPurchase.client.name
        },
        integrationDate: new Date().toISOString(),
        settings: integrationSettings
      }
    });

  } catch (error) {
    console.error('Campaign integration error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to integrate boost with campaign' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/campaigns/integration - Get campaign integrations for a client
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const organizationId = url.searchParams.get('organizationId');

    if (!clientId || !organizationId) {
      return NextResponse.json({ error: 'clientId and organizationId are required' }, { status: 400 });
    }

    // Verify user has access to organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all boost purchases for this client with campaign integrations
    const boostPurchases = await prisma.boostPurchase.findMany({
      where: {
        clientId,
        organizationId,
        // Filter for purchases that have campaign integration metadata
        metadata: {
          path: ['campaignIntegration'],
          not: Prisma.AnyNull
        }
      },
      include: {
        boostProduct: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get associated campaigns
    const campaignIds = boostPurchases
      .map(purchase => (purchase.metadata as any)?.campaignIntegration?.campaignId)
      .filter(Boolean);

    const campaigns = await prisma.campaign.findMany({
      where: {
        id: { in: campaignIds },
        organizationId
      },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true
      }
    });

    const campaignMap = campaigns.reduce((map, campaign) => {
      map[campaign.id] = campaign;
      return map;
    }, {} as Record<string, any>);

    // Format response
    const integrations = boostPurchases.map(purchase => {
      const campaignIntegration = (purchase.metadata as any)?.campaignIntegration;
      const campaign = campaignMap[campaignIntegration?.campaignId];

      return {
        id: purchase.id,
        boostProduct: purchase.boostProduct,
        client: purchase.client,
        campaign: campaign ? {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status
        } : null,
        integrationDate: campaignIntegration?.integrationDate,
        status: campaignIntegration?.status || 'active',
        settings: campaignIntegration?.settings || {},
        purchaseDate: purchase.purchaseDate,
        expiresAt: purchase.expiresAt,
        performance: purchase.performance
      };
    });

    return NextResponse.json({
      integrations,
      summary: {
        totalIntegrations: integrations.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        clientId,
        organizationId
      }
    });

  } catch (error) {
    console.error('Get campaign integrations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign integrations' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/campaigns/integration - Remove campaign integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const boostPurchaseId = url.searchParams.get('boostPurchaseId');

    if (!boostPurchaseId) {
      return NextResponse.json({ error: 'boostPurchaseId is required' }, { status: 400 });
    }

    // Verify boost purchase exists and user has access
    const boostPurchase = await prisma.boostPurchase.findFirst({
      where: {
        id: boostPurchaseId,
        userId
      }
    });

    if (!boostPurchase) {
      return NextResponse.json({ error: 'Boost purchase not found or access denied' }, { status: 404 });
    }

    // Remove campaign integration from metadata
    const updatedMetadata = { ...(boostPurchase.metadata as object || {}) };
    delete (updatedMetadata as any).campaignIntegration;

    await prisma.boostPurchase.update({
      where: { id: boostPurchaseId },
      data: {
        metadata: updatedMetadata
      }
    });

    // Log removal activity
    await prisma.activity.create({
      data: {
        type: 'MARKETPLACE_CAMPAIGN_INTEGRATION_REMOVED',
        description: 'Campaign integration removed from boost purchase',
        metadata: { boostPurchaseId },
        userId,
        organizationId: boostPurchase.organizationId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign integration removed successfully'
    });

  } catch (error) {
    console.error('Remove campaign integration error:', error);
    return NextResponse.json(
      { error: 'Failed to remove campaign integration' },
      { status: 500 }
    );
  }
}