/**
 * Analytics Types for ThriveSend B2B2G Service Provider Platform
 * Based on Analytics TDD v2.0.0 - PRD Compliant
 */

// Core Analytics Types
export interface ServiceProviderMetrics {
  organizationId: string;
  totalClients: number;
  activeClients: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  marketplaceRevenue: number;
  teamUtilization: number;
  avgClientSatisfaction: number;
  growthMetrics: GrowthMetrics;
  updatedAt: Date;
}

export interface GrowthMetrics {
  clientGrowthRate: number;
  revenueGrowthRate: number;
  retentionRate: number;
  acquisitionRate: number;
  churnRate: number;
}

// Cross-Client Analytics Types
export interface CrossClientAnalytics {
  organizationId: string;
  aggregateMetrics: AggregateMetrics;
  clientAnalytics: ServiceProviderClientAnalytics[];
  clientRankings: ClientRankings;
  contentTypeDistribution: Record<string, number>;
  platformDistribution: Record<string, number>;
  insights: AnalyticsInsight[];
  trendAnalysis: TrendAnalysis[];
}

export interface AggregateMetrics {
  totalClients: number;
  totalContent: number;
  totalPublishedContent: number;
  averageEngagement: number;
  totalViews: number;
  totalClicks: number;
  averageConversionRate: number;
}

export interface ServiceProviderClientAnalytics {
  clientId: string;
  clientName: string;
  clientType: 'municipality' | 'business' | 'startup' | 'nonprofit';
  contentMetrics: ContentMetrics;
  engagementMetrics: EngagementMetrics;
  performanceScore: number;
  healthIndicators: ClientHealthIndicators;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface ContentMetrics {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  avgEngagementRate: number;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  contentTypeBreakdown: Record<string, number>;
}

export interface EngagementMetrics {
  engagementRate: number;
  engagementGrowth: number;
  averageEngagementPerPost: number;
  peakEngagementTimes: TimeSlot[];
  engagementByPlatform: Record<string, number>;
  audienceGrowthRate: number;
}

export interface TimeSlot {
  hour: number;
  day: string;
  engagementRate: number;
}

// Client Performance & Rankings
export interface ClientRankings {
  byEngagement: ClientRanking[];
  byGrowth: ClientRanking[];
  byRevenue: ClientRanking[];
  byOverallPerformance: ClientRanking[];
}

export interface ClientRanking {
  clientId: string;
  clientName: string;
  rank: number;
  score: number;
  previousRank?: number;
  rankChange: number;
  performanceIndicators: PerformanceIndicator[];
}

export interface PerformanceIndicator {
  metric: string;
  value: number;
  benchmark: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  trend: 'improving' | 'declining' | 'stable';
}

export interface ClientHealthIndicators {
  healthScore: number; // 0-100
  riskFactors: RiskFactor[];
  opportunities: Opportunity[];
  retentionRisk: 'low' | 'medium' | 'high';
  satisfactionScore: number;
  engagementTrend: TrendDirection;
}

export interface RiskFactor {
  type: 'engagement_decline' | 'low_satisfaction' | 'billing_issues' | 'communication_gap';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendedActions: string[];
}

export interface Opportunity {
  type: 'upsell' | 'cross_sell' | 'service_expansion' | 'performance_improvement';
  potentialValue: number;
  probability: number;
  description: string;
  actionPlan: string[];
}

// Revenue Analytics Types
export interface RevenueAnalytics {
  organizationId: string;
  revenueMetrics: RevenueMetrics;
  revenueBreakdown: RevenueBreakdown;
  clientRevenue: ClientRevenueAnalytics[];
  profitabilityAnalysis: ProfitabilityMetrics;
  revenueForecasting: RevenueForecast[];
  businessIntelligence: BusinessIntelligenceInsights;
}

export interface RevenueMetrics {
  totalRevenue: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  clientLTV: number; // Customer Lifetime Value
  churnRate: number;
  revenueGrowthRate: number;
  revenuePerClient: number;
  profitMargin: number;
}

export interface RevenueBreakdown {
  subscriptionRevenue: RevenueStream;
  marketplaceCommissions: RevenueStream;
  whiteLabelRevenue: RevenueStream;
  additionalServices: RevenueStream;
  totalRevenue: number;
}

export interface RevenueStream {
  amount: number;
  percentage: number;
  growthRate: number;
  trend: TrendDirection;
  forecasting: number[];
}

export interface ClientRevenueAnalytics {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  profitability: number;
  ltv: number;
  acquisitionCost: number;
  retentionProbability: number;
}

export interface ProfitabilityMetrics {
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  clientAcquisitionCost: number;
  operatingExpenses: ExpenseBreakdown;
  profitByClient: ClientProfitability[];
  profitForecasting: ProfitForecast[];
}

export interface ExpenseBreakdown {
  salaries: number;
  marketing: number;
  technology: number;
  overhead: number;
  total: number;
}

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
}

