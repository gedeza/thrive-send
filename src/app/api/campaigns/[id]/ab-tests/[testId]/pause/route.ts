import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { ABTestEngine } from '@/lib/services/ab-test-engine';

// POST /api/campaigns/[id]/ab-tests/[testId]/pause - Pause an A/B test
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

    // Validate test can be paused
    if (abTest.status !== 'RUNNING') {
      return NextResponse.json(
        { error: `Cannot pause test with status: ${abTest.status}` },
        { status: 400 }
      );
    }

    // Get current metrics from the AB test engine before pausing
    const currentMetrics = ABTestEngine.getCurrentMetrics(params.testId);
    
    // Update variants with latest metrics if available
    let updatedVariants = typeof abTest.variants === 'string' ? JSON.parse(abTest.variants) : abTest.variants;
    if (currentMetrics) {
      updatedVariants = updatedVariants.map((variant: any) => ({
        ...variant,
        metrics: currentMetrics[variant.id] || variant.metrics
      }));
    }

    // Update test status to PAUSED
    const updatedTest = await prisma.aBTest.update({
      where: { id: params.testId },
      data: {
        status: 'PAUSED',
        variants: JSON.stringify(updatedVariants)
      }
    });

    // Pause the test in the engine
    ABTestEngine.pauseTest(params.testId);

    // Transform response
    const response = {
      ...updatedTest,
      variants: updatedVariants,
      results: updatedTest.results ? (typeof updatedTest.results === 'string' ? JSON.parse(updatedTest.results) : updatedTest.results) : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error pausing A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to pause A/B test' },
      { status: 500 }
    );
  }
}