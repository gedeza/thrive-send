import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { ABTestEngine } from '@/lib/services/ab-test-engine';

// POST /api/campaigns/[id]/ab-tests/[testId]/start - Start an A/B test
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access and get test
    const abTest = await prisma.aBTest.findUnique({
      where: { id: params.testId },
      include: {
        campaign: {
          include: { organization: true }
        }
      }
    });

    if (!abTest) {
      return NextResponse.json({ error: 'A/B test not found' }, { status: 404 });
    }

    if (abTest.campaignId !== params.id) {
      return NextResponse.json({ error: 'Test does not belong to this campaign' }, { status: 400 });
    }

    // Check organization membership
    const userOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    const hasAccess = userOrg?.organizations.some(org => org.id === abTest.campaign.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate test can be started
    if (abTest.status !== 'DRAFT' && abTest.status !== 'PAUSED') {
      return NextResponse.json(
        { error: `Cannot start test with status: ${abTest.status}` },
        { status: 400 }
      );
    }

    // Parse variants to validate
    const variants = typeof abTest.variants === 'string' ? JSON.parse(abTest.variants) : abTest.variants;
    
    if (!variants || variants.length < 2) {
      return NextResponse.json(
        { error: 'Test must have at least 2 variants' },
        { status: 400 }
      );
    }

    const controlVariants = variants.filter((v: any) => v.isControl);
    if (controlVariants.length !== 1) {
      return NextResponse.json(
        { error: 'Test must have exactly one control variant' },
        { status: 400 }
      );
    }

    const totalAllocation = variants.reduce((sum: number, variant: any) => sum + variant.trafficAllocation, 0);
    if (totalAllocation !== 100) {
      return NextResponse.json(
        { error: 'Traffic allocation must total exactly 100%' },
        { status: 400 }
      );
    }

    // Check if campaign is active
    if (abTest.campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign must be active to start A/B test' },
        { status: 400 }
      );
    }

    // Update test status to RUNNING
    const updatedTest = await prisma.aBTest.update({
      where: { id: params.testId },
      data: {
        status: 'RUNNING',
        startDate: new Date(), // Update start time when actually started
      }
    });

    // Initialize the A/B test engine for this test
    ABTestEngine.initializeTest(params.testId, {
      variants,
      campaignId: params.id,
      startDate: updatedTest.startDate,
      endDate: updatedTest.endDate || undefined
    });

    // Transform response
    const response = {
      ...updatedTest,
      variants: typeof updatedTest.variants === 'string' ? JSON.parse(updatedTest.variants) : updatedTest.variants,
      results: updatedTest.results ? (typeof updatedTest.results === 'string' ? JSON.parse(updatedTest.results) : updatedTest.results) : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error starting A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to start A/B test' },
      { status: 500 }
    );
  }
}