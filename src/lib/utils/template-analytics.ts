/**
 * Template Analytics System
 * Tracks template performance and provides insights for optimization
 */

import { CalendarEvent, ContentType } from '@/components/content/types';
import { ContentTemplate } from './content-templates';

export interface TemplatePerformanceMetrics {
  templateId: string;
  templateName: string;
  templateCategory: string;
  usageCount: number;
  successRate: number; // Percentage of events that were successfully published
  averageEngagement: number; // Average engagement score
  conversionRate: number; // Percentage that achieved their goal
  totalReach: number; // Total audience reached
  clickThroughRate: number; // For content with CTAs
  completionRate: number; // Percentage of events completed vs cancelled
  averageTimeToComplete: number; // Minutes from creation to publication
  platformPerformance: {
    [platform: string]: {
      reach: number;
      engagement: number;
      conversions: number;
    };
  };
  timeSlotPerformance: {
    [timeSlot: string]: {
      successRate: number;
      engagement: number;
    };
  };
  lastUpdated: string;
}

export interface TemplateUsageEvent {
  id: string;
  templateId: string;
  eventId: string;
  userId: string;
  organizationId: string;
  usedAt: string;
  context: 'calendar' | 'campaign' | 'project' | 'direct';
  modifications: {
    titleChanged: boolean;
    descriptionChanged: boolean;
    timeChanged: boolean;
    platformsChanged: boolean;
  };
  outcome: {
    status: 'completed' | 'cancelled' | 'failed' | 'in_progress';
    publishedAt?: string;
    engagementScore?: number;
    reach?: number;
    conversions?: number;
    clickThroughRate?: number;
  };
  platformSpecific?: {
    [platform: string]: {
      reach: number;
      engagement: number;
      conversions: number;
      clicks: number;
    };
  };
}

export interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  confidenceScore: number; // 0-1 scale
  reasons: string[];
  expectedPerformance: {
    engagementRate: number;
    successRate: number;
    estimatedReach: number;
  };
  optimizations: {
    suggestedTime?: string;
    suggestedPlatforms?: string[];
    suggestedModifications?: string[];
  };
}

/**
 * Tracks when a template is used to create a calendar event
 */
export async function trackTemplateUsage(
  templateId: string,
  eventId: string,
  userId: string,
  organizationId: string,
  context: TemplateUsageEvent['context'] = 'calendar',
  modifications: Partial<TemplateUsageEvent['modifications']> = {}
): Promise<void> {
  try {
    const usageData: Omit<TemplateUsageEvent, 'id' | 'outcome'> = {
      templateId,
      eventId,
      userId,
      organizationId,
      usedAt: new Date().toISOString(),
      context,
      modifications: {
        titleChanged: false,
        descriptionChanged: false,
        timeChanged: false,
        platformsChanged: false,
        ...modifications
      }
    };

    // Store in database
    await fetch('/api/templates/track-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usageData),
    });
  } catch (error) {
    console.error('Failed to track template usage:', error);
    // Non-critical error - don't throw
  }
}

/**
 * Updates template performance when an event is completed
 */
