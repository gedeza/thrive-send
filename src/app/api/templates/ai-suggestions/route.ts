import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for AI suggestions request
const suggestionsRequestSchema = z.object({
  context: z.enum(['content-creation', 'calendar', 'campaign', 'project', 'general']),
  user_behavior: z.object({
    most_used_types: z.array(z.enum(['email', 'social', 'blog'])).optional(),
    recent_categories: z.array(z.string()).optional(),
    preferred_goals: z.array(z.string()).optional(),
    industry: z.string().optional(),
    content_themes: z.array(z.string()).optional(),
  }).optional(),
  limit: z.number().min(1).max(20).default(6),
  include_new_suggestions: z.boolean().default(true),
});

// Context-based recommendation weights
const contextWeights = {
  'content-creation': {
    email: 1.2,
    social: 1.0,
    blog: 1.1,
    categories: {
      marketing: 1.1,
      sales: 0.9,
      support: 0.8,
    }
  },
  'calendar': {
    email: 1.3,
    social: 0.7,
    blog: 0.6,
    categories: {
      marketing: 1.2,
      sales: 0.9,
      support: 1.0,
    }
  },
  'campaign': {
    email: 1.4,
    social: 1.2,
    blog: 0.8,
    categories: {
      marketing: 1.5,
      sales: 1.3,
      support: 0.7,
    }
  },
  'project': {
    email: 1.1,
    social: 0.8,
    blog: 1.0,
    categories: {
      marketing: 0.8,
      sales: 0.9,
      support: 1.2,
    }
  },
  'general': {
    email: 1.0,
    social: 1.0,
    blog: 1.0,
    categories: {
      marketing: 1.0,
      sales: 1.0,
      support: 1.0,
    }
  }
};

// AI-powered template suggestions based on user behavior and context
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request
    const body = await req.json();
    const { context, user_behavior, limit, include_new_suggestions } = suggestionsRequestSchema.parse(body);

    // Get user's template interaction history
    const userPreferences = await prisma.userTemplatePreference.findMany({
      where: { userId },
      include: {
        template: {
          include: {
            _count: {
              select: {
                templateUsages: true
              }
            }
          }
        }
      },
      orderBy: {
        preferenceScore: 'desc'
      },
      take: 100 // Consider top 100 user preferences
    });

    // Get organization's high-performing templates
    const orgTemplates = await prisma.template.findMany({
      where: {
        organizationId: orgId,
        status: 'PUBLISHED',
      },
      include: {
        _count: {
          select: {
            templateUsages: true
          }
        }
      },
      orderBy: [
        { performanceScore: 'desc' },
        { usageCount: 'desc' },
        { lastUpdated: 'desc' }
      ],
      take: 200
    });

    // Calculate AI recommendations
    const recommendations = calculateAIRecommendations({
      context,
      userPreferences,
      orgTemplates,
      userBehavior: user_behavior,
      limit
    });

    // Generate new template suggestions if requested
    let newSuggestions = [];
    if (include_new_suggestions) {
      newSuggestions = generateNewTemplateSuggestions({
        context,
        userBehavior: user_behavior,
        existingTemplates: orgTemplates,
        limit: Math.min(3, Math.ceil(limit / 3))
      });
    }

    // Combine and rank all suggestions
    const allSuggestions = [
      ...recommendations.map(r => ({ ...r, type: 'existing' })),
      ...newSuggestions.map(s => ({ ...s, type: 'new' }))
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      context,
      suggestions: allSuggestions,
      metadata: {
        user_preference_strength: calculateUserPreferenceStrength(userPreferences),
        recommendation_confidence: calculateRecommendationConfidence(recommendations),
        suggested_actions: generateSuggestedActions(context, allSuggestions),
      },
      ai_insights: {
        most_successful_type: getMostSuccessfulType(orgTemplates),
        trending_categories: getTrendingCategories(orgTemplates),
        optimization_tips: getOptimizationTips(context, orgTemplates),
      }
    });

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI suggestions', message: error.message },
      { status: 500 }
    );
  }
}

