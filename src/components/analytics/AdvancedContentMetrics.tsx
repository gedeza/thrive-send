'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  MousePointer, 
  Target,
  Users,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Star,
  Flame,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery } from '@tanstack/react-query';
import { getServiceProviderCrossClientAnalytics } from '@/lib/api/analytics-service';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AdvancedContentMetricsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  clientId?: string;
}

export function AdvancedContentMetrics({ 
  timeRange = '30d',
  clientId = 'all'
}: AdvancedContentMetricsProps) {
  const { state: { organizationId } } = useServiceProvider();
  const [metricsView, setMetricsView] = useState<'overview' | 'engagement' | 'content-mix' | 'performance'>('overview');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'email' | 'social' | 'blog'>('all');

  // Get analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['advanced-content-metrics', organizationId, timeRange, clientId],
    queryFn: () => getServiceProviderCrossClientAnalytics({
      organizationId: organizationId!,
      timeRange,
      compareClients: true
    }),
    enabled: !!organizationId,
  });

  const chartColors = ['#1976d2', '#43a047', '#fbc02d', '#e53935', '#9c27b0', '#ff9800'];

  // Calculate advanced metrics
  const advancedMetrics = useMemo(() => {
    if (!analyticsData) return null;

    const { aggregateMetrics, clientAnalytics } = analyticsData;
    
    // Calculate engagement quality score
    const engagementQualityScore = Math.round(
      (aggregateMetrics.averageEngagement / 15) * 100 // Normalize to 0-100 scale
    );

    // Calculate content velocity (content per day)
    const contentVelocity = aggregateMetrics.totalContent / 30; // Assuming 30 days
    
    // Calculate client satisfaction score based on performance distribution
    const highPerformers = clientAnalytics.filter(c => 
      c.contentMetrics.avgEngagementRate > aggregateMetrics.averageEngagement * 1.2
    ).length;
    const clientSatisfactionScore = Math.round((highPerformers / clientAnalytics.length) * 100);

    // Calculate ROI approximation
    const estimatedROI = (aggregateMetrics.totalClicks * 0.02 * 50); // Rough calculation

    // Top performing content types
    const contentTypePerformance = Object.entries(analyticsData.contentTypeDistribution)
      .map(([type, count]) => ({
        type,
        count,
        avgEngagement: clientAnalytics
          .flatMap(client => client.topContent)
          .filter(content => content.type === type)
          .reduce((sum, content, _, arr) => sum + content.engagement / arr.length, 0) || 0
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    return {
      engagementQualityScore,
      contentVelocity,
      clientSatisfactionScore,
      estimatedROI,
      contentTypePerformance,
      totalImpressions: aggregateMetrics.totalViews * 1.8, // Estimated impressions
      reachEstimate: aggregateMetrics.totalViews * 0.7, // Estimated reach
      viralityScore: Math.round(Math.random() * 20 + 5), // Mock virality score
      contentHealthScore: Math.round((engagementQualityScore + clientSatisfactionScore) / 2)
    };
  }, [analyticsData]);

  // Generate trend data for charts
  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    return Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      return {
        date: date.toISOString().split('T')[0],
        engagement: Math.round(Math.random() * 15 + 5),
        views: Math.round(Math.random() * 1000 + 200),
        conversions: Math.round(Math.random() * 5 + 1),
        contentScore: Math.round(Math.random() * 30 + 70),
        viralityIndex: Math.round(Math.random() * 10 + 2)
      };
    });
  };

  const trendData = generateTrendData();

  // Performance scoring system
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Content performance insights
  const getContentInsights = () => {
    if (!analyticsData || !advancedMetrics) return [];

    const insights = [];

    // Engagement insight
    if (advancedMetrics.engagementQualityScore > 80) {
      insights.push({
        type: 'success',
        title: 'Strong Engagement Performance',
        message: `Your content achieves ${advancedMetrics.engagementQualityScore}% engagement quality score`,
        icon: <CheckCircle className="h-4 w-4" />
      });
    } else if (advancedMetrics.engagementQualityScore < 60) {
      insights.push({
        type: 'warning',
        title: 'Engagement Opportunity',
        message: 'Consider optimizing content for better engagement rates',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }

    // Content velocity insight
    if (advancedMetrics.contentVelocity > 3) {
      insights.push({
        type: 'info',
        title: 'High Content Velocity',
        message: `Publishing ${advancedMetrics.contentVelocity.toFixed(1)} pieces per day across all clients`,
        icon: <Activity className="h-4 w-4" />
      });
    }

    // Best performing content type
    if (advancedMetrics.contentTypePerformance.length > 0) {
      const topType = advancedMetrics.contentTypePerformance[0];
      insights.push({
        type: 'success',
        title: 'Top Performing Content Type',
        message: `${topType.type.charAt(0).toUpperCase() + topType.type.slice(1)} content shows highest engagement`,
        icon: <Star className="h-4 w-4" />
      });
    }

    return insights;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Content Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = getContentInsights();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Advanced Content Performance Metrics</CardTitle>
          <Select value={contentTypeFilter} onValueChange={(value: unknown) => setContentTypeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Deep-dive analytics and performance indicators for the last {timeRange}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={metricsView} onValueChange={(value: unknown) => setMetricsView(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="content-mix">Content Mix</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analyticsData && advancedMetrics && (
              <>
                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <Badge className={getPerformanceLevel(advancedMetrics.engagementQualityScore).bg + ' ' + getPerformanceLevel(advancedMetrics.engagementQualityScore).color}>
                        {getPerformanceLevel(advancedMetrics.engagementQualityScore).level}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Engagement Quality</p>
                      <p className="text-2xl font-bold">{advancedMetrics.engagementQualityScore}%</p>
                      <Progress value={advancedMetrics.engagementQualityScore} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <Badge className={getPerformanceLevel(advancedMetrics.clientSatisfactionScore).bg + ' ' + getPerformanceLevel(advancedMetrics.clientSatisfactionScore).color}>
                        {getPerformanceLevel(advancedMetrics.clientSatisfactionScore).level}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Client Satisfaction</p>
                      <p className="text-2xl font-bold">{advancedMetrics.clientSatisfactionScore}%</p>
                      <Progress value={advancedMetrics.clientSatisfactionScore} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <Badge variant="outline">
                        {advancedMetrics.contentVelocity > 2 ? 'High' : advancedMetrics.contentVelocity > 1 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Content Velocity</p>
                      <p className="text-2xl font-bold">{advancedMetrics.contentVelocity.toFixed(1)}/day</p>
                      <p className="text-xs text-muted-foreground">Pieces per day</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Flame className="h-4 w-4 text-orange-600" />
                      </div>
                      <Badge className={advancedMetrics.viralityScore > 15 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                        {advancedMetrics.viralityScore > 15 ? 'Viral' : 'Trending'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Virality Score</p>
                      <p className="text-2xl font-bold">{advancedMetrics.viralityScore}</p>
                      <Progress value={advancedMetrics.viralityScore * 5} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Performance Trend Chart */}
                <div className="h-80">
                  <h4 className="text-sm font-medium mb-4">Content Performance Trends</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="contentScore" stackId="1" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} name="Content Score" />
                      <Area type="monotone" dataKey="engagement" stackId="2" stroke="#43a047" fill="#43a047" fillOpacity={0.3} name="Engagement" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Key Insights */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Performance Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded ${
                            insight.type === 'success' ? 'text-green-600' :
                            insight.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {insight.icon}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{insight.title}</h5>
                            <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Rate Trend */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-4">Engagement Rate Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#1976d2" strokeWidth={3} name="Engagement Rate %" />
                    <Line type="monotone" dataKey="viralityIndex" stroke="#e53935" strokeWidth={2} name="Virality Index" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Distribution */}
              <div>
                <h4 className="text-sm font-medium mb-4">Engagement Distribution by Client</h4>
                <div className="space-y-3">
                  {analyticsData?.clientAnalytics.map((client, index) => (
                    <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[index] }} />
                        <span className="font-medium">{client.clientName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{client.contentMetrics.avgEngagementRate.toFixed(1)}%</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {client.contentMetrics.avgEngagementRate > (analyticsData?.aggregateMetrics.averageEngagement || 0) ? (
                            <ArrowUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-red-600" />
                          )}
                          <span>
                            {Math.abs(client.contentMetrics.avgEngagementRate - (analyticsData?.aggregateMetrics.averageEngagement || 0)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Engagement Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{advancedMetrics?.totalImpressions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{advancedMetrics?.reachEstimate.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Estimated Reach</p>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">${advancedMetrics?.estimatedROI.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Estimated ROI</p>
              </div>
            </div>
          </TabsContent>

          {/* Content Mix Tab */}
          <TabsContent value="content-mix" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Type Performance */}
              <div>
                <h4 className="text-sm font-medium mb-4">Content Type Performance</h4>
                <div className="space-y-3">
                  {advancedMetrics?.contentTypePerformance.map((contentType, index) => (
                    <div key={contentType.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          {contentType.type === 'email' && <MousePointer className="h-4 w-4" />}
                          {contentType.type === 'social' && <Users className="h-4 w-4" />}
                          {contentType.type === 'blog' && <BarChart3 className="h-4 w-4" />}
                        </div>
                        <div>
                          <span className="font-medium capitalize">{contentType.type}</span>
                          <p className="text-xs text-muted-foreground">{contentType.count} pieces</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{contentType.avgEngagement.toFixed(1)}%</span>
                        <p className="text-xs text-muted-foreground">Avg Engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Volume Distribution */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-4">Content Volume Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(analyticsData?.contentTypeDistribution || {}).map(([type, count]) => ({
                        name: type.charAt(0).toUpperCase() + type.slice(1),
                        value: count,
                        fill: chartColors[Object.keys(analyticsData?.contentTypeDistribution || {}).indexOf(type)]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Content Publishing Pattern */}
            <div className="h-64">
              <h4 className="text-sm font-medium mb-4">Publishing Velocity Trend</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.slice(-14)}> {/* Last 14 days */}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#1976d2" name="Daily Views" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Performance Scorecard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-xl font-bold">{advancedMetrics?.contentHealthScore}</p>
                <p className="text-sm text-muted-foreground">Content Health Score</p>
                <Progress value={advancedMetrics?.contentHealthScore} className="h-2 mt-2" />
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-xl font-bold">{analyticsData?.aggregateMetrics.averageEngagement.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Average Engagement</p>
                <div className="flex items-center justify-center mt-2 text-xs">
                  <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+2.3% vs last period</span>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xl font-bold">{Math.round((analyticsData?.aggregateMetrics.totalContent || 0) / 7)}</p>
                <p className="text-sm text-muted-foreground">Weekly Output</p>
                <p className="text-xs text-muted-foreground mt-1">Pieces per week</p>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-xl font-bold">{analyticsData?.aggregateMetrics.averageConversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <div className="flex items-center justify-center mt-2 text-xs">
                  <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+0.8% vs last period</span>
                </div>
              </div>
            </div>

            {/* Performance Comparison Chart */}
            <div className="h-80">
              <h4 className="text-sm font-medium mb-4">Multi-Metric Performance Comparison</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#1976d2" name="Engagement" />
                  <Line type="monotone" dataKey="conversions" stroke="#43a047" name="Conversions" />
                  <Line type="monotone" dataKey="contentScore" stroke="#fbc02d" name="Content Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Recommendations */}
            <div>
              <h4 className="text-sm font-medium mb-4">Performance Recommendations</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Optimize High-Performing Content Types</p>
                    <p className="text-sm text-muted-foreground">
                      {advancedMetrics?.contentTypePerformance[0]?.type} content shows strongest engagement. Consider increasing production.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Balance Content Distribution</p>
                    <p className="text-sm text-muted-foreground">
                      Consider diversifying content types to maximize reach across different audience segments.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Scale Successful Strategies</p>
                    <p className="text-sm text-muted-foreground">
                      Current performance trends are positive. Consider scaling successful content strategies across more clients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}