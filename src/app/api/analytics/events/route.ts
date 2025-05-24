import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const encoder = new TextEncoder();
    let intervalId: NodeJS.Timeout;
    let isStreamActive = true;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial data
          const data = await fetchAnalyticsData();
          if (isStreamActive) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }

          // Set up interval for updates
          intervalId = setInterval(async () => {
            if (!isStreamActive) {
              clearInterval(intervalId);
              return;
            }

            try {
              const data = await fetchAnalyticsData();
              if (isStreamActive) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              }
            } catch (error) {
              console.error('Error fetching analytics data:', error);
              if (isStreamActive) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to fetch analytics data' })}\n\n`));
              }
            }
          }, 30000); // Update every 30 seconds
        } catch (error) {
          console.error('Error in analytics stream:', error);
          if (isStreamActive) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to initialize analytics stream' })}\n\n`));
            controller.close();
          }
        }
      },
      cancel() {
        // Clean up when the stream is cancelled
        isStreamActive = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function fetchAnalyticsData() {
  try {
    // Check if database is available
    if (!db) {
      return {
        metrics: [
          {
            title: "Total Views",
            value: "0",
            comparison: "No data available",
            percentChange: 0,
          },
          {
            title: "Engagement Rate",
            value: "0%",
            comparison: "No data available",
            percentChange: 0,
          },
          {
            title: "Conversion Rate",
            value: "0%",
            comparison: "No data available",
            percentChange: 0,
          },
          {
            title: "Revenue",
            value: "$0",
            comparison: "No data available",
            percentChange: 0,
          },
        ],
        timestamp: new Date().toISOString(),
      };
    }

    // Fetch analytics data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [currentPeriod, previousPeriod] = await Promise.all([
      db.analytics.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      db.analytics.findMany({
        where: {
          createdAt: {
            gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    // Calculate metrics
    const currentViews = currentPeriod.reduce((sum, record) => sum + (record.impressions || 0), 0);
    const previousViews = previousPeriod.reduce((sum, record) => sum + (record.impressions || 0), 0);
    const viewsChange = previousViews ? ((currentViews - previousViews) / previousViews) * 100 : 0;

    const currentEngagements = currentPeriod.reduce((sum, record) => sum + (record.engagements || 0), 0);
    const previousEngagements = previousPeriod.reduce((sum, record) => sum + (record.engagements || 0), 0);
    const engagementChange = previousEngagements ? ((currentEngagements - previousEngagements) / previousEngagements) * 100 : 0;

    const currentConversions = currentPeriod.reduce((sum, record) => sum + (record.conversions || 0), 0);
    const previousConversions = previousPeriod.reduce((sum, record) => sum + (record.conversions || 0), 0);
    const conversionChange = previousConversions ? ((currentConversions - previousConversions) / previousConversions) * 100 : 0;

    const currentRevenue = currentPeriod.reduce((sum, record) => sum + (record.revenue || 0), 0);
    const previousRevenue = previousPeriod.reduce((sum, record) => sum + (record.revenue || 0), 0);
    const revenueChange = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      metrics: [
        {
          title: "Total Views",
          value: currentViews.toLocaleString(),
          comparison: `vs ${previousViews.toLocaleString()} last period`,
          percentChange: viewsChange,
        },
        {
          title: "Engagement Rate",
          value: `${((currentEngagements / currentViews) * 100).toFixed(1)}%`,
          comparison: `vs ${((previousEngagements / previousViews) * 100).toFixed(1)}% last period`,
          percentChange: engagementChange,
        },
        {
          title: "Conversion Rate",
          value: `${((currentConversions / currentEngagements) * 100).toFixed(1)}%`,
          comparison: `vs ${((previousConversions / previousEngagements) * 100).toFixed(1)}% last period`,
          percentChange: conversionChange,
        },
        {
          title: "Revenue",
          value: `$${currentRevenue.toLocaleString()}`,
          comparison: `vs $${previousRevenue.toLocaleString()} last period`,
          percentChange: revenueChange,
        },
      ],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      metrics: [
        {
          title: "Total Views",
          value: "0",
          comparison: "No data available",
          percentChange: 0,
        },
        {
          title: "Engagement Rate",
          value: "0%",
          comparison: "No data available",
          percentChange: 0,
        },
        {
          title: "Conversion Rate",
          value: "0%",
          comparison: "No data available",
          percentChange: 0,
        },
        {
          title: "Revenue",
          value: "$0",
          comparison: "No data available",
          percentChange: 0,
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }
} 