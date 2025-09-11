'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Target,
  Users,
  ArrowUp,
  ArrowDown,
  Medal,
  Award,
  Trophy,
  Crown
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery } from '@tanstack/react-query';
import { getServiceProviderCrossClientAnalytics, type ServiceProviderClientAnalytics } from '@/lib/api/analytics-service';

interface ClientPerformanceRankingsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onClientSelect?: (clientId: string) => void;
}

export function ClientPerformanceRankings({ 
  timeRange = '30d',
  onClientSelect 
}: ClientPerformanceRankingsProps) {
  const { state: { organizationId } } = useServiceProvider();
  const [rankingMetric, setRankingMetric] = useState<'engagement' | 'views' | 'conversions' | 'content'>('engagement');
  const [showAll, setShowAll] = useState(false);

  // Get cross-client analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['client-performance-rankings', organizationId, timeRange],
    queryFn: () => getServiceProviderCrossClientAnalytics({
      organizationId: organizationId!,
      timeRange,
      compareClients: true
    }),
    enabled: !!organizationId,
  });

  // Get ranking icon based on position
  const getRankingIcon = (position: number) => {
    switch (position) {
      case 0: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Medal className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get ranking badge color
  const getRankingBadgeColor = (position: number) => {
    switch (position) {
      case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 1: return 'bg-gray-100 text-gray-800 border-gray-200';
      case 2: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  // Get metric value
  const getMetricValue = (client: ServiceProviderClientAnalytics, metric: string) => {
    switch (metric) {
      case 'engagement':
        return `${client.contentMetrics.avgEngagementRate.toFixed(1)}%`;
      case 'views':
        return client.contentMetrics.totalViews.toLocaleString();
      case 'conversions':
        return `${client.contentMetrics.conversionRate.toFixed(1)}%`;
      case 'content':
        return client.contentMetrics.totalContent.toString();
      default:
        return '0';
    }
  };

  // Get sorted clients based on selected metric
  const getSortedClients = () => {
    if (!analyticsData) return [];
    
    const clients = [...analyticsData.clientAnalytics];
    
    switch (rankingMetric) {
      case 'engagement':
        return clients.sort((a, b) => b.contentMetrics.avgEngagementRate - a.contentMetrics.avgEngagementRate);
      case 'views':
        return clients.sort((a, b) => b.contentMetrics.totalViews - a.contentMetrics.totalViews);
      case 'conversions':
        return clients.sort((a, b) => b.contentMetrics.conversionRate - a.contentMetrics.conversionRate);
      case 'content':
        return clients.sort((a, b) => b.contentMetrics.totalContent - a.contentMetrics.totalContent);
      default:
        return clients;
    }
  };

  const sortedClients = getSortedClients();
  const displayClients = showAll ? sortedClients : sortedClients.slice(0, 5);

  // Calculate benchmark scores
  const calculateBenchmarkScore = (client: ServiceProviderClientAnalytics) => {
    if (!analyticsData) return 0;
    
    const avgEngagement = analyticsData.aggregateMetrics.averageEngagement;
    const avgViews = analyticsData.aggregateMetrics.totalViews / analyticsData.aggregateMetrics.totalClients;
    const avgConversion = analyticsData.aggregateMetrics.averageConversionRate;
    
    // Weighted score calculation
    const engagementScore = (client.contentMetrics.avgEngagementRate / avgEngagement) * 40;
    const viewsScore = (client.contentMetrics.totalViews / avgViews) * 30;
    const conversionScore = (client.contentMetrics.conversionRate / avgConversion) * 30;
    
    return Math.round(engagementScore + viewsScore + conversionScore);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Performance Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Client Performance Rankings</CardTitle>
          <Select value={rankingMetric} onValueChange={(value: unknown) => setRankingMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="conversions">Conversions</SelectItem>
              <SelectItem value="content">Content Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Ranked by {rankingMetric === 'engagement' ? 'engagement rate' : rankingMetric} for the last {timeRange}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {displayClients.map((client, index) => {
            const benchmarkScore = calculateBenchmarkScore(client);
            const isAboveBenchmark = benchmarkScore > 100;
            
            return (
              <div
                key={client.clientId}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  index === 0 ? 'border-yellow-200 bg-yellow-50' :
                  index === 1 ? 'border-gray-200 bg-gray-50' :
                  index === 2 ? 'border-amber-200 bg-amber-50' :
                  'border-gray-100 bg-white hover:border-blue-200'
                }`}
                onClick={() => onClientSelect?.(client.clientId)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankingIcon(index)}
                    <Badge 
                      variant="outline" 
                      className={`w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm font-bold ${getRankingBadgeColor(index)}`}
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{client.clientName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {client.clientType}
                      </Badge>
                      {isAboveBenchmark && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                          Above Benchmark
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {client.contentMetrics.avgEngagementRate.toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {client.contentMetrics.totalViews.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {client.contentMetrics.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {getMetricValue(client, rankingMetric)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <span>Score: {benchmarkScore}</span>
                    {benchmarkScore > 110 && <TrendingUp className="h-3 w-3 text-green-600" />}
                    {benchmarkScore < 90 && <TrendingDown className="h-3 w-3 text-red-600" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {sortedClients.length > 5 && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${sortedClients.length} Clients`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}