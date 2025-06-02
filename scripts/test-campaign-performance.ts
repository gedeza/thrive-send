import { PrismaClient, CampaignStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

interface Metric {
  name: string;
  value: number;
}

interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  engagement: number;
  conversionRate: number;
  roi: number;
}

async function createTestCampaign(organizationId: string, name: string, status: CampaignStatus = 'active') {
  const campaign = await prisma.campaign.create({
    data: {
      name,
      description: `Campaign for testing performance tracking - ${name}`,
      status,
      goalType: 'ENGAGEMENT',
      organization: {
        connect: {
          id: organizationId
        }
      }
    }
  });
  console.log(`Created campaign: ${campaign.id} (${name})`);
  return campaign;
}

async function addPerformanceData(campaignId: string, days: number = 7) {
  const performanceRecords = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const metrics: Metric[] = [
      {
        name: 'Impressions',
        value: faker.number.int({ min: 1000, max: 5000 })
      },
      {
        name: 'Clicks',
        value: faker.number.int({ min: 100, max: 500 })
      },
      {
        name: 'Conversions',
        value: faker.number.int({ min: 10, max: 50 })
      },
      {
        name: 'Investment',
        value: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 })
      },
      {
        name: 'Revenue',
        value: faker.number.float({ min: 200, max: 2000, fractionDigits: 2 })
      }
    ];

    const timeSeriesData: TimeSeriesDataPoint[] = [
      {
        timestamp: date.toISOString(),
        value: faker.number.int({ min: 50, max: 200 }),
        engagement: faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 2 }),
        conversionRate: faker.number.float({ min: 0.01, max: 0.1, fractionDigits: 2 }),
        roi: faker.number.float({ min: 1, max: 5, fractionDigits: 2 })
      }
    ];

    const record = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        actualMetrics: JSON.stringify({
          metrics,
          timeSeriesData,
          channel: faker.helpers.arrayElement(['email', 'social', 'web'])
        })
      }
    });
    performanceRecords.push(record);
  }
  return performanceRecords;
}

async function main() {
  try {
    // 1. Create or get an organization
    console.log('Setting up organization...');
    let organization = await prisma.organization.findFirst();
    
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Test Organization',
          slug: 'test-org-' + faker.string.alphanumeric(8).toLowerCase(),
          primaryColor: '#000000'
        }
      });
      console.log('Created organization:', organization.id);
    } else {
      console.log('Using existing organization:', organization.id);
    }

    // 2. Create multiple test campaigns
    console.log('\nCreating test campaigns...');
    const campaigns = await Promise.all([
      createTestCampaign(organization.id, 'Summer Sale Campaign'),
      createTestCampaign(organization.id, 'Product Launch Campaign'),
      createTestCampaign(organization.id, 'Brand Awareness Campaign', 'draft')
    ]);

    // 3. Add performance data to each campaign
    console.log('\nAdding performance data...');
    for (const campaign of campaigns) {
      const records = await addPerformanceData(campaign.id);
      console.log(`Added ${records.length} performance records to campaign: ${campaign.name}`);
    }

    // 4. Query and verify the data
    console.log('\nQuerying performance data...');
    const campaignsWithMetrics = await prisma.campaign.findMany({
      where: {
        id: {
          in: campaigns.map(c => c.id)
        }
      }
    });

    console.log('\nCampaign Performance Summary:');
    for (const campaign of campaignsWithMetrics) {
      console.log(`\nCampaign: ${campaign.name}`);
      console.log('Status:', campaign.status);
      
      const actualMetrics = campaign.actualMetrics ? JSON.parse(campaign.actualMetrics as string) : null;
      if (actualMetrics && actualMetrics.metrics) {
        const totalImpressions = actualMetrics.metrics.reduce((sum: number, metric: Metric) => {
          if (metric.name === 'Impressions') {
            return sum + metric.value;
          }
          return sum;
        }, 0);

        const totalRevenue = actualMetrics.metrics.reduce((sum: number, metric: Metric) => {
          if (metric.name === 'Revenue') {
            return sum + metric.value;
          }
          return sum;
        }, 0);

        console.log('Total Impressions:', totalImpressions);
        console.log('Total Revenue:', totalRevenue);
      }
    }

    // 5. Test aggregation by status
    console.log('\nPerformance by Status:');
    const statusStats = await prisma.campaign.groupBy({
      by: ['status'],
      where: {
        id: {
          in: campaigns.map(c => c.id)
        }
      },
      _count: { status: true }
    });

    console.log('Status Distribution:', statusStats);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 