import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user-utils';

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

    // Get or create user with real data from Clerk
    try {
      const baseUser = await getOrCreateUser(userId);
      
      // Get user details with organization and role information
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          organizationMemberships: {
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
        return NextResponse.json({ error: 'Failed to load user data' }, { status: 500 });
      }

      // Build user data matching ServiceProviderUser interface
      const serviceProviderUser = {
        id: user.id,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        email: user.email,
        role: user.organizationMemberships[0]?.role || 'CONTENT_CREATOR',
        permissions: [
          {
            resource: '*',
            actions: ['read', 'write'] as const,
            scope: 'organization' as const,
          },
        ],
      };

      return NextResponse.json(serviceProviderUser);
    } catch (userError) {
      console.error('Failed to get or create user:', userError);
      return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Service provider user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}