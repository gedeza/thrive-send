import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { generateId } from '@/lib/id-generator';
import { z } from 'zod';

// Simple in-memory storage for demo fallback only when database is unavailable
// This is temporary - the real solution is to fix database connectivity
const sessionDemoClients = new Map<string, any[]>();

// All demo/mock client data has been removed per user request
// This API now only serves real database clients

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = params.clientId;

    console.log('Client detail request:', {
      clientId,
      organizationId,
      userId,
      requestUrl: request.url
    });

    // Validate required parameters
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
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

    // All static demo/mock clients have been removed - only using real database clients

    // Check if this is a session demo client (user-created in demo mode)
    const sessionKey = `${organizationId}-${userId}`;
    const sessionClients = sessionDemoClients.get(sessionKey) || [];
    const sessionClient = sessionClients.find(c => c.id === clientId);
    
    console.log('Session client lookup:', {
      clientId,
      sessionKey,
      sessionClientsFound: sessionClients.length,
      sessionClientIds: sessionClients.map(c => c.id),
      foundSessionClient: !!sessionClient,
      allSessionKeys: Array.from(sessionDemoClients.keys())
    });
    
    if (sessionClient) {
      // Transform session client to detailed format
      return NextResponse.json({
        ...sessionClient,
        organizationId,
        // Add minimal detail data for session clients
        contactPerson: {
          name: 'Client Representative',
          email: sessionClient.email,
          phone: sessionClient.phone || 'Not provided',
          title: 'Primary Contact'
        },
        demographics: {
          primaryAudience: 'General Audience',
          location: 'Not specified',
          population: 0,
          averageAge: 0
        },
        services: ['Content Management'],
        contractDetails: {
          startDate: sessionClient.createdAt,
          endDate: null,
          billingCycle: 'monthly',
          contractValue: sessionClient.monthlyBudget * 12 || 0
        },
        projects: [],
        recentActivity: [
          {
            id: 'act-session-1',
            type: 'client_created',
            title: 'Client account created',
            timestamp: sessionClient.createdAt,
          }
        ],
        kpis: {
          engagement: { current: 0, target: 5.0, trend: 'stable', change: 0 },
          reach: { current: 0, target: 1000, trend: 'stable', change: 0 },
          conversions: { current: 0, target: 50, trend: 'stable', change: 0 },
          satisfaction: { current: 0, target: 4.5, trend: 'stable', change: 0 }
        },
        budget: {
          allocated: sessionClient.monthlyBudget || 0,
          spent: 0,
          remaining: sessionClient.monthlyBudget || 0,
          spendingByCategory: []
        },
        goals: [],
        documents: [],
        feedback: []
      });
    }

    // If not a demo client, try to fetch from database with fallback
    let client: any = null;
    
    try {
      console.log('Attempting to fetch client from database...');
      // Try to find client by either CUID or display ID
      // Simplified query to avoid relation errors - only include confirmed relations
      client = await prisma.client.findFirst({
        where: {
          OR: [
            { id: clientId },
            { displayId: clientId }
          ],
          organizationId: dbOrganizationId,
          status: 'ACTIVE'
        },
      });
    } catch (dbError) {
      console.warn('Database unavailable when fetching client details:', dbError);
      client = null;
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Transform database client to expected format
    const clientResponse = {
      id: client.id,
      name: client.name,
      organizationId: client.organizationId,
      email: client.email,
      type: client.type,
      status: client.status === 'ACTIVE' ? 'active' : 'inactive',
      industry: client.industry || 'General',
      website: client.website,
      phone: client.phone,
      address: client.address,
      logoUrl: client.logoUrl,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      monthlyBudget: client.monthlyBudget ? Number(client.monthlyBudget) : null,
      lastActivity: client.updatedAt.toISOString(),
      
      // Simple performance score calculation without complex relations
      performanceScore: Math.max(60 - Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 10)), 0),
      
      // Placeholder data for relations that may not exist
      projects: [],
      goals: [],
      documents: [],
      feedback: [],
      
      // Placeholder data for fields not in database
      contactPerson: {
        name: 'Client Representative',
        email: client.email,
        phone: client.phone || 'Not provided',
        title: 'Primary Contact'
      },
      
      recentActivity: [
        {
          id: 'act-db-1',
          type: 'client_created',
          title: 'Client account created',
          timestamp: client.createdAt.toISOString(),
        }
      ],
      
      kpis: {
        engagement: { current: 0, target: 5.0, trend: 'stable', change: 0 },
        reach: { current: 0, target: 1000, trend: 'stable', change: 0 },
        conversions: { current: 0, target: 50, trend: 'stable', change: 0 },
        satisfaction: { current: 0, target: 4.5, trend: 'stable', change: 0 }
      },
      
      budget: {
        allocated: client.monthlyBudget ? Number(client.monthlyBudget) : 0,
        spent: 0,
        remaining: client.monthlyBudget ? Number(client.monthlyBudget) : 0,
        spendingByCategory: []
      }
    };

    return NextResponse.json(clientResponse);

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema
const clientUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["MUNICIPALITY", "BUSINESS", "STARTUP", "INDIVIDUAL", "NONPROFIT"]).optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  logoUrl: z.string().optional(),
  monthlyBudget: z.number().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = params.clientId;

    // Validate required parameters
    if (!organizationId || !clientId) {
      return NextResponse.json(
        { error: 'Organization ID and Client ID are required' },
        { status: 400 }
      );
    }

    // Handle organization ID mapping
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    if (!orgExists) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const dbOrganizationId = orgExists.id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = clientUpdateSchema.parse(body);

    // Check if client exists and user has access
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [
          { id: clientId },
          { displayId: clientId }
        ],
        organizationId: dbOrganizationId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if email is being changed and if it's already in use
    if (validatedData.email && validatedData.email !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: validatedData.email,
          organizationId: dbOrganizationId,
          id: { not: existingClient.id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use by another client' },
          { status: 409 }
        );
      }
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id: existingClient.id },
      data: {
        ...validatedData,
        monthlyBudget: validatedData.monthlyBudget ? String(validatedData.monthlyBudget) : undefined,
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
    const clientResponse = {
      id: updatedClient.id,
      displayId: updatedClient.displayId,
      name: updatedClient.name,
      organizationId: updatedClient.organizationId,
      email: updatedClient.email,
      type: updatedClient.type,
      status: 'active' as const,
      industry: updatedClient.industry || 'General',
      website: updatedClient.website,
      phone: updatedClient.phone,
      address: updatedClient.address,
      logoUrl: updatedClient.logoUrl,
      createdAt: updatedClient.createdAt.toISOString(),
      updatedAt: updatedClient.updatedAt.toISOString(),
      monthlyBudget: updatedClient.monthlyBudget ? Number(updatedClient.monthlyBudget) : null,
      socialAccounts: updatedClient.socialAccounts,
      projects: updatedClient.projects,
    };

    return NextResponse.json(clientResponse);
  } catch (_error) {
    console.error("", _error);
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = params.clientId;

    // Validate required parameters
    if (!organizationId || !clientId) {
      return NextResponse.json(
        { error: 'Organization ID and Client ID are required' },
        { status: 400 }
      );
    }

    // Handle organization ID mapping
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    if (!orgExists) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const dbOrganizationId = orgExists.id;

    // Check if client exists and user has access
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [
          { id: clientId },
          { displayId: clientId }
        ],
        organizationId: dbOrganizationId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Delete client with defensive approach
    console.log('🗑️ Attempting to delete client:', existingClient.id);
    
    try {
      // Try simple deletion first
      await prisma.client.delete({
        where: { id: existingClient.id },
      });
      console.log('✅ Client deleted successfully with simple deletion');
    } catch (deleteError) {
      console.warn('⚠️ Simple deletion failed, trying cascade cleanup:', deleteError);
      
      // If simple deletion fails, try cleaning up related records first
      await prisma.$transaction(async (tx) => {
        console.log('🧹 Cleaning up related records...');
        
        // Update projects to remove client reference
        try {
          const updatedProjects = await tx.project.updateMany({
            where: { clientId: existingClient.id },
            data: { clientId: null }
          });
          console.log(`📋 Updated ${updatedProjects.count} projects`);
        } catch (_error) {
          console.warn('Could not update projects:', error);
        }
        
        // Delete related records that should be removed
        const relatedTables = [
          { name: 'socialAccount', model: tx.socialAccount },
          { name: 'clientDocument', model: tx.clientDocument },
          { name: 'clientFeedback', model: tx.clientFeedback },
          { name: 'clientGoal', model: tx.clientGoal },
          { name: 'clientAssignment', model: tx.clientAssignment },
        ];
        
        for (const table of relatedTables) {
          try {
            const result = await table.model.deleteMany({
              where: { clientId: existingClient.id },
            });
            console.log(`🗑️ Deleted ${result.count} records from ${table.name}`);
          } catch (_error) {
            console.warn(`Could not delete from ${table.name}:`, error);
          }
        }
        
        // Finally delete the client
        await tx.client.delete({
          where: { id: existingClient.id },
        });
        console.log('✅ Client deleted successfully with cascade cleanup');
      });
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}