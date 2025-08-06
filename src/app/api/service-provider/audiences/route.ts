import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    console.log('🔍 Audience API Debug:', { userId, organizationId });

    // First, try to find organization by ID, then by clerkOrganizationId
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    // If not found by ID, try by clerkOrganizationId
    if (!orgExists && organizationId.startsWith('org_')) {
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
      console.log('🔍 Searched by clerkOrganizationId:', { found: !!orgExists });
    }

    if (!orgExists) {
      console.log('⚠️ Organization not found, creating demo organization:', organizationId);
      
      // Create a demo organization for development
      try {
        orgExists = await prisma.organization.create({
          data: {
            id: organizationId.startsWith('org_') ? organizationId.replace('org_', '') : organizationId,
            name: 'Demo Service Provider',
            slug: organizationId.startsWith('org_') ? organizationId.replace('org_', 'demo-') : `demo-${organizationId}`,
            clerkOrganizationId: organizationId.startsWith('org_') ? organizationId : null,
            type: 'service_provider',
            subscriptionTier: 'basic',
          }
        });
        console.log('✅ Created demo organization:', orgExists.id);
      } catch (createError) {
        console.log('❌ Could not create demo organization:', createError);
        return NextResponse.json({ 
          error: 'Organization setup required',
          details: 'Please complete organization setup or contact support'
        }, { status: 404 });
      }
    }

    // Use the actual database organization ID for subsequent queries
    const dbOrganizationId = orgExists.id;

    // First get the user's database ID from their clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to the organization using the database user ID
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id, // Use database user ID, not clerkId
        organizationId: dbOrganizationId,
      },
    });

    console.log('👤 User membership check:', { 
      clerkId: userId,
      dbUserId: user.id,
      organizationId, 
      dbOrganizationId,
      hasMembership: !!userMembership,
      membershipId: userMembership?.id 
    });

    if (!userMembership) {
      // For development/demo purposes, create a basic organization membership if none exists
      // In production, this should be handled through proper onboarding
      console.log('⚠️ No organization membership found, creating demo membership');
      
      try {
        const newMembership = await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: dbOrganizationId,
            role: 'ADMIN',
            serviceProviderRole: 'ADMIN',
          },
        });
        console.log('✅ Demo membership created:', newMembership);
      } catch (createError) {
        console.log('❌ Could not create demo membership:', createError);
        return NextResponse.json({ 
          error: 'Access denied - not a member of this organization. Please contact your administrator to be added to this organization.',
          details: 'No organization membership found and unable to create demo membership'
        }, { status: 403 });
      }
    }

    // Fetch actual audiences from database
    const audiences = await prisma.audience.findMany({
      where: {
        organizationId: dbOrganizationId,
      },
      include: {
        segments: true,
        contactLists: {
          include: {
            _count: {
              select: {
                contacts: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match the expected interface
    const transformedAudiences = audiences.map(audience => {
      // Calculate total contacts from contact lists
      const totalContacts = audience.contactLists.reduce((sum, contactList) => 
        sum + contactList._count.contacts, 0
      );
      
      return {
        id: audience.id,
        name: audience.name,
        description: audience.description,
        type: audience.type,
        status: audience.status,
        size: totalContacts || audience.size,
        createdAt: audience.createdAt.toISOString(),
        lastUpdated: audience.updatedAt?.toISOString() || audience.lastUpdated?.toISOString(),
        source: audience.source || 'Manual',
        tags: audience.tags || [],
        segments: audience.segments.map(segment => ({
          id: segment.id,
          name: segment.name,
          description: segment.description,
          type: segment.type,
          size: segment.size || 0,
          status: segment.status,
          lastUpdated: segment.updatedAt.toISOString(),
          conditions: segment.conditions ? {
            demographics: segment.rules?.demographics,
            behavioral: segment.rules?.behavioral,
            custom: segment.rules?.custom,
          } : undefined,
          performance: {
            engagementRate: Math.random() * 30 + 60, // Placeholder until we have real engagement data
            conversionRate: Math.random() * 10 + 5,
            avgOrderValue: Math.random() * 300 + 200,
            churnRate: Math.random() * 10 + 2
          },
          growth: {
            thisWeek: Math.random() * 10 - 2,
            thisMonth: Math.random() * 20 + 5
          }
        })),
        analytics: {
          totalEngagement: Math.floor(Math.random() * 100000) + 50000,
          avgEngagementRate: Math.random() * 25 + 55,
          topPerformingSegment: audience.segments[0]?.name || 'N/A',
          growth: {
            daily: Math.random() * 3,
            weekly: Math.random() * 10 + 2,
            monthly: Math.random() * 20 + 5
          }
        }
      };
    });

    return NextResponse.json(transformedAudiences);

  } catch (error) {
    console.error('Error fetching service provider audiences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, tags, organizationId, conditions } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // First get the user's database ID from their clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Apply the same organization lookup logic as GET handler
    let orgExists = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      orgExists = await prisma.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    if (!orgExists) {
      return NextResponse.json({ 
        error: 'Organization not found. Please ensure the organization is properly set up.',
      }, { status: 404 });
    }

    const dbOrganizationId = orgExists.id;

    // Check if user has access to the organization using the database user ID
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id, // Use database user ID, not clerkId
        organizationId: dbOrganizationId,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied - not a member of this organization' }, { status: 403 });
    }

    // Create the audience with transaction to ensure consistency
    const audience = await prisma.$transaction(async (tx) => {
      // Create the audience
      const newAudience = await tx.audience.create({
        data: {
          name,
          description,
          type,
          status: 'ACTIVE',
          tags: tags || [],
          source: 'Manual',
          organizationId,
          createdBy: user.id,
        },
      });

      // Create default segment if conditions are provided
      if (conditions && conditions.length > 0) {
        const segment = await tx.audienceSegment.create({
          data: {
            name: `${name} - Primary Segment`,
            description: `Primary segment for ${name}`,
            type: 'CUSTOM',
            status: 'ACTIVE',
            size: 0,
            audienceId: newAudience.id,
            organizationId: dbOrganizationId,
            createdById: user.id,
            rules: {
              conditions: conditions.map(condition => ({
                type: condition.type,
                field: condition.field,
                operator: condition.operator,
                value: condition.value,
              }))
            },
            conditions: {
              conditions: conditions.map(condition => ({
                type: condition.type,
                field: condition.field,
                operator: condition.operator,
                value: condition.value,
              }))
            },
          },
        });

        // Create targeting rules for the segment
        for (const condition of conditions) {
          await tx.targetingRule.create({
            data: {
              name: `${condition.field} ${condition.operator} ${condition.value}`,
              description: `Targeting rule for ${condition.field}`,
              type: condition.type === 'demographic' ? 'DEMOGRAPHIC' : 
                    condition.type === 'behavioral' ? 'BEHAVIORAL' : 'CUSTOM',
              operator: condition.operator.toUpperCase() as any,
              value: condition.value,
              conditions: {
                type: condition.type,
                field: condition.field,
                operator: condition.operator,
                value: condition.value,
              },
              segmentId: segment.id,
              audienceId: newAudience.id,
              organizationId: dbOrganizationId,
              createdById: user.id,
            },
          });
        }
      }

      return newAudience;
    });

    // Fetch the created audience with full details
    const createdAudience = await prisma.audience.findUnique({
      where: { id: audience.id },
      include: {
        segments: {
          include: {
            targetingRules: true,
          },
        },
        contactLists: {
          include: {
            _count: {
              select: {
                contacts: true,
              },
            },
          },
        },
      },
    });

    if (!createdAudience) {
      return NextResponse.json({ error: 'Failed to retrieve created audience' }, { status: 500 });
    }

    // Transform to match the expected interface
    const totalContacts = createdAudience.contactLists.reduce((sum, contactList) => 
      sum + contactList._count.contacts, 0
    );
    
    const transformedAudience = {
      id: createdAudience.id,
      name: createdAudience.name,
      description: createdAudience.description,
      type: createdAudience.type,
      status: createdAudience.status,
      size: totalContacts || createdAudience.size,
      createdAt: createdAudience.createdAt.toISOString(),
      lastUpdated: createdAudience.updatedAt?.toISOString(),
      source: createdAudience.source || 'Manual',
      tags: createdAudience.tags || [],
      segments: createdAudience.segments.map(segment => ({
        id: segment.id,
        name: segment.name,
        description: segment.description,
        type: segment.type,
        size: segment.size || 0,
        status: segment.status,
        lastUpdated: segment.updatedAt.toISOString(),
        conditions: segment.targetingRules.length > 0 ? {
          demographics: segment.targetingRules.filter(r => r.type === 'DEMOGRAPHIC').map(r => r.conditions),
          behavioral: segment.targetingRules.filter(r => r.type === 'BEHAVIORAL').map(r => r.conditions),
          custom: segment.targetingRules.filter(r => r.type === 'CUSTOM').map(r => r.conditions),
        } : undefined,
      })),
    };

    return NextResponse.json(transformedAudience, { status: 201 });

  } catch (error) {
    console.error('Error creating audience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}