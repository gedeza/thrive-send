import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizationMemberships: {
        include: { organization: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return { user, clerkId: userId };
}

export async function getUserWithOrganization(organizationId?: string) {
  const { user, clerkId } = await getAuthenticatedUser();
  
  if (!organizationId && user.organizationMemberships.length === 0) {
    throw new Error('No organization access');
  }

  const targetOrgId = organizationId || user.organizationMemberships[0].organizationId;
  const membership = user.organizationMemberships.find(m => m.organizationId === targetOrgId);
  
  if (!membership) {
    throw new Error('Organization access denied');
  }

  return { user, organization: membership.organization, clerkId };
}