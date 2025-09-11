import { NextRequest, NextResponse } from 'next/server';
import { webhookHandler } from '@/lib/email/webhook-handler';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const result = await webhookHandler.handleSendGridWebhook(request);
    
    logger.info('SendGrid webhook processed successfully', result);
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
    
  } catch (_error) {
    logger.error('SendGrid webhook failed', error as Error);
    
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}