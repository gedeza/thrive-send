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

  // Create initial clients for the organization
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
        website: 'https://techcorp.com',
        phone: '+1 (555) 123-4567',
        organizationId: organization.id,
        status: 'ACTIVE',
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        monthlyRetainer: 5000,
        industry: 'Technology',
        businessType: 'B2B',
        targetAudience: 'Enterprise software companies',
        primaryGoals: ['brand-awareness', 'lead-generation'],
        communicationStyle: 'Professional and technical',
        contentTypes: ['blog', 'social', 'email'],
        socialMediaPlatforms: ['linkedin', 'twitter'],
        campaignBudget: 2500,
        notes: 'High-value enterprise client focusing on thought leadership content'
      }
    }),
    prisma.client.create({
      data: {
        name: 'GreenLeaf Marketing',
        email: 'hello@greenleaf.co',
        website: 'https://greenleaf.co',
        phone: '+1 (555) 987-6543',
        organizationId: organization.id,
        status: 'ACTIVE',
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        monthlyRetainer: 3000,
        industry: 'Marketing & Advertising',
        businessType: 'B2C',
        targetAudience: 'Small business owners and entrepreneurs',
        primaryGoals: ['lead-generation', 'sales'],
        communicationStyle: 'Friendly and approachable',
        contentTypes: ['social', 'email', 'video'],
        socialMediaPlatforms: ['instagram', 'facebook', 'tiktok'],
        campaignBudget: 1500,
        notes: 'Creative agency specializing in eco-friendly brands'
      }
    }),
    prisma.client.create({
      data: {
        name: 'Fitness First Studio',
        email: 'info@fitnessfirst.com',
        website: 'https://fitnessfirst.com',
        phone: '+1 (555) 456-7890',
        organizationId: organization.id,
        status: 'ACTIVE',
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        monthlyRetainer: 2000,
        industry: 'Health & Fitness',
        businessType: 'B2C',
        targetAudience: 'Health-conscious individuals aged 25-45',
        primaryGoals: ['community-building', 'brand-awareness'],
        communicationStyle: 'Motivational and energetic',
        contentTypes: ['social', 'video', 'blog'],
        socialMediaPlatforms: ['instagram', 'youtube', 'facebook'],
        campaignBudget: 1000,
        notes: 'Local fitness studio looking to expand their community presence'
      }
    })
  ]);

  console.log('Seed data created:');
  console.log('Admin User:', adminUser.email);
  console.log('Content Creator:', contentCreator.email);
  console.log('Reviewer:', reviewer.email);
  console.log('Organization:', organization.name);
  console.log('Clients created:', clients.map(c => c.name).join(', '));
  console.log('Total clients:', clients.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 