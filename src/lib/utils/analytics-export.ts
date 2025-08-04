/**
 * Analytics Export Utilities
 * Built for ThriveSend B2B2G Service Provider Platform
 * Supports CSV, Excel, and PDF export formats for service provider analytics
 */

import { format } from 'date-fns';
import { AnalyticsExportData } from '@/types/analytics';

// CSV Export Functions
export function exportAnalyticsToCSV(data: AnalyticsExportData, filename: string): void {
  const csvContent = generateAnalyticsCSV(data);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

function generateAnalyticsCSV(data: AnalyticsExportData): string {
  const rows: string[] = [];
  
  // Header
  rows.push('ThriveSend Service Provider Analytics Report');
  rows.push(`Generated: ${new Date(data.timestamp).toLocaleString()}`);
  rows.push(`Organization: ${data.organizationId}`);
  rows.push(`Time Range: ${data.timeRange}`);
  rows.push(`Export Type: ${data.exportType}`);
  rows.push('');

  // Service Provider Metrics
  if (data.serviceProviderMetrics) {
    rows.push('SERVICE PROVIDER METRICS');
    rows.push('Metric,Value,Growth Rate');
    rows.push(`Total Clients,${data.serviceProviderMetrics.totalClients},${data.serviceProviderMetrics.growthMetrics.clientGrowthRate}%`);
    rows.push(`Active Clients,${data.serviceProviderMetrics.activeClients},-`);
    rows.push(`Total Revenue,$${data.serviceProviderMetrics.totalRevenue},${data.serviceProviderMetrics.growthMetrics.revenueGrowthRate}%`);
    rows.push(`Marketplace Revenue,$${data.serviceProviderMetrics.marketplaceRevenue},-`);
    rows.push(`Team Utilization,${data.serviceProviderMetrics.teamUtilization}%,-`);
    rows.push(`Client Satisfaction,${data.serviceProviderMetrics.avgClientSatisfaction}/5.0,-`);
    rows.push(`Retention Rate,${data.serviceProviderMetrics.growthMetrics.retentionRate}%,-`);
    rows.push(`Churn Rate,${data.serviceProviderMetrics.growthMetrics.churnRate}%,-`);
    rows.push('');
  }

  // Cross-Client Analytics
  if (data.crossClientAnalytics) {
    rows.push('CROSS-CLIENT ANALYTICS');
    rows.push('Metric,Value');
    rows.push(`Total Content,${data.crossClientAnalytics.aggregateMetrics.totalContent}`);
    rows.push(`Published Content,${data.crossClientAnalytics.aggregateMetrics.totalPublishedContent}`);
    rows.push(`Average Engagement,${data.crossClientAnalytics.aggregateMetrics.averageEngagement}%`);
    rows.push(`Total Views,${data.crossClientAnalytics.aggregateMetrics.totalViews}`);
    rows.push(`Total Clicks,${data.crossClientAnalytics.aggregateMetrics.totalClicks}`);
    rows.push(`Average Conversion Rate,${data.crossClientAnalytics.aggregateMetrics.averageConversionRate}%`);
    rows.push('');

    // Individual Client Performance
    if (data.crossClientAnalytics.clientAnalytics.length > 0) {
      rows.push('INDIVIDUAL CLIENT PERFORMANCE');
      rows.push('Client Name,Client Type,Total Content,Engagement Rate,Total Views,Conversion Rate,Performance Score');
      data.crossClientAnalytics.clientAnalytics.forEach(client => {
        rows.push([
          client.clientName,
          client.clientType,
          client.contentMetrics.totalContent,
          `${client.contentMetrics.avgEngagementRate}%`,
          client.contentMetrics.totalViews,
          `${client.contentMetrics.conversionRate}%`,
          client.performanceScore
        ].join(','));
      });
      rows.push('');
    }

    // Content Type Distribution
    if (Object.keys(data.crossClientAnalytics.contentTypeDistribution).length > 0) {
      rows.push('CONTENT TYPE DISTRIBUTION');
      rows.push('Content Type,Count');
      Object.entries(data.crossClientAnalytics.contentTypeDistribution).forEach(([type, count]) => {
        rows.push(`${type},${count}`);
      });
      rows.push('');
    }
  }

  // Revenue Analytics
  if (data.revenueAnalytics) {
    rows.push('REVENUE ANALYTICS');
    rows.push('Metric,Value');
    rows.push(`Total Revenue,$${data.revenueAnalytics.revenueMetrics.totalRevenue}`);
    rows.push(`Monthly Recurring Revenue (MRR),$${data.revenueAnalytics.revenueMetrics.mrr}`);
    rows.push(`Annual Recurring Revenue (ARR),$${data.revenueAnalytics.revenueMetrics.arr}`);
    rows.push(`Customer Lifetime Value,$${data.revenueAnalytics.revenueMetrics.clientLTV}`);
    rows.push(`Churn Rate,${data.revenueAnalytics.revenueMetrics.churnRate}%`);
    rows.push(`Revenue Growth Rate,${data.revenueAnalytics.revenueMetrics.revenueGrowthRate}%`);
    rows.push(`Revenue per Client,$${data.revenueAnalytics.revenueMetrics.revenuePerClient}`);
    rows.push(`Profit Margin,${data.revenueAnalytics.revenueMetrics.profitMargin}%`);
    rows.push('');

    // Revenue Breakdown
    rows.push('REVENUE BREAKDOWN');
    rows.push('Revenue Stream,Amount,Percentage,Growth Rate');
    rows.push(`Subscription Revenue,$${data.revenueAnalytics.revenueBreakdown.subscriptionRevenue.amount},${data.revenueAnalytics.revenueBreakdown.subscriptionRevenue.percentage}%,${data.revenueAnalytics.revenueBreakdown.subscriptionRevenue.growthRate}%`);
    rows.push(`Marketplace Commissions,$${data.revenueAnalytics.revenueBreakdown.marketplaceCommissions.amount},${data.revenueAnalytics.revenueBreakdown.marketplaceCommissions.percentage}%,${data.revenueAnalytics.revenueBreakdown.marketplaceCommissions.growthRate}%`);
    rows.push(`White Label Revenue,$${data.revenueAnalytics.revenueBreakdown.whiteLabelRevenue.amount},${data.revenueAnalytics.revenueBreakdown.whiteLabelRevenue.percentage}%,${data.revenueAnalytics.revenueBreakdown.whiteLabelRevenue.growthRate}%`);
    rows.push(`Additional Services,$${data.revenueAnalytics.revenueBreakdown.additionalServices.amount},${data.revenueAnalytics.revenueBreakdown.additionalServices.percentage}%,${data.revenueAnalytics.revenueBreakdown.additionalServices.growthRate}%`);
    rows.push('');

    // Client Revenue
    if (data.revenueAnalytics.clientRevenue.length > 0) {
      rows.push('CLIENT REVENUE ANALYSIS');
      rows.push('Client Name,Total Revenue,Monthly Revenue,Growth Rate,LTV,Profitability');
      data.revenueAnalytics.clientRevenue.forEach(client => {
        rows.push([
          client.clientName,
          `$${client.totalRevenue}`,
          `$${client.monthlyRevenue}`,
          `${client.revenueGrowth}%`,
          `$${client.ltv}`,
          `${client.profitability}%`
        ].join(','));
      });
    }
  }

  return rows.join('\n');
}

// Excel Export Functions
export function exportAnalyticsToExcel(data: AnalyticsExportData, filename: string): void {
  // For now, export as CSV with .xlsx extension
  // In production, you would use a library like xlsx or exceljs
  const csvContent = generateAnalyticsCSV(data);
  downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

// PDF Export Functions
export async function exportAnalyticsToPDF(data: AnalyticsExportData, filename: string): Promise<void> {
  const htmlContent = generateAnalyticsPDF(data);
  
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
    
    // Allow content to load before printing
    setTimeout(() => {
      newWindow.print();
    }, 1000);
  }
}

function generateAnalyticsPDF(data: AnalyticsExportData): string {
  const timestamp = new Date(data.timestamp);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Service Provider Analytics Report</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 3px solid #2563eb; 
          padding-bottom: 20px; 
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header .subtitle {
          color: #64748b;
          margin: 10px 0;
          font-size: 16px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section h2 {
          color: #1e40af;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-card { 
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .metric-title { 
          font-weight: 600; 
          color: #475569; 
          font-size: 14px;
          margin-bottom: 8px;
        }
        .metric-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #1e40af;
          margin-bottom: 4px;
        }
        .metric-growth {
          font-size: 12px;
          color: #059669;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
          background: white;
        }
        th, td { 
          border: 1px solid #e2e8f0; 
          padding: 12px 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f1f5f9; 
          font-weight: 600;
          color: #334155;
        }
        .insights {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Service Provider Analytics Report</h1>
        <div class="subtitle">
          <strong>Generated:</strong> ${timestamp.toLocaleString()}<br>
          <strong>Organization:</strong> ${data.organizationId}<br>
          <strong>Time Range:</strong> ${data.timeRange} | <strong>Export Type:</strong> ${data.exportType}
        </div>
      </div>

      ${data.serviceProviderMetrics ? `
      <div class="section">
        <h2>Service Provider Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Total Clients</div>
            <div class="metric-value">${data.serviceProviderMetrics.totalClients}</div>
            <div class="metric-growth">+${data.serviceProviderMetrics.growthMetrics.clientGrowthRate.toFixed(1)}% growth</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Revenue</div>
            <div class="metric-value">$${data.serviceProviderMetrics.totalRevenue.toLocaleString()}</div>
            <div class="metric-growth">+${data.serviceProviderMetrics.growthMetrics.revenueGrowthRate.toFixed(1)}% growth</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Active Campaigns</div>
            <div class="metric-value">${data.serviceProviderMetrics.activeCampaigns}</div>
            <div class="metric-growth">of ${data.serviceProviderMetrics.totalCampaigns} total</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Team Utilization</div>
            <div class="metric-value">${data.serviceProviderMetrics.teamUtilization}%</div>
            <div class="metric-growth">Satisfaction: ${data.serviceProviderMetrics.avgClientSatisfaction.toFixed(1)}/5.0</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${data.crossClientAnalytics ? `
      <div class="section">
        <h2>Cross-Client Performance</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Total Content</div>
            <div class="metric-value">${data.crossClientAnalytics.aggregateMetrics.totalContent}</div>
            <div class="metric-growth">${data.crossClientAnalytics.aggregateMetrics.totalPublishedContent} published</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Average Engagement</div>
            <div class="metric-value">${data.crossClientAnalytics.aggregateMetrics.averageEngagement.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Views</div>
            <div class="metric-value">${data.crossClientAnalytics.aggregateMetrics.totalViews.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Conversion Rate</div>
            <div class="metric-value">${data.crossClientAnalytics.aggregateMetrics.averageConversionRate.toFixed(1)}%</div>
          </div>
        </div>

        ${data.crossClientAnalytics.clientAnalytics.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Type</th>
              <th>Content</th>
              <th>Engagement</th>
              <th>Views</th>
              <th>Conversion</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${data.crossClientAnalytics.clientAnalytics.map(client => `
              <tr>
                <td><strong>${client.clientName}</strong></td>
                <td>${client.clientType}</td>
                <td>${client.contentMetrics.totalContent}</td>
                <td>${client.contentMetrics.avgEngagementRate.toFixed(1)}%</td>
                <td>${client.contentMetrics.totalViews.toLocaleString()}</td>
                <td>${client.contentMetrics.conversionRate.toFixed(1)}%</td>
                <td>${client.performanceScore.toFixed(1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}
      </div>
      ` : ''}

      ${data.revenueAnalytics ? `
      <div class="section">
        <h2>Revenue Analytics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Monthly Recurring Revenue</div>
            <div class="metric-value">$${data.revenueAnalytics.revenueMetrics.mrr.toLocaleString()}</div>
            <div class="metric-growth">ARR: $${data.revenueAnalytics.revenueMetrics.arr.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Client Lifetime Value</div>
            <div class="metric-value">$${data.revenueAnalytics.revenueMetrics.clientLTV.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Churn Rate</div>
            <div class="metric-value">${data.revenueAnalytics.revenueMetrics.churnRate.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Profit Margin</div>
            <div class="metric-value">${data.revenueAnalytics.revenueMetrics.profitMargin.toFixed(1)}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Revenue Stream</th>
              <th>Amount</th>
              <th>Percentage</th>
              <th>Growth Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Subscription Revenue</td>
              <td>$${data.revenueAnalytics.revenueBreakdown.subscriptionRevenue.amount.toLocaleString()}</td>
              <td>${data.revenueAnalytics.revenueBreakdown.subscriptionRevenue.percentage.toFixed(1)}%</td>
              <td>+${data.revenueAnalytics.revenueBreakdown.subscriptionRevenue.growthRate.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Marketplace Commissions</td>
              <td>$${data.revenueAnalytics.revenueBreakdown.marketplaceCommissions.amount.toLocaleString()}</td>
              <td>${data.revenueAnalytics.revenueBreakdown.marketplaceCommissions.percentage.toFixed(1)}%</td>
              <td>+${data.revenueAnalytics.revenueBreakdown.marketplaceCommissions.growthRate.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>White Label Revenue</td>
              <td>$${data.revenueAnalytics.revenueBreakdown.whiteLabelRevenue.amount.toLocaleString()}</td>
              <td>${data.revenueAnalytics.revenueBreakdown.whiteLabelRevenue.percentage.toFixed(1)}%</td>
              <td>+${data.revenueAnalytics.revenueBreakdown.whiteLabelRevenue.growthRate.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Additional Services</td>
              <td>$${data.revenueAnalytics.revenueBreakdown.additionalServices.amount.toLocaleString()}</td>
              <td>${data.revenueAnalytics.revenueBreakdown.additionalServices.percentage.toFixed(1)}%</td>
              <td>+${data.revenueAnalytics.revenueBreakdown.additionalServices.growthRate.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <strong>ThriveSend Service Provider Analytics Platform</strong><br>
        B2B2G Analytics & Business Intelligence Solution<br>
        Report generated on ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;
}

// Utility function to download files
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}