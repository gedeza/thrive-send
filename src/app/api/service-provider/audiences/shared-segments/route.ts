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

    // Fetch shared segments - segments that are used across multiple audiences
    const segments = await prisma.audienceSegment.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        audience: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        targetingRules: true,
        _count: {
          select: {
            targetingRules: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Group segments by similar targeting rules to identify shared segments
    const segmentGroups = new Map<string, any[]>();
    
    segments.forEach(segment => {
      // Create a signature for the segment based on its targeting rules
      const rulesSignature = segment.targetingRules
        .map(rule => `${rule.type}-${rule.operator}-${JSON.stringify(rule.value)}`)
        .sort()
        .join('|');
      
      if (!segmentGroups.has(rulesSignature)) {
        segmentGroups.set(rulesSignature, []);
      }
      segmentGroups.get(rulesSignature)!.push(segment);
    });

    // Transform into shared segments format
    const sharedSegments = Array.from(segmentGroups.entries())
      .filter(([signature, segments]) => segments.length > 1 || segments[0].targetingRules.length > 0)
      .map(([signature, segmentGroup]) => {
        const primarySegment = segmentGroup[0];
        const audiences = segmentGroup.map(s => s.audience);
        
        return {
          id: `shared-${signature.slice(0, 8)}`,
          name: `Shared: ${primarySegment.name}`,
          description: `Shared segment used across ${audiences.length} audience(s)`,
          type: primarySegment.type,
          status: 'ACTIVE',
          size: segmentGroup.reduce((sum, s) => sum + s.size, 0),
          createdAt: primarySegment.createdAt.toISOString(),
          lastUpdated: Math.max(...segmentGroup.map(s => s.updatedAt.getTime())),
          usageCount: audiences.length,
          audiences: audiences.map(audience => ({
            id: audience.id,
            name: audience.name,
            type: audience.type,
          })),
          targetingRules: primarySegment.targetingRules.map(rule => ({
            id: rule.id,
            name: rule.name,
            type: rule.type,
            operator: rule.operator,
            value: rule.value,
            conditions: rule.conditions,
          })),
          segments: segmentGroup.map(segment => ({
            id: segment.id,
            name: segment.name,
            size: segment.size,
            audienceId: segment.audienceId,
            audienceName: segment.audience.name,
          })),
          performance: {
            totalReach: segmentGroup.reduce((sum, s) => sum + s.size, 0),
            avgEngagementRate: Math.random() * 30 + 60, // Placeholder
            conversionRate: Math.random() * 10 + 5,
            efficiency: segmentGroup.length > 1 ? 'High' : 'Medium',
          },
        };
      });

    return NextResponse.json(sharedSegments);

  } catch (error) {
    console.error('Error fetching shared segments:', error);
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
    const { 
      name, 
      description, 
      type, 
      organizationId, 
      targetingRules,
      audienceIds // Array of audience IDs to apply this shared segment to
    } = body;

    if (!organizationId || !name || !type || !audienceIds?.length) {
      return NextResponse.json({ 
        error: 'Organization ID, name, type, and audience IDs are required' 
      }, { status: 400 });
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

    // Verify all audience IDs belong to the organization
    const audiences = await prisma.audience.findMany({
      where: {
        id: { in: audienceIds },
        organizationId,
      },
    });

    if (audiences.length !== audienceIds.length) {
      return NextResponse.json({ 
        error: 'One or more audience IDs are invalid or not accessible' 
      }, { status: 400 });
    }

    // Create shared segment across multiple audiences using transaction
    const sharedSegments = await prisma.$transaction(async (tx) => {
      const createdSegments = [];

      for (const audienceId of audienceIds) {
        // Create segment for each audience
        const segment = await tx.audienceSegment.create({
          data: {
            name: `${name} (${audiences.find(a => a.id === audienceId)?.name})`,
            description,
            type,
            status: 'ACTIVE',
            size: 0,
            audienceId,
            organizationId,
            createdById: userId,
            rules: {
              shared: true,
              originalName: name,
              targetingRules: targetingRules || [],
            },
          },
        });

        // Create targeting rules for the segment
        if (targetingRules && targetingRules.length > 0) {
          for (const rule of targetingRules) {
            await tx.targetingRule.create({
              data: {
                name: rule.name || `${rule.field} ${rule.operator} ${rule.value}`,
                description: rule.description || `Shared targeting rule for ${rule.field}`,
                type: rule.type,
                operator: rule.operator,
                value: rule.value,
                conditions: rule.conditions || {
                  type: rule.type,
                  field: rule.field,
                  operator: rule.operator,
                  value: rule.value,
                },
                segmentId: segment.id,
                audienceId,
                organizationId,
                createdById: userId,
              },
            });
          }
        }

        createdSegments.push(segment);
      }

      return createdSegments;
    });

    // Return the shared segment information
    return NextResponse.json({
      id: `shared-${Date.now()}`,
      name,
      description,
      type,
      status: 'ACTIVE',
      usageCount: audienceIds.length,
      segments: sharedSegments.map(segment => ({
        id: segment.id,
        name: segment.name,
        audienceId: segment.audienceId,
        size: segment.size,
      })),
      createdAt: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating shared segment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}