'use client';

/**
 * ServiceProviderAnalyticsDashboard Component
 * Built from Analytics TDD v2.0.0 - PRD Compliant B2B2G Architecture
 * 
 * Main analytics interface for service providers to monitor their entire 
 * client portfolio and business performance across multiple revenue streams.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  ServiceProviderMetrics,
  CrossClientAnalytics,
  RevenueAnalytics,
  ServiceProviderAnalyticsDashboardProps,
  AnalyticsInsight,
  TrendDirection
} from '@/types/analytics';
import { useServiceProvider } from '@/context/ServiceProviderContext';

// Service functions for API calls
const fetchServiceProviderMetrics = async (
  organizationId: string, 
  timeRange: string
): Promise<ServiceProviderMetrics> => {
  const response = await fetch(`/api/service-provider/analytics/metrics?organizationId=${organizationId}&timeRange=${timeRange}`);
  if (!response.ok) throw new Error('Failed to fetch service provider metrics');
  return response.json();
};

const fetchCrossClientAnalytics = async (
  organizationId: string, 
  timeRange: string
): Promise<CrossClientAnalytics> => {
  const response = await fetch(`/api/service-provider/analytics/cross-client?organizationId=${organizationId}&timeRange=${timeRange}&compareClients=true`);
  if (!response.ok) throw new Error('Failed to fetch cross-client analytics');
  return response.json();
};

const fetchRevenueAnalytics = async (
  organizationId: string, 
  timeRange: string
): Promise<RevenueAnalytics> => {
  const response = await fetch(`/api/service-provider/analytics/revenue?organizationId=${organizationId}&timeRange=${timeRange}&includeForecasting=true`);
  if (!response.ok) throw new Error('Failed to fetch revenue analytics');
  return response.json();
};

export function ServiceProviderAnalyticsDashboard({
  organizationId,
  defaultTimeRange = '30d',
  initialView = 'overview'
}: ServiceProviderAnalyticsDashboardProps) {
  const { state } = useServiceProvider();
  
  // Component State
  const [currentView, setCurrentView] = useState<'overview' | 'cross-client' | 'revenue' | 'rankings'>(initialView);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(defaultTimeRange);
  const [isExporting, setIsExporting] = useState(false);

  // Data Queries
  const { 
    data: serviceProviderMetrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useQuery({
    queryKey: ['service-provider-metrics', organizationId, timeRange],
    queryFn: () => fetchServiceProviderMetrics(organizationId, timeRange),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { 
    data: crossClientData, 
    isLoading: crossClientLoading, 
    error: crossClientError,
    refetch: refetchCrossClient 
  } = useQuery({
    queryKey: ['cross-client-analytics', organizationId, timeRange],
    queryFn: () => fetchCrossClientAnalytics(organizationId, timeRange),
    enabled: !!organizationId && (currentView === 'overview' || currentView === 'cross-client'),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  const { 
    data: revenueData, 
    isLoading: revenueLoading, 
    error: revenueError,
    refetch: refetchRevenue 
  } = useQuery({
    queryKey: ['revenue-analytics', organizationId, timeRange],
    queryFn: () => fetchRevenueAnalytics(organizationId, timeRange),
    enabled: !!organizationId && (currentView === 'overview' || currentView === 'revenue'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Utility Functions
  const getTrendIcon = useCallback((trend: TrendDirection, value?: number) => {
    if (trend === 'up' || (value && value > 0)) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' || (value && value < 0)) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  }, []);

  const getInsightIcon = useCallback((type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }, []);

  // Event Handlers
  const handleRefresh = useCallback(() => {
    refetchMetrics();
    refetchCrossClient();
    refetchRevenue();
  }, [refetchMetrics, refetchCrossClient, refetchRevenue]);

  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      const exportData = {
        serviceProviderMetrics,
        crossClientAnalytics: crossClientData,
        revenueAnalytics: revenueData,
        timestamp: new Date().toISOString(),
        organizationId,
        timeRange,
        exportType: 'full' as const
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `service-provider-analytics-${timestamp}`;

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

      console.log(`✅ Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [serviceProviderMetrics, crossClientData, revenueData, organizationId, timeRange]);

  // Loading and Error States
  const isMainLoading = useMemo(() => {
    return metricsLoading || (currentView === 'cross-client' && crossClientLoading) || (currentView === 'revenue' && revenueLoading);
  }, [metricsLoading, crossClientLoading, revenueLoading, currentView]);

  const currentError = useMemo(() => {
    return metricsError || crossClientError || revenueError;
  }, [metricsError, crossClientError, revenueError]);

  if (currentError) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Analytics Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load analytics data. Please try refreshing or contact support.
        </p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </Card>
    );
  }

  if (isMainLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Service Provider Analytics</h2>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
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
        <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
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
            Monitor performance across your {serviceProviderMetrics?.totalClients || 0} client portfolio
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
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Select onValueChange={(value) => handleExport(value as 'csv' | 'excel' | 'pdf')} disabled={isExporting}>
            <SelectTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
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

      {/* Key Business Metrics Cards */}
      {serviceProviderMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold">{serviceProviderMetrics.totalClients}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon('up', serviceProviderMetrics.growthMetrics.clientGrowthRate)}
                    <span className="text-sm text-green-600">
                      {formatPercentage(serviceProviderMetrics.growthMetrics.clientGrowthRate)}
                    </span>
                  </div>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(serviceProviderMetrics.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon('up', serviceProviderMetrics.growthMetrics.revenueGrowthRate)}
                    <span className="text-sm text-green-600">
                      {formatPercentage(serviceProviderMetrics.growthMetrics.revenueGrowthRate)}
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{serviceProviderMetrics.activeCampaigns}</p>
                  <p className="text-sm text-muted-foreground">
                    of {serviceProviderMetrics.totalCampaigns} total
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                  <p className="text-2xl font-bold">{serviceProviderMetrics.teamUtilization}%</p>
                  <p className="text-sm text-muted-foreground">
                    Client satisfaction: {serviceProviderMetrics.avgClientSatisfaction.toFixed(1)}/5.0
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Revenue Metrics */}
      {serviceProviderMetrics?.marketplaceRevenue > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Revenue Streams</h3>
              <Badge variant="outline">
                {formatPercentage(serviceProviderMetrics.growthMetrics.revenueGrowthRate)} growth
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Client Revenue</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(serviceProviderMetrics.totalRevenue - serviceProviderMetrics.marketplaceRevenue)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Marketplace Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(serviceProviderMetrics.marketplaceRevenue)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Average per Client</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(serviceProviderMetrics.totalRevenue / serviceProviderMetrics.totalClients)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Insights */}
      {crossClientData?.insights && crossClientData.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crossClientData.insights.slice(0, 3).map((insight: AnalyticsInsight, index: number) => (
                <div key={insight.id || index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.impact} impact
                      </Badge>
                      {insight.actionRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation to Detailed Views */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('cross-client')}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-2">Cross-Client Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Compare performance across your entire client portfolio
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('revenue')}>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold mb-2">Revenue Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Detailed revenue breakdown and business intelligence
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('rankings')}>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold mb-2">Client Rankings</h3>
            <p className="text-sm text-muted-foreground">
              Client performance rankings and health scoring
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}