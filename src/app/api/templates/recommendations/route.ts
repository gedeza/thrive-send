import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { calculateTemplateSimilarity, predictTemplatePerformance } from '@/lib/utils/template-analytics';
import { ContentTemplate } from '@/lib/utils/content-templates';
import { ContentType } from '@/components/content/types';

// Validation schema for recommendation requests
const recommendationSchema = z.object({
  context: z.object({
    contentType: z.enum(['social', 'email', 'blog', 'article', 'custom']).optional(),
    targetAudience: z.string().optional(),
    industry: z.string().optional(),
    scheduledTime: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    goal: z.string().optional(),
  }),
  userId: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  limit: z.number().min(1).max(20).default(5)
});

// POST /api/templates/recommendations
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to get template recommendations' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = recommendationSchema.parse(body);

    // Verify organization access
    if (validatedData.organizationId !== orgId) {
      return NextResponse.json(
        { error: 'Access denied to organization templates' },
        { status: 403 }
      );
    }

    // Get all available templates for the organization
    const templates = await prisma.template.findMany({
      where: {
        organizationId: orgId,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        templateUsages: {
          where: {
            organizationId: orgId,
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 50 // Limit for performance
        }
      },
      orderBy: [
        { performanceScore: 'desc' },
        { usageCount: 'desc' },
        { lastUpdated: 'desc' }
      ]
    });

    // Get user's usage history for personalization
    const userHistory = await prisma.templateUsage.findMany({
      where: {
        userId: validatedData.userId,
        organizationId: orgId,
      },
      include: {
        template: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20
    });

    // Calculate recommendations
    const recommendations = await calculateRecommendations(
      templates,
      userHistory,
      validatedData.context,
      validatedData.limit
    );

    return NextResponse.json({
      success: true,
      recommendations,
      totalTemplates: templates.length,
      userHistoryCount: userHistory.length,
      context: validatedData.context,
      generatedAt: new Date().toISOString()
    });

  } catch (_error) {
    console.error("", _error);
    
    // Handle validation errors
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid recommendation request',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        message: 'An unexpected error occurred while generating template recommendations'
      },
      { status: 500 }
    );
  }
}

async function calculateRecommendations(
  templates: any[],
  userHistory: any[],
  context: any,
  limit: number
) {
  const recommendations = [];

  // Convert database templates to ContentTemplate format for analysis
  const contentTemplates: ContentTemplate[] = templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description || '',
    type: t.type as ContentType,
    category: t.category as any,
    icon: '📝',
    defaultTitle: t.name,
    defaultDescription: t.description || '',
    defaultDuration: t.averageTimeToComplete || 60,
    suggestedPlatforms: extractPlatformsFromContent(t.content),
    tags: extractTagsFromContent(t.content),
    isCustom: !t.aiGenerated
  }));

  for (const template of templates) {
    try {
      // Calculate base score from template performance
      let score = template.performanceScore || 0.5;

      // Boost score based on context alignment
      if (context.contentType && template.type === context.contentType) {
        score += 0.3;
      }

      // Boost based on user history
      const userUsedThisTemplate = userHistory.some(h => h.templateId === template.id);
      if (userUsedThisTemplate) {
        // Check if user had success with this template
        const userSuccessWithTemplate = userHistory
          .filter(h => h.templateId === template.id)
          .some(h => (h.outcome as any)?.status === 'completed');
        
        if (userSuccessWithTemplate) {
          score += 0.2; // Boost for user success
        } else {
          score -= 0.1; // Slight penalty for past issues
        }
      }

      // Boost based on similar templates user has used successfully
      const userSuccessfulTemplates = userHistory
        .filter(h => (h.outcome as any)?.status === 'completed')
        .map(h => h.template);

      if (userSuccessfulTemplates.length > 0) {
        const currentTemplate = contentTemplates.find(ct => ct.id === template.id);
        if (currentTemplate) {
          const maxSimilarity = Math.max(
            ...userSuccessfulTemplates.map(ust => {
              const successfulTemplate: ContentTemplate = {
                id: ust.id,
                name: ust.name,
                description: ust.description || '',
                type: ust.type as ContentType,
                category: ust.category as any,
                icon: '📝',
                defaultTitle: ust.name,
                defaultDescription: ust.description || '',
                tags: extractTagsFromContent(ust.content),
                suggestedPlatforms: extractPlatformsFromContent(ust.content)
              };
              return calculateTemplateSimilarity(currentTemplate, successfulTemplate);
            })
          );
          score += maxSimilarity * 0.25;
        }
      }

      // Time-based scoring
      if (context.scheduledTime && template.templateUsages) {
        const timeSlot = context.scheduledTime.substring(0, 2) + ':00';
        const usagesAtTime = template.templateUsages.filter((usage: any) => {
          const usageTime = new Date(usage.timestamp).getHours() + ':00';
          return usageTime === timeSlot;
        });
        
        if (usagesAtTime.length > 0) {
          const successAtTime = usagesAtTime.filter((usage: any) => 
            (usage.outcome as any)?.status === 'completed'
          );
          const timeSuccessRate = successAtTime.length / usagesAtTime.length;
          score += timeSuccessRate * 0.15;
        }
      }

      // Platform alignment scoring
      if (context.platforms && context.platforms.length > 0) {
        const templatePlatforms = extractPlatformsFromContent(template.content);
        const alignmentScore = context.platforms.filter((p: string) => 
          templatePlatforms.includes(p as any)
        ).length / Math.max(context.platforms.length, 1);
        score += alignmentScore * 0.2;
      }

      // Recency boost for recently successful templates
      const recentUsages = template.templateUsages
        ?.filter((usage: any) => {
          const usageDate = new Date(usage.timestamp);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return usageDate > thirtyDaysAgo;
        }) || [];

      if (recentUsages.length > 0) {
        const recentSuccessRate = recentUsages.filter((usage: any) => 
          (usage.outcome as any)?.status === 'completed'
        ).length / recentUsages.length;
        score += recentSuccessRate * 0.1;
      }

      // Generate prediction for this template
      const currentTemplate = contentTemplates.find(ct => ct.id === template.id);
      let prediction = { expectedEngagement: 0.5, expectedReach: 1000, successProbability: 0.8, confidence: 0.5 };
      
      if (currentTemplate) {
        // Build historical metrics from template usage
        const historicalMetrics = buildHistoricalMetrics(template);
        prediction = predictTemplatePerformance(currentTemplate, context, historicalMetrics);
      }

      // Generate reasons for recommendation
      const reasons = generateReasons(template, context, userHistory, score);

      // Generate optimization suggestions
      const optimizations = generateOptimizations(template, context, prediction);

      recommendations.push({
        templateId: template.id,
        templateName: template.name,
        confidenceScore: Math.min(score, 1),
        reasons,
        expectedPerformance: {
          engagementRate: prediction.expectedEngagement,
          successRate: prediction.successProbability,
          estimatedReach: prediction.expectedReach
        },
        optimizations,
        templateData: {
          category: template.category,
          author: template.author,
          usageCount: template.usageCount || 0,
          performanceScore: template.performanceScore || 0,
          lastUsed: template.lastUsed,
          aiGenerated: template.aiGenerated || false
        }
      });

    } catch (_error) {
      console.error("", _error);
      // Continue with other templates
    }
  }

  // Sort by confidence score and return top recommendations
  return recommendations
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit);
}

