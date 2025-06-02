import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create test data
    const testData = {
      lineChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Impressions',
            data: [1000, 2000, 1500, 3000, 2500, 4000],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Clicks',
            data: [500, 1000, 800, 1500, 1200, 2000],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      barChart: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Revenue',
            data: [1200, 1900, 1500, 2100, 1800, 2500, 2200],
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          }
        ]
      },
      pieChart: {
        labels: ['Social', 'Email', 'Search', 'Direct'],
        datasets: [
          {
            data: [30, 25, 20, 25],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)'
            ]
          }
        ]
      },
      tableData: {
        columns: [
          { header: 'Campaign', accessorKey: 'campaign' },
          { header: 'Impressions', accessorKey: 'impressions' },
          { header: 'Clicks', accessorKey: 'clicks' },
          { header: 'CTR', accessorKey: 'ctr' },
          { header: 'Revenue', accessorKey: 'revenue' }
        ],
        data: [
          {
            campaign: 'Summer Sale',
            impressions: 10000,
            clicks: 500,
            ctr: '5%',
            revenue: '$1,200'
          },
          {
            campaign: 'Product Launch',
            impressions: 15000,
            clicks: 750,
            ctr: '5%',
            revenue: '$2,500'
          },
          {
            campaign: 'Brand Awareness',
            impressions: 20000,
            clicks: 1000,
            ctr: '5%',
            revenue: '$3,000'
          }
        ]
      }
    };

    // Create a test report
    const report = await prisma.report.create({
      data: {
        name: 'Test Report',
        sections: [
          {
            type: 'chart',
            title: 'Performance Trends',
            chartType: 'line',
            data: testData.lineChart
          },
          {
            type: 'chart',
            title: 'Daily Revenue',
            chartType: 'bar',
            data: testData.barChart
          },
          {
            type: 'chart',
            title: 'Traffic Sources',
            chartType: 'pie',
            data: testData.pieChart
          },
          {
            type: 'table',
            title: 'Campaign Performance',
            data: testData.tableData
          }
        ],
        campaign: {
          connect: {
            id: 'test-campaign-id' // Replace with actual campaign ID
          }
        },
        createdBy: {
          connect: {
            id: 'test-user-id' // Replace with actual user ID
          }
        },
        organization: {
          connect: {
            id: 'test-org-id' // Replace with actual organization ID
          }
        }
      }
    });

    console.log('Test report created:', report);
    console.log('\nTest data structure:');
    console.log(JSON.stringify(testData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 