import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { generateId } from '@/lib/id-generator';
import { getDisplayableId } from '@/lib/enhanced-models';
import { getOrCreateUser } from '@/lib/user-utils';

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
        const user = await getOrCreateUser(userId);
        
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

      console.log('🔍 Raw database clients found:', userClients.map(c => ({
        id: c.id,
        name: c.name,
        displayId: c.displayId,
        organizationId: c.organizationId,
        status: c.status
      })));

      // Transform user-created clients into the expected service provider format
      userClientSummaries = userClients.map(client => {
        const totalCampaigns = client._count.campaigns;
        const activeProjects = client.projects.filter(p => p.status === 'ACTIVE').length;

        // Calculate performance score based on activity and engagement
        const campaignScore = Math.min((totalCampaigns > 0 ? 1 : 0) * 40, 40);
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

    // Return only real database clients (no more demo/mock data)
    const allClients = [...userClientSummaries, ...sessionClients];

    console.log(`🔍 Final client list composition:`);
    console.log(`   Database clients: ${userClientSummaries.length}`);
    console.log(`   Session demo clients (temporary): ${sessionClients.length}`);
    console.log(`   Total clients: ${allClients.length}`);
    console.log(`🔍 All client names:`, allClients.map(c => `${c.name} (${c.id})`));
    
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

      // Generate display ID for new client
      const displayId = generateId.client();
      
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
          displayId, // Add the user-friendly display ID
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
        displayId: newClient.displayId, // Include the user-friendly display ID
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
      
      // Generate display ID for demo client too
      const demoDisplayId = generateId.client();
      
      // Fallback: Create a demo client response and store in session
      clientResponse = {
        id: `demo-client-user-${Date.now()}`,
        displayId: demoDisplayId, // Include display ID for demo clients too
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