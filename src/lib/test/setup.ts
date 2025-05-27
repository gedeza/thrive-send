import { randomUUID } from 'crypto';
import { prisma, resetDatabase } from './db';

export async function setupTestDatabase() {
  try {
    // Create test users
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        clerkId: `test_clerk_${randomUUID()}`,
      },
    });

    const memberUser = await prisma.user.create({
      data: {
        email: 'member@test.com',
        name: 'Member User',
        clerkId: `test_clerk_${randomUUID()}`,
      },
    });

    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
        members: {
          create: [
            {
              userId: adminUser.id,
              role: 'ADMIN',
            },
            {
              userId: memberUser.id,
              role: 'MEMBER',
            },
          ],
        },
        subscription: {
          create: {
            plan: 'free',
            status: 'active',
            startDate: new Date(),
            price: 0,
            currency: 'USD',
            billingCycle: 'MONTHLY',
            cancelAtPeriodEnd: false,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        subscription: true,
      },
    });

    return {
      adminUser,
      memberUser,
      organization,
    };
  } catch (error) {
    console.error('Error setting up test database:', {
      type: error?.constructor?.name,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function cleanupTestData() {
  try {
    await resetDatabase();
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
}

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await prisma.$transaction(async () => {
      try {
        return await fn();
      } catch (error) {
        // Only log the error message and type, not the full stack trace
        console.error('Transaction failed:', {
          type: error?.constructor?.name,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  } catch (error) {
    // Only log the error message and type, not the full stack trace
    console.error('Failed to start transaction:', {
      type: error?.constructor?.name,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Helper to reset all mocks between tests
export function resetMocks() {
  jest.clearAllMocks();
} 