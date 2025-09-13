'use client';

/**
 * RevenueAnalyticsDashboard Component
 * Built from Analytics TDD v2.0.0 - PRD Compliant B2B2G Architecture
 * 
 * Provides comprehensive revenue analytics and business intelligence
 * for service providers to monitor financial performance and forecasting.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  PieChart,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Info,
  Lightbulb,
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  RevenueAnalytics,
  RevenueAnalyticsDashboardProps,
  RevenueStream,
  ClientRevenueAnalytics,
  UpsellOpportunity,
  ChurnRiskClient,
  TrendDirection
} from '@/types/analytics';
import { useAnalyticsCurrency } from '@/hooks/useCurrency';

// Service functions for API calls
const fetchRevenueAnalytics = async (
  organizationId: string,
  timeRange: string = '30d',
  includeForecasting: boolean = true
): Promise<RevenueAnalytics> => {
  const response = await fetch(`/api/service-provider/analytics/revenue?organizationId=${organizationId}&timeRange=${timeRange}&includeForecasting=${includeForecasting}`);
  if (!response.ok) throw new Error('Failed to fetch revenue analytics');
  return response.json();
};

export function RevenueAnalyticsDashboard({
  organizationId,
  timeRange = '30d',
  view = 'overview'
}: RevenueAnalyticsDashboardProps) {
  const { formatCurrency } = useAnalyticsCurrency();
  // Component State
  const [currentTimeRange, setCurrentTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(timeRange);
  const [currentView, setCurrentView] = useState<'overview' | 'breakdown' | 'forecasting' | 'profitability'>(view);
  const [selectedStream, setSelectedStream] = useState<string>('all');

  // Data Query
  const { 
    data: revenueData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['revenue-analytics', organizationId, currentTimeRange],
    queryFn: () => fetchRevenueAnalytics(organizationId, currentTimeRange, true),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Computed Data
  const topRevenueClients = useMemo(() => {
    if (!revenueData?.clientRevenue) return [];
    return [...revenueData.clientRevenue]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [revenueData?.clientRevenue]);

  const revenueStreams = useMemo(() => {
    if (!revenueData?.revenueBreakdown) return [];
    return [
      { name: 'Subscription Revenue', ...revenueData.revenueBreakdown.subscriptionRevenue },
      { name: 'Marketplace Commissions', ...revenueData.revenueBreakdown.marketplaceCommissions },
      { name: 'White Label Revenue', ...revenueData.revenueBreakdown.whiteLabelRevenue },
      { name: 'Additional Services', ...revenueData.revenueBreakdown.additionalServices }
    ];
  }, [revenueData?.revenueBreakdown]);

  // Utility Functions
  const getTrendIcon = useCallback((trend: TrendDirection, value?: number) => {
    if (trend === 'up' || (value && value > 0)) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' || (value && value < 0)) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }, []);

  // Currency formatting handled by useAnalyticsCurrency hook

  const formatPercentage = useCallback((value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }, []);

  const getChurnRiskColor = useCallback((risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  }, []);

  // Event Handlers
  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (!revenueData) return;
    
    try {
      const exportData = {
        revenueAnalytics: revenueData,
        timestamp: new Date().toISOString(),
        organizationId,
        timeRange: currentTimeRange,
        exportType: 'revenue' as const
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `revenue-analytics-${timestamp}`;

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

      console.log(`✅ Revenue analytics exported as ${format.toUpperCase()}`);
    } catch (_error) {
      console.error("", _error);
    }
  }, [revenueData, organizationId, currentTimeRange]);

  // Loading and Error States
  if (error) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Revenue Analytics Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load revenue analytics. Please try refreshing.
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
            <h2 className="text-2xl font-bold">Revenue Analytics</h2>
            <div className="w-96 h-4 bg-muted/50 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-muted/50 rounded animate-pulse" />
            <div className="w-24 h-10 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!revenueData) {
    return (
      <Card className="p-8 text-center">
        <Info className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Revenue Data</h3>
        <p className="text-muted-foreground">
          Revenue analytics data is not available yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive financial performance and business intelligence
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

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.revenueMetrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon('up', revenueData.revenueMetrics.revenueGrowthRate)}
                  <span className="text-sm text-green-600">
                    {formatPercentage(revenueData.revenueMetrics.revenueGrowthRate)}
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
                <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.revenueMetrics.mrr)}</p>
                <p className="text-sm text-muted-foreground">
                  ARR: {formatCurrency(revenueData.revenueMetrics.arr)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client Lifetime Value</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.revenueMetrics.clientLTV)}</p>
                <p className="text-sm text-muted-foreground">
                  Per client: {formatCurrency(revenueData.revenueMetrics.revenuePerClient)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{revenueData.revenueMetrics.profitMargin.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">
                  Churn: {revenueData.revenueMetrics.churnRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={currentView} onValueChange={(value: unknown) => setCurrentView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Streams Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {revenueStreams.map((stream, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{stream.name}</h3>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stream.amount)}</p>
                      <p className="text-sm text-muted-foreground">{stream.percentage.toFixed(1)}% of total</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(stream.trend, stream.growthRate)}
                      <span className={`text-sm font-medium ${
                        stream.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(stream.growthRate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Revenue Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topRevenueClients.map((client: ClientRevenueAnalytics, index: number) => (
                  <div key={client.clientId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-muted/50' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{client.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          LTV: {formatCurrency(client.ltv)} | Profitability: {client.profitability.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(client.totalRevenue)}</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon('up', client.revenueGrowth)}
                        <span className={`text-sm ${
                          client.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(client.revenueGrowth)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          {/* Detailed Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreams.map((stream, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stream.name}</span>
                        <span className="text-sm font-bold">{formatCurrency(stream.amount)}</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${stream.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{stream.percentage.toFixed(1)}% of total</span>
                        <span className={stream.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(stream.growthRate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.clientRevenue.slice(0, 8).map((client: ClientRevenueAnalytics) => (
                    <div key={client.clientId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          Monthly: {formatCurrency(client.monthlyRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(client.totalRevenue)}</p>
                        <p className={`text-sm ${client.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(client.revenueGrowth)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          {/* Forecasting Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.revenueForecasting.slice(0, 6).map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{forecast.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {(forecast.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(forecast.projectedRevenue)}</p>
                        {forecast.factors.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {forecast.factors[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.businessIntelligence.upsellOpportunities.slice(0, 5).map((opportunity: UpsellOpportunity) => (
                    <div key={opportunity.clientId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{opportunity.clientName}</h3>
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                          {formatCurrency(opportunity.potentialValue)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{opportunity.opportunityType}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Probability: {(opportunity.probability * 100).toFixed(0)}%</span>
                        <span>Timeline: {opportunity.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          {/* Profitability Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-2">Gross Margin</h3>
                <p className="text-2xl font-bold text-green-600">
                  {revenueData.profitabilityAnalysis.grossMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-2">Operating Margin</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {revenueData.profitabilityAnalysis.operatingMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <PieChart className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-2">Net Margin</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {revenueData.profitabilityAnalysis.netMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Churn Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Churn Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.businessIntelligence.churnRiskAssessment.slice(0, 5).map((client: ChurnRiskClient) => (
                  <div key={client.clientId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{client.clientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Risk Score: {client.riskScore}/100
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getChurnRiskColor(client.churnRisk)}>
                        {client.churnRisk.toUpperCase()} RISK
                      </Badge>
                      {client.riskFactors.length > 0 && (
                        <div className="text-xs text-muted-foreground max-w-xs">
                          {client.riskFactors[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profitability Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Profitability Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.businessIntelligence.profitabilityOptimization.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium capitalize">{recommendation.type.replace('_', ' ')}</h3>
                      <Badge variant="outline" className="text-green-600">
                        {formatCurrency(recommendation.potentialImpact)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Effort: {recommendation.implementationEffort}</span>
                      <span>Timeline: {recommendation.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}