// scripts/seed-organization.ts
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Initializing Prisma client...');
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if an organization already exists
    const orgCount = await prisma.organization.count();
    
    if (orgCount > 0) {
      console.log(`Found ${orgCount} organizations in the database. No need to create one.`);
      const orgs = await prisma.organization.findMany();
      console.log('Existing organizations:', orgs.map(org => ({ id: org.id, name: org.name })));
    } else {
      console.log('No organizations found. Creating a test organization...');
      
      const newOrg = await prisma.organization.create({
        data: {
          name: 'Test Organization',
          slug: 'test-organization', // Required by the schema
          website: 'https://example.com',
          primaryColor: '#4F46E5', // Default primary color
        }
      });
      
      console.log('✅ Created test organization:', newOrg);
    }
  } catch (error) {
    console.error('❌ Error during organization creation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
  }
}

main()
  .then(() => console.log('Organization seeding completed'))
  .catch(e => console.error('Organization seeding failed:', e));