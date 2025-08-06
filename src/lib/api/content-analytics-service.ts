import { ContentData } from './content-service';

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
  } catch (error) {
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
  } catch (error) {
    console.warn('Failed to fetch bulk analytics:', error);
    return {};
  }
}

// Calculate performance score (0-100) based on analytics metrics
export function calculatePerformanceScore(analytics: ContentAnalytics | null | undefined): number {
  if (!analytics) return 0;
  
  // Weighted score calculation with null safety
  const views = analytics.views || 0;
  const engagementRate = analytics.engagementRate || 0;
  const shares = analytics.shares || 0;
  const conversionRate = analytics.conversionRate || 0;
  
  const viewsScore = Math.min((views / 1000) * 20, 20); // Max 20 points
  const engagementScore = engagementRate * 30; // Max 30 points (if 100% engagement)
  const sharesScore = Math.min((shares / 50) * 15, 15); // Max 15 points
  const conversionScore = conversionRate * 35; // Max 35 points
  
  return Math.round(viewsScore + engagementScore + sharesScore + conversionScore);
}

// Determine if content is trending based on recent performance
export function isTrendingContent(analytics: ContentAnalytics | null | undefined): boolean {
  if (!analytics) return false;
  
  // Simple trending logic with null safety - can be enhanced with time-based calculations
  const engagementRate = analytics.engagementRate || 0;
  const views = analytics.views || 0;
  const shares = analytics.shares || 0;
  
  return (
    engagementRate > 0.05 && // 5% engagement rate
    views > 500 &&
    shares > 10
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

// Generate performance insights text
export function getPerformanceInsight(analytics: ContentAnalytics): string {
  if (!analytics) return 'No performance data';
  
  const score = calculatePerformanceScore(analytics);
  
  if (score >= 80) return 'Excellent performance';
  if (score >= 60) return 'Good performance';
  if (score >= 40) return 'Average performance';
  if (score >= 20) return 'Below average';
  return 'Needs improvement';
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