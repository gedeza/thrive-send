import { ContentData } from './content-service';
import { 
  getPerformanceConfig, 
  getContentTypeWeights, 
  getPerformanceLevel, 
  getPerformanceColor,
  getPerformanceLabel 
} from '@/lib/config/performance-thresholds';

// Analytics data structure for content items
export interface ContentAnalytics {
  id: string;
  contentId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  conversionRate: number;
  reachCount: number;
  impressions: number;
  clickThroughRate: number;
  updatedAt: string;
}

// Enhanced content data with analytics
export interface ContentWithAnalytics extends ContentData {
  analytics?: ContentAnalytics;
  performanceScore?: number;
  trending?: boolean;
}

// Fetch analytics for a single content item
export async function getContentAnalytics(contentId: string): Promise<ContentAnalytics | null> {
  try {
    const response = await fetch(`/api/content/${contentId}/analytics`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No analytics data yet
      }
      throw new Error(`Analytics API error: ${response.status}`);
    }
    return await response.json();
  } catch (_error) {
    console.warn(`Failed to fetch analytics for content ${contentId}:`, error);
    return null;
  }
}

// Fetch analytics for multiple content items
export async function getBulkContentAnalytics(contentIds: string[]): Promise<Record<string, ContentAnalytics>> {
  try {
    const response = await fetch('/api/content/analytics/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentIds }),
    });
    
    if (!response.ok) {
      throw new Error(`Bulk analytics API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.analytics || {};
  } catch (_error) {
    console.warn('Failed to fetch bulk analytics:', error);
    return {};
  }
}

// Calculate performance score (0-100) based on analytics metrics and configurable weights
export function calculatePerformanceScore(
  analytics: ContentAnalytics | null | undefined,
  contentType: string = 'default'
): number {
  if (!analytics) return 0;
  
  const config = getPerformanceConfig();
  const weights = getContentTypeWeights(contentType, config);
  
  // Extract metrics with null safety
  const views = analytics.views || 0;
  const likes = analytics.likes || 0;
  const shares = analytics.shares || 0;
  const comments = analytics.comments || 0;
  const engagementRate = analytics.engagementRate || 0;
  
  // Calculate engagement metrics
  const totalEngagement = likes + shares + comments;
  const calculatedEngagementRate = views > 0 ? totalEngagement / views : 0;
  
  // Normalize metrics to 0-100 scale with configurable scaling factors
  const viewsScore = Math.min((views / (contentType === 'social' ? 1000 : 500)) * 100, 100);
  const likesScore = Math.min((likes / (views * 0.1)) * 100, 100);
  const sharesScore = Math.min((shares / (views * 0.05)) * 100, 100);
  const commentsScore = Math.min((comments / (views * 0.02)) * 100, 100);
  
  // Apply content-type specific weights
  const weightedScore = 
    (viewsScore * weights.views) +
    (likesScore * weights.likes) +
    (sharesScore * weights.shares) +
    (commentsScore * weights.comments);
  
  // Apply engagement ratio multiplier
  const finalScore = weightedScore * (1 + (calculatedEngagementRate * (weights.engagementRatio || 1)));
  
  return Math.round(Math.min(finalScore, 100));
}

// Determine if content is trending based on configurable thresholds
export function isTrendingContent(analytics: ContentAnalytics | null | undefined): boolean {
  if (!analytics) return false;
  
  const config = getPerformanceConfig();
  const thresholds = config.trendingThresholds;
  
  // Extract metrics with null safety
  const views = analytics.views || 0;
  const likes = analytics.likes || 0;
  const shares = analytics.shares || 0;
  const comments = analytics.comments || 0;
  
  const totalEngagement = likes + shares + comments;
  
  return (
    views >= thresholds.minViews &&
    totalEngagement >= thresholds.minEngagement
  );
}

// Format analytics numbers for display
export function formatAnalyticsNumber(num: number | undefined | null): string {
  // Handle null/undefined cases
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  // Ensure we have a valid number
  const validNum = Number(num);
  if (isNaN(validNum)) {
    return '0';
  }
  
  if (validNum >= 1000000) {
    return (validNum / 1000000).toFixed(1) + 'M';
  } else if (validNum >= 1000) {
    return (validNum / 1000).toFixed(1) + 'K';
  }
  return validNum.toString();
}

// Generate performance insights text using configurable thresholds
export function getPerformanceInsight(
  analytics: ContentAnalytics, 
  contentType: string = 'default'
): string {
  if (!analytics) return 'No performance data';
  
  const score = calculatePerformanceScore(analytics, contentType);
  const config = getPerformanceConfig();
  const level = getPerformanceLevel(score, config);
  const label = getPerformanceLabel(score, config);
  
  return `${label} performance`;
}

// Get performance color for UI display
export function getPerformanceScoreColor(
  analytics: ContentAnalytics,
  contentType: string = 'default'
): string {
  if (!analytics) return '#6B7280'; // gray-500
  
  const score = calculatePerformanceScore(analytics, contentType);
  const config = getPerformanceConfig();
  return getPerformanceColor(score, config);
}

// Get performance level for categorization
export function getPerformanceScoreLevel(
  analytics: ContentAnalytics,
  contentType: string = 'default'
): 'excellent' | 'good' | 'average' | 'poor' {
  if (!analytics) return 'poor';
  
  const score = calculatePerformanceScore(analytics, contentType);
  const config = getPerformanceConfig();
  return getPerformanceLevel(score, config) as 'excellent' | 'good' | 'average' | 'poor';
}

// Create mock analytics data for development/testing
export function createMockAnalytics(contentId: string): ContentAnalytics {
  const baseViews = Math.floor(Math.random() * 5000) + 100;
  const engagementRate = Math.random() * 0.1; // 0-10%
  const likes = Math.floor(baseViews * engagementRate * 0.7);
  const shares = Math.floor(likes * 0.3);
  const comments = Math.floor(likes * 0.2);
  
  return {
    id: `analytics_${contentId}`,
    contentId,
    views: baseViews,
    likes,
    shares,
    comments,
    engagementRate: parseFloat(engagementRate.toFixed(4)),
    conversionRate: Math.random() * 0.05, // 0-5%
    reachCount: Math.floor(baseViews * 1.2),
    impressions: Math.floor(baseViews * 2.5),
    clickThroughRate: Math.random() * 0.03, // 0-3%
    updatedAt: new Date().toISOString(),
  };
}