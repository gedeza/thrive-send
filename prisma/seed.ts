import { PrismaClient, UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Create test users with different roles
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'test_admin_' + randomBytes(8).toString('hex'),
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  const contentCreator = await prisma.user.create({
    data: {
      clerkId: 'test_creator_' + randomBytes(8).toString('hex'),
      email: 'creator@test.com',
      firstName: 'Content',
      lastName: 'Creator',
      role: UserRole.CONTENT_CREATOR,
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      clerkId: 'test_reviewer_' + randomBytes(8).toString('hex'),
      email: 'reviewer@test.com',
      firstName: 'Content',
      lastName: 'Reviewer',
      role: UserRole.REVIEWER,
    },
  });

  // Create test organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      website: 'https://test-org.com',
      members: {
        create: [
          {
            userId: adminUser.id,
            role: 'ADMIN',
          },
          {
            userId: contentCreator.id,
            role: 'MEMBER',
          },
          {
            userId: reviewer.id,
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
        },
      },
    },
  });

  console.log('Seed data created:');
  console.log('Admin User:', adminUser.email);
  console.log('Content Creator:', contentCreator.email);
  console.log('Reviewer:', reviewer.email);
  console.log('Organization:', organization.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 