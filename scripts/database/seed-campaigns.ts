// scripts/seed-campaigns.ts
import { PrismaClient, CampaignStatus, CampaignGoalType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed data...');
  
  // Define organizations with fixed IDs for reference
  const organizations = [
    {
      id: "org1",
      name: "Marketing Agency Inc.",
      slug: "marketing-agency-inc",
      type: "AGENCY",
      industry: "Marketing"
    },
    {
      id: "org2",
      name: "Tech Solutions Ltd.",
      slug: "tech-solutions-ltd",
      type: "ENTERPRISE",
      industry: "Technology"
    },
    {
      id: "org3",
      name: "Nonprofit Foundation",
      slug: "nonprofit-foundation",
      type: "NONPROFIT",
      industry: "Social Services"
    }
  ];

  // Upsert organizations (create if not exists, update if exists)
  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: org,
      create: org,
    });
  }
  console.log(`Upserted ${organizations.length} organizations`);

  // Define clients
  const clients = [
    {
      id: "client1",
      name: "Retail Chain Co.",
      email: "contact@retailchain.com",
      type: "CORPORATE",
      industry: "Retail",
      organizationId: "org1"
    },
    {
      id: "client2",
      name: "Financial Services Group",
      email: "info@financialservices.com",
      type: "ENTERPRISE",
      industry: "Finance",
      organizationId: "org2"
    }
  ];

  // Upsert clients
  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: client,
      create: client,
    });
  }
  console.log(`Upserted ${clients.length} clients`);

  // Define projects
  const projects = [
    {
      id: "proj1",
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      organizationId: "org1" // Required field
    },
    {
      id: "proj2",
      name: "Product Launch Campaign",
      description: "Marketing campaign for new product line",
      organizationId: "org2" // Required field
    }
  ];

  // Upsert projects
  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project,
    });
  }
  console.log(`Upserted ${projects.length} projects`);

  // Define campaigns with relationships to organizations, clients, and projects
  // Optional fields (budget, goals, clientId, projectId) are explicitly set to null if not applicable.
  // Using only canonical status values: draft, active, completed, paused, archived
  const campaigns = [
    {
      name: 'Summer Sale Email',
      description: 'Promotion for our summer collection',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-07-15'),
      status: CampaignStatus.completed,
      budget: 1500,
      customGoal: 'Increase summer sales by 20%',
      goalType: CampaignGoalType.REVENUE,
      organizationId: "org1",
      clientId: "client1",
      projectId: null, // Explicitly null
    },
    {
      name: 'Product Launch',
      description: 'New product announcement campaign',
      startDate: new Date('2023-06-28'),
      endDate: new Date('2023-07-28'),
      status: CampaignStatus.draft,
      budget: null, // Explicitly null
      customGoal: null,  // Explicitly null
      goalType: CampaignGoalType.AWARENESS,
      organizationId: "org2",
      clientId: null, // Explicitly null
      projectId: "proj2"
    },
    {
      name: 'Monthly Newsletter',
      description: 'Regular updates and offers',
      startDate: new Date('2023-05-20'),
      endDate: new Date('2023-06-01'),
      status: CampaignStatus.completed,
      budget: null, // Explicitly null
      customGoal: null,  // Explicitly null
      goalType: CampaignGoalType.RETENTION,
      organizationId: "org3",
      clientId: null, // Explicitly null
      projectId: null, // Explicitly null
    },
    {
      name: 'Holiday Special',
      description: 'End of year promotional campaign',
      startDate: new Date('2023-11-15'),
      endDate: new Date('2023-12-31'),
      status: CampaignStatus.active,
      budget: 5000,
      customGoal: 'Drive holiday sales and increase customer engagement',
      goalType: CampaignGoalType.CONVERSION,
      organizationId: "org1",
      clientId: "client2",
      projectId: null, // Explicitly null
    },
    {
      name: 'Brand Awareness',
      description: 'Social media campaign to increase brand visibility',
      startDate: new Date('2023-08-01'),
      endDate: new Date('2023-10-31'),
      status: CampaignStatus.active,
      budget: 3500,
      customGoal: 'Increase social media followers by 15%',
      goalType: CampaignGoalType.AWARENESS,
      organizationId: "org2",
      clientId: null, // Explicitly null
      projectId: "proj1"
    }
  ];

  // Create campaigns
  // Consider deleting existing campaigns first if this script is run multiple times
  // await prisma.campaign.deleteMany({}); // Optional: uncomment to clear campaigns before seeding
  for (const campaign of campaigns) {
    await prisma.campaign.create({
      data: campaign
    });
  }

  console.log(`Created ${campaigns.length} campaigns`);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
