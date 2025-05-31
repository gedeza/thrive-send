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

// GET: Return comparison data for a specific metric
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const type = searchParams.get('type') || 'week';

    // For now, return mock data
    // TODO: Implement actual comparison data fetching
    return NextResponse.json({
      current: 1234,
      previous: 1000,
      change: 234,
      isPositive: true
    });
  } catch (error) {
    console.error('Comparison API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: error instanceof Error && error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
} 