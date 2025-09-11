'use client';

/**
 * CrossClientAnalytics Component
 * Built from Analytics TDD v2.0.0 - PRD Compliant B2B2G Architecture
 * 
 * Provides comprehensive cross-client performance comparison and analytics
 * for service providers to monitor their entire client portfolio.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Search,
  Grid,
  List,
  Info,
  Star,
  Trophy,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  CrossClientAnalytics as CrossClientAnalyticsType,
  ServiceProviderClientAnalytics,
  CrossClientAnalyticsProps,
  TrendDirection,
  AnalyticsInsight,
  ClientRanking
} from '@/types/analytics';

// Service functions for API calls
const fetchCrossClientAnalytics = async (
  organizationId: string, 
  timeRange: string,
  compareClients: boolean = true
): Promise<CrossClientAnalyticsType> => {
  const response = await fetch(`/api/service-provider/analytics/cross-client?organizationId=${organizationId}&timeRange=${timeRange}&compareClients=${compareClients}`);
  if (!response.ok) throw new Error('Failed to fetch cross-client analytics');
  return response.json();
};

export function CrossClientAnalytics({
  organizationId,
  timeRange = '30d',
  selectedClients = [],
  onClientSelect
}: CrossClientAnalyticsProps) {
  // Component State
  const [currentTimeRange, setCurrentTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(timeRange);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'performance' | 'engagement' | 'growth' | 'content'>('performance');
  const [filterType, setFilterType] = useState<'all' | 'municipality' | 'business' | 'startup' | 'nonprofit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set(selectedClients));
  const [currentTab, setCurrentTab] = useState<'overview' | 'performance' | 'content' | 'insights'>('overview');

  // Data Query
  const { 
    data: crossClientData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['cross-client-analytics', organizationId, currentTimeRange],
    queryFn: () => fetchCrossClientAnalytics(organizationId, currentTimeRange, true),
    enabled: !!organizationId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Computed Data
  const filteredAndSortedClients = useMemo(() => {
    if (!crossClientData?.clientAnalytics) return [];
    
    let filtered = crossClientData.clientAnalytics;
    
    // Apply filters
    if (filterType !== 'all') {
      filtered = filtered.filter(client => client.clientType === filterType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(client => 
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performanceScore - a.performanceScore;
        case 'engagement':
          return b.contentMetrics.avgEngagementRate - a.contentMetrics.avgEngagementRate;
        case 'growth':
          return b.engagementMetrics.engagementGrowth - a.engagementMetrics.engagementGrowth;
        case 'content':
          return b.contentMetrics.totalContent - a.contentMetrics.totalContent;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [crossClientData?.clientAnalytics, filterType, searchQuery, sortBy]);

  // Utility Functions
  const getTrendIcon = useCallback((trend: TrendDirection, value?: number) => {
    if (trend === 'up' || (value && value > 0)) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' || (value && value < 0)) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  }, []);

  const getPerformanceColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }, []);

  const getClientTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'municipality': return '🏛️';
      case 'business': return '🏢';
      case 'startup': return '🚀';
      case 'nonprofit': return '🤝';
      default: return '🏢';
    }
  }, []);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat().format(num);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }, []);

  // Event Handlers
  const handleClientSelect = useCallback((clientId: string) => {
    const newSelected = new Set(selectedClientIds);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClientIds(newSelected);
    onClientSelect?.(clientId);
  }, [selectedClientIds, onClientSelect]);

  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (!crossClientData) return;
    
    try {
      const exportData = {
        crossClientAnalytics: crossClientData,
        timestamp: new Date().toISOString(),
        organizationId,
        timeRange: currentTimeRange,
        exportType: 'cross-client' as const
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `cross-client-analytics-${timestamp}`;

      if (format === 'csv') {
        const { exportAnalyticsToCSV } = await import('@/lib/utils/analytics-export');
        exportAnalyticsToCSV(exportData, filename);
      } else if (format === 'excel') {
        const { exportAnalyticsToExcel } = await import('@/lib/utils/analytics-export');
        exportAnalyticsToExcel(exportData, filename);
      } else if (format === 'pdf') {
        const { exportAnalyticsToPDF } = await import('@/lib/utils/analytics-export');
        await exportAnalyticsToPDF(exportData, filename);
      }

      console.log(`✅ Cross-client analytics exported as ${format.toUpperCase()}`);
    } catch (_error) {
      console.error("", _error);
    }
  }, [crossClientData, organizationId, currentTimeRange]);

  // Loading and Error States
  if (error) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Cross-Client Analytics Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load cross-client analytics. Please try refreshing.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Cross-Client Analytics</h2>
            <div className="w-96 h-4 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!crossClientData) {
    return (
      <Card className="p-8 text-center">
        <Info className="h-8 w-8 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">
          Cross-client analytics data is not available yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cross-Client Analytics</h2>
          <p className="text-muted-foreground">
            Compare performance across {crossClientData.aggregateMetrics.totalClients} clients
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={currentTimeRange} onValueChange={(value: unknown) => setCurrentTimeRange(value)}>
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
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Select onValueChange={(value) => handleExport(value as 'csv' | 'excel' | 'pdf')}>
            <SelectTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export as CSV</SelectItem>
              <SelectItem value="excel">Export as Excel</SelectItem>
              <SelectItem value="pdf">Export as PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{formatNumber(crossClientData.aggregateMetrics.totalContent)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(crossClientData.aggregateMetrics.totalPublishedContent)} published
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm text-muted-foreground">
                  {formatNumber(crossClientData.aggregateMetrics.totalViews)} total views
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{formatNumber(crossClientData.aggregateMetrics.totalClicks)}</p>
                <p className="text-sm text-muted-foreground">
                  {crossClientData.aggregateMetrics.averageConversionRate.toFixed(1)}% conversion
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{crossClientData.aggregateMetrics.totalClients}</p>
                <p className="text-sm text-muted-foreground">
                  Across all portfolios
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={currentTab} onValueChange={(value: unknown) => setCurrentTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={(value: unknown) => setFilterType(value)}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Client Types</SelectItem>
                <SelectItem value="municipality">Municipalities</SelectItem>
                <SelectItem value="business">Businesses</SelectItem>
                <SelectItem value="startup">Startups</SelectItem>
                <SelectItem value="nonprofit">Nonprofits</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: unknown) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance Score</SelectItem>
                <SelectItem value="engagement">Engagement Rate</SelectItem>
                <SelectItem value="growth">Growth Rate</SelectItem>
                <SelectItem value="content">Content Volume</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Client Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredAndSortedClients.map((client: ServiceProviderClientAnalytics) => (
              <Card 
                key={client.clientId} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedClientIds.has(client.clientId) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleClientSelect(client.clientId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getClientTypeIcon(client.clientType)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{client.clientName}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{client.clientType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedClientIds.has(client.clientId)}
                        onChange={() => handleClientSelect(client.clientId)}
                      />
                      {getTrendIcon(client.trendDirection)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Performance Score</span>
                      <Badge className={getPerformanceColor(client.performanceScore)}>
                        {client.performanceScore.toFixed(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Content</p>
                        <p className="font-medium">{client.contentMetrics.totalContent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-medium">{client.contentMetrics.avgEngagementRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium">{formatNumber(client.contentMetrics.totalViews)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversion</p>
                        <p className="font-medium">{client.contentMetrics.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Health Indicators */}
                    <div className="flex items-center gap-1 pt-2">
                      {client.healthIndicators.healthScore >= 80 && (
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Healthy
                        </Badge>
                      )}
                      {client.healthIndicators.retentionRisk === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          At Risk
                        </Badge>
                      )}
                      {client.healthIndicators.opportunities.length > 0 && (
                        <Badge variant="outline" className="text-blue-600 bg-blue-50">
                          <Star className="h-3 w-3 mr-1" />
                          Opportunity
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Top Performers */}
          {crossClientData.clientRankings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Top Performing Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crossClientData.clientRankings.byOverallPerformance.slice(0, 5).map((ranking: ClientRanking, index: number) => (
                    <div key={ranking.clientId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                        }`}>
                          {ranking.rank}
                        </div>
                        <div>
                          <p className="font-medium">{ranking.clientName}</p>
                          <p className="text-sm text-muted-foreground">Score: {ranking.score.toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ranking.rankChange > 0 && (
                          <Badge variant="outline" className="text-green-600">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            +{ranking.rankChange}
                          </Badge>
                        )}
                        {ranking.rankChange < 0 && (
                          <Badge variant="outline" className="text-red-600">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            {ranking.rankChange}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Type Distribution */}
          {Object.keys(crossClientData.contentTypeDistribution).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(crossClientData.contentTypeDistribution).map(([type, count]) => (
                    <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Distribution */}
          {Object.keys(crossClientData.platformDistribution).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(crossClientData.platformDistribution).map(([platform, count]) => (
                    <div key={platform} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{count}</p>
                      <p className="text-sm text-muted-foreground">{platform}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Analytics Insights */}
          {crossClientData.insights && crossClientData.insights.length > 0 && (
            <div className="space-y-4">
              {crossClientData.insights.map((insight: AnalyticsInsight, index: number) => (
                <Card key={insight.id || index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-100' :
                        insight.type === 'warning' ? 'bg-yellow-100' :
                        insight.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                        {insight.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                        {insight.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{insight.title}</h3>
                        <p className="text-muted-foreground mb-3">{insight.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${
                            insight.impact === 'high' ? 'border-red-200 text-red-700' :
                            insight.impact === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-gray-200 text-gray-700'
                          }`}>
                            {insight.impact} impact
                          </Badge>
                          {insight.actionRequired && (
                            <Badge variant="destructive">Action Required</Badge>
                          )}
                        </div>
                        {insight.recommendedActions && insight.recommendedActions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {insight.recommendedActions.map((action, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}