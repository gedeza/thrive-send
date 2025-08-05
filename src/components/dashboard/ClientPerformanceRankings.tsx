'use client';

/**
 * ClientPerformanceRankings Component  
 * Built from Analytics TDD v2.0.0 - PRD Compliant B2B2G Architecture
 * 
 * Provides comprehensive client performance rankings and health scoring
 * for service providers to track and benchmark their client portfolio.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  BarChart3,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Info,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  ClientRankings,
  ClientRanking,
  ClientPerformanceRankingsProps,
  PerformanceIndicator,
  TrendDirection
} from '@/types/analytics';

// Service functions for API calls
const fetchClientRankings = async (
  organizationId: string,
  timeRange: string = '30d',
  rankingType: string = 'overall'
): Promise<ClientRankings> => {
  const response = await fetch(`/api/service-provider/analytics/client-rankings?organizationId=${organizationId}&timeRange=${timeRange}&rankingType=${rankingType}`);
  if (!response.ok) throw new Error('Failed to fetch client rankings');
  return response.json();
};

export function ClientPerformanceRankings({
  organizationId,
  timeRange = '30d',
  rankingType = 'overall',
  onClientSelect
}: ClientPerformanceRankingsProps) {
  // Component State
  const [currentTimeRange, setCurrentTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(timeRange);
  const [currentRankingType, setCurrentRankingType] = useState<'overall' | 'engagement' | 'growth' | 'revenue'>(rankingType);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'rankings' | 'insights' | 'trends'>('rankings');

  // Data Query
  const { 
    data: rankingsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['client-rankings', organizationId, currentTimeRange, currentRankingType],
    queryFn: () => fetchClientRankings(organizationId, currentTimeRange, currentRankingType),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Computed Data
  const filteredRankings = useMemo(() => {
    if (!rankingsData) return [];
    
    const rankings = 
      currentRankingType === 'engagement' ? rankingsData.byEngagement :
      currentRankingType === 'growth' ? rankingsData.byGrowth :
      currentRankingType === 'revenue' ? rankingsData.byRevenue :
      rankingsData.byOverallPerformance;
    
    if (!searchQuery) return rankings;
    
    return rankings.filter(client =>
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rankingsData, currentRankingType, searchQuery]);

  // Utility Functions
  const getTrendIcon = useCallback((trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  const getRankIcon = useCallback((rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-600" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-500" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
  }, []);

  const getRankColor = useCallback((rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }, []);

  const getPerformanceStatus = useCallback((indicators: PerformanceIndicator[]) => {
    const excellentCount = indicators.filter(i => i.status === 'excellent').length;
    const goodCount = indicators.filter(i => i.status === 'good').length;
    const total = indicators.length;
    
    if (excellentCount >= total * 0.7) return { status: 'excellent', color: 'text-green-600 bg-green-100' };
    if (goodCount + excellentCount >= total * 0.5) return { status: 'good', color: 'text-blue-600 bg-blue-100' };
    return { status: 'needs-attention', color: 'text-red-600 bg-red-100' };
  }, []);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat().format(num);
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (!rankingsData) return;
    
    try {
      const exportData = {
        clientRankings: rankingsData,
        timestamp: new Date().toISOString(),
        organizationId,
        timeRange: currentTimeRange,
        exportType: 'rankings' as const
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `client-rankings-${timestamp}`;

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

      console.log(`✅ Client rankings exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }, [rankingsData, organizationId, currentTimeRange]);

  // Loading and Error States
  if (error) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Rankings Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load client rankings. Please try refreshing.
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
            <h2 className="text-2xl font-bold">Client Performance Rankings</h2>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!rankingsData) {
    return (
      <Card className="p-8 text-center">
        <Info className="h-8 w-8 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Rankings Data</h3>
        <p className="text-muted-foreground">
          Client rankings data is not available yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Client Performance Rankings</h2>
          <p className="text-muted-foreground">
            Compare and rank your {filteredRankings.length} clients by performance metrics
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={currentTimeRange} onValueChange={(value: any) => setCurrentTimeRange(value)}>
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

      {/* Content */}
      <Tabs value={currentTab} onValueChange={(value: any) => setCurrentTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="insights">Performance Insights</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-6">
          {/* Controls */}
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
            
            <Select value={currentRankingType} onValueChange={(value: any) => setCurrentRankingType(value)}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall Performance</SelectItem>
                <SelectItem value="engagement">Engagement Rate</SelectItem>
                <SelectItem value="growth">Growth Rate</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rankings List */}
          <div className="space-y-4">
            {filteredRankings.map((ranking: ClientRanking) => {
              const performanceStatus = getPerformanceStatus(ranking.performanceIndicators);
              
              return (
                <Card 
                  key={ranking.clientId} 
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => onClientSelect?.(ranking.clientId)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getRankColor(ranking.rank)}`}>
                          {getRankIcon(ranking.rank)}
                        </div>

                        {/* Client Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{ranking.clientName}</h3>
                            {ranking.rankChange !== 0 && (
                              <Badge variant="outline" className={`text-xs ${
                                ranking.rankChange > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                              }`}>
                                {ranking.rankChange > 0 ? '↑' : '↓'} {Math.abs(ranking.rankChange)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Score: {ranking.score.toFixed(1)}/100</span>
                            <Badge className={performanceStatus.color}>
                              {performanceStatus.status === 'excellent' ? 'Excellent' :
                               performanceStatus.status === 'good' ? 'Good' : 'Needs Attention'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="flex items-center gap-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          {ranking.performanceIndicators.slice(0, 4).map((indicator: PerformanceIndicator, index: number) => (
                            <div key={index} className="text-center">
                              <div className="flex items-center gap-1 justify-center mb-1">
                                {getTrendIcon(indicator.trend)}
                                <span className="text-xs text-muted-foreground">{indicator.metric}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {typeof indicator.value === 'number' ? 
                                  (indicator.metric.includes('%') ? `${indicator.value.toFixed(1)}%` : formatNumber(indicator.value)) : 
                                  indicator.value
                                }
                              </div>
                              <div className={`text-xs px-1 rounded ${
                                indicator.status === 'excellent' ? 'bg-green-50 text-green-700' :
                                indicator.status === 'good' ? 'bg-blue-50 text-blue-700' :
                                indicator.status === 'average' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {indicator.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredRankings.length === 0 && (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Rankings Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No clients match your search criteria.' : 'Rankings will appear as client data becomes available.'}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Top Performers Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <h3 className="font-semibold mb-2">Top Performer</h3>
                {filteredRankings[0] && (
                  <>
                    <p className="text-lg font-bold">{filteredRankings[0].clientName}</p>
                    <p className="text-sm text-muted-foreground">Score: {filteredRankings[0].score.toFixed(1)}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-2">Biggest Climber</h3>
                {(() => {
                  const biggestGainer = filteredRankings.reduce((max, client) => 
                    client.rankChange > max.rankChange ? client : max, 
                    filteredRankings[0] || { rankChange: 0 }
                  );
                  return biggestGainer && (
                    <>
                      <p className="text-lg font-bold">{biggestGainer.clientName}</p>
                      <p className="text-sm text-muted-foreground">+{biggestGainer.rankChange} positions</p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold mb-2">Needs Attention</h3>
                {(() => {
                  const needsAttention = filteredRankings.find(client => 
                    getPerformanceStatus(client.performanceIndicators).status === 'needs-attention'
                  );
                  return needsAttention && (
                    <>
                      <p className="text-lg font-bold">{needsAttention.clientName}</p>
                      <p className="text-sm text-muted-foreground">Score: {needsAttention.score.toFixed(1)}</p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <ArrowUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredRankings.filter(c => c.rankChange > 0).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <ArrowDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-muted-foreground">Declining</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredRankings.filter(c => c.rankChange < 0).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Minus className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-muted-foreground">Stable</p>
                <p className="text-2xl font-bold text-gray-600">
                  {filteredRankings.filter(c => c.rankChange === 0).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(filteredRankings.reduce((sum, c) => sum + c.score, 0) / filteredRankings.length || 0).toFixed(1)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}