/**
 * Standardized Analytics Metrics Calculator
 * Ensures consistent metric calculations across all endpoints
 */

export interface RawAnalyticsData {
  id: string;
  views: number;
  impressions: number;
  clicks: number;
  engagements: number;
  conversions: number;
  revenue: number;
  likes: number;
  shares: number;
  comments: number;
  reachCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  conversionRate: number;
  engagementRate: number;
  createdAt: Date;
  campaignId?: string;
  clientId: string;
}

export interface CalculatedMetrics {
  // Basic metrics
  views: number;
  impressions: number;
  clicks: number;
  engagements: number;
  conversions: number;
  revenue: number;
  
  // Engagement metrics
  likes: number;
  shares: number;
  comments: number;
  totalEngagements: number;
  
  // Calculated rates
  clickThroughRate: number; // CTR = (clicks / impressions) * 100
  conversionRate: number; // CR = (conversions / clicks) * 100
  engagementRate: number; // ER = (engagements / impressions) * 100
  viewToConversionRate: number; // VCR = (conversions / views) * 100
  
  // Performance metrics
  costPerClick: number; // CPC = cost / clicks
  costPerConversion: number; // CPA = cost / conversions
  returnOnInvestment: number; // ROI = (revenue - cost) / cost * 100
  
  // Reach and frequency
  reach: number;
  frequency: number; // impressions / reach
  
  // Time-based metrics
  avgTimeOnSite?: number;
  bounceRate: number;
  
  // Quality scores
  qualityScore: number; // Composite score based on multiple factors
  performanceIndex: number; // Normalized performance indicator
}

/**
 * Core metrics calculator class
 */
export class AnalyticsMetricsCalculator {
  private static readonly CONSTANTS = {
    // Thresholds for performance classification
    GOOD_CTR_THRESHOLD: 2.0, // 2% CTR is considered good
    GOOD_CONVERSION_RATE_THRESHOLD: 3.0, // 3% conversion rate is good
    GOOD_ENGAGEMENT_RATE_THRESHOLD: 1.0, // 1% engagement rate is good
    
    // Default costs for calculations (can be overridden)
    DEFAULT_COST_PER_IMPRESSION: 0.005, // $0.005 CPM
    DEFAULT_COST_PER_CLICK: 0.50, // $0.50 CPC
  };

  /**
   * Calculate standardized metrics from raw analytics data
   */
  static calculateMetrics(
    data: RawAnalyticsData[],
    options: {
      costData?: { totalCost: number; costModel: 'cpm' | 'cpc' | 'cpa' };
    } = {}
  ): CalculatedMetrics {
    if (!data || data.length === 0) {
      return this.getEmptyMetrics();
    }

    // Aggregate raw data
    const aggregated = data.reduce((acc, item) => {
      acc.views += item.views;
      acc.impressions += item.impressions;
      acc.clicks += item.clicks;
      acc.engagements += item.engagements;
      acc.conversions += item.conversions;
      acc.revenue += item.revenue;
      acc.likes += item.likes;
      acc.shares += item.shares;
      acc.comments += item.comments;
      acc.reachCount += item.reachCount;
      
      return acc;
    }, {
      views: 0,
      impressions: 0,
      clicks: 0,
      engagements: 0,
      conversions: 0,
      revenue: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      reachCount: 0,
    });

    // Calculate derived metrics
    const totalEngagements = aggregated.likes + aggregated.shares + aggregated.comments;
    const clickThroughRate = this.calculateRate(aggregated.clicks, aggregated.impressions);
    const conversionRate = this.calculateRate(aggregated.conversions, aggregated.clicks);
    const engagementRate = this.calculateRate(aggregated.engagements, aggregated.impressions);
    const viewToConversionRate = this.calculateRate(aggregated.conversions, aggregated.views);
    
    // Calculate cost-based metrics
    const totalCost = this.calculateTotalCost(aggregated, options.costData);
    const costPerClick = this.calculateRate(totalCost, aggregated.clicks);
    const costPerConversion = this.calculateRate(totalCost, aggregated.conversions);
    const returnOnInvestment = this.calculateROI(aggregated.revenue, totalCost);
    
    // Calculate reach and frequency
    const reach = aggregated.reachCount || this.estimateReach(aggregated.impressions);
    const frequency = aggregated.impressions > 0 ? aggregated.impressions / reach : 0;
    
    // Calculate bounce rate (average from individual records)
    const bounceRate = data.length > 0 ? 
      data.reduce((sum, item) => sum + item.bounceRate, 0) / data.length : 0;
    
    // Calculate quality and performance scores
    const qualityScore = this.calculateQualityScore({
      clickThroughRate,
      conversionRate,
      engagementRate,
      bounceRate,
      viewToConversionRate
    });
    
    const performanceIndex = this.calculatePerformanceIndex({
      clicks: aggregated.clicks,
      conversions: aggregated.conversions,
      revenue: aggregated.revenue,
      cost: totalCost,
      impressions: aggregated.impressions
    });

    return {
      // Basic metrics
      views: aggregated.views,
      impressions: aggregated.impressions,
      clicks: aggregated.clicks,
      engagements: aggregated.engagements,
      conversions: aggregated.conversions,
      revenue: aggregated.revenue,
      
      // Engagement metrics
      likes: aggregated.likes,
      shares: aggregated.shares,
      comments: aggregated.comments,
      totalEngagements,
      
      // Calculated rates
      clickThroughRate,
      conversionRate,
      engagementRate,
      viewToConversionRate,
      
      // Performance metrics
      costPerClick,
      costPerConversion,
      returnOnInvestment,
      
      // Reach and frequency
      reach,
      frequency,
      
      // Time-based metrics
      bounceRate,
      
      // Quality scores
      qualityScore,
      performanceIndex,
    };
  }

