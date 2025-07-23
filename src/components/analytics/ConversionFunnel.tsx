'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Target, 
  ArrowDown,
  Settings,
  Eye,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface FunnelStage {
  id: string;
  name: string;
  description?: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeSpent?: number;
  value?: number;
}

interface ConversionFunnelData {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  stages: FunnelStage[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  revenue?: number;
  averageOrderValue?: number;
  timeframe: string;
  lastUpdated: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

interface ConversionFunnelProps {
  campaignId?: string;
  timeframe?: string;
  showControls?: boolean;
}

export function ConversionFunnel({ campaignId, timeframe = '30d', showControls = true }: ConversionFunnelProps) {
  const [funnel, setFunnel] = useState<ConversionFunnelData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnelData();
  }, [campaignId, selectedTimeframe]);

  const fetchFunnelData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      const mockFunnel: ConversionFunnelData = {
        id: '1',
        name: 'E-commerce Purchase Funnel',
        campaignId: campaignId || '1',
        campaignName: 'Summer Sale Campaign',
        totalVisitors: 10000,
        totalConversions: 850,
        overallConversionRate: 8.5,
        revenue: 127500,
        averageOrderValue: 150,
        timeframe: selectedTimeframe,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE',
        stages: [
          {
            id: 'awareness',
            name: 'Landing Page Visit',
            description: 'Users who visited the campaign landing page',
            visitors: 10000,
            conversions: 10000,
            conversionRate: 100,
            dropoffRate: 0,
            avgTimeSpent: 45,
            value: 0
          },
          {
            id: 'interest',
            name: 'Product View',
            description: 'Users who viewed product details',
            visitors: 6500,
            conversions: 6500,
            conversionRate: 65,
            dropoffRate: 35,
            avgTimeSpent: 120,
            value: 0
          },
          {
            id: 'consideration',
            name: 'Add to Cart',
            description: 'Users who added items to their cart',
            visitors: 3200,
            conversions: 3200,
            conversionRate: 32,
            dropoffRate: 50.8,
            avgTimeSpent: 180,
            value: 0
          },
          {
            id: 'intent',
            name: 'Checkout Started',
            description: 'Users who began the checkout process',
            visitors: 1400,
            conversions: 1400,
            conversionRate: 14,
            dropoffRate: 56.3,
            avgTimeSpent: 240,
            value: 0
          },
          {
            id: 'purchase',
            name: 'Purchase Complete',
            description: 'Users who completed their purchase',
            visitors: 850,
            conversions: 850,
            conversionRate: 8.5,
            dropoffRate: 39.3,
            avgTimeSpent: 300,
            value: 127500
          }
        ]
      };

      setFunnel(mockFunnel);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageWidth = (visitors: number, totalVisitors: number) => {
    return Math.max((visitors / totalVisitors) * 100, 10); // Minimum 10% width for visibility
  };

  const getDropoffColor = (dropoffRate: number) => {
    if (dropoffRate > 50) return 'text-red-600';
    if (dropoffRate > 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConversionColor = (conversionRate: number, stageIndex: number) => {
    // Lower stages naturally have lower conversion rates
    const expectedRate = 100 - (stageIndex * 20);
    if (conversionRate >= expectedRate * 0.8) return 'text-green-600';
    if (conversionRate >= expectedRate * 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!funnel) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Funnel Data Available</h3>
          <p className="text-muted-foreground">Set up conversion tracking to see funnel analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      {showControls && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{funnel.name}</h2>
            <p className="text-muted-foreground">Campaign: {funnel.campaignName}</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold">{formatNumber(funnel.totalVisitors)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{formatNumber(funnel.totalConversions)}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(funnel.overallConversionRate)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        {funnel.revenue && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${formatNumber(funnel.revenue)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {funnel.stages.map((stage, index) => {
              const stageWidth = getStageWidth(stage.visitors, funnel.totalVisitors);
              const isSelected = selectedStage === stage.id;
              
              return (
                <div key={stage.id} className="space-y-2">
                  {/* Stage Bar */}
                  <div 
                    className={`relative cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  >
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-shadow"
                      style={{ width: `${stageWidth}%` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{stage.name}</h4>
                          <p className="text-blue-100 text-sm">{stage.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatNumber(stage.visitors)}
                          </div>
                          <div className="text-blue-100 text-sm">
                            {formatPercentage(stage.conversionRate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dropoff indicator */}
                    {index < funnel.stages.length - 1 && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex flex-col items-center">
                          <ArrowDown className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-xs font-medium ${getDropoffColor(stage.dropoffRate)}`}>
                            -{formatPercentage(stage.dropoffRate)} dropoff
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stage Details (when selected) */}
                  {isSelected && (
                    <Card className="ml-4 border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Visitors</p>
                            <p className="text-lg font-semibold">{formatNumber(stage.visitors)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Conversion Rate</p>
                            <p className={`text-lg font-semibold ${getConversionColor(stage.conversionRate, index)}`}>
                              {formatPercentage(stage.conversionRate)}
                            </p>
                          </div>
                          {stage.avgTimeSpent && (
                            <div>
                              <p className="text-sm text-muted-foreground">Avg. Time Spent</p>
                              <p className="text-lg font-semibold">{stage.avgTimeSpent}s</p>
                            </div>
                          )}
                          {stage.value && stage.value > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground">Value Generated</p>
                              <p className="text-lg font-semibold">${formatNumber(stage.value)}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Stage</th>
                  <th className="text-right p-2">Visitors</th>
                  <th className="text-right p-2">Conversions</th>
                  <th className="text-right p-2">Rate</th>
                  <th className="text-right p-2">Dropoff</th>
                  <th className="text-right p-2">Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                {funnel.stages.map((stage, index) => (
                  <tr key={stage.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{stage.name}</div>
                        <div className="text-muted-foreground text-xs">{stage.description}</div>
                      </div>
                    </td>
                    <td className="text-right p-2">{formatNumber(stage.visitors)}</td>
                    <td className="text-right p-2">{formatNumber(stage.conversions)}</td>
                    <td className="text-right p-2">
                      <span className={getConversionColor(stage.conversionRate, index)}>
                        {formatPercentage(stage.conversionRate)}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      {index < funnel.stages.length - 1 ? (
                        <span className={getDropoffColor(stage.dropoffRate)}>
                          -{formatPercentage(stage.dropoffRate)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="text-right p-2">
                      {stage.avgTimeSpent ? `${stage.avgTimeSpent}s` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}