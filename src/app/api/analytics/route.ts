import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Validation schema for analytics query parameters
const analyticsQuerySchema = z.object({
  startDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, "Invalid start date"),
  endDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, "Invalid end date"),
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
    
    // Validate query parameters
    const validatedQuery = analyticsQuerySchema.safeParse(query);
    if (!validatedQuery.success) {
      return NextResponse.json({ 
        message: 'Invalid query parameters', 
        errors: validatedQuery.error.errors 
      }, { status: 400 });
    }

    const startDate = new Date(validatedQuery.data.startDate);
    const endDate = new Date(validatedQuery.data.endDate);

    // Ensure endDate is not before startDate
    if (endDate < startDate) {
      return NextResponse.json({ 
        message: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(validatedQuery.data.campaignId && { campaignId: validatedQuery.data.campaignId }),
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        views: true,
        engagements: true,
        shares: true,
        likes: true,
        comments: true,
        conversions: true,
        follows: true,
        new_followers: true,
        revenue: true,
        createdAt: true,
      },
    });

    // If no data found, return empty result instead of error
    if (analytics.length === 0) {
      return NextResponse.json({
        data: [],
        total: {
          views: 0,
          engagements: 0,
          shares: 0,
          likes: 0,
          comments: 0,
          conversions: 0,
          follows: 0,
          new_followers: 0,
          revenue: 0,
        },
      });
    }

    // Group data by the specified interval
    const groupedData = analytics.reduce((acc, curr) => {
      const date = new Date(curr.createdAt);
      let key: string;

      switch (validatedQuery.data.timeframe) {
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
          new_followers: 0,
          revenue: 0,
        };
      }

      acc[key].views += curr.views ?? 0;
      acc[key].engagements += curr.engagements ?? 0;
      acc[key].shares += curr.shares ?? 0;
      acc[key].likes += curr.likes ?? 0;
      acc[key].comments += curr.comments ?? 0;
      acc[key].conversions += curr.conversions ?? 0;
      acc[key].follows += curr.follows ?? 0;
      acc[key].new_followers += curr.new_followers ?? 0;
      acc[key].revenue += curr.revenue ?? 0;

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      data: Object.values(groupedData),
      total: {
        views: analytics.reduce((sum, curr) => sum + (curr.views ?? 0), 0),
        engagements: analytics.reduce((sum, curr) => sum + (curr.engagements ?? 0), 0),
        shares: analytics.reduce((sum, curr) => sum + (curr.shares ?? 0), 0),
        likes: analytics.reduce((sum, curr) => sum + (curr.likes ?? 0), 0),
        comments: analytics.reduce((sum, curr) => sum + (curr.comments ?? 0), 0),
        conversions: analytics.reduce((sum, curr) => sum + (curr.conversions ?? 0), 0),
        follows: analytics.reduce((sum, curr) => sum + (curr.follows ?? 0), 0),
        new_followers: analytics.reduce((sum, curr) => sum + (curr.new_followers ?? 0), 0),
        revenue: analytics.reduce((sum, curr) => sum + (curr.revenue ?? 0), 0),
      },
      audienceGrowthData: {
        labels: Object.keys(groupedData),
        datasets: [{
          label: "New Followers",
          data: Object.values(groupedData).map(d => d.new_followers),
          backgroundColor: "#1976d2",
        }]
      }
    });
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}