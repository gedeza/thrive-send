'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Award,
  AlertTriangle,
  Download
} from 'lucide-react';
import { 
  ContentAnalytics, 
  formatAnalyticsNumber, 
  calculatePerformanceScore, 
  isTrendingContent,
  getPerformanceInsight
} from '@/lib/api/content-analytics-service';
import { ContentData } from '@/lib/api/content-service';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentPerformanceDashboardProps {
  content: ContentData[];
  analyticsMap: Record<string, ContentAnalytics>;
  isLoading?: boolean;
  timeframe?: '7d' | '30d' | '90d' | '1y';
  onTimeframeChange?: (timeframe: '7d' | '30d' | '90d' | '1y') => void;
}

interface PerformanceInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  metric?: string;
  icon?: React.ReactNode;
}

export function ContentPerformanceDashboard({ 
  content, 
  analyticsMap, 
  isLoading = false,
  timeframe = '30d',
  onTimeframeChange 
}: ContentPerformanceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'top-performers' | 'insights' | 'trends'>('overview');

  // Calculate comprehensive analytics metrics
  const dashboardMetrics = useMemo(() => {
    const contentWithAnalytics = content.filter(item => analyticsMap[item.id!]);
    
    if (contentWithAnalytics.length === 0) {
      return {
        totalContent: content.length,
        averageViews: 0,
        averageEngagement: 0,
        averagePerformanceScore: 0,
        topPerformers: [],
        underPerformers: [],
        trendingContent: [],
        insights: []
      };
    }

    // Aggregate metrics
    const totalViews = contentWithAnalytics.reduce((sum, item) => 
      sum + (analyticsMap[item.id!]?.views || 0), 0);
    const totalEngagement = contentWithAnalytics.reduce((sum, item) => {
      const analytics = analyticsMap[item.id!];
      return sum + (analytics ? analytics.likes + analytics.shares + analytics.comments : 0);
    }, 0);

    const averageViews = Math.round(totalViews / contentWithAnalytics.length);
    const averageEngagement = totalEngagement / contentWithAnalytics.length;

    // Performance scores
    const performanceScores = contentWithAnalytics.map(item => 
      calculatePerformanceScore(analyticsMap[item.id!]));
    const averagePerformanceScore = Math.round(
      performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length
    );

    // Top and bottom performers
    const contentWithScores = contentWithAnalytics.map(item => ({
      ...item,
      analytics: analyticsMap[item.id!],
      performanceScore: calculatePerformanceScore(analyticsMap[item.id!])
    })).sort((a, b) => b.performanceScore - a.performanceScore);

    const topPerformers = contentWithScores.slice(0, 5);
    const underPerformers = contentWithScores.slice(-3).reverse();

    // Trending content
    const trendingContent = contentWithAnalytics
      .filter(item => isTrendingContent(analyticsMap[item.id!]))
      .slice(0, 5);

    // Generate insights
    const insights: PerformanceInsight[] = [];

    // High performer insight
    if (topPerformers.length > 0 && topPerformers[0].performanceScore >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Top Performer',
        description: `"${topPerformers[0].title}" is performing exceptionally well with a score of ${topPerformers[0].performanceScore}/100`,
        metric: `${formatAnalyticsNumber(topPerformers[0].analytics.views)} views`,
        icon: <Award className="h-4 w-4" />
      });
    }

    // Low engagement warning
    const lowEngagementCount = contentWithScores.filter(item => 
      item.performanceScore < 30).length;
    if (lowEngagementCount > contentWithScores.length * 0.3) {
      insights.push({
        type: 'warning',
        title: 'Low Engagement Alert',
        description: `${lowEngagementCount} pieces of content have low engagement rates`,
        metric: 'Consider reviewing content strategy',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    // Content type performance
    const typePerformance = contentWithScores.reduce((acc, item) => {
      const type = item.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = { total: 0, score: 0, count: 0 };
      }
      acc[type].total += item.analytics.views;
      acc[type].score += item.performanceScore;
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { total: number; score: number; count: number }>);

    const bestPerformingType = Object.entries(typePerformance)
      .map(([type, data]) => ({ 
        type, 
        avgScore: data.score / data.count,
        totalViews: data.total 
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0];

    if (bestPerformingType) {
      insights.push({
        type: 'info',
        title: 'Best Content Type',
        description: `${bestPerformingType.type.toUpperCase()} content performs best on average`,
        metric: `${bestPerformingType.avgScore.toFixed(0)} avg score`,
        icon: <Target className="h-4 w-4" />
      });
    }

    return {
      totalContent: content.length,
      contentWithAnalytics: contentWithAnalytics.length,
      totalViews,
      totalEngagement,
      averageViews,
      averageEngagement: Math.round(averageEngagement),
      averagePerformanceScore,
      topPerformers,
      underPerformers,
      trendingContent,
      insights,
      typePerformance
    };
  }, [content, analyticsMap]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Timeframe Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Content Performance Dashboard
            </h2>
            <p className="text-muted-foreground">
              Analyze your content performance and discover insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onTimeframeChange && (
              <Select value={timeframe} onValueChange={onTimeframeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatAnalyticsNumber(dashboardMetrics.totalViews)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg: {formatAnalyticsNumber(dashboardMetrics.averageViews)} per content
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-pink-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {formatAnalyticsNumber(dashboardMetrics.totalEngagement)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg: {dashboardMetrics.averageEngagement} per content
                  </p>
                </div>
                <div className="p-3 bg-pink-100 rounded-full">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardMetrics.averagePerformanceScore}/100
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPerformanceInsight({ engagementRate: dashboardMetrics.averagePerformanceScore / 100 } as ContentAnalytics)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Trending Content</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {dashboardMetrics.trendingContent.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Out of {dashboardMetrics.contentWithAnalytics} pieces
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Content Type Performance */}
            {Object.keys(dashboardMetrics.typePerformance).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Performance by Content Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(dashboardMetrics.typePerformance).map(([type, data]) => (
                      <div key={type} className="text-center p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg capitalize">{type}</h4>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(data.score / data.count)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Score ({data.count} pieces)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatAnalyticsNumber(data.total)} total views
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardMetrics.topPerformers.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatAnalyticsNumber(item.analytics.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatAnalyticsNumber(item.analytics.likes)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Score: {item.performanceScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Under Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    Needs Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardMetrics.underPerformers.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatAnalyticsNumber(item.analytics.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatAnalyticsNumber(item.analytics.likes)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Score: {item.performanceScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardMetrics.insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-start gap-3 p-4 border rounded-lg",
                      insight.type === 'success' && "border-green-200 bg-green-50",
                      insight.type === 'warning' && "border-yellow-200 bg-yellow-50",
                      insight.type === 'info' && "border-blue-200 bg-blue-50",
                      insight.type === 'error' && "border-red-200 bg-red-50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full",
                      insight.type === 'success' && "bg-green-100 text-green-600",
                      insight.type === 'warning' && "bg-yellow-100 text-yellow-600",
                      insight.type === 'info' && "bg-blue-100 text-blue-600",
                      insight.type === 'error' && "bg-red-100 text-red-600"
                    )}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.metric && (
                        <p className="text-xs font-medium mt-1">{insight.metric}</p>
                      )}
                    </div>
                  </div>
                ))}

                {dashboardMetrics.insights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No specific insights available yet.</p>
                    <p className="text-sm">More data is needed to generate actionable insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Trending Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardMetrics.trendingContent.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardMetrics.trendingContent.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <Zap className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatAnalyticsNumber(analyticsMap[item.id!].views)} views</span>
                            <span>{(analyticsMap[item.id!].engagementRate * 100).toFixed(1)}% engagement</span>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Trending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trending content detected.</p>
                    <p className="text-sm">Content needs higher engagement to be marked as trending.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}