import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { OpenAI } from 'openai';

// Initialize OpenAI client - consider using environment variables for configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for AI template generation request
const aiGenerateSchema = z.object({
  // Core template information
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(500, "Prompt too long"),
  type: z.enum(['email', 'social', 'blog'], {
    required_error: "Template type is required"
  }),
  
  // Business context
  industry: z.string().optional(),
  target_audience: z.string().optional(),
  brand_voice: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'playful', 'luxury']).default('professional'),
  
  // Template parameters
  goal: z.enum(['engagement', 'conversion', 'information', 'onboarding', 'retention', 'promotion']).default('engagement'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  
  // Advanced AI features (premium)
  include_subject_line: z.boolean().default(true),
  include_cta: z.boolean().default(true),
  personalization_level: z.enum(['none', 'basic', 'advanced']).default('basic'),
  
  // A/B testing
  generate_variants: z.boolean().default(false),
  variant_count: z.number().min(1).max(5).default(2),
  
  // Template context
  context: z.enum(['content-creation', 'calendar', 'campaign', 'project']).optional(),
  
  // Auto-save options
  save_to_library: z.boolean().default(true),
  category: z.string().default('ai-generated'),
  
  // Performance optimization
  optimize_for_mobile: z.boolean().default(true),
  include_analytics_hooks: z.boolean().default(true),
});

// Template generation prompts by type and context
const templatePrompts = {
  email: {
    system: `You are an expert email marketing copywriter who creates high-converting, engaging email templates. 
    Focus on clear subject lines, compelling openings, valuable content, and strong calls-to-action.
    Always consider mobile readability and accessibility.`,
    
    context: {
      'content-creation': 'Create an email template optimized for regular content distribution and subscriber engagement.',
      'calendar': 'Create an email template for event-based communications, appointments, or scheduled notifications.',
      'campaign': 'Create a high-converting email template for marketing campaigns with strong CTAs and performance tracking.',
      'project': 'Create an email template for project communications, updates, and team coordination.'
    }
  },
  
  social: {
    system: `You are a social media expert who creates viral, engaging social media content templates.
    Focus on attention-grabbing hooks, trending formats, hashtag strategies, and platform-specific optimization.`,
    
    context: {
      'content-creation': 'Create social media templates for regular content posting across platforms.',
      'calendar': 'Create social media templates for scheduled posts, events, and time-sensitive content.',
      'campaign': 'Create social media campaign templates optimized for reach, engagement, and conversions.',
      'project': 'Create social media templates for project announcements and milestone celebrations.'
    }
  },
  
  blog: {
    system: `You are a professional content writer who creates engaging, SEO-optimized blog post templates.
    Focus on compelling headlines, structured content, reader engagement, and clear value propositions.`,
    
    context: {
      'content-creation': 'Create blog post templates for regular content publishing and thought leadership.',
      'calendar': 'Create blog templates for scheduled content series and editorial calendars.',
      'campaign': 'Create blog templates that support marketing campaigns and drive traffic.',
      'project': 'Create blog templates for project case studies, updates, and documentation.'
    }
  }
};

// Brand voice configurations
const brandVoices = {
  professional: "formal, expert, trustworthy, clear, and authoritative",
  casual: "friendly, approachable, conversational, and relaxed",
  friendly: "warm, welcoming, helpful, and personable",
  authoritative: "confident, knowledgeable, decisive, and commanding",
  playful: "fun, creative, energetic, and lighthearted",
  luxury: "sophisticated, exclusive, premium, and elegant"
};

