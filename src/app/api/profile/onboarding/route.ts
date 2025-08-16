import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Return onboarding status for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  // Auto-create user if they don't exist (first-time login)
  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    console.log('Creating new user for Clerk ID:', userId);
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: 'user@example.com', // Will be updated by webhook later
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

    // Create a default organization for the user
    const organization = await prisma.organization.create({
      data: {
        id: `user-org-${userId}`,
        name: 'My Organization',
        slug: `org-${userId}`,
        description: 'Default organization',
        website: '',
        industry: 'Technology',
        settings: {}
      }
    });

    // Create organization membership
    await prisma.organizationMembership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: new Date()
      }
    });

    console.log('✅ User and organization created successfully');
  }

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
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error updating onboarding status' }),
      { status: 500 }
    );
  }
} 