export async function updateTemplatePerformance(
  eventId: string,
  outcome: TemplateUsageEvent['outcome'],
  platformSpecific?: TemplateUsageEvent['platformSpecific']
): Promise<void> {
  try {
    await fetch('/api/templates/update-performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        outcome,
        platformSpecific,
        updatedAt: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to update template performance:', error);
    // Non-critical error - don't throw
  }
}

/**
 * Gets performance metrics for a specific template
 */
export async function getTemplateMetrics(
  templateId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<TemplatePerformanceMetrics | null> {
  try {
    const response = await fetch(
      `/api/templates/${templateId}/metrics?timeRange=${timeRange}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch template metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get template metrics:', error);
    return null;
  }
}

/**
 * Gets template recommendations based on context and historical performance
 */
export async function getTemplateRecommendations(
  context: {
    contentType?: ContentType;
    targetAudience?: string;
    industry?: string;
    scheduledTime?: string;
    platforms?: string[];
    goal?: string;
  },
  userId: string,
  organizationId: string,
  limit: number = 5
): Promise<TemplateRecommendation[]> {
  try {
    const response = await fetch('/api/templates/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        userId,
        organizationId,
        limit
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get template recommendations');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get template recommendations:', error);
    return [];
  }
}

/**
 * Analyzes template performance and suggests optimizations
 */
export function analyzeTemplatePerformance(
  metrics: TemplatePerformanceMetrics
): {
  overall: 'excellent' | 'good' | 'average' | 'poor';
  insights: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
} {
  const insights: string[] = [];
  const recommendations: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analyze success rate
  if (metrics.successRate >= 0.9) {
    strengths.push('Very high success rate - template is reliable');
  } else if (metrics.successRate < 0.7) {
    weaknesses.push('Low success rate - many events are cancelled or failed');
    recommendations.push('Review template complexity and user expectations');
  }

  // Analyze engagement
  if (metrics.averageEngagement >= 0.8) {
    strengths.push('High engagement - content resonates well with audience');
  } else if (metrics.averageEngagement < 0.5) {
    weaknesses.push('Low engagement - content may need improvement');
    recommendations.push('Review content quality and relevance to audience');
  }

  // Analyze time performance
  if (metrics.averageTimeToComplete < 30) {
    strengths.push('Quick to implement - efficient template');
  } else if (metrics.averageTimeToComplete > 120) {
    weaknesses.push('Takes long to complete - may be too complex');
    recommendations.push('Consider simplifying template or providing better guidance');
  }

  // Analyze platform performance
  const platformCount = Object.keys(metrics.platformPerformance).length;
  if (platformCount > 0) {
    const bestPlatform = Object.entries(metrics.platformPerformance)
      .sort(([,a], [,b]) => b.engagement - a.engagement)[0];
    
    if (bestPlatform) {
      insights.push(`Best performing platform: ${bestPlatform[0]} (${(bestPlatform[1].engagement * 100).toFixed(1)}% engagement)`);
    }

    const lowPerformingPlatforms = Object.entries(metrics.platformPerformance)
      .filter(([,perf]) => perf.engagement < 0.3);
    
    if (lowPerformingPlatforms.length > 0) {
      recommendations.push(`Consider optimizing content for: ${lowPerformingPlatforms.map(([platform]) => platform).join(', ')}`);
    }
  }

  // Analyze time slot performance
  const timeSlots = Object.keys(metrics.timeSlotPerformance);
  if (timeSlots.length > 0) {
    const bestTimeSlot = Object.entries(metrics.timeSlotPerformance)
      .sort(([,a], [,b]) => b.engagement - a.engagement)[0];
    
    if (bestTimeSlot) {
      insights.push(`Best time slot: ${bestTimeSlot[0]} (${(bestTimeSlot[1].engagement * 100).toFixed(1)}% engagement)`);
    }
  }

  // Determine overall performance
  const overallScore = (
    metrics.successRate * 0.3 +
    metrics.averageEngagement * 0.3 +
    metrics.conversionRate * 0.2 +
    (metrics.completionRate || 0) * 0.2
  );

  let overall: 'excellent' | 'good' | 'average' | 'poor';
  if (overallScore >= 0.8) {
    overall = 'excellent';
  } else if (overallScore >= 0.6) {
    overall = 'good';
  } else if (overallScore >= 0.4) {
    overall = 'average';
  } else {
    overall = 'poor';
  }

  return {
    overall,
    insights,
    recommendations,
    strengths,
    weaknesses
  };
}

/**
 * Calculates template similarity for recommendation purposes
 */
export function calculateTemplateSimilarity(
  template1: ContentTemplate,
  template2: ContentTemplate
): number {
  let similarity = 0;
  let factors = 0;

  // Type similarity (high weight)
  if (template1.type === template2.type) {
    similarity += 0.3;
  }
  factors += 0.3;

  // Category similarity (medium weight)
  if (template1.category === template2.category) {
    similarity += 0.2;
  }
  factors += 0.2;

  // Tag similarity (medium weight)
  const commonTags = template1.tags.filter(tag => template2.tags.includes(tag));
  if (template1.tags.length > 0 && template2.tags.length > 0) {
    const tagSimilarity = commonTags.length / Math.max(template1.tags.length, template2.tags.length);
    similarity += tagSimilarity * 0.3;
  }
  factors += 0.3;

  // Platform similarity for social content (low weight)
  if (template1.type === 'social' && template2.type === 'social' && 
      template1.suggestedPlatforms && template2.suggestedPlatforms) {
    const commonPlatforms = template1.suggestedPlatforms.filter(
      platform => template2.suggestedPlatforms!.includes(platform)
    );
    if (template1.suggestedPlatforms.length > 0 && template2.suggestedPlatforms.length > 0) {
      const platformSimilarity = commonPlatforms.length / 
        Math.max(template1.suggestedPlatforms.length, template2.suggestedPlatforms.length);
      similarity += platformSimilarity * 0.2;
    }
  }
  factors += 0.2;

  return factors > 0 ? similarity / factors : 0;
}

/**
 * Predicts template performance for a given context
 */
export function predictTemplatePerformance(
  template: ContentTemplate,
  context: {
    scheduledTime?: string;
    platforms?: string[];
    targetAudience?: string;
    industry?: string;
  },
  historicalMetrics?: TemplatePerformanceMetrics
): {
  expectedEngagement: number;
  expectedReach: number;
  successProbability: number;
  confidence: number;
} {
  let expectedEngagement = 0.5; // Base rate
  let expectedReach = 1000; // Base reach
  let successProbability = 0.8; // Base success rate
  let confidence = 0.5; // Base confidence

  // Use historical data if available
  if (historicalMetrics) {
    expectedEngagement = historicalMetrics.averageEngagement;
    expectedReach = historicalMetrics.totalReach / Math.max(historicalMetrics.usageCount, 1);
    successProbability = historicalMetrics.successRate;
    confidence = Math.min(historicalMetrics.usageCount / 10, 1); // More usage = more confidence
  }

  // Adjust based on time slot
  if (context.scheduledTime && historicalMetrics?.timeSlotPerformance) {
    const timeSlot = context.scheduledTime.substring(0, 2) + ':00';
    const timePerf = historicalMetrics.timeSlotPerformance[timeSlot];
    if (timePerf) {
      expectedEngagement = (expectedEngagement + timePerf.engagement) / 2;
      successProbability = (successProbability + timePerf.successRate) / 2;
      confidence = Math.min(confidence + 0.1, 1);
    }
  }

  // Adjust based on platform alignment
  if (context.platforms && template.suggestedPlatforms) {
    const alignmentScore = context.platforms.filter(p => 
      template.suggestedPlatforms!.includes(p as any)
    ).length / Math.max(context.platforms.length, 1);
    
    expectedEngagement *= (0.8 + alignmentScore * 0.4); // Boost if platforms align
    confidence = Math.min(confidence + alignmentScore * 0.2, 1);
  }

  // Adjust based on content type patterns
  const contentTypeMultipliers = {
    social: { engagement: 1.2, reach: 1.5 }, // Social tends to have higher reach
    email: { engagement: 0.9, reach: 0.8 }, // Email has lower reach but better targeting
    blog: { engagement: 0.8, reach: 0.7 }, // Blog has longer engagement but smaller reach
    article: { engagement: 0.7, reach: 0.6 }, // Articles have focused audience
    custom: { engagement: 1.0, reach: 1.0 } // Neutral
  };

  const multiplier = contentTypeMultipliers[template.type];
  expectedEngagement *= multiplier.engagement;
  expectedReach *= multiplier.reach;

  return {
    expectedEngagement: Math.min(expectedEngagement, 1),
    expectedReach: Math.round(expectedReach),
    successProbability: Math.min(successProbability, 1),
    confidence: Math.min(confidence, 1)
  };
}