// Generate AI content using OpenAI
async function generateTemplateContent(request: z.infer<typeof aiGenerateSchema>) {
  const systemPrompt = templatePrompts[request.type].system;
  const contextPrompt = request.context ? templatePrompts[request.type].context[request.context] : '';
  
  const userPrompt = `
Generate a ${request.type} template with the following specifications:

**Request:** ${request.prompt}
**Brand Voice:** ${brandVoices[request.brand_voice]}
**Target Audience:** ${request.target_audience || 'General audience'}
**Industry:** ${request.industry || 'General business'}
**Goal:** ${request.goal}
**Length:** ${request.length}
**Context:** ${contextPrompt}

**Requirements:**
- ${request.include_subject_line ? 'Include a compelling subject line/headline' : 'No subject line needed'}
- ${request.include_cta ? 'Include a strong call-to-action' : 'No CTA required'}
- ${request.optimize_for_mobile ? 'Optimize for mobile viewing' : ''}
- Personalization level: ${request.personalization_level}

**Format the response as JSON:**
{
  "subject_line": "string (if requested)",
  "content": "string (main template content)",
  "cta": "string (if requested)", 
  "meta": {
    "word_count": number,
    "estimated_read_time": "string",
    "personalization_tags": ["array of suggested merge tags"],
    "optimization_notes": "string"
  }
}

Make the content engaging, actionable, and perfectly aligned with the brand voice.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use GPT-4 for premium quality
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Balance creativity with consistency
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const generatedContent = completion.choices[0]?.message?.content;
    if (!generatedContent) {
      throw new Error('No content generated from AI');
    }

    return JSON.parse(generatedContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI content');
  }
}

// Generate multiple variants for A/B testing
async function generateVariants(request: z.infer<typeof aiGenerateSchema>, baseTemplate: any) {
  const variants = [];
  
  for (let i = 0; i < request.variant_count - 1; i++) {
    const variantPrompt = {
      ...request,
      prompt: `${request.prompt} - Create a variant of this template with a different approach or angle while maintaining the same core message and goals.`
    };
    
    try {
      const variant = await generateTemplateContent(variantPrompt);
      variants.push({
        ...variant,
        variant_type: `variant_${i + 1}`,
        original_template_id: baseTemplate.id
      });
    } catch (error) {
      console.error(`Error generating variant ${i + 1}:`, error);
      // Continue with other variants even if one fails
    }
  }
  
  return variants;
}

// POST /api/templates/ai-generate
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access AI template generation' },
        { status: 401 }
      );
    }

    // Check if user has premium subscription (placeholder - implement your subscription logic)
    // const hasAIAccess = await checkPremiumSubscription(userId, orgId);
    // if (!hasAIAccess) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Premium Feature', 
    //       message: 'AI template generation is available in Pro and Enterprise plans',
    //       upgrade_url: '/pricing'
    //     },
    //     { status: 403 }
    //   );
    // }

    // Validate request body
    const body = await req.json();
    const validatedRequest = aiGenerateSchema.parse(body);

    // Rate limiting check (implement based on subscription tier)
    // await checkRateLimit(userId, 'ai_template_generation');

    // Generate the main template with AI
    const aiGeneratedContent = await generateTemplateContent(validatedRequest);
    
    // Create the template in database
    const templateId = nanoid();
    const templateData = {
      id: templateId,
      name: `AI Generated: ${validatedRequest.prompt.substring(0, 50)}...`,
      description: `AI-generated ${validatedRequest.type} template for ${validatedRequest.goal}`,
      type: validatedRequest.type,
      category: validatedRequest.category,
      status: 'DRAFT' as const,
      content: JSON.stringify({
        subject_line: aiGeneratedContent.subject_line,
        body: aiGeneratedContent.content,
        cta: aiGeneratedContent.cta,
        meta: aiGeneratedContent.meta,
        ai_metadata: {
          prompt: validatedRequest.prompt,
          brand_voice: validatedRequest.brand_voice,
          goal: validatedRequest.goal,
          generated_at: new Date().toISOString(),
          model_version: 'gpt-4o-mini',
          personalization_level: validatedRequest.personalization_level
        }
      }),
      organizationId: orgId,
      authorId: userId,
      lastUpdated: new Date(),
      // AI-specific fields
      aiGenerated: true,
      aiRecommended: true,
      performanceScore: 0.8, // Initial high score for AI-generated content
    };

    let savedTemplate;
    if (validatedRequest.save_to_library) {
      savedTemplate = await prisma.template.create({
        data: templateData,
        include: {
          author: true,
          organization: true,
        },
      });
    }

    // Generate variants if requested
    let variants = [];
    if (validatedRequest.generate_variants && savedTemplate) {
      variants = await generateVariants(validatedRequest, savedTemplate);
      
      // Save variants to database
      for (const variant of variants) {
        const variantId = nanoid();
        await prisma.template.create({
          data: {
            id: variantId,
            name: `${savedTemplate.name} (Variant)`,
            description: `AI-generated variant of ${savedTemplate.name}`,
            type: validatedRequest.type,
            category: validatedRequest.category,
            status: 'DRAFT' as const,
            content: JSON.stringify({
              subject_line: variant.subject_line,
              body: variant.content,
              cta: variant.cta,
              meta: variant.meta,
              ai_metadata: {
                ...templateData.ai_metadata,
                variant_of: savedTemplate.id,
                variant_type: variant.variant_type
              }
            }),
            organizationId: orgId,
            authorId: userId,
            lastUpdated: new Date(),
            aiGenerated: true,
            aiRecommended: true,
            performanceScore: 0.75, // Slightly lower for variants
          },
        });
      }
    }

    // Log usage for analytics and billing
    await prisma.aiUsage.create({
      data: {
        userId,
        organizationId: orgId,
        feature: 'template_generation',
        tokensUsed: 1500, // Approximate token usage
        cost: 0.05, // Cost in dollars
        requestData: {
          type: validatedRequest.type,
          goal: validatedRequest.goal,
          variants_generated: variants.length,
          prompt_length: validatedRequest.prompt.length
        },
        createdAt: new Date()
      }
    }).catch(() => {
      // Non-critical - don't fail the request if usage logging fails
      console.warn('Failed to log AI usage');
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'AI template generated successfully!',
      template: savedTemplate || {
        id: templateId,
        content: aiGeneratedContent,
        metadata: templateData
      },
      variants: variants.length,
      usage: {
        tokens_used: 1500,
        cost: 0.05,
        remaining_credits: 95 // Placeholder - implement based on subscription
      },
      suggestions: {
        next_steps: [
          'Review and edit the generated content',
          'Test the template with your audience',
          'Add personalization tokens',
          'Set up A/B testing if variants were generated'
        ]
      }
    });

  } catch (error) {
    console.error('AI Template Generation Error:', error);
    
    // Handle different error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('OpenAI') || error.message.includes('API')) {
        return NextResponse.json(
          { 
            error: 'AI Service Temporarily Unavailable',
            message: 'Our AI service is experiencing high demand. Please try again in a few minutes.',
            retry_after: 60
          },
          { status: 503 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'Rate Limit Exceeded',
            message: 'You have reached your AI generation limit. Upgrade your plan for more credits.',
            upgrade_url: '/pricing'
          },
          { status: 429 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Template Generation Failed',
        message: 'An unexpected error occurred while generating your template. Please try again.',
        support_contact: 'support@thrive-send.com'
      },
      { status: 500 }
    );
  }
}