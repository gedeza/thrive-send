import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for optimization request
const optimizeRequestSchema = z.object({
  optimization_goals: z.array(z.enum(['engagement', 'conversion', 'readability', 'personalization', 'mobile', 'accessibility'])).min(1),
  target_metrics: z.object({
    open_rate: z.number().min(0).max(1).optional(),
    click_rate: z.number().min(0).max(1).optional(),
    conversion_rate: z.number().min(0).max(1).optional(),
  }).optional(),
  A_B_test_insights: z.object({
    winning_elements: z.array(z.string()).optional(),
    losing_elements: z.array(z.string()).optional(),
    performance_data: z.record(z.number()).optional(),
  }).optional(),
  audience_data: z.object({
    demographics: z.record(z.any()).optional(),
    behavior_patterns: z.record(z.any()).optional(),
    preferences: z.record(z.any()).optional(),
  }).optional(),
  brand_guidelines: z.object({
    tone: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    avoid_keywords: z.array(z.string()).optional(),
  }).optional(),
  create_variants: z.boolean().default(false),
  variant_count: z.number().min(1).max(3).default(2),
});

// POST /api/templates/:id/ai-optimize
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
    const optimizationRequest = optimizeRequestSchema.parse(body);

    // Get the template
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        organizationId: orgId
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Parse template content
    let templateContent;
    try {
      templateContent = typeof template.content === 'string' 
        ? JSON.parse(template.content) 
        : template.content;
    } catch {
      templateContent = { body: template.content || '' };
    }

    // Generate optimization suggestions with AI
    const optimizationResults = await generateOptimizationSuggestions(
      template,
      templateContent,
      optimizationRequest
    );

    // Create optimized variants if requested
    let variants = [];
    if (optimizationRequest.create_variants) {
      variants = await createOptimizedVariants(
        template,
        templateContent,
        optimizationRequest,
        optimizationResults.suggestions
      );
    }

    // Save optimization analysis
    await prisma.templateOptimization.create({
      data: {
        templateId,
        userId,
        organizationId: orgId,
        goals: optimizationRequest.optimization_goals,
        suggestions: JSON.stringify(optimizationResults.suggestions),
        confidenceScore: optimizationResults.confidence_score,
        estimatedImprovement: optimizationResults.estimated_improvement,
        createdAt: new Date(),
      }
    });

    // Update template with AI insights
    await prisma.template.update({
      where: { id: templateId },
      data: {
        performanceScore: Math.max(
          template.performanceScore || 0,
          optimizationResults.estimated_improvement
        ),
        lastOptimized: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
      },
      optimization: optimizationResults,
      variants: variants.length,
      recommendations: {
        quick_wins: optimizationResults.suggestions
          .filter((s: any) => s.difficulty === 'easy')
          .slice(0, 3),
        high_impact: optimizationResults.suggestions
          .filter((s: any) => s.impact === 'high')
          .slice(0, 3),
      },
      next_steps: generateNextSteps(optimizationResults, optimizationRequest),
    });

  } catch (error) {
    console.error('Template optimization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid optimization parameters', details: error.errors },
        { status: 400 }
      );
    }

    if (error.message?.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'AI optimization service temporarily unavailable', retry_after: 60 },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Template optimization failed', message: error.message },
      { status: 500 }
    );
  }
}

