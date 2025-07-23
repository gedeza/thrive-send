import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createFunnelSchema = z.object({
  name: z.string().min(1),
  campaignId: z.string(),
  stages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    eventType: z.enum(['PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'PURCHASE', 'CUSTOM']),
    eventValue: z.string(),
    goalValue: z.number().optional(),
    timeLimit: z.number().optional(),
  })).min(2),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT']).default('DRAFT'),
});

const updateFunnelSchema = createFunnelSchema.partial();

// GET /api/analytics/funnels - List conversion funnels
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');
    const status = url.searchParams.get('status');

    // Build where clause
    const where: any = {};
    
    if (campaignId) {
      where.campaignId = campaignId;
      
      // Verify user has access to this campaign
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id: campaignId,
          organization: {
            members: {
              some: { userId }
            }
          }
        }
      });
      
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
    } else {
      // Get all funnels for user's organizations
      where.campaign = {
        organization: {
          members: {
            some: { userId }
          }
        }
      };
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const funnels = await prisma.conversionFunnel.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields and add computed metrics
    const enrichedFunnels = funnels.map(funnel => {
      const stages = Array.isArray(funnel.stages) ? funnel.stages : [];
      const metrics = funnel.metrics && typeof funnel.metrics === 'object' ? funnel.metrics : {};
      
      return {
        ...funnel,
        stages,
        metrics,
        totalStages: stages.length,
        status: funnel.campaign ? 'ACTIVE' : 'INACTIVE', // Infer status
      };
    });

    return NextResponse.json({ funnels: enrichedFunnels });

  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnels' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/funnels - Create conversion funnel
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createFunnelSchema.parse(body);

    // Verify user has access to the campaign
    const campaign = await prisma.campaign.findFirst({
      where: { 
        id: validatedData.campaignId,
        organization: {
          members: {
            some: { userId }
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Create the funnel
    const funnel = await prisma.conversionFunnel.create({
      data: {
        name: validatedData.name,
        campaignId: validatedData.campaignId,
        stages: validatedData.stages,
        metrics: {
          timeframe: validatedData.timeframe,
          status: validatedData.status,
          createdBy: userId,
          lastCalculated: null,
          totalVisitors: 0,
          totalConversions: 0,
          overallConversionRate: 0,
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

    return NextResponse.json({ 
      funnel: {
        ...funnel,
        stages: Array.isArray(funnel.stages) ? funnel.stages : [],
        metrics: funnel.metrics && typeof funnel.metrics === 'object' ? funnel.metrics : {},
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating funnel:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create funnel' },
      { status: 500 }
    );
  }
}