import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateFunnelSchema = z.object({
  name: z.string().min(1).optional(),
  stages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    eventType: z.enum(['PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'PURCHASE', 'CUSTOM']),
    eventValue: z.string(),
    goalValue: z.number().optional(),
    timeLimit: z.number().optional(),
  })).min(2).optional(),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT']).optional(),
});

// GET /api/analytics/funnels/[id] - Get conversion funnel details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const funnelId = params.id;
    const url = new URL(request.url);
    const includeAnalytics = url.searchParams.get('analytics') === 'true';

    const funnel = await prisma.conversionFunnel.findFirst({
      where: { 
        id: funnelId,
        campaign: {
          organization: {
            members: {
              some: { userId }
            }
          }
        }
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          }
        }
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    let analytics = null;
    if (includeAnalytics) {
      // Calculate funnel analytics
      analytics = await calculateFunnelAnalytics(funnelId);
    }

    const enrichedFunnel = {
      ...funnel,
      stages: Array.isArray(funnel.stages) ? funnel.stages : [],
      metrics: funnel.metrics && typeof funnel.metrics === 'object' ? funnel.metrics : {},
      analytics,
    };

    return NextResponse.json({ funnel: enrichedFunnel });

  } catch (error) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel' },
      { status: 500 }
    );
  }
}

// PUT /api/analytics/funnels/[id] - Update conversion funnel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const funnelId = params.id;
    const body = await request.json();
    const validatedData = updateFunnelSchema.parse(body);

    // Verify user has access to this funnel
    const existingFunnel = await prisma.conversionFunnel.findFirst({
      where: { 
        id: funnelId,
        campaign: {
          organization: {
            members: {
              some: { userId }
            }
          }
        }
      }
    });

    if (!existingFunnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name) {
      updateData.name = validatedData.name;
    }
    
    if (validatedData.stages) {
      updateData.stages = validatedData.stages;
    }

    // Update metrics if provided
    if (validatedData.timeframe || validatedData.status) {
      const currentMetrics = existingFunnel.metrics && typeof existingFunnel.metrics === 'object' 
        ? existingFunnel.metrics as any
        : {};
      
      updateData.metrics = {
        ...currentMetrics,
        ...(validatedData.timeframe && { timeframe: validatedData.timeframe }),
        ...(validatedData.status && { status: validatedData.status }),
        lastUpdated: new Date().toISOString(),
        updatedBy: userId,
      };
    }

    const updatedFunnel = await prisma.conversionFunnel.update({
      where: { id: funnelId },
      data: updateData,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          }
        }
      }
    });

    return NextResponse.json({ 
      funnel: {
        ...updatedFunnel,
        stages: Array.isArray(updatedFunnel.stages) ? updatedFunnel.stages : [],
        metrics: updatedFunnel.metrics && typeof updatedFunnel.metrics === 'object' ? updatedFunnel.metrics : {},
      }
    });

  } catch (error) {
    console.error('Error updating funnel:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update funnel' },
      { status: 500 }
    );
  }
}

// DELETE /api/analytics/funnels/[id] - Delete conversion funnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const funnelId = params.id;

    // Verify user has access to this funnel
    const funnel = await prisma.conversionFunnel.findFirst({
      where: { 
        id: funnelId,
        campaign: {
          organization: {
            members: {
              some: { userId }
            }
          }
        }
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    await prisma.conversionFunnel.delete({
      where: { id: funnelId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json(
      { error: 'Failed to delete funnel' },
      { status: 500 }
    );
  }
}

// Helper function to calculate funnel analytics
async function calculateFunnelAnalytics(funnelId: string) {
  try {
    // This would integrate with your behavioral tracking system
    // For now, return mock analytics data
    
    const mockAnalytics = {
      totalVisitors: 10000,
      totalConversions: 850,
      overallConversionRate: 8.5,
      revenue: 127500,
      averageOrderValue: 150,
      timeframe: '30d',
      lastCalculated: new Date().toISOString(),
      stageMetrics: [
        {
          stageId: 'awareness',
          visitors: 10000,
          conversions: 10000,
          conversionRate: 100,
          dropoffRate: 0,
          avgTimeSpent: 45,
          value: 0
        },
        {
          stageId: 'interest',
          visitors: 6500,
          conversions: 6500,
          conversionRate: 65,
          dropoffRate: 35,
          avgTimeSpent: 120,
          value: 0
        },
        {
          stageId: 'consideration',
          visitors: 3200,
          conversions: 3200,
          conversionRate: 32,
          dropoffRate: 50.8,
          avgTimeSpent: 180,
          value: 0
        },
        {
          stageId: 'intent',
          visitors: 1400,
          conversions: 1400,
          conversionRate: 14,
          dropoffRate: 56.3,
          avgTimeSpent: 240,
          value: 0
        },
        {
          stageId: 'purchase',
          visitors: 850,
          conversions: 850,
          conversionRate: 8.5,
          dropoffRate: 39.3,
          avgTimeSpent: 300,
          value: 127500
        }
      ],
      trends: {
        conversionRateTrend: 5.2, // % change from previous period
        visitorsTrend: 12.8,
        revenueTrend: 18.3
      }
    };

    return mockAnalytics;
  } catch (error) {
    console.error('Error calculating funnel analytics:', error);
    return null;
  }
}