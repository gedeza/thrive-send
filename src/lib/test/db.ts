import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient instance for testing
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: 'file::memory:?cache=shared',
      },
    },
    log: ['error', 'warn'],
    // Add connection timeout
    connectionTimeout: 10000,
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };

// Helper function to reset the database
export async function resetDatabase() {
  try {
    // Execute deletes in a transaction for better performance
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM "Invitation"`;
      await tx.$executeRaw`DELETE FROM "OrganizationMember"`;
      await tx.$executeRaw`DELETE FROM "Subscription"`;
      await tx.$executeRaw`DELETE FROM "Organization"`;
      await tx.$executeRaw`DELETE FROM "User"`;
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// Helper function to seed test data
export async function seedTestData() {
  // Add any initial test data here
  // This is useful for data that should be available in all tests
}

// Ensure proper cleanup
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}); 