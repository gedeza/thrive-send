import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

// Simple in-memory storage for demo fallback only when database is unavailable
// This is temporary - the real solution is to fix database connectivity
const sessionDemoClients = new Map<string, any[]>();

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

    // 🔍 Handle organization ID mapping - check both database ID and Clerk organization ID
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      console.log('🔍 Searching by clerkOrganizationId:', organizationId);
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    // Create organization if it doesn't exist (development mode)
    if (!orgExists) {
      console.log('⚠️ Organization not found, creating for development:', organizationId);
      try {
        orgExists = await prisma.organization.create({
          data: {
            id: organizationId.startsWith('org_') ? `org-${Date.now()}` : organizationId,
            name: 'Auto-created Organization',
            clerkOrganizationId: organizationId.startsWith('org_') ? organizationId : null,
          }
        });
        
        // Also create organization membership for the user if needed
        const user = await prisma.user.findUnique({
          where: { clerkId: userId }
        });
        
        if (user) {
          await prisma.organizationMember.upsert({
            where: {
              userId_organizationId: {
                userId: user.id,
                organizationId: orgExists.id
              }
            },
            create: {
              userId: user.id,
              organizationId: orgExists.id,
              role: 'ADMIN'
            },
            update: {}
          });
        }
      } catch (createError) {
        console.error('Failed to create organization:', createError);
        return NextResponse.json({ error: 'Organization access denied' }, { status: 403 });
      }
    }

    // Use the database organization ID for queries
    const dbOrganizationId = orgExists.id;
    console.log('🔍 Using organization ID for database queries:', dbOrganizationId);

    // Create demo clients with real, inspiring data
    const demoClients = [
      {
        id: 'demo-client-1',
        name: 'City of Springfield',
        organizationId: dbOrganizationId,
        email: 'communications@springfield.gov',
        type: 'Government',
        status: 'active' as const,
        industry: 'Municipal Government',
        website: 'https://springfield.gov',
        phone: '+1 (555) 123-4567',
        address: '123 City Hall Plaza, Springfield, IL 62701',
        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Springfield&backgroundColor=1e40af',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        performanceScore: 92,
        monthlyBudget: 15000,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        socialAccounts: [
          { id: 'demo-social-1', platform: 'FACEBOOK', handle: 'CityOfSpringfield' },
          { id: 'demo-social-2', platform: 'TWITTER', handle: '@SpringfieldGov' },
          { id: 'demo-social-3', platform: 'INSTAGRAM', handle: '@springfieldcity' }
        ],
        projects: [
          { id: 'demo-project-1', name: 'Summer Community Events 2024', status: 'ACTIVE' },
          { id: 'demo-project-2', name: 'Public Safety Awareness Campaign', status: 'COMPLETED' },
          { id: 'demo-project-3', name: 'Budget Transparency Initiative', status: 'PLANNED' }
        ],
      },
      {
        id: 'demo-client-2',
        name: 'Regional Health District',
        organizationId: dbOrganizationId,
        email: 'marketing@healthdistrict.org',
        type: 'Healthcare',
        status: 'active' as const,
        industry: 'Healthcare & Public Health',
        website: 'https://regionalhealthdistrict.org',
        phone: '+1 (555) 987-6543',
        address: '456 Medical Center Dr, Metro City, CA 90210',
        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HealthDistrict&backgroundColor=059669',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        performanceScore: 88,
        monthlyBudget: 22000,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        socialAccounts: [
          { id: 'demo-social-4', platform: 'FACEBOOK', handle: 'RegionalHealthDistrict' },
          { id: 'demo-social-5', platform: 'TWITTER', handle: '@RegionalHealth' },
          { id: 'demo-social-6', platform: 'LINKEDIN', handle: 'regional-health-district' }
        ],
        projects: [
          { id: 'demo-project-4', name: 'Vaccination Awareness Campaign', status: 'ACTIVE' },
          { id: 'demo-project-5', name: 'Mental Health Resources Program', status: 'ACTIVE' },
          { id: 'demo-project-6', name: 'Flu Season Preparedness', status: 'COMPLETED' }
        ],
      }
    ];

    // Try to get user-created clients from database with fallback
    let userClientSummaries: any[] = [];
    
    try {
      console.log('Attempting to connect to database...');
      const userClients = await prisma.client.findMany({
        where: {
          organizationId: dbOrganizationId,
          status: 'ACTIVE',
        },
        include: {
          campaigns: {
            where: {
              status: { in: ['ACTIVE', 'SCHEDULED', 'COMPLETED'] },
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          projects: {
            where: {
              status: { in: ['ACTIVE', 'PLANNED', 'COMPLETED'] },
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          socialAccounts: {
            select: {
              id: true,
              platform: true,
              handle: true,
            },
          },
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

      // Transform user-created clients into the expected service provider format
      userClientSummaries = userClients.map(client => {
        const activeCampaigns = client.campaigns.filter(c => c.status === 'ACTIVE').length;
        const totalCampaigns = client._count.campaigns;
        const activeProjects = client.projects.filter(p => p.status === 'ACTIVE').length;

        // Calculate performance score based on activity and engagement
        const campaignScore = Math.min((activeCampaigns / Math.max(totalCampaigns, 1)) * 40, 40);
        const projectScore = Math.min(activeProjects * 15, 30);
        const timeScore = Math.max(30 - Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)), 0);
        const performanceScore = Math.min(campaignScore + projectScore + timeScore, 100);

        return {
          id: client.id,
          name: client.name,
          organizationId: client.organizationId,
          email: client.email,
          type: client.type,
          status: client.status === 'ACTIVE' ? 'active' : 'inactive' as const,
          industry: client.industry || 'General',
          website: client.website,
          phone: client.phone,
          address: client.address,
          logoUrl: client.logoUrl,
          createdAt: client.createdAt.toISOString(),
          updatedAt: client.updatedAt.toISOString(),
          performanceScore: Number(performanceScore.toFixed(1)),
          monthlyBudget: client.monthlyBudget ? Number(client.monthlyBudget) : null,
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

      console.log(`Successfully loaded ${userClients.length} clients from database`);

    } catch (dbError) {
      console.warn('Database unavailable, using demo-only mode:', dbError);
      // Continue with empty userClientSummaries array
      userClientSummaries = [];
    }

    // Get session-specific demo clients created by this user
    const sessionKey = `${organizationId}-${userId}`;
    const sessionClients = sessionDemoClients.get(sessionKey) || [];

    console.log('Session storage debug:', {
      sessionKey,
      sessionClientsFound: sessionClients.length,
      allSessionKeys: Array.from(sessionDemoClients.keys()),
      sessionClientIds: sessionClients.map(c => c.id)
    });

    // Combine all clients: static demos + database clients + session demo clients
    const allClients = [...demoClients, ...userClientSummaries, ...sessionClients];

    console.log(`Returning ${allClients.length} total clients (${demoClients.length} static demo + ${userClientSummaries.length} database + ${sessionClients.length} session demo)`);
    
    // Return simple array format for compatibility with existing frontend
    return NextResponse.json(allClients);

  } catch (error) {
    console.error('Service provider clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, type, organizationId, ...otherData } = body;

    // Validate required fields
    if (!name || !email || !type || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, type, organizationId' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 🔍 Handle organization ID mapping for POST method as well
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    if (!orgExists) {
      try {
        orgExists = await prisma.organization.create({
          data: {
            id: organizationId.startsWith('org_') ? `org-${Date.now()}` : organizationId,
            name: 'Auto-created Organization',
            clerkOrganizationId: organizationId.startsWith('org_') ? organizationId : null,
          }
        });
      } catch (createError) {
        console.error('Failed to create organization:', createError);
        return NextResponse.json({ error: 'Organization access denied' }, { status: 403 });
      }
    }

    const dbOrganizationId = orgExists.id;

    let clientResponse: any;

    try {
      console.log('Attempting to create client in database...');
      
      // Check if client with same email already exists in this organization
      const existingClient = await prisma.client.findFirst({
        where: {
          email,
          organizationId: dbOrganizationId,
        },
      });

      if (existingClient) {
        return NextResponse.json(
          { error: 'A client with this email already exists in your organization' },
          { status: 409 }
        );
      }

      // Create client in database
      const newClient = await prisma.client.create({
        data: {
          name,
          email,
          type,
          organizationId: dbOrganizationId,
          industry: otherData.industry || null,
          website: otherData.website || null,
          phone: otherData.phone || null,
          address: otherData.address || null,
          logoUrl: otherData.logoUrl || null,
          monthlyBudget: otherData.monthlyBudget ? Number(otherData.monthlyBudget) : null,
          status: 'ACTIVE',
        },
        include: {
          socialAccounts: {
            select: {
              id: true,
              platform: true,
              handle: true,
            },
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      // Transform to expected format
      clientResponse = {
        id: newClient.id,
        name: newClient.name,
        organizationId: newClient.organizationId,
        email: newClient.email,
        type: newClient.type,
        status: 'active' as const,
        industry: newClient.industry || 'General',
        website: newClient.website,
        phone: newClient.phone,
        address: newClient.address,
        logoUrl: newClient.logoUrl,
        createdAt: newClient.createdAt.toISOString(),
        updatedAt: newClient.updatedAt.toISOString(),
        performanceScore: 0,
        monthlyBudget: newClient.monthlyBudget ? Number(newClient.monthlyBudget) : null,
        lastActivity: newClient.updatedAt.toISOString(),
        socialAccounts: newClient.socialAccounts,
        projects: newClient.projects,
      };

      console.log('Client created in database:', newClient.id);

    } catch (dbError) {
      console.warn('Database unavailable, creating demo client:', dbError);
      
      // Fallback: Create a demo client response and store in session
      clientResponse = {
        id: `demo-client-user-${Date.now()}`,
        name,
        email,
        type,
        organizationId,
        status: 'active' as const,
        industry: otherData.industry || 'General',
        website: otherData.website || null,
        phone: otherData.phone || null,
        address: otherData.address || null,
        logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        performanceScore: 0,
        monthlyBudget: otherData.monthlyBudget ? Number(otherData.monthlyBudget) : null,
        lastActivity: new Date().toISOString(),
        socialAccounts: [],
        projects: [],
      };

      // Store in session-based storage (temporary fallback)
      const sessionKey = `${organizationId}-${userId}`;
      const existingSessionClients = sessionDemoClients.get(sessionKey) || [];
      existingSessionClients.push(clientResponse);
      sessionDemoClients.set(sessionKey, existingSessionClients);

      console.log('Demo client created and stored in session (temporary):', {
        clientId: clientResponse.id,
        sessionKey,
        organizationId,
        userId,
        clientsInSession: existingSessionClients.length,
        allSessionKeys: Array.from(sessionDemoClients.keys()),
        clientName: clientResponse.name,
        note: 'This is temporary - real data should go to database'
      });
    }
    
    return NextResponse.json({
      success: true,
      client: clientResponse,
      message: clientResponse.id.startsWith('demo-client-user-') 
        ? 'Client created successfully (Demo mode - database unavailable)' 
        : 'Client created successfully',
      demoMode: clientResponse.id.startsWith('demo-client-user-')
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}