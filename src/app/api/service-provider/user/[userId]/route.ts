import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // Verify user is requesting their own data or has admin access
    if (authUserId !== userId) {
      // TODO: Add admin check if needed
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get user details with organization and role information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build user data with permissions (simplified for now)
    const serviceProviderUser = {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: user.organizations[0]?.role || 'CONTENT_CREATOR',
      permissions: [
        {
          resource: '*',
          actions: ['read', 'write'],
          scope: 'organization' as const,
        },
      ],
      organizations: user.organizations.map(uo => ({
        id: uo.organization.id,
        name: uo.organization.name,
        type: uo.organization.type,
        role: uo.role,
      })),
    };

    return NextResponse.json(serviceProviderUser);
  } catch (error) {
    console.error('Service provider user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}