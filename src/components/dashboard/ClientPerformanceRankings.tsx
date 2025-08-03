'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Star, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServiceProvider } from '@/context/ServiceProviderContext';

interface ClientRanking {
  id: string;
  name: string;
  type: string;
  performanceScore: number;
  engagementRate: number;
  revenue: number;
  campaignsActive: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  rank: number;
  previousRank?: number;
}

interface ClientPerformanceRankingsProps {
  className?: string;
}

export function ClientPerformanceRankings({ className = '' }: ClientPerformanceRankingsProps) {
  const { state } = useServiceProvider();
  const [rankings, setRankings] = useState<ClientRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'performance' | 'engagement' | 'revenue'>('performance');

  useEffect(() => {
    fetchClientRankings();
  }, [state.organizationId, sortBy]);

  const fetchClientRankings = async () => {
    if (!state.organizationId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/service-provider/client-rankings?organizationId=${state.organizationId}&sortBy=${sortBy}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      } else {
        // Fallback to mock data for demo
        setRankings(getMockRankings());
      }
    } catch (error) {
      console.error('Failed to fetch client rankings:', error);
      setRankings(getMockRankings());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockRankings = (): ClientRanking[] => [
    {
      id: '1',
      name: 'Tech Startup Inc',
      type: 'Technology',
      performanceScore: 94.2,
      engagementRate: 8.7,
      revenue: 45000,
      campaignsActive: 12,
      trend: 'up',
      trendValue: 12.5,
      rank: 1,
      previousRank: 2,
    },
    {
      id: '2',
      name: 'Municipal Corp',
      type: 'Government',
      performanceScore: 87.8,
      engagementRate: 7.2,
      revenue: 38000,
      campaignsActive: 8,
      trend: 'up',
      trendValue: 5.3,
      rank: 2,
      previousRank: 3,
    },
    {
      id: '3',
      name: 'Downtown Bistro',
      type: 'Restaurant',
      performanceScore: 82.1,
      engagementRate: 9.1,
      revenue: 22000,
      campaignsActive: 6,
      trend: 'stable',
      trendValue: 0.8,
      rank: 3,
      previousRank: 1,
    },
    {
      id: '4',
      name: 'Local Coffee Shop',
      type: 'Hospitality',
      performanceScore: 79.5,
      engagementRate: 6.8,
      revenue: 18000,
      campaignsActive: 4,
      trend: 'down',
      trendValue: -3.2,
      rank: 4,
      previousRank: 4,
    },
    {
      id: '5',
      name: 'Creative Agency',
      type: 'Marketing',
      performanceScore: 75.3,
      engagementRate: 7.9,
      revenue: 31000,
      campaignsActive: 9,
      trend: 'up',
      trendValue: 8.1,
      rank: 5,
      previousRank: 6,
    },
  ];

  const getTrendIcon = (trend: string, trendValue: number) => {
    const iconProps = { className: "h-4 w-4" };
    
    if (trend === 'up') {
      return <TrendingUp {...iconProps} className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown {...iconProps} className="h-4 w-4 text-red-500" />;
    } else {
      return <ArrowUpDown {...iconProps} className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank === 2) return 'bg-gray-100 text-gray-800';
    if (rank === 3) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Star className="h-4 w-4" />;
    }
    return <span className="text-sm font-bold">{rank}</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Client Performance Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Client Performance Rankings</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant={sortBy === 'performance' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('performance')}
            className="text-xs"
          >
            Performance
          </Button>
          <Button
            variant={sortBy === 'engagement' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('engagement')}
            className="text-xs"
          >
            Engagement
          </Button>
          <Button
            variant={sortBy === 'revenue' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('revenue')}
            className="text-xs"
          >
            Revenue
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Rank Badge */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getRankBadgeColor(client.rank)}`}>
                  {getRankIcon(client.rank)}
                </div>

                {/* Client Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{client.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {client.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {client.campaignsActive} campaigns
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {client.engagementRate.toFixed(1)}% engagement
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center space-x-4 text-right">
                {/* Primary Metric based on sort */}
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {sortBy === 'performance' && client.performanceScore.toFixed(1)}
                    {sortBy === 'engagement' && `${client.engagementRate.toFixed(1)}%`}
                    {sortBy === 'revenue' && formatCurrency(client.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {sortBy === 'performance' && 'Score'}
                    {sortBy === 'engagement' && 'Engagement'}
                    {sortBy === 'revenue' && 'Revenue'}
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center space-x-1">
                  {getTrendIcon(client.trend, client.trendValue)}
                  <span className={`text-xs font-medium ${
                    client.trend === 'up' ? 'text-green-600' : 
                    client.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {client.trend === 'stable' ? '±' : client.trend === 'up' ? '+' : ''}
                    {Math.abs(client.trendValue).toFixed(1)}%
                  </span>
                </div>

                {/* Rank Change Indicator */}
                {client.previousRank && client.previousRank !== client.rank && (
                  <div className="text-xs text-gray-400">
                    {client.rank < client.previousRank ? '↑' : '↓'}
                    {Math.abs(client.rank - client.previousRank)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {rankings.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-sm">No client data available</div>
              <div className="text-xs">Rankings will appear as clients become active</div>
            </div>
          )}
        </div>

        {rankings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" size="sm" className="w-full">
              View Detailed Rankings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}