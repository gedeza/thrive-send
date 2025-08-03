'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceProvider } from '@/context/ServiceProviderContext';

interface CrossClientAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  totalPerformance: {
    campaigns: number;
    engagement: number;
    revenue: number;
    growth: number;
  };
  clientComparison: {
    id: string;
    name: string;
    performance: number;
    campaigns: number;
    engagement: number;
    revenue: number;
  }[];
  trendData: {
    period: string;
    campaigns: number;
    engagement: number;
    revenue: number;
  }[];
}

export function CrossClientAnalytics({ className = '' }: CrossClientAnalyticsProps) {
  const { state } = useServiceProvider();
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cross-client analytics
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, state.organizationId]);

  const fetchAnalytics = async () => {
    if (!state.organizationId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/service-provider/analytics/cross-client?organizationId=${state.organizationId}&timeRange=${timeRange}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch cross-client analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cross-Client Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Cross-Client Performance</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        {analyticsData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.totalPerformance.campaigns}
                </div>
                <div className="text-sm text-gray-500">Total Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.totalPerformance.engagement.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Avg Engagement</div>
              </div>
              <div className="text-2xl font-bold text-purple-600 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${analyticsData.totalPerformance.revenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  +{analyticsData.totalPerformance.growth.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Growth Rate</div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <div className="text-sm">Cross-Client Performance Chart</div>
                <div className="text-xs">Chart.js integration will be added here</div>
              </div>
            </div>

            {/* Client Comparison Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Client Performance Comparison</h3>
              <div className="space-y-2">
                {analyticsData.clientComparison.map((client, index) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">
                          {client.campaigns} campaigns
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {client.engagement.toFixed(1)}%
                        </div>
                        <div className="text-gray-500">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          ${client.revenue.toLocaleString()}
                        </div>
                        <div className="text-gray-500">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">
                          {client.performance.toFixed(1)}
                        </div>
                        <div className="text-gray-500">Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-900">Campaign Volume</div>
                      <div className="text-lg font-bold text-blue-600">
                        {analyticsData.trendData[analyticsData.trendData.length - 1]?.campaigns || 0}
                      </div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-900">Engagement Rate</div>
                      <div className="text-lg font-bold text-green-600">
                        {analyticsData.trendData[analyticsData.trendData.length - 1]?.engagement.toFixed(1) || 0}%
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-purple-900">Revenue Growth</div>
                      <div className="text-lg font-bold text-purple-600">
                        ${analyticsData.trendData[analyticsData.trendData.length - 1]?.revenue.toLocaleString() || 0}
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!analyticsData && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <div>No analytics data available</div>
            <div className="text-sm">Data will appear as clients become active</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}