function extractPlatformsFromContent(content: string | null): string[] {
  if (!content) return [];
  
  try {
    const parsed = JSON.parse(content);
    return parsed.suggestedPlatforms || [];
  } catch {
    return [];
  }
}

function extractTagsFromContent(content: string | null): string[] {
  if (!content) return [];
  
  try {
    const parsed = JSON.parse(content);
    return parsed.tags || [];
  } catch {
    return [];
  }
}

function buildHistoricalMetrics(template: any) {
  const usages = template.templateUsages || [];
  if (usages.length === 0) return undefined;

  const completedUsages = usages.filter((u: any) => (u.outcome as any)?.status === 'completed');
  
  const totalReach = completedUsages.reduce((sum: number, u: any) => 
    sum + ((u.outcome as any)?.reach || 0), 0
  );
  
  const avgEngagement = completedUsages.length > 0
    ? completedUsages.reduce((sum: number, u: any) => 
        sum + ((u.outcome as any)?.engagementScore || 0), 0
      ) / completedUsages.length
    : 0;

  const successRate = usages.length > 0 ? completedUsages.length / usages.length : 0;

  return {
    templateId: template.id,
    templateName: template.name,
    templateCategory: template.category,
    usageCount: usages.length,
    successRate,
    averageEngagement: avgEngagement,
    conversionRate: 0.1, // Placeholder
    totalReach,
    clickThroughRate: 0.05, // Placeholder
    completionRate: successRate,
    averageTimeToComplete: template.averageTimeToComplete || 60,
    platformPerformance: {},
    timeSlotPerformance: {},
    lastUpdated: new Date().toISOString()
  };
}

function generateReasons(template: any, context: any, userHistory: any[], score: number): string[] {
  const reasons = [];

  if (template.performanceScore > 0.8) {
    reasons.push('High performance template with excellent success rate');
  }

  if (context.contentType && template.type === context.contentType) {
    reasons.push(`Perfect match for ${context.contentType} content`);
  }

  if (template.usageCount > 10) {
    reasons.push('Proven template with extensive usage history');
  }

  const userUsedSimilar = userHistory.some(h => h.template.category === template.category);
  if (userUsedSimilar) {
    reasons.push('Similar to templates you\'ve used successfully before');
  }

  if (template.aiGenerated) {
    reasons.push('AI-optimized content for maximum engagement');
  }

  const recentUsages = template.templateUsages?.filter((usage: any) => {
    const usageDate = new Date(usage.timestamp);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return usageDate > sevenDaysAgo;
  }) || [];

  if (recentUsages.length > 0) {
    reasons.push('Recently trending with good performance');
  }

  if (reasons.length === 0) {
    reasons.push('Good baseline template for your content needs');
  }

  return reasons.slice(0, 3); // Limit to top 3 reasons
}

function generateOptimizations(template: any, context: any, prediction: any) {
  const optimizations: any = {};

  // Time optimization
  if (context.scheduledTime) {
    const hour = parseInt(context.scheduledTime.substring(0, 2));
    if (template.type === 'social' && (hour < 9 || hour > 21)) {
      optimizations.suggestedTime = '14:00'; // Peak social media time
    } else if (template.type === 'email' && (hour < 8 || hour > 18)) {
      optimizations.suggestedTime = '09:00'; // Peak email time
    }
  }

  // Platform optimization
  if (template.type === 'social') {
    const templatePlatforms = extractPlatformsFromContent(template.content);
    if (templatePlatforms.length > 0) {
      optimizations.suggestedPlatforms = templatePlatforms;
    }
  }

  // Content modifications
  const modifications = [];
  if (prediction.confidence < 0.7) {
    modifications.push('Consider personalizing the content for your audience');
  }
  if (template.averageTimeToComplete > 120) {
    modifications.push('Template may benefit from simplification');
  }
  if (template.performanceScore < 0.6) {
    modifications.push('Review and update content for better engagement');
  }

  if (modifications.length > 0) {
    optimizations.suggestedModifications = modifications;
  }

  return optimizations;
}