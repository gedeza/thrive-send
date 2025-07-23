import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[id]/ab-tests/[testId] - Get specific A/B test
export async function GET(
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

    // Transform the response
    const response = {
      ...abTest,
      variants: typeof abTest.variants === 'string' ? JSON.parse(abTest.variants) : abTest.variants,
      results: abTest.results ? (typeof abTest.results === 'string' ? JSON.parse(abTest.results) : abTest.results) : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id]/ab-tests/[testId] - Update A/B test
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Verify access
    const existingTest = await prisma.aBTest.findUnique({
      where: { id: params.testId },
      include: {
        campaign: {
          include: { organization: true }
        }
      }
    });

    if (!existingTest) {
      return NextResponse.json({ error: 'A/B test not found' }, { status: 404 });
    }

    if (existingTest.campaignId !== params.id) {
      return NextResponse.json({ error: 'Test does not belong to this campaign' }, { status: 400 });
    }

    // Check organization membership
    const userOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    const hasAccess = userOrg?.organizations.some(org => org.id === existingTest.campaign.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow updates to running tests (except status changes)
    if (existingTest.status === 'RUNNING' && body.status !== 'PAUSED' && body.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot update running test configuration' },
        { status: 400 }
      );
    }

    // Update the test
    const updatedTest = await prisma.aBTest.update({
      where: { id: params.testId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.variants && { variants: JSON.stringify(body.variants) }),
        ...(body.results && { results: JSON.stringify(body.results) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
      }
    });

    // Transform response
    const response = {
      ...updatedTest,
      variants: typeof updatedTest.variants === 'string' ? JSON.parse(updatedTest.variants) : updatedTest.variants,
      results: updatedTest.results ? (typeof updatedTest.results === 'string' ? JSON.parse(updatedTest.results) : updatedTest.results) : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to update A/B test' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id]/ab-tests/[testId] - Delete A/B test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access
    const existingTest = await prisma.aBTest.findUnique({
      where: { id: params.testId },
      include: {
        campaign: {
          include: { organization: true }
        }
      }
    });

    if (!existingTest) {
      return NextResponse.json({ error: 'A/B test not found' }, { status: 404 });
    }

    if (existingTest.campaignId !== params.id) {
      return NextResponse.json({ error: 'Test does not belong to this campaign' }, { status: 400 });
    }

    // Check organization membership
    const userOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    const hasAccess = userOrg?.organizations.some(org => org.id === existingTest.campaign.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deletion of running tests
    if (existingTest.status === 'RUNNING') {
      return NextResponse.json(
        { error: 'Cannot delete running test. Pause it first.' },
        { status: 400 }
      );
    }

    // Delete the test
    await prisma.aBTest.delete({
      where: { id: params.testId }
    });

    return NextResponse.json({ message: 'A/B test deleted successfully' });
  } catch (error) {
    console.error('Error deleting A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to delete A/B test' },
      { status: 500 }
    );
  }
}