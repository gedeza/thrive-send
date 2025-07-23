import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const variantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.object({
    subject: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    cta: z.string().optional(),
  }),
  trafficAllocation: z.number().min(0).max(100),
  isControl: z.boolean(),
});

const createABTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  description: z.string().optional(),
  variants: z.array(variantSchema).min(2, 'At least 2 variants required'),
  configuration: z.object({
    testDuration: z.number().min(1),
    minimumSampleSize: z.number().min(100),
    confidenceLevel: z.number().min(80).max(99),
    primaryMetric: z.enum(['clicks', 'conversions', 'revenue', 'ctr']),
    autoSelectWinner: z.boolean(),
  }),
});

// GET /api/campaigns/[id]/ab-tests - Get all A/B tests for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: { organization: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check organization membership
    const userOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    const hasAccess = userOrg?.organizations.some(org => org.id === campaign.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch A/B tests
    const abTests = await prisma.aBTest.findMany({
      where: { campaignId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to include parsed variants and results
    const transformedTests = abTests.map(test => ({
      ...test,
      variants: typeof test.variants === 'string' ? JSON.parse(test.variants) : test.variants,
      results: test.results ? (typeof test.results === 'string' ? JSON.parse(test.results) : test.results) : null
    }));

    return NextResponse.json({ tests: transformedTests });
  } catch (error) {
    console.error('Error fetching A/B tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/ab-tests - Create a new A/B test
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createABTestSchema.parse(body);

    // Verify user has access to the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: { organization: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check organization membership
    const userOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    const hasAccess = userOrg?.organizations.some(org => org.id === campaign.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate traffic allocation totals 100%
    const totalAllocation = validatedData.variants.reduce(
      (sum, variant) => sum + variant.trafficAllocation, 
      0
    );
    
    if (totalAllocation !== 100) {
      return NextResponse.json(
        { error: 'Traffic allocation must total exactly 100%' },
        { status: 400 }
      );
    }

    // Ensure exactly one control variant
    const controlVariants = validatedData.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      return NextResponse.json(
        { error: 'Exactly one variant must be marked as control' },
        { status: 400 }
      );
    }

    // Initialize variants with metrics
    const variantsWithMetrics = validatedData.variants.map(variant => ({
      id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...variant,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        ctr: 0,
        conversionRate: 0,
        cpc: 0
      }
    }));

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + validatedData.configuration.testDuration);

    // Create A/B test
    const abTest = await prisma.aBTest.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        campaignId: params.id,
        status: 'DRAFT',
        startDate,
        endDate,
        variants: JSON.stringify(variantsWithMetrics),
        results: null
      }
    });

    // Transform response
    const response = {
      ...abTest,
      variants: variantsWithMetrics,
      configuration: validatedData.configuration
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating A/B test:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create A/B test' },
      { status: 500 }
    );
  }
}