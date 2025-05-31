import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for request body
const metricsRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timeframe: z.enum(['day', 'week', 'month']),
  campaignId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = metricsRequestSchema.parse(body);
    const { startDate, endDate, timeframe, campaignId } = validatedData;

    // Get analytics data from database
    const analytics = await prisma.analytics.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(campaignId ? { campaignId } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate metrics
    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalEngagements = analytics.reduce((sum, a) => sum + a.engagements, 0);
    const totalShares = analytics.reduce((sum, a) => sum + a.shares, 0);
    const totalLikes = analytics.reduce((sum, a) => sum + a.likes, 0);
    const totalComments = analytics.reduce((sum, a) => sum + a.comments, 0);
    const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);
    
    // Calculate engagement rate as (engagements / views) * 100
    const avgEngagementRate = totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;
    
    // Calculate conversion rate as (conversions / views) * 100
    const avgConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    // Format metrics for response
    const metrics = [
      {
        id: 'total_views',
        title: 'Total Views',
        value: totalViews.toLocaleString(),
        description: 'Total content views this period',
        icon: null
      },
      {
        id: 'engagement_rate',
        title: 'Engagement Rate',
        value: `${avgEngagementRate.toFixed(1)}%`,
        description: 'Average engagement rate',
        icon: null
      },
      {
        id: 'total_engagements',
        title: 'Total Engagements',
        value: totalEngagements.toLocaleString(),
        description: 'Total interactions with content',
        icon: null
      },
      {
        id: 'total_shares',
        title: 'Total Shares',
        value: totalShares.toLocaleString(),
        description: 'Total content shares',
        icon: null
      },
      {
        id: 'total_likes',
        title: 'Total Likes',
        value: totalLikes.toLocaleString(),
        description: 'Total content likes',
        icon: null
      },
      {
        id: 'total_comments',
        title: 'Total Comments',
        value: totalComments.toLocaleString(),
        description: 'Total content comments',
        icon: null
      },
      {
        id: 'conversion_rate',
        title: 'Conversion Rate',
        value: `${avgConversionRate.toFixed(1)}%`,
        description: 'Average conversion rate',
        icon: null
      },
      {
        id: 'total_conversions',
        title: 'Total Conversions',
        value: totalConversions.toLocaleString(),
        description: 'Total conversions achieved',
        icon: null
      }
    ];

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in analytics metrics API:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 