// Calculate AI-powered recommendations based on multiple factors
function calculateAIRecommendations({
  context,
  userPreferences,
  orgTemplates,
  userBehavior,
  limit
}: {
  context: string;
  userPreferences: any[];
  orgTemplates: any[];
  userBehavior?: any;
  limit: number;
}) {
  const contextWeight = contextWeights[context as keyof typeof contextWeights];
  
  return orgTemplates
    .map(template => {
      let score = 0;
      
      // Base performance score
      score += (template.performanceScore || 0) * 0.3;
      
      // Usage popularity
      score += Math.min(template._count.templateUsages / 100, 1) * 0.2;
      
      // Context relevance
      score += (contextWeight[template.type as keyof typeof contextWeight] || 1) * 0.2;
      score += (contextWeight.categories[template.category as keyof typeof contextWeight.categories] || 1) * 0.15;
      
      // User preference alignment
      const userPref = userPreferences.find(p => p.templateId === template.id);
      if (userPref) {
        score += userPref.preferenceScore * 0.1;
      }
      
      // Behavioral alignment
      if (userBehavior) {
        if (userBehavior.most_used_types?.includes(template.type)) {
          score += 0.1;
        }
        if (userBehavior.recent_categories?.includes(template.category)) {
          score += 0.05;
        }
      }
      
      // Recency factor (newer templates get slight boost)
      const daysSinceUpdate = Math.floor((Date.now() - new Date(template.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
      score += Math.max(0, (30 - daysSinceUpdate) / 30) * 0.05;
      
      return {
        ...template,
        aiScore: score,
        recommendation_reason: generateRecommendationReason(template, score, context)
      };
    })
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, limit);
}

// Generate suggestions for new templates to create
function generateNewTemplateSuggestions({
  context,
  userBehavior,
  existingTemplates,
  limit
}: {
  context: string;
  userBehavior?: any;
  existingTemplates: any[];
  limit: number;
}) {
  const suggestions = [];
  
  // Context-specific suggestions
  const contextSuggestions = {
    'content-creation': [
      { name: 'Weekly Newsletter Template', type: 'email', category: 'marketing', description: 'Engage your audience with consistent weekly updates' },
      { name: 'Product Update Announcement', type: 'social', category: 'marketing', description: 'Share exciting product news across social channels' },
      { name: 'How-To Guide Template', type: 'blog', category: 'support', description: 'Help users with educational content' },
    ],
    'calendar': [
      { name: 'Event Reminder Email', type: 'email', category: 'marketing', description: 'Boost event attendance with timely reminders' },
      { name: 'Webinar Follow-up', type: 'email', category: 'sales', description: 'Convert webinar attendees into customers' },
      { name: 'Meeting Recap Template', type: 'email', category: 'support', description: 'Document important meeting outcomes' },
    ],
    'campaign': [
      { name: 'Seasonal Promotion Email', type: 'email', category: 'marketing', description: 'Capitalize on seasonal buying patterns' },
      { name: 'Customer Success Story', type: 'social', category: 'marketing', description: 'Build trust with authentic testimonials' },
      { name: 'Limited-Time Offer', type: 'email', category: 'sales', description: 'Create urgency with time-sensitive deals' },
    ],
    'project': [
      { name: 'Project Kickoff Announcement', type: 'email', category: 'support', description: 'Align your team on project goals and timeline' },
      { name: 'Milestone Celebration', type: 'social', category: 'marketing', description: 'Share project achievements with your audience' },
      { name: 'Status Update Template', type: 'email', category: 'support', description: 'Keep stakeholders informed of progress' },
    ],
    'general': [
      { name: 'Welcome Email Series', type: 'email', category: 'marketing', description: 'Onboard new users with a warm welcome' },
      { name: 'Customer Feedback Request', type: 'email', category: 'support', description: 'Gather valuable insights from your audience' },
      { name: 'Thank You Message', type: 'social', category: 'marketing', description: 'Show appreciation to your community' },
    ]
  };
  
  const contextSpecificSuggestions = contextSuggestions[context as keyof typeof contextSuggestions] || contextSuggestions.general;
  
  // Filter out suggestions for templates that already exist
  const filteredSuggestions = contextSpecificSuggestions.filter(suggestion => {
    return !existingTemplates.some(existing => 
      existing.name.toLowerCase().includes(suggestion.name.toLowerCase()) ||
      (existing.type === suggestion.type && existing.category === suggestion.category)
    );
  });
  
  return filteredSuggestions.slice(0, limit).map(suggestion => ({
    ...suggestion,
    id: `new_${Math.random().toString(36).substr(2, 9)}`,
    aiScore: 0.8,
    recommendation_reason: `AI suggests creating this ${suggestion.type} template based on your ${context} needs`,
    estimated_impact: 'High engagement potential based on industry trends',
    creation_difficulty: 'Easy with AI assistance'
  }));
}

// Generate contextual recommendation reasons
function generateRecommendationReason(template: any, score: number, context: string): string {
  const reasons = [];
  
  if (template.performanceScore > 0.7) {
    reasons.push('high performance');
  }
  
  if (template._count.templateUsages > 10) {
    reasons.push('popular with users');
  }
  
  if (template.aiGenerated) {
    reasons.push('AI-optimized');
  }
  
  const contextReasons = {
    'content-creation': 'ideal for content workflows',
    'calendar': 'perfect for scheduled communications',
    'campaign': 'proven for marketing campaigns',
    'project': 'effective for project coordination',
    'general': 'versatile for multiple use cases'
  };
  
  reasons.push(contextReasons[context as keyof typeof contextReasons]);
  
  return `Recommended because it's ${reasons.join(', ')}.`;
}

// Calculate user preference strength
function calculateUserPreferenceStrength(userPreferences: any[]): 'high' | 'medium' | 'low' {
  if (userPreferences.length === 0) return 'low';
  
  const avgScore = userPreferences.reduce((sum, pref) => sum + pref.preferenceScore, 0) / userPreferences.length;
  
  if (avgScore > 1.0) return 'high';
  if (avgScore > 0.5) return 'medium';
  return 'low';
}

// Calculate recommendation confidence
function calculateRecommendationConfidence(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  
  const avgScore = recommendations.reduce((sum, rec) => sum + rec.aiScore, 0) / recommendations.length;
  return Math.min(avgScore, 1.0);
}

// Generate suggested actions based on context
function generateSuggestedActions(context: string, suggestions: any[]): string[] {
  const baseActions = [
    'Review recommended templates',
    'Customize templates for your brand',
    'Test templates with A/B testing'
  ];
  
  const contextActions = {
    'content-creation': ['Set up content calendar', 'Create template library'],
    'calendar': ['Schedule template usage', 'Set up automated reminders'],
    'campaign': ['Plan campaign timeline', 'Prepare tracking metrics'],
    'project': ['Assign templates to team members', 'Create approval workflow'],
    'general': ['Organize templates by category', 'Train team on template usage']
  };
  
  return [
    ...baseActions,
    ...(contextActions[context as keyof typeof contextActions] || [])
  ];
}

// Get most successful template type
function getMostSuccessfulType(templates: any[]): string {
  const typePerformance = templates.reduce((acc, template) => {
    acc[template.type] = (acc[template.type] || 0) + (template.performanceScore || 0);
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(typePerformance).reduce((best, [type, score]) => 
    score > best.score ? { type, score } : best, 
    { type: 'email', score: 0 }
  ).type;
}

// Get trending categories
function getTrendingCategories(templates: any[]): string[] {
  const categoryUsage = templates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + (template._count.templateUsages || 0);
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
}

// Get optimization tips
function getOptimizationTips(context: string, templates: any[]): string[] {
  const tips = [
    'Use personalization tokens to increase engagement',
    'Test different subject lines for better open rates',
    'Keep mobile users in mind when designing templates'
  ];
  
  const contextTips = {
    'content-creation': ['Maintain consistent brand voice across templates'],
    'calendar': ['Include clear call-to-action buttons for event RSVPs'],
    'campaign': ['Track conversion metrics to optimize performance'],
    'project': ['Use clear headings and bullet points for easy scanning'],
    'general': ['Create template variants for different audience segments']
  };
  
  return [...tips, ...(contextTips[context as keyof typeof contextTips] || [])];
}