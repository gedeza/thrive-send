import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for usage tracking
const usageTrackingSchema = z.object({
  context: z.enum(['content-creation', 'calendar', 'campaign', 'project', 'general']),
  action: z.enum(['view', 'select', 'duplicate', 'edit', 'publish']).default('select'),
  source: z.string().optional(), // Where the template was accessed from
  metadata: z.record(z.any()).optional(), // Additional context data
});

// POST /api/templates/:id/track-usage
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Validate request body
    const body = await req.json();
    const { context, action, source, metadata } = usageTrackingSchema.parse(body);

    // Verify template exists and user has access
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        organizationId: orgId
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create usage tracking record
    await prisma.templateUsage.create({
      data: {
        templateId,
        userId,
        organizationId: orgId,
        context,
        action,
        source,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
      }
    });

    // Update template usage count and last used timestamp
    await prisma.template.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1
        },
        lastUsed: new Date(),
      }
    });

    // Update user's template interaction patterns for AI learning
    await prisma.userTemplatePreference.upsert({
      where: {
        userId_templateId: {
          userId,
          templateId
        }
      },
      create: {
        userId,
        templateId,
        interactionCount: 1,
        lastInteraction: new Date(),
        contexts: [context],
        preferenceScore: calculateInitialPreferenceScore(context, action),
      },
      update: {
        interactionCount: {
          increment: 1
        },
        lastInteraction: new Date(),
        contexts: {
          push: context
        },
        preferenceScore: {
          increment: calculatePreferenceIncrement(action)
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully'
    });

  } catch (error) {
    console.error('Usage tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid tracking data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Non-critical failure - don't break user experience
    return NextResponse.json(
      { 
        success: false,
        message: 'Usage tracking failed but template selection succeeded'
      },
      { status: 200 }
    );
  }
}

// Calculate initial preference score based on context and action
function calculateInitialPreferenceScore(context: string, action: string): number {
  const contextWeights = {
    'content-creation': 1.0,
    'calendar': 0.8,
    'campaign': 1.2,
    'project': 0.9,
    'general': 0.7
  };

  const actionWeights = {
    'view': 0.1,
    'select': 0.5,
    'duplicate': 0.8,
    'edit': 1.0,
    'publish': 1.5
  };

  return (contextWeights[context as keyof typeof contextWeights] || 0.5) * 
         (actionWeights[action as keyof typeof actionWeights] || 0.5);
}

// Calculate preference increment based on action
function calculatePreferenceIncrement(action: string): number {
  const increments = {
    'view': 0.05,
    'select': 0.1,
    'duplicate': 0.15,
    'edit': 0.2,
    'publish': 0.3
  };

  return increments[action as keyof typeof increments] || 0.1;
}