import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Verify user has access to this client
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organization: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    // Build client context
    const clientContext = {
      id: client.id,
      name: client.name,
      type: client.type,
      organizationId: client.organizationId,
      permissions: [
        {
          resource: 'client',
          actions: ['read', 'write'],
          scope: 'client' as const,
          clientId: client.id,
        },
      ],
      settings: client.settings,
    };

    return NextResponse.json({
      clientContext,
      availableFeatures: [
        'content_management',
        'campaign_management',
        'analytics',
        'marketplace',
      ],
      permissions: clientContext.permissions,
    });
  } catch (error) {
    console.error('Context switch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}