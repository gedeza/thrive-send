/**
 * Dashboard Text Constants
 * Centralized text constants for revenue dashboard components
 * This enables easy internationalization and consistent messaging
 */

export const REVENUE_DASHBOARD_TEXT = {
  // Main Headers
  TITLE: 'Revenue Dashboard',
  SUBTITLE: 'Track your marketplace revenue and client spending across all boost purchases',
  
  // Metric Cards
  METRICS: {
    REVENUE_TITLE: 'Revenue',
    AVERAGE_ORDER_VALUE: 'Average Order Value',
    ACTIVE_BOOSTS: 'Active Boosts', 
    CLIENT_RETENTION: 'Client Retention',
    TOTAL_REVENUE: 'Total Revenue',
    MONTHLY_REVENUE: 'Monthly Revenue',
    QUARTERLY_REVENUE: 'Quarterly Revenue',
    YEARLY_REVENUE: 'Yearly Revenue',
  },

  // Time Periods
  TIME_PERIODS: {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly', 
    YEARLY: 'Yearly',
    ALL_TIME: 'All Time',
    LAST_7_DAYS: 'Last 7 days',
    LAST_30_DAYS: 'Last 30 days',
    LAST_90_DAYS: 'Last 90 days',
    LAST_YEAR: 'Last year',
  },

  // Chart Sections
  CHARTS: {
    REVENUE_TRENDS: 'Revenue Trends',
    REVENUE_BY_CATEGORY: 'Revenue by Category',
    TREND_PLACEHOLDER: 'Revenue trend chart would be displayed here',
    TREND_SUBTITLE: 'Integration with Chart.js or Recharts',
    CATEGORY_PLACEHOLDER: 'Category breakdown chart would be displayed here',
    CATEGORY_EXAMPLE: 'Government: 45% • Business: 35% • Startup: 20%',
  },

  // Table Headers
  TABLES: {
    TOP_CLIENTS: 'Top Clients by Revenue',
    TOP_PRODUCTS: 'Top Products by Revenue',
    VIEW_ALL: 'View All',
    SHOW_LESS: 'Show Less',
    SHOWING_COUNT: (current: number, total: number) => `Showing ${current} of ${total}`,
    ORDERS: 'orders',
    LAST_PURCHASE: 'Last',
    ROI: 'ROI',
    UNITS_SOLD: 'units sold',
    AVERAGE_PRICE: 'Avg',
    PROFIT_MARGIN: 'Margin',
    PROFIT: 'profit',
  },

  // Client Status
  CLIENT_STATUS: {
    HIGH_VALUE: 'high value',
    GROWING: 'growing',
    STABLE: 'stable', 
    AT_RISK: 'at risk',
  },

  // Product Popularity
  PRODUCT_POPULARITY: {
    BESTSELLER: 'bestseller',
    HOT: 'hot',
    TRENDING: 'trending',
    NEW: 'new',
  },

  // Insights
  INSIGHTS: {
    HEADER: 'Revenue Insights',
    GROWING_SEGMENTS: 'Growing Segments',
    GROWING_SEGMENTS_DESC: 'Municipal clients show 28% growth this quarter',
    BEST_PERFORMERS: 'Best Performers', 
    BEST_PERFORMERS_DESC: 'Premium boosts have 72% profit margin',
    CLIENT_HEALTH: 'Client Health',
    CLIENT_HEALTH_DESC: '94.2% retention rate across all client types',
  },

  // Actions
  ACTIONS: {
    REFRESH: 'Refresh',
    EXPORT_REPORT: 'Export Report',
    REFRESH_DATA: 'Refresh Data',
  },

  // Error States
  ERRORS: {
    DATA_UNAVAILABLE: 'Revenue Data Unavailable',
    UNABLE_TO_LOAD: 'Unable to load revenue data. Please try refreshing or contact support.',
    RETRY: 'Try Again',
  },

  // Revenue Streams
  REVENUE_STREAMS: {
    HEADER: 'Revenue Streams',
    CLIENT_REVENUE: 'Client Revenue',
    MARKETPLACE_REVENUE: 'Marketplace Revenue', 
    AVERAGE_PER_CLIENT: 'Average per Client',
    GROWTH: 'growth',
  },

  // Time-based labels
  TIME_LABELS: {
    VS_LAST: (period: string) => `vs last ${period}`,
    VS_LAST_MONTH: 'vs last month',
    VS_LAST_QUARTER: 'vs last quarter',
    PER_MONTH: '/month',
    TOTAL: 'total',
    OF: 'of',
  },
} as const;

// Semantic color class mappings to replace hardcoded Tailwind colors
// Using actual Tailwind classes that correspond to CSS custom properties
export const SEMANTIC_COLORS = {
  CLIENT_STATUS: {
    'high-value': 'bg-secondary/20 text-secondary-foreground border-secondary/30',
    'growing': 'bg-primary/20 text-primary-foreground border-primary/30', 
    'stable': 'bg-accent/20 text-accent-foreground border-accent/30',
    'at-risk': 'bg-destructive/20 text-destructive-foreground border-destructive/30',
  },
  METRICS: {
    REVENUE: 'bg-secondary/10 text-secondary-foreground',
    GROWTH: 'bg-secondary/10 text-secondary-foreground', 
    NEUTRAL: 'bg-muted text-muted-foreground',
    DECLINE: 'bg-destructive/10 text-destructive-foreground',
  },
  INSIGHTS: {
    GROWING: 'bg-secondary/10 text-secondary-foreground',
    PERFORMING: 'bg-primary/10 text-primary-foreground',
    HEALTH: 'bg-accent/10 text-accent-foreground',
  },
} as const;

export type DashboardTextKeys = typeof REVENUE_DASHBOARD_TEXT;
export type SemanticColorKeys = typeof SEMANTIC_COLORS;