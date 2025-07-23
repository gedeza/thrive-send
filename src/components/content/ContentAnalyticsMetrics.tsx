'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  TrendingUp, 
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContentAnalytics, 
  formatAnalyticsNumber, 
  calculatePerformanceScore, 
  isTrendingContent,
  getPerformanceInsight
} from '@/lib/api/content-analytics-service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentAnalyticsMetricsProps {
  contentId: string;
  analytics?: ContentAnalytics | null;
  size?: 'sm' | 'md' | 'lg';
  showPerformanceScore?: boolean;
  showTrendingBadge?: boolean;
  className?: string;
}

export function ContentAnalyticsMetrics({ 
  contentId, 
  analytics, 
  size = 'md',
  showPerformanceScore = true,
  showTrendingBadge = true,
  className 
}: ContentAnalyticsMetricsProps) {
  const [isLoading, setIsLoading] = useState(!analytics);

  // If no analytics provided, we'll show loading state
  useEffect(() => {
    if (!analytics) {
      // In a real implementation, you might fetch analytics here
      // For now, we'll show loading briefly then hide
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [analytics]);

  const performanceScore = analytics ? calculatePerformanceScore(analytics) : 0;
  const isContentTrending = analytics ? isTrendingContent(analytics) : false;
  const insight = analytics ? getPerformanceInsight(analytics) : '';

  // Size-specific styles
  const sizeStyles = {
    sm: {
      container: 'space-y-1',
      metrics: 'flex items-center gap-2 text-xs',
      icon: 'h-3 w-3',
      badge: 'text-xs px-1 py-0',
      score: 'text-xs'
    },
    md: {
      container: 'space-y-2',
      metrics: 'flex items-center gap-3 text-sm',
      icon: 'h-4 w-4',
      badge: 'text-xs px-2 py-1',
      score: 'text-sm'
    },
    lg: {
      container: 'space-y-3',
      metrics: 'flex items-center gap-4 text-base',
      icon: 'h-5 w-5',
      badge: 'text-sm px-3 py-1',
      score: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
        {showPerformanceScore && <Skeleton className="h-5 w-24" />}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>
        No analytics data available
      </div>
    );
  }

  // Performance score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <TooltipProvider>
      <div className={cn(styles.container, className)}>
        {/* Main Metrics Row */}
        <div className={styles.metrics}>
          {/* Views */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground hover:text-blue-600 transition-colors">
                <Eye className={cn(styles.icon, 'text-blue-500')} />
                <span className="font-medium">{formatAnalyticsNumber(analytics.views)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{analytics.views.toLocaleString()} total views</p>
            </TooltipContent>
          </Tooltip>

          {/* Likes */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground hover:text-pink-600 transition-colors">
                <Heart className={cn(styles.icon, 'text-pink-500')} />
                <span className="font-medium">{formatAnalyticsNumber(analytics.likes)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{analytics.likes.toLocaleString()} likes</p>
            </TooltipContent>
          </Tooltip>

          {/* Shares */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground hover:text-green-600 transition-colors">
                <Share2 className={cn(styles.icon, 'text-green-500')} />
                <span className="font-medium">{formatAnalyticsNumber(analytics.shares)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{analytics.shares.toLocaleString()} shares</p>
            </TooltipContent>
          </Tooltip>

          {/* Comments */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground hover:text-purple-600 transition-colors">
                <MessageCircle className={cn(styles.icon, 'text-purple-500')} />
                <span className="font-medium">{formatAnalyticsNumber(analytics.comments)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{analytics.comments.toLocaleString()} comments</p>
            </TooltipContent>
          </Tooltip>

          {/* Engagement Rate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground hover:text-orange-600 transition-colors">
                <TrendingUp className={cn(styles.icon, 'text-orange-500')} />
                <span className="font-medium">{(analytics.engagementRate * 100).toFixed(1)}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Engagement rate: {(analytics.engagementRate * 100).toFixed(2)}%</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Performance Score and Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {showPerformanceScore && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'flex items-center gap-1 border font-medium',
                    styles.badge,
                    getScoreColor(performanceScore)
                  )}
                >
                  <Target className={cn(styles.icon)} />
                  Score: {performanceScore}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{insight}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on views, engagement, shares, and conversions
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {showTrendingBadge && isContentTrending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'flex items-center gap-1 border font-medium text-orange-600 bg-orange-50 border-orange-200',
                    styles.badge
                  )}
                >
                  <Zap className={cn(styles.icon)} />
                  Trending
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This content is performing above average</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}