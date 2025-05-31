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

// GET: Return time series data for a specific metric
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const interval = searchParams.get('interval') || 'day';

    // For now, return mock data
    // TODO: Implement actual time series data fetching
    return NextResponse.json({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: metric === 'views' ? 'Views' : 'Engagement',
          data: [100, 120, 115, 134, 168, 132, 200],
          borderColor: '#2563eb',
          backgroundColor: '#3b82f6'
        }
      ]
    });
  } catch (error) {
    console.error('Time series API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: error instanceof Error && error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
} 