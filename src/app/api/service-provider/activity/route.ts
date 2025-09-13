import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const userOrg = await db.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get recent activities from various sources
    const activities: any[] = [];

    // Recent campaigns
    const recentCampaigns = await db.campaign.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        client: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    recentCampaigns.forEach(campaign => {
      activities.push({
        id: `campaign-${campaign.id}`,
        type: 'campaign',
        title: campaign.status === 'COMPLETED' ? 'Campaign Completed' : 'Campaign Created',
        description: campaign.name,
        clientName: campaign.client?.name,
        userName: campaign.createdBy?.name || 'System',
        timestamp: campaign.createdAt,
        status: campaign.status === 'COMPLETED' ? 'completed' : campaign.status === 'ACTIVE' ? 'pending' : 'completed',
      });
    });

    // Recent content publications
    const recentContent = await db.content.findMany({
      where: {
        organizationId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        client: true,
        createdBy: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    recentContent.forEach(content => {
      activities.push({
        id: `content-${content.id}`,
        type: 'content',
        title: 'Content Published',
        description: content.title || 'New content published',
        clientName: content.client?.name,
        userName: content.createdBy?.name || 'System',
        timestamp: content.publishedAt || content.createdAt,
        status: 'completed',
      });
    });

    // Recent client additions
    const recentClients = await db.client.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    recentClients.forEach(client => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        title: 'New Client Added',
        description: `${client.name} onboarded`,
        clientName: client.name,
        userName: 'System',
        timestamp: client.createdAt,
        status: 'completed',
      });
    });

    // Recent approval requests
    const recentApprovals = await db.content.findMany({
      where: {
        organizationId,
        status: 'PENDING_APPROVAL',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        client: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    recentApprovals.forEach(content => {
      activities.push({
        id: `approval-${content.id}`,
        type: 'approval',
        title: 'Approval Requested',
        description: content.title || 'Content needs review',
        clientName: content.client?.name,
        userName: content.createdBy?.name || 'System',
        timestamp: content.createdAt,
        status: 'pending',
      });
    });

    // Sort all activities by timestamp and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}