// Generate AI-powered optimization suggestions
async function generateOptimizationSuggestions(
  template: any,
  templateContent: any,
  request: z.infer<typeof optimizeRequestSchema>
) {
  const systemPrompt = `You are an expert content optimization specialist who analyzes templates and provides actionable improvement suggestions. 
  Focus on practical, measurable improvements that can increase engagement, conversion, and user experience.`;

  const userPrompt = `
Analyze this ${template.type} template and provide optimization suggestions:

**Template Content:**
Subject Line: ${templateContent.subject_line || 'N/A'}
Body: ${templateContent.body || templateContent.content || ''}
CTA: ${templateContent.cta || 'N/A'}

**Template Details:**
- Type: ${template.type}
- Category: ${template.category}
- Current Performance Score: ${template.performanceScore || 0}

**Optimization Goals:** ${request.optimization_goals.join(', ')}

**Additional Context:**
${request.target_metrics ? `Target Metrics: ${JSON.stringify(request.target_metrics)}` : ''}
${request.A_B_test_insights ? `A/B Test Data: ${JSON.stringify(request.A_B_test_insights)}` : ''}
${request.brand_guidelines ? `Brand Guidelines: ${JSON.stringify(request.brand_guidelines)}` : ''}

**Please provide optimization suggestions in this JSON format:**
{
  "suggestions": [
    {
      "category": "subject_line|content|cta|structure|personalization|mobile|accessibility",
      "title": "Brief title",
      "description": "Detailed explanation",
      "current_issue": "What needs improvement",
      "suggested_change": "Specific recommendation",
      "expected_impact": "Quantified expected improvement",
      "difficulty": "easy|medium|hard",
      "impact": "low|medium|high",
      "implementation_notes": "How to implement this change"
    }
  ],
  "confidence_score": 0.85,
  "estimated_improvement": 0.15,
  "overall_assessment": "Summary of template strengths and weaknesses",
  "priority_order": ["List", "of", "suggestion", "titles", "in", "priority", "order"]
}

Focus on actionable, specific improvements with measurable impact predictions.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No optimization suggestions generated');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('OpenAI optimization error:', error);
    throw new Error('Failed to generate optimization suggestions');
  }
}

// Create optimized template variants
async function createOptimizedVariants(
  template: any,
  templateContent: any,
  request: z.infer<typeof optimizeRequestSchema>,
  suggestions: any[]
) {
  const variants = [];
  
  // Take top suggestions and create variants based on them
  const topSuggestions = suggestions
    .filter(s => s.impact === 'high' || s.difficulty === 'easy')
    .slice(0, request.variant_count);

  for (let i = 0; i < Math.min(topSuggestions.length, request.variant_count); i++) {
    const suggestion = topSuggestions[i];
    
    try {
      const variantContent = await generateVariantWithSuggestion(
        template,
        templateContent,
        suggestion,
        request
      );

      // Save variant to database
      const variant = await prisma.template.create({
        data: {
          id: `${template.id}_opt_${i + 1}_${Date.now()}`,
          name: `${template.name} (Optimized Variant ${i + 1})`,
          description: `AI-optimized variant focusing on ${suggestion.category}`,
          type: template.type,
          category: template.category,
          status: 'DRAFT' as const,
          content: JSON.stringify(variantContent),
          organizationId: template.organizationId,
          authorId: template.authorId,
          lastUpdated: new Date(),
          aiGenerated: true,
          aiRecommended: true,
          performanceScore: (template.performanceScore || 0) + (suggestion.impact === 'high' ? 0.1 : 0.05),
          originalTemplateId: template.id,
          optimizationFocus: suggestion.category,
        }
      });

      variants.push({
        id: variant.id,
        focus: suggestion.category,
        changes: suggestion.suggested_change,
        expected_improvement: suggestion.expected_impact,
      });
      
    } catch (error) {
      console.error(`Error creating variant ${i + 1}:`, error);
      // Continue with other variants
    }
  }

  return variants;
}

// Generate a variant based on a specific suggestion
async function generateVariantWithSuggestion(
  template: any,
  templateContent: any,
  suggestion: any,
  request: z.infer<typeof optimizeRequestSchema>
) {
  const systemPrompt = `You are a content optimization expert. Create an improved version of the template content based on the specific suggestion provided.`;

  const userPrompt = `
Create an optimized variant of this template content based on the following suggestion:

**Original Content:**
${JSON.stringify(templateContent, null, 2)}

**Optimization Suggestion:**
Category: ${suggestion.category}
Title: ${suggestion.title}
Suggested Change: ${suggestion.suggested_change}
Implementation Notes: ${suggestion.implementation_notes}

**Requirements:**
- Apply the suggestion while maintaining the template's core message
- Preserve the original structure and format
- Only modify the parts mentioned in the suggestion
- Ensure the changes align with the optimization goal

**Return the modified content in the same JSON structure as the original.**
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No variant content generated');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Variant generation error:', error);
    // Return original content if variant generation fails
    return templateContent;
  }
}

// Generate next steps based on optimization results
function generateNextSteps(
  optimizationResults: any,
  request: z.infer<typeof optimizeRequestSchema>
): string[] {
  const steps = [];
  
  // Base next steps
  steps.push('Review optimization suggestions in priority order');
  steps.push('Implement quick wins first for immediate improvements');
  
  // Goal-specific steps
  if (request.optimization_goals.includes('engagement')) {
    steps.push('Focus on subject line and opening paragraph improvements');
  }
  
  if (request.optimization_goals.includes('conversion')) {
    steps.push('Optimize call-to-action placement and wording');
  }
  
  if (request.optimization_goals.includes('mobile')) {
    steps.push('Test template rendering on various mobile devices');
  }
  
  // A/B testing recommendations
  if (request.create_variants) {
    steps.push('Set up A/B tests with the generated variants');
    steps.push('Monitor performance metrics for at least 2 weeks');
  }
  
  // High-impact suggestion specific steps
  const highImpactSuggestions = optimizationResults.suggestions?.filter(
    (s: any) => s.impact === 'high'
  ) || [];
  
  if (highImpactSuggestions.length > 0) {
    steps.push(`Prioritize implementing: ${highImpactSuggestions[0]?.title}`);
  }
  
  steps.push('Schedule follow-up optimization review in 4 weeks');
  
  return steps;
}