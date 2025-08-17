import { clerkClient } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

export async function getOrCreateUser(clerkUserId: string) {
  console.log(`🔍 getOrCreateUser called for: ${clerkUserId}`);
  
  try {
    // First try to find existing user with organization memberships
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        organizationMemberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (user) {
      console.log(`✅ User found in database: ${user.id}`);
      
      // Check if user has organization membership
      if (user.organizationMemberships.length === 0) {
        console.log(`🔧 User has no organization membership, creating default organization...`);
        await createDefaultOrganizationForUser(user);
      }
      
      return user;
    }

    // If user doesn't exist, fetch their data from Clerk and create them
    console.log(`🔧 User not found in database, fetching from Clerk: ${clerkUserId}`);
    
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      
      const userData = {
        clerkId: clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress || `user-${clerkUserId}@placeholder.com`,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.emailAddresses[0]?.emailAddress || '',
        imageUrl: clerkUser.imageUrl || null,
        role: 'CONTENT_CREATOR',
        hasCompletedOnboarding: false,
      };

      user = await prisma.user.create({
        data: userData,
      });

      console.log(`✅ User created successfully with real data:`, {
        id: user.id,
        name: userData.name,
        email: userData.email,
      });

      // Create default organization for new user
      await createDefaultOrganizationForUser(user);

      return user;
    } catch (clerkError) {
      console.error('Failed to fetch user from Clerk:', clerkError);
      
      // Fallback: create user with minimal data
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: `user-${clerkUserId}@placeholder.com`,
          firstName: '',
          lastName: '',
          role: 'CONTENT_CREATOR',
          hasCompletedOnboarding: false,
        },
      });

      console.log(`⚠️ User created with fallback data: ${user.id}`);
      
      // Create default organization for fallback user too
      await createDefaultOrganizationForUser(user);
      
      return user;
    }
  } catch (error) {
    console.error('Critical error in getOrCreateUser:', error);
    throw error;
  }
}

async function createDefaultOrganizationForUser(user: any) {
  try {
    // Create a default organization for the user
    const organizationName = user.name || user.email || 'My Organization';
    const organizationSlug = `org-${user.id.slice(-8)}`;
    
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
        type: 'service_provider',
      },
    });

    // Create organization membership
    await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    });

    console.log(`✅ Default organization created: ${organization.name} (${organization.id})`);
    console.log(`✅ Organization membership created for user: ${user.id}`);
  } catch (orgError) {
    console.error('Failed to create default organization:', orgError);
    throw orgError;
  }
}