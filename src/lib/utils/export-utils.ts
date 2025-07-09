import { format } from 'date-fns';

interface ExportData {
  metrics: any;
  chartData: any;
  audienceData: any;
  engagementData: any;
  revenueData: any;
  filters: {
    timeframe: string;
    dateRange: any;
    campaign: string;
    platform: string;
  };
}

export function generateCSV(data: ExportData): string {
  const headers = [
    'Metric',
    'Value',
    'Change %',
    'Period',
    'Platform',
    'Campaign'
  ];

  const rows = [
    headers.join(','),
    // Metrics
    `Total Views,${data.metrics.totalViews},"${data.metrics.viewsChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`,
    `Total Reach,${data.metrics.totalReach},"${data.metrics.reachChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`,
    `Total Conversions,${data.metrics.totalConversions},"${data.metrics.conversionsChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`,
    `Engagement Rate,"${data.metrics.engagementRate}","${data.metrics.engagementChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`,
    // Revenue
    `Total Revenue,"${data.revenueData.totalRevenue}","${data.revenueData.revenueChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`,
    `Conversion Rate,"${data.revenueData.conversionRate}","${data.revenueData.conversionChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`,
    `Avg Order Value,"${data.revenueData.avgOrderValue}","${data.revenueData.aovChange || 0}%","${data.filters.timeframe}","${data.filters.platform}","${data.filters.campaign}"`
  ];

  // Add performance trend data
  if (data.chartData.performanceTrend) {
    rows.push('', 'Performance Trend Data');
    rows.push('Date,Views,Engagement,Conversions,Reach');
    data.chartData.performanceTrend.forEach((item: any) => {
      rows.push(`"${item.name}",${item.views},${item.engagement},${item.conversions},${item.reach}`);
    });
  }

  // Add platform performance data
  if (data.chartData.platformPerformance) {
    rows.push('', 'Platform Performance Data');
    rows.push('Platform,Views');
    data.chartData.platformPerformance.forEach((item: any) => {
      rows.push(`"${item.name}",${item.value}`);
    });
  }

  // Add audience data
  if (data.audienceData.deviceDistribution) {
    rows.push('', 'Device Distribution');
    rows.push('Device,Count');
    data.audienceData.deviceDistribution.forEach((item: any) => {
      rows.push(`"${item.name}",${item.value}`);
    });
  }

  return rows.join('\n');
}

export function downloadCSV(data: ExportData, filename?: string): void {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function generatePDF(data: ExportData): Promise<void> {
  // For PDF generation, we would typically use libraries like jsPDF or react-pdf
  // For now, we'll create a simplified HTML version that can be printed to PDF
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric-title { font-weight: bold; color: #666; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-change { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .positive { color: green; }
        .negative { color: red; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Analytics Report</h1>
        <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'HH:mm')}</p>
        <p>Period: ${data.filters.timeframe} | Platform: ${data.filters.platform} | Campaign: ${data.filters.campaign}</p>
      </div>

      <div class="section">
        <h2>Key Metrics</h2>
        <div class="metric">
          <div class="metric-title">Total Views</div>
          <div class="metric-value">${data.metrics.totalViews.toLocaleString()}</div>
          <div class="metric-change ${(data.metrics.viewsChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.metrics.viewsChange || 0) >= 0 ? '+' : ''}${(data.metrics.viewsChange || 0).toFixed(1)}%
          </div>
        </div>
        <div class="metric">
          <div class="metric-title">Total Reach</div>
          <div class="metric-value">${data.metrics.totalReach.toLocaleString()}</div>
          <div class="metric-change ${(data.metrics.reachChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.metrics.reachChange || 0) >= 0 ? '+' : ''}${(data.metrics.reachChange || 0).toFixed(1)}%
          </div>
        </div>
        <div class="metric">
          <div class="metric-title">Conversions</div>
          <div class="metric-value">${data.metrics.totalConversions.toLocaleString()}</div>
          <div class="metric-change ${(data.metrics.conversionsChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.metrics.conversionsChange || 0) >= 0 ? '+' : ''}${(data.metrics.conversionsChange || 0).toFixed(1)}%
          </div>
        </div>
        <div class="metric">
          <div class="metric-title">Engagement Rate</div>
          <div class="metric-value">${data.metrics.engagementRate}</div>
          <div class="metric-change ${(data.metrics.engagementChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.metrics.engagementChange || 0) >= 0 ? '+' : ''}${(data.metrics.engagementChange || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Revenue Metrics</h2>
        <div class="metric">
          <div class="metric-title">Total Revenue</div>
          <div class="metric-value">${data.revenueData.totalRevenue}</div>
          <div class="metric-change ${(data.revenueData.revenueChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.revenueData.revenueChange || 0) >= 0 ? '+' : ''}${(data.revenueData.revenueChange || 0).toFixed(1)}%
          </div>
        </div>
        <div class="metric">
          <div class="metric-title">Conversion Rate</div>
          <div class="metric-value">${data.revenueData.conversionRate}</div>
          <div class="metric-change ${(data.revenueData.conversionChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.revenueData.conversionChange || 0) >= 0 ? '+' : ''}${(data.revenueData.conversionChange || 0).toFixed(1)}%
          </div>
        </div>
        <div class="metric">
          <div class="metric-title">Avg Order Value</div>
          <div class="metric-value">${data.revenueData.avgOrderValue}</div>
          <div class="metric-change ${(data.revenueData.aovChange || 0) >= 0 ? 'positive' : 'negative'}">
            ${(data.revenueData.aovChange || 0) >= 0 ? '+' : ''}${(data.revenueData.aovChange || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      ${data.chartData.performanceTrend ? `
      <div class="section">
        <h2>Performance Trend</h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Views</th><th>Engagement</th><th>Conversions</th><th>Reach</th></tr>
          </thead>
          <tbody>
            ${data.chartData.performanceTrend.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.views.toLocaleString()}</td>
                <td>${item.engagement.toLocaleString()}</td>
                <td>${item.conversions.toLocaleString()}</td>
                <td>${item.reach.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${data.chartData.platformPerformance ? `
      <div class="section">
        <h2>Platform Performance</h2>
        <table>
          <thead>
            <tr><th>Platform</th><th>Views</th></tr>
          </thead>
          <tbody>
            ${data.chartData.platformPerformance.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.value.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${data.audienceData.deviceDistribution ? `
      <div class="section">
        <h2>Device Distribution</h2>
        <table>
          <thead>
            <tr><th>Device</th><th>Count</th></tr>
          </thead>
          <tbody>
            ${data.audienceData.deviceDistribution.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.value.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
    
    // Allow the content to load before printing
    setTimeout(() => {
      newWindow.print();
    }, 1000);
  }
}

export async function downloadPDF(data: ExportData, filename?: string): Promise<void> {
  await generatePDF(data);
}