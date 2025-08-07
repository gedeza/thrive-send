/**
 * Reports Text Constants
 * Centralized text constants for reports and analytics components
 * This enables easy internationalization and consistent messaging
 */

export const REPORTS_TEXT = {
  // Main Headers
  TITLE: 'Advanced Reports',
  SUBTITLE: 'Generate comprehensive analytics reports, schedule automated delivery, and gain deep insights across all your clients',
  
  // Navigation Tabs
  TABS: {
    OVERVIEW: 'Overview',
    ANALYTICS: 'Analytics', 
    AUTOMATION: 'Automation',
    TEMPLATES: 'Templates',
  },

  // Statistics Cards
  STATS: {
    TOTAL_REPORTS: 'Total Reports',
    SCHEDULED_REPORTS: 'Scheduled Reports',
    TEMPLATES_AVAILABLE: 'Templates Available', 
    REPORTS_GENERATED: 'Reports Generated',
    THIS_MONTH: 'This Month',
    ACTIVE_SCHEDULES: 'Active Schedules',
  },

  // Report Types
  REPORT_TYPES: {
    PERFORMANCE: 'Performance',
    REVENUE: 'Revenue',
    ENGAGEMENT: 'Engagement', 
    CROSS_CLIENT: 'Cross-Client',
    CUSTOM: 'Custom',
  },

  // Report Status
  STATUS: {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    GENERATING: 'Generating',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  },

  // Report Formats
  FORMATS: {
    PDF: 'PDF',
    EXCEL: 'Excel',
    CSV: 'CSV', 
    JSON: 'JSON',
  },

  // Frequency Options
  FREQUENCY: {
    ONCE: 'Once',
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
  },

  // Actions
  ACTIONS: {
    CREATE_REPORT: 'Create Report',
    DOWNLOAD: 'Download',
    DELETE: 'Delete',
    DUPLICATE: 'Duplicate',
    SCHEDULE: 'Schedule',
    GENERATE: 'Generate',
    REFRESH: 'Refresh',
    EXPORT: 'Export',
    FILTER: 'Filter',
    SEARCH: 'Search',
    VIEW_ALL: 'View All',
    SHOW_LESS: 'Show Less',
    USE_TEMPLATE: 'Use Template',
    PREVIEW: 'Preview',
    EDIT: 'Edit',
    SHARE: 'Share',
    BOOKMARK: 'Bookmark',
  },

  // Forms & Inputs
  FORMS: {
    REPORT_TITLE: 'Report Title',
    ENTER_REPORT_TITLE: 'Enter report title',
    REPORT_DESCRIPTION: 'Report Description',
    DESCRIBE_REPORT: 'Describe what this report will analyze',
    SELECT_TYPE: 'Select type',
    SELECT_FORMAT: 'Select format',
    SELECT_FREQUENCY: 'Select frequency',
    DATE_RANGE: 'Date Range',
    CLIENTS: 'Clients',
    METRICS: 'Metrics',
    INCLUDE_CHARTS: 'Include Charts',
    INCLUDE_RAW_DATA: 'Include Raw Data',
  },

  // Filter & Search
  FILTERS: {
    ALL_TYPES: 'All Types',
    ALL_STATUS: 'All Status',
    SORT_BY: 'Sort by',
    SEARCH_REPORTS: 'Search reports...',
    FILTER_BY_TYPE: 'Filter by type',
    FILTER_BY_STATUS: 'Filter by status',
  },

  // Empty States
  EMPTY_STATES: {
    NO_REPORTS_FOUND: 'No reports found',
    NO_REPORTS_DESCRIPTION: 'Try adjusting your search criteria or create a new report',
    NO_SCHEDULED_REPORTS: 'No scheduled reports',
    NO_TEMPLATES: 'No templates available',
    CREATE_FIRST_REPORT: 'Create your first report to get started',
  },

  // Analytics Specific
  ANALYTICS: {
    CROSS_CLIENT_TITLE: 'Cross-Client Analytics',
    CROSS_CLIENT_SUBTITLE: 'Compare performance metrics across all your clients',
    CLIENT_PERFORMANCE: 'Client Performance',
    PERFORMANCE_METRICS: 'Performance Metrics',
    ENGAGEMENT_OVERVIEW: 'Engagement Overview',
    TOP_PERFORMERS: 'Top Performers',
    IMPROVEMENT_OPPORTUNITIES: 'Improvement Opportunities',
    CLIENT_COMPARISON: 'Client Comparison',
    METRICS_COMPARISON: 'Metrics Comparison',
    TOTAL_POSTS: 'Total Posts',
    AVERAGE_ENGAGEMENT: 'Average Engagement',
    FOLLOWER_GROWTH: 'Follower Growth',
    REACH_RATE: 'Reach Rate',
    CLICK_THROUGH_RATE: 'Click Through Rate',
    CONVERSION_RATE: 'Conversion Rate',
    LEADS_GENERATED: 'Leads Generated',
    REVENUE_ATTRIBUTED: 'Revenue Attributed',
  },

  // Insights & Recommendations
  INSIGHTS: {
    KEY_INSIGHTS: 'Key Insights',
    RECOMMENDATIONS: 'Recommendations',
    TRENDS: 'Trends',
    OPPORTUNITIES: 'Opportunities',
    PERFORMANCE_HIGHLIGHTS: 'Performance Highlights',
    TOP_PERFORMER: 'Top Performer',
    HIGHEST_ENGAGEMENT: 'Highest Engagement',
    BEST_GROWTH: 'Best Growth',
    NEEDS_ATTENTION: 'Needs Attention',
    IMPROVEMENT_POTENTIAL: 'Improvement Potential',
  },

  // Time Periods
  TIME_PERIODS: {
    LAST_7_DAYS: 'Last 7 days',
    LAST_30_DAYS: 'Last 30 days', 
    LAST_90_DAYS: 'Last 90 days',
    LAST_6_MONTHS: 'Last 6 months',
    LAST_YEAR: 'Last year',
    ALL_TIME: 'All time',
    CUSTOM_RANGE: 'Custom range',
    THIS_WEEK: 'This week',
    THIS_MONTH: 'This month',
    THIS_QUARTER: 'This quarter',
  },

  // Client Types
  CLIENT_TYPES: {
    MUNICIPALITY: 'Municipality',
    GOVERNMENT: 'Government',
    BUSINESS: 'Business',
    STARTUP: 'Startup',
    NONPROFIT: 'Nonprofit',
    ENTERPRISE: 'Enterprise',
  },

  // Error Messages
  ERRORS: {
    REPORTS_UNAVAILABLE: 'Reports Unavailable',
    UNABLE_TO_LOAD: 'Unable to load reports. Please try refreshing or contact support.',
    GENERATION_FAILED: 'Report generation failed',
    DOWNLOAD_FAILED: 'Download failed',
    INVALID_FORMAT: 'Invalid report format',
    NO_DATA_AVAILABLE: 'No data available for selected criteria',
  },

  // Success Messages
  SUCCESS: {
    REPORT_CREATED: 'Report created successfully',
    REPORT_SCHEDULED: 'Report scheduled successfully', 
    REPORT_DOWNLOADED: 'Report downloaded successfully',
    REPORT_DELETED: 'Report deleted successfully',
    REPORT_DUPLICATED: 'Report duplicated successfully',
    TEMPLATE_APPLIED: 'Template applied successfully',
  },

  // Loading States
  LOADING: {
    GENERATING_REPORT: 'Generating report...',
    LOADING_REPORTS: 'Loading reports...',
    PROCESSING: 'Processing...',
    ANALYZING_DATA: 'Analyzing data...',
    PREPARING_DOWNLOAD: 'Preparing download...',
  },

  // Accessibility Labels
  ARIA: {
    DOWNLOAD_REPORT: (title: string) => `Download ${title} report`,
    DELETE_REPORT: (title: string) => `Delete ${title} report`,
    DUPLICATE_REPORT: (title: string) => `Duplicate ${title} report`,
    VIEW_REPORT: (title: string) => `View ${title} report details`,
    FILTER_REPORTS: 'Filter reports by criteria',
    SEARCH_REPORTS: 'Search through reports',
    REPORT_STATUS: (status: string) => `Report status: ${status}`,
    REPORT_TYPE: (type: string) => `Report type: ${type}`,
    SORT_REPORTS: 'Sort reports by different criteria',
    CLIENT_METRICS: (client: string) => `Performance metrics for ${client}`,
  },
} as const;

