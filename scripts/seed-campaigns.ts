// scripts/seed-campaigns.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed data...');
  
  // Define organizations with fixed IDs for reference
  const organizations = [
    {
      id: "org1",
      name: "Marketing Agency Inc.",
      type: "AGENCY",
      industry: "Marketing"
    },
    {
      id: "org2",
      name: "Tech Solutions Ltd.",
      type: "ENTERPRISE",
      industry: "Technology"
    },
    {
      id: "org3",
      name: "Nonprofit Foundation",
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
      industry: "Retail"
    },
    {
      id: "client2",
      name: "Financial Services Group",
      industry: "Finance"
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
      description: "Complete overhaul of company website"
    },
    {
      id: "proj2",
      name: "Product Launch Campaign",
      description: "Marketing campaign for new product line"
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
  const campaigns = [
    {
      name: 'Summer Sale Email',
      description: 'Promotion for our summer collection',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-07-15'),
      status: 'SENT',
      budget: 1500,
      goals: 'Increase summer sales by 20%',
      organizationId: "org1",
      clientId: "client1"
    },
    {
      name: 'Product Launch',
      description: 'New product announcement campaign',
      startDate: new Date('2023-06-28'),
      endDate: new Date('2023-07-28'),
      status: 'DRAFT',
      organizationId: "org2",
      projectId: "proj2"
    },
    {
      name: 'Monthly Newsletter',
      description: 'Regular updates and offers',
      startDate: new Date('2023-05-20'),
      endDate: new Date('2023-06-01'),
      status: 'COMPLETED',
      organizationId: "org3",
    },
    {
      name: 'Holiday Special',
      description: 'End of year promotional campaign',
      startDate: new Date('2023-11-15'),
      endDate: new Date('2023-12-31'),
      status: 'PLANNED',
      budget: 5000,
      goals: 'Drive holiday sales and increase customer engagement',
      organizationId: "org1",
      clientId: "client2"
    },
    {
      name: 'Brand Awareness',
      description: 'Social media campaign to increase brand visibility',
      startDate: new Date('2023-08-01'),
      endDate: new Date('2023-10-31'),
      status: 'ACTIVE',
      budget: 3500,
      goals: 'Increase social media followers by 15%',
      organizationId: "org2",
      projectId: "proj1"
    }
  ];

  // Create campaigns
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
