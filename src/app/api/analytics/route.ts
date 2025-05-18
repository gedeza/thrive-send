import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Validation schema for analytics query parameters
const analyticsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timeframe: z.enum(['day', 'week', 'month', 'year']).nullable().transform(val => val || 'day'),
  campaignId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = analyticsQuerySchema.parse(query);

    const startDate = new Date(validatedQuery.startDate);
    const endDate = new Date(validatedQuery.endDate);

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        ...(validatedQuery.campaignId && { campaignId: validatedQuery.campaignId }),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Group data by the specified interval
    const groupedData = analytics.reduce((acc, curr) => {
      const date = new Date(curr.timestamp);
      let key: string;

      switch (validatedQuery.timeframe) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          views: 0,
          engagements: 0,
          shares: 0,
          likes: 0,
          comments: 0,
          conversions: 0,
          follows: 0,
          newFollowers: 0,
          revenue: 0,
        };
      }

      acc[key].views += curr.views;
      acc[key].engagements += curr.engagements;
      acc[key].shares += curr.shares;
      acc[key].likes += curr.likes;
      acc[key].comments += curr.comments;
      acc[key].conversions += curr.conversions;
      acc[key].follows += curr.follows;
      acc[key].newFollowers += curr.new_followers;
      acc[key].revenue += curr.revenue;

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      data: Object.values(groupedData),
      total: {
        views: analytics.reduce((sum, curr) => sum + curr.views, 0),
        engagements: analytics.reduce((sum, curr) => sum + curr.engagements, 0),
        shares: analytics.reduce((sum, curr) => sum + curr.shares, 0),
        likes: analytics.reduce((sum, curr) => sum + curr.likes, 0),
        comments: analytics.reduce((sum, curr) => sum + curr.comments, 0),
        conversions: analytics.reduce((sum, curr) => sum + curr.conversions, 0),
        follows: analytics.reduce((sum, curr) => sum + curr.follows, 0),
        newFollowers: analytics.reduce((sum, curr) => sum + curr.new_followers, 0),
        revenue: analytics.reduce((sum, curr) => sum + curr.revenue, 0),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid query parameters', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}