// Semantic color class mappings for reports
export const REPORTS_COLORS = {
  STATUS: {
    'draft': 'bg-muted text-muted-foreground border-muted',
    'scheduled': 'bg-primary/20 text-primary-foreground border-primary/30',
    'generating': 'bg-accent/20 text-accent-foreground border-accent/30',
    'completed': 'bg-secondary/20 text-secondary-foreground border-secondary/30',
    'failed': 'bg-destructive/20 text-destructive-foreground border-destructive/30',
  },
  REPORT_TYPES: {
    'performance': 'bg-primary/10 text-primary-foreground',
    'revenue': 'bg-secondary/10 text-secondary-foreground',
    'engagement': 'bg-accent/10 text-accent-foreground', 
    'cross-client': 'bg-muted text-muted-foreground',
    'custom': 'bg-primary/15 text-primary-foreground',
  },
  INSIGHTS: {
    POSITIVE: 'bg-secondary/10 text-secondary-foreground',
    NEUTRAL: 'bg-muted text-muted-foreground',
    ATTENTION: 'bg-accent/10 text-accent-foreground',
    NEGATIVE: 'bg-destructive/10 text-destructive-foreground',
  },
} as const;

export type ReportsTextKeys = typeof REPORTS_TEXT;
export type ReportsColorKeys = typeof REPORTS_COLORS;