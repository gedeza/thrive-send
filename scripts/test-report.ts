import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestReport() {
  try {
    // First, get or create an organization
    const organization = await prisma.organization.findFirst() || 
      await prisma.organization.create({
        data: {
          name: 'Test Organization',
          slug: 'test-org',
        },
      });

    // Get or create a user
    const user = await prisma.user.findFirst() || 
      await prisma.user.create({
        data: {
          clerkId: 'test-user',
          email: 'test@example.com',
          role: 'CONTENT_CREATOR',
        },
      });

    // Get or create a campaign
    const campaign = await prisma.campaign.findFirst() || 
      await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          organizationId: organization.id,
          goalType: 'AWARENESS',
          status: 'active',
        },
      });

    // Create a test report
    const report = await prisma.report.create({
      data: {
        name: 'Q2 Campaign Performance Report',
        sections: {
          metrics: [
            {
              type: 'metric',
              title: 'Total Impressions',
              value: 15000,
              change: '+12%',
            },
            {
              type: 'metric',
              title: 'Engagement Rate',
              value: '4.2%',
              change: '+0.5%',
            },
          ],
          charts: [
            {
              type: 'chart',
              title: 'Daily Performance',
              chartType: 'line',
              data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    label: 'Impressions',
                    data: [1200, 1900, 1500, 2100, 1800, 2200, 2000],
                  },
                ],
              },
            },
          ],
          tables: [
            {
              type: 'table',
              title: 'Top Performing Content',
              columns: ['Content', 'Impressions', 'Engagement'],
              data: [
                ['Post 1', '5000', '4.5%'],
                ['Post 2', '4500', '4.2%'],
                ['Post 3', '4000', '3.8%'],
              ],
            },
          ],
        },
        campaignId: campaign.id,
        createdById: user.id,
        organizationId: organization.id,
      },
    });

    console.log('Created test report:', report);

    // Create a report export
    const export_ = await prisma.reportExport.create({
      data: {
        format: 'PDF',
        url: 'https://example.com/reports/test-report.pdf',
        reportId: report.id,
      },
    });

    console.log('Created report export:', export_);

    // Create a report share
    const share = await prisma.reportShare.create({
      data: {
        reportId: report.id,
        userId: user.id,
      },
    });

    console.log('Created report share:', share);

  } catch (error) {
    console.error('Error creating test report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReport(); 