export interface ProfitForecast {
  month: string;
  projectedProfit: number;
  confidence: number;
}

export interface RevenueForecast {
  month: string;
  projectedRevenue: number;
  confidence: number;
  factors: string[];
}

export interface BusinessIntelligenceInsights {
  upsellOpportunities: UpsellOpportunity[];
  churnRiskAssessment: ChurnRiskClient[];
  marketExpansionOpportunities: MarketOpportunity[];
  competitivePositioning: CompetitiveAnalysis;
  profitabilityOptimization: ProfitabilityRecommendation[];
}

export interface UpsellOpportunity {
  clientId: string;
  clientName: string;
  opportunityType: string;
  potentialValue: number;
  probability: number;
  timeframe: string;
  requiredActions: string[];
}

export interface ChurnRiskClient {
  clientId: string;
  clientName: string;
  churnRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  riskFactors: string[];
  retentionActions: string[];
}

export interface MarketOpportunity {
  market: string;
  opportunitySize: number;
  competitiveness: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
  timeline: string;
}

export interface CompetitiveAnalysis {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ProfitabilityRecommendation {
  type: 'cost_reduction' | 'revenue_increase' | 'efficiency_improvement';
  description: string;
  potentialImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
}

// Common Types
export type TrendDirection = 'up' | 'down' | 'stable';

export interface AnalyticsInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  recommendedActions?: string[];
}

export interface TrendAnalysis {
  metric: string;
  trend: TrendDirection;
  changePercent: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

// API Request/Response Types
export interface ServiceProviderAnalyticsRequest {
  organizationId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeForecasting?: boolean;
  metrics?: string[];
}

export interface CrossClientAnalyticsRequest {
  organizationId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  compareClients?: boolean;
  metrics?: string[];
}

export interface ClientComparisonRequest {
  organizationId: string;
  clientIds: string[];
  timeRange: '7d' | '30d' | '90d' | '1y';
  metrics: string[];
}

export interface RevenueAnalyticsRequest {
  organizationId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeForecasting?: boolean;
}

// Component Props Types
export interface ServiceProviderAnalyticsDashboardProps {
  organizationId: string;
  defaultTimeRange?: '7d' | '30d' | '90d' | '1y';
  initialView?: 'overview' | 'cross-client' | 'revenue' | 'rankings';
}

export interface CrossClientAnalyticsProps {
  organizationId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  selectedClients?: string[];
  onClientSelect?: (clientId: string) => void;
}

export interface ClientPerformanceRankingsProps {
  organizationId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  rankingType?: 'overall' | 'engagement' | 'growth' | 'revenue';
  onClientSelect?: (clientId: string) => void;
}

export interface RevenueAnalyticsDashboardProps {
  organizationId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  view?: 'overview' | 'breakdown' | 'forecasting' | 'profitability';
}

// Export Types
export interface AnalyticsExportData {
  serviceProviderMetrics?: ServiceProviderMetrics;
  crossClientAnalytics?: CrossClientAnalytics;
  revenueAnalytics?: RevenueAnalytics;
  timestamp: string;
  organizationId: string;
  timeRange: string;
  exportType: 'full' | 'summary' | 'custom';
}

export interface ExportConfiguration {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  customBranding?: BrandingConfiguration;
  sections: ExportSection[];
}

export interface ExportSection {
  type: 'overview' | 'cross-client' | 'revenue' | 'rankings' | 'insights';
  included: boolean;
  customization?: Record<string, any>;
}

export interface BrandingConfiguration {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string;
  headerText?: string;
  footerText?: string;
}