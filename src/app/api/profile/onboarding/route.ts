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

    // Ensure user exists before updating
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      // Auto-create user if they don't exist
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'User',
          role: 'ADMIN',
          hasCompletedOnboarding: false,
          userType: 'SERVICE_PROVIDER',
          phoneNumber: '',
          timezone: 'America/New_York',
          language: 'en',
          marketingConsent: false,
          preferences: {}
        }
      });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { hasCompletedOnboarding },
    });

    return NextResponse.json({ 
      message: 'Onboarding status updated successfully',
      hasCompletedOnboarding: updatedUser.hasCompletedOnboarding 
    });
  } catch (_error) {
    console.error("", _error);
    return new NextResponse(
      JSON.stringify({ message: 'Error updating onboarding status' }),
      { status: 500 }
    );
  }
} 