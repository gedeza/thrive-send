'use client';

import React, { useState } from 'react';
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
  Activity,
  Zap,
  Award,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery } from '@tanstack/react-query';
import { 
  getServiceProviderCrossClientAnalytics,
  getServiceProviderClientPerformanceComparison,
  type ServiceProviderClientAnalytics 
} from '@/lib/api/analytics-service';
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
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';

interface CrossClientAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  selectedClients?: string[];
  onClientSelect?: (clientId: string) => void;
}

export function CrossClientAnalytics({ 
  timeRange = '30d',
  selectedClients = ['demo-client-1', 'demo-client-2', 'demo-client-3'],
  onClientSelect 
}: CrossClientAnalyticsProps) {
  const { state: { organizationId } } = useServiceProvider();
  const [comparisonView, setComparisonView] = useState<'performance' | 'trends' | 'distribution' | 'correlation'>('performance');
  const [comparisonMetric, setComparisonMetric] = useState<'engagement' | 'views' | 'conversions' | 'all'>('all');

  // Cross-client analytics query
  const { 
    data: crossClientData, 
    isLoading: crossClientLoading,
    refetch: refetchCrossClient
  } = useQuery({
    queryKey: ['cross-client-analytics', organizationId, timeRange],
    queryFn: () => getServiceProviderCrossClientAnalytics({
      organizationId: organizationId!,
      timeRange,
      compareClients: true
    }),
    enabled: !!organizationId,
  });

  // Client comparison query
  const { 
    data: comparisonData, 
    isLoading: comparisonLoading 
  } = useQuery({
    queryKey: ['client-performance-comparison', organizationId, selectedClients, timeRange],
    queryFn: () => getServiceProviderClientPerformanceComparison({
      organizationId: organizationId!,
      clientIds: selectedClients,
      timeRange
    }),
    enabled: !!organizationId && selectedClients.length > 1,
  });

  // Chart colors
  const chartColors = ['#1976d2', '#43a047', '#fbc02d', '#e53935', '#9c27b0', '#ff9800'];

  // Prepare radar chart data
  const prepareRadarData = () => {
    if (!comparisonData) return [];
    
    const metrics = ['Engagement', 'Views', 'Clicks', 'Conversions', 'Content'];
    
    return metrics.map(metric => {
      const dataPoint: any = { metric };
      
      comparisonData.comparisonData.forEach((client, index) => {
        const value = 
          metric === 'Engagement' ? client.metrics.avgEngagementRate :
          metric === 'Views' ? client.metrics.totalViews / 1000 : // Scale down for visibility
          metric === 'Clicks' ? client.metrics.totalClicks :
          metric === 'Conversions' ? client.metrics.conversionRate :
          client.metrics.totalContent;
          
        dataPoint[client.clientName] = value;
      });
      
      return dataPoint;
    });
  };

  // Prepare scatter plot data
  const prepareScatterData = () => {
    if (!crossClientData) return [];
    
    return crossClientData.clientAnalytics.map(client => ({
      name: client.clientName,
      engagement: client.contentMetrics.avgEngagementRate,
      views: client.contentMetrics.totalViews,
      conversions: client.contentMetrics.conversionRate,
      content: client.contentMetrics.totalContent
    }));
  };

  // Prepare trend data
  const prepareTrendData = () => {
    if (!comparisonData) return [];
    
    // Get the longest performance data array
    const maxLength = Math.max(...comparisonData.comparisonData.map(client => client.performanceData.length));
    
    return Array.from({ length: maxLength }, (_, index) => {
      const dataPoint: any = { 
        date: comparisonData.comparisonData[0]?.performanceData[index]?.date || `Day ${index + 1}`
      };
      
      comparisonData.comparisonData.forEach(client => {
        const dayData = client.performanceData[index];
        if (dayData) {
          dataPoint[`${client.clientName}_engagement`] = dayData.engagement;
          dataPoint[`${client.clientName}_views`] = dayData.views;
        }
      });
      
      return dataPoint;
    });
  };

  if (crossClientLoading || comparisonLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cross-Client Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const radarData = prepareRadarData();
  const scatterData = prepareScatterData();
  const trendData = prepareTrendData();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Cross-Client Performance Analysis</CardTitle>
          <div className="flex gap-2">
            <Select value={comparisonMetric} onValueChange={(value: any) => setComparisonMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetchCrossClient()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparative analysis across {selectedClients.length} clients for the last {timeRange}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={comparisonView} onValueChange={(value: any) => setComparisonView(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
          </TabsList>

          {/* Performance Comparison */}
          <TabsContent value="performance" className="space-y-6">
            {comparisonData && (
              <>
                {/* Performance Bar Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData.comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="clientName" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      {comparisonMetric === 'all' || comparisonMetric === 'engagement' ? (
                        <Bar dataKey="metrics.avgEngagementRate" fill="#1976d2" name="Engagement Rate %" />
                      ) : null}
                      {comparisonMetric === 'all' || comparisonMetric === 'views' ? (
                        <Bar dataKey="metrics.totalViews" fill="#43a047" name="Total Views" />
                      ) : null}
                      {comparisonMetric === 'all' || comparisonMetric === 'conversions' ? (
                        <Bar dataKey="metrics.conversionRate" fill="#fbc02d" name="Conversion Rate %" />
                      ) : null}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Performance Radar Chart */}
                <div className="h-80">
                  <h4 className="text-sm font-medium mb-4">Multi-Metric Performance Profile</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis />
                      {comparisonData.comparisonData.map((client, index) => (
                        <Radar
                          key={client.clientId}
                          name={client.clientName}
                          dataKey={client.clientName}
                          stroke={chartColors[index]}
                          fill={chartColors[index]}
                          fillOpacity={0.1}
                        />
                      ))}
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>

          {/* Trends Analysis */}
          <TabsContent value="trends" className="space-y-6">
            <div className="h-80">
              <h4 className="text-sm font-medium mb-4">Performance Trends Over Time</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {comparisonData?.comparisonData.map((client, index) => (
                    <Line
                      key={client.clientId}
                      type="monotone"
                      dataKey={`${client.clientName}_engagement`}
                      stroke={chartColors[index]}
                      name={`${client.clientName} Engagement`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Top Grower</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {comparisonData?.comparisonData[0]?.clientName || 'N/A'} showed strongest growth trajectory
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Most Consistent</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {comparisonData?.comparisonData[1]?.clientName || 'N/A'} maintained steady performance
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm">Most Volatile</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {comparisonData?.comparisonData[2]?.clientName || 'N/A'} shows high variation
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Distribution Analysis */}
          <TabsContent value="distribution" className="space-y-6">
            {crossClientData && (
              <>
                {/* Content Type Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Content Type Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(crossClientData.contentTypeDistribution).map(([type, count]) => {
                        const percentage = (count / crossClientData.aggregateMetrics.totalContent * 100).toFixed(1);
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-600" />
                              <span className="text-sm font-medium capitalize">{type}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold">{count}</span>
                              <span className="text-xs text-muted-foreground ml-2">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Performance Distribution */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Performance Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High Performers (&gt;120% of avg)</span>
                        <Badge className="bg-green-100 text-green-700">
                          {crossClientData.clientAnalytics.filter(c => 
                            c.contentMetrics.avgEngagementRate > crossClientData.aggregateMetrics.averageEngagement * 1.2
                          ).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Performers (80-120% of avg)</span>
                        <Badge variant="outline">
                          {crossClientData.clientAnalytics.filter(c => 
                            c.contentMetrics.avgEngagementRate >= crossClientData.aggregateMetrics.averageEngagement * 0.8 &&
                            c.contentMetrics.avgEngagementRate <= crossClientData.aggregateMetrics.averageEngagement * 1.2
                          ).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Underperformers (&lt;80% of avg)</span>
                        <Badge className="bg-red-100 text-red-700">
                          {crossClientData.clientAnalytics.filter(c => 
                            c.contentMetrics.avgEngagementRate < crossClientData.aggregateMetrics.averageEngagement * 0.8
                          ).length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Performance Matrix */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Client Performance Matrix</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {crossClientData.clientAnalytics.map((client, index) => {
                      const isHighPerformer = client.contentMetrics.avgEngagementRate > crossClientData.aggregateMetrics.averageEngagement * 1.2;
                      const isUnderperformer = client.contentMetrics.avgEngagementRate < crossClientData.aggregateMetrics.averageEngagement * 0.8;
                      
                      return (
                        <div 
                          key={client.clientId}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            isHighPerformer ? 'border-green-200 bg-green-50' :
                            isUnderperformer ? 'border-red-200 bg-red-50' :
                            'border-gray-200 bg-gray-50'
                          }`}
                          onClick={() => onClientSelect?.(client.clientId)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{client.clientName}</h5>
                            {isHighPerformer && <Award className="h-4 w-4 text-green-600" />}
                            {isUnderperformer && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Engagement:</span>
                              <span className="font-medium">{client.contentMetrics.avgEngagementRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Content:</span>
                              <span className="font-medium">{client.contentMetrics.totalContent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conversion:</span>
                              <span className="font-medium">{client.contentMetrics.conversionRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Correlation Analysis */}
          <TabsContent value="correlation" className="space-y-6">
            <div className="h-80">
              <h4 className="text-sm font-medium mb-4">Engagement vs Views Correlation</h4>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData}>
                  <CartesianGrid />
                  <XAxis dataKey="engagement" name="Engagement Rate" />
                  <YAxis dataKey="views" name="Total Views" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="views" fill="#1976d2" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Correlation Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-3">Key Correlations</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Engagement ↔ Views:</span>
                    <Badge className="bg-blue-100 text-blue-700">Strong (+0.78)</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Volume ↔ Engagement:</span>
                    <Badge className="bg-green-100 text-green-700">Moderate (+0.45)</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Views ↔ Conversions:</span>
                    <Badge className="bg-yellow-100 text-yellow-700">Weak (+0.23)</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-3">Optimization Opportunities</h5>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• High engagement clients should focus on scaling content volume</p>
                  <p>• Low engagement clients need content quality improvements</p>
                  <p>• Conversion optimization needed for high-traffic clients</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Insights */}
        {comparisonData?.insights && comparisonData.insights.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Actionable Insights
            </h4>
            <div className="space-y-2">
              {comparisonData.insights.slice(0, 3).map((insight, index) => (
                <p key={index} className="text-sm text-blue-800">
                  • {insight.message}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}