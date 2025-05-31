import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

// GET: Return basic analytics data
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timeframe = searchParams.get('timeframe');

    // For now, return mock data
    // TODO: Implement actual analytics data fetching
    return NextResponse.json({
      metrics: [
        {
          key: 'total_views',
          label: 'Total Views',
          value: '1,234',
          description: 'Across all content',
          icon: '👁️'
        },
        {
          key: 'engagement_rate',
          label: 'Engagement Rate',
          value: '4.5%',
          description: 'Average engagement',
          icon: '❤️'
        },
        {
          key: 'total_followers',
          label: 'Total Followers',
          value: '5,678',
          description: 'Across all platforms',
          icon: '👥'
        },
        {
          key: 'conversion_rate',
          label: 'Conversion Rate',
          value: '2.3%',
          description: 'From content views',
          icon: '📈'
        }
      ],
      timeSeriesData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Views',
            data: [100, 120, 115, 134, 168, 132, 200],
            borderColor: '#2563eb',
            backgroundColor: '#3b82f6'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: error instanceof Error && error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}