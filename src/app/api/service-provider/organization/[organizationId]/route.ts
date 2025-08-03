import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    // Verify user has access to this organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        type: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Determine organization type based on settings or default to service provider
    const orgType = organization.settings?.type || 'service_provider';

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      type: orgType,
      settings: organization.settings,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    });
  } catch (error) {
    console.error('Service provider organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}