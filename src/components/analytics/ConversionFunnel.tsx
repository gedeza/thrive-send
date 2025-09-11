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
      console.log('📊 Fetching conversion funnel data...', { campaignId, timeframe: selectedTimeframe });
      
      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedTimeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch conversion data from live API
      const response = await fetch(
        `/api/analytics/conversions?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversion data');
      }

      const conversionData = await response.json();
      console.log('✅ Conversion data fetched successfully', conversionData);

      // Transform API response to funnel format
      const funnelStages = conversionData.conversionFunnel || [];
      const totalVisitors = funnelStages[0]?.count || 10000;
      const totalConversions = conversionData.totalConversions || 0;
      const revenue = conversionData.revenue || 0;

      // Create detailed funnel stages from API data
      const stages: FunnelStage[] = funnelStages.map((stage: any, index: number) => {
        const nextStage = funnelStages[index + 1];
        const dropoffRate = nextStage ? 
          ((stage.count - nextStage.count) / stage.count) * 100 : 0;
        
        return {
          id: stage.stage.toLowerCase().replace(/\s+/g, '_'),
          name: stage.stage,
          description: getStageDescription(stage.stage),
          visitors: stage.count,
          conversions: stage.count,
          conversionRate: stage.percentage,
          dropoffRate: Math.round(dropoffRate * 10) / 10,
          avgTimeSpent: getEstimatedTimeSpent(stage.stage),
          value: stage.stage === 'Conversions' ? revenue : 0
        };
      });

      // Create funnel data object
      const funnelData: ConversionFunnelData = {
        id: campaignId || 'default-funnel',
        name: 'Conversion Funnel Analysis',
        campaignId: campaignId || 'all-campaigns',
        campaignName: campaignId ? `Campaign ${campaignId}` : 'All Campaigns',
        totalVisitors,
        totalConversions,
        overallConversionRate: parseFloat(conversionData.conversionRate) || 0,
        revenue,
        averageOrderValue: conversionData.averageOrderValue || 0,
        timeframe: selectedTimeframe,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE',
        stages
      };

      console.log('📊 Funnel data processed:', {
        stages: funnelData.stages.length,
        totalVisitors: funnelData.totalVisitors,
        totalConversions: funnelData.totalConversions,
        conversionRate: funnelData.overallConversionRate
      });

      setFunnel(funnelData);
    } catch (_error) {
      console.error("", _error);
      
      // Fallback to basic demo data on error
      const fallbackFunnel: ConversionFunnelData = {
        id: '1',
        name: 'Conversion Funnel (Demo)',
        campaignId: campaignId || '1',
        campaignName: 'Demo Campaign',
        totalVisitors: 8500,
        totalConversions: 425,
        overallConversionRate: 5.0,
        revenue: 63750,
        averageOrderValue: 150,
        timeframe: selectedTimeframe,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE',
        stages: [
          {
            id: 'visitors',
            name: 'Visitors',
            description: 'Users who visited the site',
            visitors: 8500,
            conversions: 8500,
            conversionRate: 100,
            dropoffRate: 0,
            avgTimeSpent: 30,
            value: 0
          },
          {
            id: 'engaged_users',
            name: 'Engaged Users',
            description: 'Users who interacted with content',
            visitors: 1700,
            conversions: 1700,
            conversionRate: 20,
            dropoffRate: 80,
            avgTimeSpent: 120,
            value: 0
          },
          {
            id: 'qualified_leads',
            name: 'Qualified Leads',
            description: 'Users who showed purchase intent',
            visitors: 850,
            conversions: 850,
            conversionRate: 10,
            dropoffRate: 50,
            avgTimeSpent: 180,
            value: 0
          },
          {
            id: 'opportunities',
            name: 'Opportunities',
            description: 'Users who started conversion process',
            visitors: 340,
            conversions: 340,
            conversionRate: 4,
            dropoffRate: 60,
            avgTimeSpent: 240,
            value: 0
          },
          {
            id: 'conversions',
            name: 'Conversions',
            description: 'Users who completed the goal',
            visitors: 425,
            conversions: 425,
            conversionRate: 5,
            dropoffRate: 0,
            avgTimeSpent: 300,
            value: 63750
          }
        ]
      };
      
      setFunnel(fallbackFunnel);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get stage descriptions
  const getStageDescription = (stageName: string): string => {
    const descriptions: Record<string, string> = {
      'Visitors': 'Users who visited the site or landing page',
      'Engaged Users': 'Users who interacted with content or spent time on site',
      'Qualified Leads': 'Users who showed interest or engagement signals',
      'Opportunities': 'Users who started the conversion process',
      'Conversions': 'Users who completed the desired action'
    };
    return descriptions[stageName] || `Users in the ${stageName.toLowerCase()} stage`;
  };

  // Helper function to estimate time spent at each stage
  const getEstimatedTimeSpent = (stageName: string): number => {
    const timeEstimates: Record<string, number> = {
      'Visitors': 30,
      'Engaged Users': 120,
      'Qualified Leads': 180,
      'Opportunities': 240,
      'Conversions': 300
    };
    return timeEstimates[stageName] || 60;
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