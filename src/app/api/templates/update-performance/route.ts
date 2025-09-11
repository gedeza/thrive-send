import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for performance updates
const updatePerformanceSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  outcome: z.object({
    status: z.enum(['completed', 'cancelled', 'failed', 'in_progress']),
    publishedAt: z.string().optional(),
    engagementScore: z.number().min(0).max(1).optional(),
    reach: z.number().min(0).optional(),
    conversions: z.number().min(0).optional(),
    clickThroughRate: z.number().min(0).max(1).optional(),
  }),
  platformSpecific: z.record(z.object({
    reach: z.number().min(0),
    engagement: z.number().min(0),
    conversions: z.number().min(0),
    clicks: z.number().min(0),
  })).optional(),
  updatedAt: z.string().optional()
});

// POST /api/templates/update-performance
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to update template performance' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = updatePerformanceSchema.parse(body);

    // Find the template usage record
    const templateUsage = await prisma.templateUsage.findFirst({
      where: {
        eventId: validatedData.eventId,
        organizationId: orgId,
      },
      include: {
        template: true,
      },
    });

    if (!templateUsage) {
      return NextResponse.json(
        { error: 'Template usage record not found for this event' },
        { status: 404 }
      );
    }

    // Update the template usage record with outcome data
    const updatedUsage = await prisma.templateUsage.update({
      where: { id: templateUsage.id },
      data: {
        outcome: validatedData.outcome,
        platformSpecific: validatedData.platformSpecific,
        completedAt: validatedData.outcome.status === 'completed' ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    // Calculate and update template performance metrics
    await updateTemplateMetrics(templateUsage.templateId, orgId);

    // If this is a completion, update template's success metrics
    if (validatedData.outcome.status === 'completed') {
      const template = templateUsage.template;
      const totalUsages = await prisma.templateUsage.count({
        where: { templateId: template.id }
      });
      
      const completedUsages = await prisma.templateUsage.count({
        where: { 
          templateId: template.id,
          outcome: {
            path: ['status'],
            equals: 'completed'
          }
        }
      });

      const successRate = totalUsages > 0 ? completedUsages / totalUsages : 0;

      // Calculate average engagement from all completed usages
      const completedUsageData = await prisma.templateUsage.findMany({
        where: { 
          templateId: template.id,
          outcome: {
            path: ['status'],
            equals: 'completed'
          }
        },
        select: {
          outcome: true
        }
      });

      const avgEngagement = completedUsageData.length > 0 
        ? completedUsageData.reduce((sum, usage) => {
            const engagementScore = (usage.outcome as any)?.engagementScore || 0;
            return sum + engagementScore;
          }, 0) / completedUsageData.length
        : 0;

      // Update template performance score
      const performanceScore = (successRate * 0.6) + (avgEngagement * 0.4);

      await prisma.template.update({
        where: { id: template.id },
        data: {
          performanceScore,
          successRate,
          averageEngagement: avgEngagement,
          lastUpdated: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Template performance updated successfully',
      usageId: updatedUsage.id,
      templateId: templateUsage.templateId,
      performanceData: {
        status: validatedData.outcome.status,
        engagementScore: validatedData.outcome.engagementScore,
        reach: validatedData.outcome.reach,
        conversions: validatedData.outcome.conversions,
      }
    });

  } catch (_error) {
    console.error("", _error);
    
    // Handle validation errors
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid performance data',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Failed to update template performance',
        message: 'An unexpected error occurred while updating performance metrics'
      },
      { status: 500 }
    );
  }
}

// Helper function to recalculate template metrics
async function updateTemplateMetrics(templateId: string, organizationId: string) {
  try {
    // Get all usage data for this template
    const usageData = await prisma.templateUsage.findMany({
      where: { 
        templateId,
        organizationId
      },
      orderBy: { timestamp: 'desc' }
    });

    if (usageData.length === 0) return;

    // Calculate metrics
    const totalUsages = usageData.length;
    const completedUsages = usageData.filter(u => (u.outcome as any)?.status === 'completed').length;
    const cancelledUsages = usageData.filter(u => (u.outcome as any)?.status === 'cancelled').length;
    const failedUsages = usageData.filter(u => (u.outcome as any)?.status === 'failed').length;

    const successRate = totalUsages > 0 ? completedUsages / totalUsages : 0;
    const completionRate = totalUsages > 0 ? (completedUsages + failedUsages) / totalUsages : 0;

    // Calculate average metrics from completed usages
    const completedUsageData = usageData.filter(u => (u.outcome as any)?.status === 'completed');
    
    const avgEngagement = completedUsageData.length > 0 
      ? completedUsageData.reduce((sum, u) => sum + ((u.outcome as any)?.engagementScore || 0), 0) / completedUsageData.length
      : 0;

    const totalReach = completedUsageData.reduce((sum, u) => sum + ((u.outcome as any)?.reach || 0), 0);
    const totalConversions = completedUsageData.reduce((sum, u) => sum + ((u.outcome as any)?.conversions || 0), 0);
    const conversionRate = totalReach > 0 ? totalConversions / totalReach : 0;

    // Calculate average time to complete (for completed usages)
    const completionTimes = completedUsageData
      .filter(u => u.completedAt && u.timestamp)
      .map(u => {
        const start = new Date(u.timestamp).getTime();
        const end = new Date(u.completedAt!).getTime();
        return (end - start) / (1000 * 60); // Convert to minutes
      });

    const avgTimeToComplete = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    // Update template with calculated metrics
    await prisma.template.update({
      where: { id: templateId },
      data: {
        usageCount: totalUsages,
        successRate,
        completionRate,
        averageEngagement: avgEngagement,
        performanceScore: (successRate * 0.4) + (avgEngagement * 0.3) + (completionRate * 0.3),
        totalReach,
        conversionRate,
        averageTimeToComplete: Math.round(avgTimeToComplete),
        lastUpdated: new Date(),
      },
    });

  } catch (_error) {
    console.error("", _error);
    // Don't throw - this is a background calculation
  }
}