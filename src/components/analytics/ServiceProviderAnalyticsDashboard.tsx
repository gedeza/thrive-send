'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery } from '@tanstack/react-query';
import { 
  getServiceProviderCrossClientAnalytics,
  getServiceProviderClientAnalytics,
  getServiceProviderClientPerformanceComparison,
  type ServiceProviderCrossClientAnalytics,
  type ServiceProviderSingleClientAnalyticsResponse,
  type ServiceProviderClientAnalytics
} from '@/lib/api/analytics-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ServiceProviderAnalyticsDashboardProps {
  defaultView?: 'overview' | 'client-specific' | 'comparison';
  defaultTimeRange?: '7d' | '30d' | '90d' | '1y';
}

export function ServiceProviderAnalyticsDashboard({ 
  defaultView = 'overview',
  defaultTimeRange = '30d' 
}: ServiceProviderAnalyticsDashboardProps) {
  const { 
    state: { organizationId, selectedClient }, 
    switchClient 
  } = useServiceProvider();

  // State for dashboard controls
  const [currentView, setCurrentView] = useState<'overview' | 'client-specific' | 'comparison'>(defaultView);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(defaultTimeRange);
  const [selectedClientId, setSelectedClientId] = useState<string>(selectedClient?.id || 'all');
  const [comparisonClients, setComparisonClients] = useState<string[]>(['demo-client-1', 'demo-client-2']);

  // Cross-client analytics query
  const { 
    data: crossClientData, 
    isLoading: crossClientLoading, 
    error: crossClientError,
    refetch: refetchCrossClient 
  } = useQuery<ServiceProviderCrossClientAnalytics>({
    queryKey: ['service-provider-cross-client-analytics', organizationId, timeRange],
    queryFn: () => getServiceProviderCrossClientAnalytics({
      organizationId: organizationId!,
      timeRange,
      compareClients: true
    }),
    enabled: !!organizationId && currentView === 'overview',
  });

  // Single client analytics query
  const { 
    data: singleClientData, 
    isLoading: singleClientLoading,
    error: singleClientError,
    refetch: refetchSingleClient
  } = useQuery<ServiceProviderSingleClientAnalyticsResponse>({
    queryKey: ['service-provider-client-analytics', organizationId, selectedClientId, timeRange],
    queryFn: () => getServiceProviderClientAnalytics({
      organizationId: organizationId!,
      clientId: selectedClientId,
      timeRange
    }),
    enabled: !!organizationId && selectedClientId !== 'all' && currentView === 'client-specific',
  });

  // Client performance comparison query
  const { 
    data: comparisonData, 
    isLoading: comparisonLoading,
    error: comparisonError
  } = useQuery({
    queryKey: ['service-provider-client-comparison', organizationId, comparisonClients, timeRange],
    queryFn: () => getServiceProviderClientPerformanceComparison({
      organizationId: organizationId!,
      clientIds: comparisonClients,
      timeRange
    }),
    enabled: !!organizationId && comparisonClients.length > 1 && currentView === 'comparison',
  });

  // Chart colors for consistency
  const chartColors = ['#1976d2', '#43a047', '#fbc02d', '#e53935', '#9c27b0', '#ff9800'];

  // Get metric icon
  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'views': return <Eye className="h-4 w-4" />;
      case 'clicks': return <MousePointer className="h-4 w-4" />;
      case 'engagement': return <TrendingUp className="h-4 w-4" />;
      case 'conversions': return <Target className="h-4 w-4" />;
      case 'content': return <BarChart3 className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  // Get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // Get insight icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  // Loading state
  if (crossClientLoading || singleClientLoading || comparisonLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Service Provider Analytics</h2>
          <p className="text-muted-foreground">
            Monitor performance across all your clients
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
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
          
          <Button variant="outline" size="sm" onClick={() => {
            if (currentView === 'overview') refetchCrossClient();
            if (currentView === 'client-specific') refetchSingleClient();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
        <TabsList>
          <TabsTrigger value="overview">Cross-Client Overview</TabsTrigger>
          <TabsTrigger value="client-specific">Client-Specific</TabsTrigger>
          <TabsTrigger value="comparison">Client Comparison</TabsTrigger>
        </TabsList>

        {/* Cross-Client Overview */}
        <TabsContent value="overview" className="space-y-6">
          {crossClientData && (
            <>
              {/* Aggregate Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                        <p className="text-2xl font-bold">{crossClientData.aggregateMetrics.totalClients}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                        <p className="text-2xl font-bold">{crossClientData.aggregateMetrics.totalContent}</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                        <p className="text-2xl font-bold">{crossClientData.aggregateMetrics.averageEngagement.toFixed(1)}%</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{crossClientData.aggregateMetrics.totalViews.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Eye className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Client Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top by Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {crossClientData.clientRankings.byEngagement.slice(0, 3).map((client, index) => (
                        <div key={client.clientId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{client.clientName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {client.contentMetrics.avgEngagementRate.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top by Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {crossClientData.clientRankings.byViews.slice(0, 3).map((client, index) => (
                        <div key={client.clientId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{client.clientName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {client.contentMetrics.totalViews.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top by Conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {crossClientData.clientRankings.byConversion.slice(0, 3).map((client, index) => (
                        <div key={client.clientId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{client.clientName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {client.contentMetrics.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content Type Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(crossClientData.contentTypeDistribution).map(([type, count]) => ({
                            name: type.charAt(0).toUpperCase() + type.slice(1),
                            value: count
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {Object.entries(crossClientData.contentTypeDistribution).map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {crossClientData.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Client-Specific View */}
        <TabsContent value="client-specific" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo-client-1">City of Springfield</SelectItem>
                <SelectItem value="demo-client-2">TechStart Inc.</SelectItem>
                <SelectItem value="demo-client-3">Local Coffee Co.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {singleClientData && (
            <>
              {/* Client Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                        <p className="text-2xl font-bold">{singleClientData.clientAnalytics.contentMetrics.totalContent}</p>
                      </div>
                      {getMetricIcon('content')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                        <p className="text-2xl font-bold">{singleClientData.clientAnalytics.contentMetrics.avgEngagementRate.toFixed(1)}%</p>
                      </div>
                      {getMetricIcon('engagement')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{singleClientData.clientAnalytics.contentMetrics.totalViews.toLocaleString()}</p>
                      </div>
                      {getMetricIcon('views')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{singleClientData.clientAnalytics.contentMetrics.conversionRate.toFixed(1)}%</p>
                      </div>
                      {getMetricIcon('conversions')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={singleClientData.clientAnalytics.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#1976d2" name="Views" />
                      <Line type="monotone" dataKey="engagement" stroke="#43a047" name="Engagement" />
                      <Line type="monotone" dataKey="clicks" stroke="#fbc02d" name="Clicks" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Performing Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {singleClientData.clientAnalytics.topContent.map((content, index) => (
                      <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{content.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{content.type}</Badge>
                            <span>{content.views.toLocaleString()} views</span>
                            <span>{content.engagement}% engagement</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Client Comparison View */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Comparing: {comparisonClients.map(id => 
                id === 'demo-client-1' ? 'City of Springfield' :
                id === 'demo-client-2' ? 'TechStart Inc.' :
                'Local Coffee Co.'
              ).join(' vs ')}
            </p>
          </div>

          {comparisonData && (
            <>
              {/* Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="clientName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="metrics.avgEngagementRate" fill="#1976d2" name="Engagement Rate %" />
                      <Bar dataKey="metrics.totalViews" fill="#43a047" name="Total Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Comparison Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comparison Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <p className="text-sm">{insight.message}</p>
                          <div className="flex gap-2 mt-2">
                            {insight.clientsAffected.map(clientId => (
                              <Badge key={clientId} variant="outline" className="text-xs">
                                {clientId === 'demo-client-1' ? 'Springfield' :
                                 clientId === 'demo-client-2' ? 'TechStart' :
                                 'Coffee Co.'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}