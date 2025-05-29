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
  timeframe: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
  campaignId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
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
        id: true,
        clientId: true,
        campaignId: true,
        projectCount: true,
        activeProjects: true,
        completedProjects: true,
        totalBudget: true,
        usedBudget: true,
        engagementRate: true,
        contentCount: true,
        reachCount: true,
        interactionCount: true,
        conversionRate: true,
        roi: true,
        lastActivity: true,
        createdAt: true,
      },
    });

    // If no data found, return empty result instead of error
    if (analytics.length === 0) {
      return NextResponse.json({
        data: [],
        total: {
          projectCount: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalBudget: 0,
          usedBudget: 0,
          engagementRate: 0,
          contentCount: 0,
          reachCount: 0,
          interactionCount: 0,
          conversionRate: 0,
          roi: 0,
        },
        audienceGrowthData: {
          labels: [],
          datasets: [{
            label: "Content Growth",
            data: [],
            backgroundColor: "#1976d2",
          }]
        },
        engagementPieData: {
          labels: ["Active", "Completed", "Planned"],
          datasets: [{
            label: "Projects",
            data: [0, 0, 0],
            backgroundColor: ["#1976d2", "#43a047", "#fbc02d"],
          }]
        },
        performanceLineData: {
          labels: [],
          datasets: [{
            label: "Engagement Rate Trend",
            data: [],
            borderColor: "#1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.2)",
            tension: 0.35,
            fill: true,
          }]
        }
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
          projectCount: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalBudget: 0,
          usedBudget: 0,
          engagementRate: 0,
          contentCount: 0,
          reachCount: 0,
          interactionCount: 0,
          conversionRate: 0,
          roi: 0,
        };
      }

      acc[key].projectCount += curr.projectCount ?? 0;
      acc[key].activeProjects += curr.activeProjects ?? 0;
      acc[key].completedProjects += curr.completedProjects ?? 0;
      acc[key].totalBudget += curr.totalBudget ?? 0;
      acc[key].usedBudget += curr.usedBudget ?? 0;
      acc[key].engagementRate = Math.max(acc[key].engagementRate, curr.engagementRate ?? 0);
      acc[key].contentCount += curr.contentCount ?? 0;
      acc[key].reachCount += curr.reachCount ?? 0;
      acc[key].interactionCount += curr.interactionCount ?? 0;
      acc[key].conversionRate = Math.max(acc[key].conversionRate, curr.conversionRate ?? 0);
      acc[key].roi = Math.max(acc[key].roi, curr.roi ?? 0);

      return acc;
    }, {} as Record<string, any>);

    const groupedDataValues = Object.values(groupedData);
    const totalProjectCount = analytics.reduce((sum, curr) => sum + (curr.projectCount ?? 0), 0);
    const totalActiveProjects = analytics.reduce((sum, curr) => sum + (curr.activeProjects ?? 0), 0);
    const totalCompletedProjects = analytics.reduce((sum, curr) => sum + (curr.completedProjects ?? 0), 0);
    const totalPlannedProjects = totalProjectCount - (totalActiveProjects + totalCompletedProjects);

    return NextResponse.json({
      data: groupedDataValues,
      total: {
        projectCount: totalProjectCount,
        activeProjects: totalActiveProjects,
        completedProjects: totalCompletedProjects,
        plannedProjects: totalPlannedProjects,
        totalBudget: analytics.reduce((sum, curr) => sum + (curr.totalBudget ?? 0), 0),
        usedBudget: analytics.reduce((sum, curr) => sum + (curr.usedBudget ?? 0), 0),
        engagementRate: analytics.length > 0 ? analytics.reduce((sum, curr) => sum + (curr.engagementRate ?? 0), 0) / analytics.length : 0,
        contentCount: analytics.reduce((sum, curr) => sum + (curr.contentCount ?? 0), 0),
        reachCount: analytics.reduce((sum, curr) => sum + (curr.reachCount ?? 0), 0),
        interactionCount: analytics.reduce((sum, curr) => sum + (curr.interactionCount ?? 0), 0),
        conversionRate: analytics.length > 0 ? analytics.reduce((sum, curr) => sum + (curr.conversionRate ?? 0), 0) / analytics.length : 0,
        roi: analytics.length > 0 ? analytics.reduce((sum, curr) => sum + (curr.roi ?? 0), 0) / analytics.length : 0,
      },
      audienceGrowthData: {
        labels: Object.keys(groupedData),
        datasets: [{
          label: "Content Growth",
          data: groupedDataValues.map(d => d.contentCount),
          backgroundColor: "#1976d2",
        }]
      },
      engagementPieData: {
        labels: ["Active", "Completed", "Planned"],
        datasets: [{
          label: "Projects",
          data: [totalActiveProjects, totalCompletedProjects, totalPlannedProjects],
          backgroundColor: ["#1976d2", "#43a047", "#fbc02d"],
        }]
      },
      performanceLineData: {
        labels: Object.keys(groupedData),
        datasets: [{
          label: "Engagement Rate Trend",
          data: groupedDataValues.map(d => d.engagementRate),
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.2)",
          tension: 0.35,
          fill: true,
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