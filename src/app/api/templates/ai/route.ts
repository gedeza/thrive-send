import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { AIService } from '@/lib/services/ai-service';
import { z } from 'zod';

const requestSchema = z.object({
  content: z.string(),
  type: z.enum(['email', 'social', 'blog'])
});

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, type } = requestSchema.parse(body);

    const aiService = new AIService();
    const suggestions = await aiService.generateTemplateSuggestions(orgId, content, type);

    return NextResponse.json({ suggestions });
  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Please provide valid content and template type',
          details: error.errors 
        }, 
        { status: 400 }
      );
    }

    if (_error instanceof Error && error.message.includes('subscription plan')) {
      return NextResponse.json(
        { 
          error: 'Upgrade your plan to access AI features',
          message: 'AI-powered suggestions are available on our Professional and Enterprise plans. Upgrade to unlock this feature!',
          type: 'subscription_required'
        }, 
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Unable to generate suggestions',
        message: 'We\'re having trouble generating suggestions right now. Please try again later.',
        type: 'service_error'
      }, 
      { status: 500 }
    );
  }
} 