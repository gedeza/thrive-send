import { NextRequest, NextResponse } from 'next/server';
import { rateLimitService } from '@/lib/rate-limiting/index';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Get rate limit status for the organization
    const status = await rateLimitService.getOrganizationStatus(organizationId);
    
    const response = {
      organizationId,
      timestamp: new Date().toISOString(),
      status,
    };
    
    logger.info('Organization rate limit status retrieved', {
      organizationId,
      operations: Object.keys(status).length,
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    logger.error('Failed to retrieve organization rate limit status', error as Error, {
      organizationId: params.organizationId,
    });
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve rate limit status',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}