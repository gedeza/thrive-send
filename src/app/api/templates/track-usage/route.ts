import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Validation schema for template usage tracking
const trackUsageSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
  userId: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  context: z.enum(['calendar', 'campaign', 'project', 'direct']).default('calendar'),
  modifications: z.object({
    titleChanged: z.boolean().default(false),
    descriptionChanged: z.boolean().default(false),
    timeChanged: z.boolean().default(false),
    platformsChanged: z.boolean().default(false),
  }).default({}),
  usedAt: z.string().optional()
});

// POST /api/templates/track-usage
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to track template usage' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = trackUsageSchema.parse(body);

    // Verify the user has access to this template and organization
    const template = await prisma.template.findFirst({
      where: {
        id: validatedData.templateId,
        organizationId: orgId,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    // Create template usage record
    const usageRecord = await prisma.templateUsage.create({
      data: {
        id: nanoid(),
        templateId: validatedData.templateId,
        eventId: validatedData.eventId,
        userId: validatedData.userId,
        organizationId: validatedData.organizationId,
        context: validatedData.context,
        modifications: validatedData.modifications,
        usedAt: validatedData.usedAt ? new Date(validatedData.usedAt) : new Date(),
        timestamp: new Date(),
      },
    });

    // Update template usage count and last used date
    await prisma.template.update({
      where: { id: validatedData.templateId },
      data: {
        usageCount: {
          increment: 1
        },
        lastUsed: new Date(),
        lastUpdated: new Date(),
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Template usage tracked successfully',
      usageId: usageRecord.id,
      timestamp: usageRecord.timestamp.toISOString()
    });

  } catch (_error) {
    console.error("", _error);
    
    // Handle validation errors
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (_error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          error: 'Usage already tracked',
          message: 'This template usage has already been recorded for this event'
        },
        { status: 409 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Failed to track template usage',
        message: 'An unexpected error occurred while tracking template usage'
      },
      { status: 500 }
    );
  }
}