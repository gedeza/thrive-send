// scripts/test-campaigns-db.ts
import { PrismaClient, CampaignStatus, CampaignGoalType } from '@prisma/client';

async function main() {
  console.log('Initializing Prisma client...');
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    console.log('Checking Campaign model...');
    const campaignCount = await prisma.campaign.count();
    console.log(`Found ${campaignCount} campaigns in the database`);

    // Try to fetch one campaign to validate the schema
    if (campaignCount > 0) {
      const sampleCampaign = await prisma.campaign.findFirst();
      console.log('Sample campaign:', sampleCampaign);
    } else {
      console.log('Creating a test campaign...');
      // Get first org ID
      let org = await prisma.organization.findFirst();
      
      // If no organization exists, create one
      if (!org) {
        console.log('No organization found. Creating a test organization...');
        org = await prisma.organization.create({
          data: {
            name: 'Test Organization',
            slug: 'test-organization', // Adding a unique slug as required by the schema
          },
        });
        console.log('✅ Created test organization:', org.name);
      }
      
      const newCampaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          description: 'Created by test script',
          status: CampaignStatus.draft,
          goalType: CampaignGoalType.AWARENESS,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
          organizationId: org.id,
        }
      });
      console.log('Created test campaign:', newCampaign);
    }
    
  } catch (error) {
    console.error('❌ Error during Prisma test:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
  }
}

main()
  .then(() => console.log('Test completed'))
  .catch(e => console.error('Test failed:', e));
