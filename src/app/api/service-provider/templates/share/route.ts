import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      templateId,
      clientIds,
      serviceProviderId,
      shareType = 'share' // 'share' or 'unshare'
    } = body;

    // Validate required fields
    if (!templateId || !clientIds || !Array.isArray(clientIds) || !serviceProviderId) {
      return NextResponse.json({
        error: 'Missing required fields: templateId, clientIds (array), serviceProviderId'
      }, { status: 400 });
    }

    // 🚀 DEMO IMPLEMENTATION - Template Sharing Logic
    const shareOperation = {
      templateId,
      clientIds,
      serviceProviderId,
      shareType,
      timestamp: new Date().toISOString(),
      sharedByUserId: userId,
    };

    // Simulate sharing success with different outcomes based on shareType
    if (shareType === 'share') {
      console.log('🎨 Sharing template with clients:', {
        templateId,
        clientCount: clientIds.length,
        clients: clientIds
      });

      const shareResult = {
        success: true,
        templateId,
        operation: 'share',
        results: clientIds.map(clientId => ({
          clientId,
          clientName: getClientName(clientId),
          status: 'shared',
          sharedAt: new Date().toISOString(),
          permissions: {
            canView: true,
            canUse: true,
            canCustomize: true,
            canCopy: false // Service provider retains ownership
          }
        })),
        summary: {
          totalClients: clientIds.length,
          successfulShares: clientIds.length,
          failedShares: 0,
          previouslyShared: 0
        },
        notifications: {
          clientsNotified: true,
          notificationsSent: clientIds.length,
          emailsQueued: clientIds.length
        }
      };

      return NextResponse.json(shareResult, { status: 200 });

    } else if (shareType === 'unshare') {
      console.log('🚫 Unsharing template from clients:', {
        templateId,
        clientCount: clientIds.length,
        clients: clientIds
      });

      const unshareResult = {
        success: true,
        templateId,
        operation: 'unshare',
        results: clientIds.map(clientId => ({
          clientId,
          clientName: getClientName(clientId),
          status: 'unshared',
          unsharedAt: new Date().toISOString(),
          cleanupActions: {
            activeUsageRemoved: true,
            scheduledContentUpdated: true,
            notificationSent: true
          }
        })),
        summary: {
          totalClients: clientIds.length,
          successfulUnshares: clientIds.length,
          failedUnshares: 0,
          activeUsageAffected: Math.floor(Math.random() * 3) // Simulate random active usage
        },
        warnings: [
          'Clients will lose access to this template immediately',
          'Any scheduled content using this template will be affected',
          'Clients will be notified of template removal'
        ]
      };

      return NextResponse.json(unshareResult, { status: 200 });
    }

    // TODO: Replace with actual database operations when schema is ready
    /*
    if (shareType === 'share') {
      await prisma.contentTemplate.update({
        where: { 
          id: templateId,
          serviceProviderId: serviceProviderId
        },
        data: {
          sharedClients: {
            connect: clientIds.map(clientId => ({ id: clientId }))
          },
          updatedAt: new Date()
        }
      });

      // Create sharing history records
      await prisma.templateSharingHistory.createMany({
        data: clientIds.map(clientId => ({
          templateId,
          clientId,
          sharedByUserId: userId,
          action: 'SHARED',
          timestamp: new Date()
        }))
      });

    } else if (shareType === 'unshare') {
      await prisma.contentTemplate.update({
        where: { 
          id: templateId,
          serviceProviderId: serviceProviderId
        },
        data: {
          sharedClients: {
            disconnect: clientIds.map(clientId => ({ id: clientId }))
          },
          updatedAt: new Date()
        }
      });

      // Create unsharing history records
      await prisma.templateSharingHistory.createMany({
        data: clientIds.map(clientId => ({
          templateId,
          clientId,
          sharedByUserId: userId,
          action: 'UNSHARED',
          timestamp: new Date()
        }))
      });
    }
    */

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get client names (demo implementation)
function getClientName(clientId: string): string {
  const clientNames: Record<string, string> = {
    'demo-client-1': 'City of Springfield',
    'demo-client-2': 'TechStart Inc.',
    'demo-client-3': 'Local Coffee Co.'
  };
  return clientNames[clientId] || `Client ${clientId}`;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const serviceProviderId = searchParams.get('serviceProviderId');

    if (!templateId || !serviceProviderId) {
      return NextResponse.json({
        error: 'Missing required parameters: templateId, serviceProviderId'
      }, { status: 400 });
    }

    // 🚀 DEMO IMPLEMENTATION - Get Template Sharing Status
    const sharingStatus = {
      templateId,
      serviceProviderId,
      isShared: true,
      totalClientsWithAccess: 2,
      
      // 📊 SHARING DETAILS
      sharedWith: [
        {
          clientId: 'demo-client-1',
          clientName: 'City of Springfield',
          clientType: 'government',
          sharedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: {
            canView: true,
            canUse: true,
            canCustomize: true,
            canCopy: false
          },
          usage: {
            timesUsed: 8,
            lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            averageEngagement: 8.4
          }
        },
        {
          clientId: 'demo-client-3',
          clientName: 'Local Coffee Co.',
          clientType: 'business',
          sharedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: {
            canView: true,
            canUse: true,
            canCustomize: true,
            canCopy: false
          },
          usage: {
            timesUsed: 7,
            lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            averageEngagement: 6.8
          }
        }
      ],
      
      // 🎯 AVAILABLE CLIENTS TO SHARE WITH
      availableClients: [
        {
          clientId: 'demo-client-2',
          clientName: 'TechStart Inc.',
          clientType: 'business',
          isEligible: true,
          eligibilityReason: 'Active client with template sharing permissions'
        }
      ],
      
      // 📈 PERFORMANCE SUMMARY
      overallPerformance: {
        totalUsage: 15,
        averageEngagement: 7.6,
        bestPerformingClient: 'demo-client-1',
        mostRecentUsage: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    console.log('🔍 Template sharing status requested:', {
      templateId,
      sharedClientsCount: sharingStatus.sharedWith.length,
      availableClientsCount: sharingStatus.availableClients.length
    });

    return NextResponse.json(sharingStatus);

    // TODO: Replace with actual database query when schema is ready
    /*
    const template = await prisma.contentTemplate.findUnique({
      where: {
        id: templateId,
        serviceProviderId: serviceProviderId
      },
      include: {
        sharedClients: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        usage: {
          include: {
            client: {
              select: { id: true, name: true }
            }
          }
        },
        sharingHistory: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      templateId: template.id,
      isShared: template.sharedClients.length > 0,
      sharedWith: template.sharedClients,
      usage: template.usage,
      sharingHistory: template.sharingHistory
    });
    */

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}