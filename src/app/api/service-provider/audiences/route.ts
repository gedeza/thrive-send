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

    // Verify user has access to the organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        members: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 403 });
    }

    // Fetch actual audiences from database
    const audiences = await prisma.audience.findMany({
      where: {
        organizationId,
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

    // Verify user has access to the organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        members: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 403 });
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
          createdBy: userId,
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
            organizationId,
            createdById: userId,
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
              organizationId,
              createdById: userId,
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