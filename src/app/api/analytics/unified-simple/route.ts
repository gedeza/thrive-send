import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('🔍 Starting unified-simple endpoint...');
    
    // Step 1: Check authentication
    const { userId } = await auth();
    console.log('Auth result:', { userId });
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        success: false 
      }, { status: 401 });
    }
    
    // Step 2: Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizationMemberships: {
          select: {
            organizationId: true,
            role: true
          }
        }
      }
    });
    
    console.log('User found:', { userId: user?.id, orgCount: user?.organizationMemberships?.length });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        success: false 
      }, { status: 404 });
    }
    
    // Step 3: Check organization memberships
    if (!user.organizationMemberships || user.organizationMemberships.length === 0) {
      return NextResponse.json({ 
        error: 'No organization memberships found',
        success: false 
      }, { status: 403 });
    }
    
    // Step 4: Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        success: false 
      }, { status: 400 });
    }
    
    console.log('Request body:', requestBody);
    
    // Step 5: Return mock data for now
    const mockResponse = {
      success: true,
      data: {
        metrics: [
          {
            key: 'total_views',
            label: 'Total Views',
            value: '1,234',
            description: 'Total content views this period',
            icon: 'eye'
          },
          {
            key: 'engagement_rate',
            label: 'Engagement Rate',
            value: '3.2%',
            description: 'Average engagement across all content',
            icon: 'heart'
          },
          {
            key: 'conversions',
            label: 'Conversions',
            value: '87',
            description: 'Total conversions this period',
            icon: 'target'
          },
          {
            key: 'revenue',
            label: 'Revenue',
            value: '$12,345',
            description: 'Total revenue generated',
            icon: 'dollar-sign'
          }
        ],
        overview: {
          totalViews: 1234,
          totalEngagement: 456,
          conversionRate: 3.2
        },
        audience: {
          labels: ['Desktop', 'Mobile', 'Tablet'],
          datasets: [{
            label: 'Device Distribution',
            data: [45, 40, 15],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
          }]
        },
        engagement: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Engagement',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6'
          }]
        },
        performance: {
          labels: ['Views', 'Clicks', 'Conversions', 'Revenue'],
          datasets: [{
            label: 'Performance Metrics',
            data: [1234, 567, 87, 12345],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
          }]
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
        executionTime: 50,
        cacheStatus: {
          metrics: 'miss',
          overview: 'miss',
          audience: 'miss',
          engagement: 'miss',
          performance: 'miss'
        }
      }
    };
    
    console.log('✅ Returning mock response');
    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error('❌ Unified-simple endpoint error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      success: false,
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}