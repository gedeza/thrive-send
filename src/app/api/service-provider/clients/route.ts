import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // For demo purposes, return demo data immediately to avoid database issues
    const demoClients = [
      {
        id: 'demo-client-1',
        name: 'City of Springfield',
        organizationId,
        email: 'admin@springfield.gov',
        type: 'MUNICIPALITY',
        status: 'active' as const,
        industry: 'Government',
        website: 'https://springfield.gov',
        logoUrl: null,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        performanceScore: 92,
        monthlyBudget: 15000,
        lastActivity: new Date().toISOString(),
        socialAccounts: [
          { id: 'demo-social-1', platform: 'FACEBOOK', handle: 'springfieldcity' },
          { id: 'demo-social-2', platform: 'TWITTER', handle: '@springfieldgov' }
        ],
        projects: [
          { id: 'demo-project-1', name: 'Summer Festival Campaign', status: 'ACTIVE' },
          { id: 'demo-project-2', name: 'Public Health Initiative', status: 'COMPLETED' }
        ],
      },
      {
        id: 'demo-client-2',
        name: 'TechStart Inc.',
        organizationId,
        email: 'contact@techstart.com',
        type: 'STARTUP',
        status: 'active' as const,
        industry: 'Technology',
        website: 'https://techstart.com',
        logoUrl: null,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        performanceScore: 88,
        monthlyBudget: 8000,
        lastActivity: new Date().toISOString(),
        socialAccounts: [
          { id: 'demo-social-3', platform: 'LINKEDIN', handle: '/company/techstart' },
          { id: 'demo-social-4', platform: 'TWITTER', handle: '@techstartinc' }
        ],
        projects: [
          { id: 'demo-project-3', name: 'Product Launch Campaign', status: 'ACTIVE' }
        ],
      },
      {
        id: 'demo-client-3',
        name: 'Local Coffee Co.',
        organizationId,
        email: 'hello@localcoffee.com',
        type: 'BUSINESS',
        status: 'active' as const,
        industry: 'Food & Beverage',
        website: 'https://localcoffee.com',
        logoUrl: null,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        performanceScore: 76,
        monthlyBudget: 3500,
        lastActivity: new Date().toISOString(),
        socialAccounts: [
          { id: 'demo-social-5', platform: 'INSTAGRAM', handle: '@localcoffeeco' },
          { id: 'demo-social-6', platform: 'FACEBOOK', handle: 'localcoffeeco' }
        ],
        projects: [
          { id: 'demo-project-4', name: 'Holiday Menu Promotion', status: 'PLANNED' }
        ],
      }
    ];
    
    return NextResponse.json(demoClients);

    // TODO: Re-enable database queries later when schema is stable
    /*
    // Get clients with their metrics
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        campaigns: {
          where: {
            status: { in: ['ACTIVE', 'SCHEDULED', 'COMPLETED'] },
          },
        },
        projects: {
          where: {
            status: { in: ['ACTIVE', 'PLANNED', 'COMPLETED'] },
          },
        },
        socialAccounts: true,
        _count: {
          select: {
            campaigns: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform clients into client summaries with performance metrics
    const clientSummaries = clients.map(client => {
      const activeCampaigns = client.campaigns.filter(c => c.status === 'ACTIVE').length;
      const totalCampaigns = client._count.campaigns;
      const activeProjects = client.projects.filter(p => p.status === 'ACTIVE').length;

      // Calculate performance score (placeholder algorithm)
      const campaignScore = Math.min((activeCampaigns / Math.max(totalCampaigns, 1)) * 40, 40);
      const projectScore = Math.min(activeProjects * 3, 30);
      const timeScore = Math.max(30 - Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)), 0);
      const performanceScore = Math.min(campaignScore + projectScore + timeScore, 100);

      // Calculate engagement rate (placeholder)
      const engagementRate = Math.random() * 8 + 2; // Random between 2-10%

      return {
        id: client.id,
        name: client.name,
        organizationId: client.organizationId,
        email: client.email,
        type: client.type,
        status: client.status === 'ACTIVE' ? 'active' : 'inactive',
        industry: client.industry || 'General',
        website: client.website,
        logoUrl: client.logoUrl,
        createdAt: client.createdAt.toISOString(),
        performanceScore: Number(performanceScore.toFixed(1)),
        monthlyBudget: client.monthlyBudget ? Number(client.monthlyBudget) : undefined,
        lastActivity: client.updatedAt.toISOString(),
        socialAccounts: client.socialAccounts.map(sa => ({
          id: sa.id,
          platform: sa.platform,
          handle: sa.handle,
        })),
        projects: client.projects.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
        })),
      };
    });

    // For demo purposes, if no clients exist, return demo data
    if (clientSummaries.length === 0) {
      const demoClients = [
        {
          id: 'demo-client-1',
          name: 'City of Springfield',
          organizationId,
          email: 'admin@springfield.gov',
          type: 'MUNICIPALITY',
          status: 'active' as const,
          industry: 'Government',
          website: 'https://springfield.gov',
          logoUrl: null,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          performanceScore: 92,
          monthlyBudget: 15000,
          lastActivity: new Date().toISOString(),
          socialAccounts: [
            { id: 'demo-social-1', platform: 'FACEBOOK', handle: 'springfieldcity' },
            { id: 'demo-social-2', platform: 'TWITTER', handle: '@springfieldgov' }
          ],
          projects: [
            { id: 'demo-project-1', name: 'Summer Festival Campaign', status: 'ACTIVE' },
            { id: 'demo-project-2', name: 'Public Health Initiative', status: 'COMPLETED' }
          ],
        },
        {
          id: 'demo-client-2',
          name: 'TechStart Inc.',
          organizationId,
          email: 'contact@techstart.com',
          type: 'STARTUP',
          status: 'active' as const,
          industry: 'Technology',
          website: 'https://techstart.com',
          logoUrl: null,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          performanceScore: 88,
          monthlyBudget: 8000,
          lastActivity: new Date().toISOString(),
          socialAccounts: [
            { id: 'demo-social-3', platform: 'LINKEDIN', handle: '/company/techstart' },
            { id: 'demo-social-4', platform: 'TWITTER', handle: '@techstartinc' }
          ],
          projects: [
            { id: 'demo-project-3', name: 'Product Launch Campaign', status: 'ACTIVE' }
          ],
        },
        {
          id: 'demo-client-3',
          name: 'Local Coffee Co.',
          organizationId,
          email: 'hello@localcoffee.com',
          type: 'BUSINESS',
          status: 'active' as const,
          industry: 'Food & Beverage',
          website: 'https://localcoffee.com',
          logoUrl: null,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          performanceScore: 76,
          monthlyBudget: 3500,
          lastActivity: new Date().toISOString(),
          socialAccounts: [
            { id: 'demo-social-5', platform: 'INSTAGRAM', handle: '@localcoffeeco' },
            { id: 'demo-social-6', platform: 'FACEBOOK', handle: 'localcoffeeco' }
          ],
          projects: [
            { id: 'demo-project-4', name: 'Holiday Menu Promotion', status: 'PLANNED' }
          ],
        }
      ];
      
      return NextResponse.json(demoClients);
    }

    return NextResponse.json(clientSummaries);
    */ // End of commented database code

  } catch (error) {
    console.error('Service provider clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}