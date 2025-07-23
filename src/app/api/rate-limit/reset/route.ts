import { NextRequest, NextResponse } from 'next/server';
import { rateLimitService } from '@/lib/rate-limiting/index';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, operation } = body;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Reset rate limits for the organization
    const result = await rateLimitService.resetOrganizationLimits(organizationId);
    
    const response = {
      success: result.success,
      organizationId,
      operation: operation || 'all',
      resetCount: result.resetCount,
      timestamp: new Date().toISOString(),
      message: result.success 
        ? `Rate limits reset successfully for organization ${organizationId}`
        : `Failed to reset rate limits for organization ${organizationId}`,
    };
    
    logger.info('Organization rate limits reset', {
      organizationId,
      operation: operation || 'all',
      success: result.success,
      resetCount: result.resetCount,
    });
    
    return NextResponse.json(response, {
      status: result.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    logger.error('Rate limit reset operation failed', error as Error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit reset operation failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}