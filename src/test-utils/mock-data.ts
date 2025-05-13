// Mock data for analytics dashboard tests

export const mockMetrics = [
  { key: 'visitors', label: 'Total Visitors', value: 12500 },
  { key: 'pageViews', label: 'Page Views', value: 48300 },
  { key: 'conversionRate', label: 'Conversion Rate', value: 3.2 },
  { key: 'avgTimeOnSite', label: 'Avg. Time on Site', value: 3.5 }
];

export const mockDateRange = {
  start: new Date('2023-01-01'),
  end: new Date('2023-01-31')
};

// Additional mock data that might be used in other tests
export const mockFilters = {
  category: 'web',
  source: 'direct'
};

export const mockChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Visitors',
      data: [150, 230, 180, 290, 410, 380, 320]
    }
  ]
};