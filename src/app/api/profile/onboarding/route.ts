import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user-utils';

// GET: Return onboarding status for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ message: 'Not authenticated' }),
      { status: 401 }
    );
  }
  const user = await getOrCreateUser(userId);
  return NextResponse.json({ hasCompletedOnboarding: user.hasCompletedOnboarding });
}

// POST: Update onboarding status for current user
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { hasCompletedOnboarding } = body;

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { hasCompletedOnboarding },
    });

    return NextResponse.json({ 
      message: 'Onboarding status updated successfully',
      hasCompletedOnboarding: user.hasCompletedOnboarding 
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error updating onboarding status' }),
      { status: 500 }
    );
  }
} 