  // Private helper methods
  private static calculateRate(numerator: number, denominator: number): number {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  }

  private static calculateTotalCost(
    data: any,
    costData?: { totalCost: number; costModel: 'cpm' | 'cpc' | 'cpa' }
  ): number {
    if (costData) {
      return costData.totalCost;
    }
    
    // Estimate cost based on default rates
    const { CONSTANTS } = this;
    return (data.impressions * CONSTANTS.DEFAULT_COST_PER_IMPRESSION) +
           (data.clicks * CONSTANTS.DEFAULT_COST_PER_CLICK);
  }

  private static calculateROI(revenue: number, cost: number): number {
    return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  }

  private static estimateReach(impressions: number): number {
    // Estimate reach as 60% of impressions (industry average)
    return Math.round(impressions * 0.6);
  }

  private static calculateQualityScore(metrics: {
    clickThroughRate: number;
    conversionRate: number;
    engagementRate: number;
    bounceRate: number;
    viewToConversionRate: number;
  }): number {
    const { CONSTANTS } = this;
    
    // Normalize metrics to 0-100 scale
    const normalizedCTR = Math.min(metrics.clickThroughRate / CONSTANTS.GOOD_CTR_THRESHOLD, 1) * 100;
    const normalizedCR = Math.min(metrics.conversionRate / CONSTANTS.GOOD_CONVERSION_RATE_THRESHOLD, 1) * 100;
    const normalizedER = Math.min(metrics.engagementRate / CONSTANTS.GOOD_ENGAGEMENT_RATE_THRESHOLD, 1) * 100;
    const normalizedBR = Math.max(0, 100 - metrics.bounceRate); // Inverted - lower bounce rate is better
    const normalizedVCR = Math.min(metrics.viewToConversionRate * 10, 100); // Scale up VCR
    
    // Calculate weighted score
    const score = (normalizedCTR + normalizedCR + normalizedER + normalizedBR + normalizedVCR) / 5;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private static calculatePerformanceIndex(metrics: {
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    impressions: number;
  }): number {
    // Performance index combines volume and efficiency
    const volumeScore = Math.log10(Math.max(1, metrics.impressions)) / 6 * 50; // Max 50 points for volume
    const efficiencyScore = metrics.cost > 0 ? Math.min(metrics.revenue / metrics.cost, 5) / 5 * 50 : 0; // Max 50 points for efficiency
    
    return Math.round(Math.max(0, Math.min(100, volumeScore + efficiencyScore)));
  }

  private static getEmptyMetrics(): CalculatedMetrics {
    return {
      views: 0,
      impressions: 0,
      clicks: 0,
      engagements: 0,
      conversions: 0,
      revenue: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      totalEngagements: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      engagementRate: 0,
      viewToConversionRate: 0,
      costPerClick: 0,
      costPerConversion: 0,
      returnOnInvestment: 0,
      reach: 0,
      frequency: 0,
      bounceRate: 0,
      qualityScore: 0,
      performanceIndex: 0,
    };
  }
}

// Export convenience functions
export const calculateMetrics = AnalyticsMetricsCalculator.calculateMetrics;