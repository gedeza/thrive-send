'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  MailOpen, 
  MousePointer, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';

interface DeliveryMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplaints: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

interface RealTimeStats {
  lastHour: DeliveryMetrics;
  lastDay: DeliveryMetrics;
  lastWeek: DeliveryMetrics;
  lastMonth: DeliveryMetrics;
}

interface HealthScore {
  score: number;
  factors: Record<string, { score: number; weight: number; impact: string }>;
  recommendations: string[];
}

interface DeliveryDashboardProps {
  organizationId: string;
  campaignId?: string;
}

export function DeliveryDashboard({ organizationId, campaignId }: DeliveryDashboardProps) {
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('lastDay');
  const [granularity, setGranularity] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [organizationId, campaignId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRealTimeData(),
        loadHealthScore(),
        loadAnalytics(),
      ]);
    } catch (error) {
      console.error('Failed to load delivery dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        ...(campaignId && { campaignId }),
      });

      const response = await fetch(`/api/analytics/delivery/realtime?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setRealTimeStats(data);
      }
    } catch (error) {
      console.error('Failed to load real-time stats:', error);
    }
  };

  const loadHealthScore = async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        ...(campaignId && { campaignId }),
      });

      const response = await fetch(`/api/analytics/delivery/health?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setHealthScore(data.healthScore);
      }
    } catch (error) {
      console.error('Failed to load health score:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        granularity,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        ...(campaignId && { campaignId }),
      });

      const response = await fetch(`/api/analytics/delivery?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        organizationId,
        format,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        includeMetadata: 'true',
        ...(campaignId && { campaignId }),
      });

      const response = await fetch(`/api/analytics/delivery/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `delivery-data-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getMetricsForTimeframe = (timeframe: string): DeliveryMetrics => {
    if (!realTimeStats) return {} as DeliveryMetrics;
    
    switch (timeframe) {
      case 'lastHour': return realTimeStats.lastHour;
      case 'lastDay': return realTimeStats.lastDay;
      case 'lastWeek': return realTimeStats.lastWeek;
      case 'lastMonth': return realTimeStats.lastMonth;
      default: return realTimeStats.lastDay;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const currentMetrics = getMetricsForTimeframe(selectedTimeframe);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Delivery Analytics</h2>
          <p className="text-gray-600">Real-time tracking and performance insights</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-4 items-center">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastHour">Last Hour</SelectItem>
            <SelectItem value="lastDay">Last Day</SelectItem>
            <SelectItem value="lastWeek">Last Week</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      {/* Health Score */}
      {healthScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHealthIcon(healthScore.score)}
              Delivery Health Score
              <Badge 
                variant={healthScore.score >= 80 ? 'default' : healthScore.score >= 60 ? 'secondary' : 'destructive'}
                className="ml-auto"
              >
                {healthScore.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={healthScore.score} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(healthScore.factors).map(([factor, data]) => (
                  <div key={factor} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={getHealthColor(data.score)}>
                        {Math.round(data.score)}%
                      </span>
                    </div>
                    <Progress value={data.score} className="h-1" />
                  </div>
                ))}
              </div>

              {healthScore.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {healthScore.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold">{currentMetrics.totalSent?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {currentMetrics.deliveryRate?.toFixed(1) || 0}% delivered
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opens</p>
                <p className="text-2xl font-bold">{currentMetrics.totalOpened?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {currentMetrics.openRate?.toFixed(1) || 0}% open rate
                </p>
              </div>
              <MailOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clicks</p>
                <p className="text-2xl font-bold">{currentMetrics.totalClicked?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {currentMetrics.clickRate?.toFixed(1) || 0}% click rate
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bounces</p>
                <p className="text-2xl font-bold">{currentMetrics.totalBounced?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {currentMetrics.bounceRate?.toFixed(1) || 0}% bounce rate
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.trends.deliveryTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Open Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.trends.openTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Click Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.trends.clickTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>By Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.breakdown.byProvider).map(([provider, metrics]) => ({
                          name: provider,
                          value: (metrics as DeliveryMetrics).totalSent,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {Object.entries(analytics.breakdown.byProvider).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Hour of Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analytics.breakdown.byHour).map(([hour, metrics]) => ({
                      hour,
                      sent: (metrics as DeliveryMetrics).totalSent,
                      opened: (metrics as DeliveryMetrics).totalOpened,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sent" fill="#3b82f6" />
                      <Bar dataKey="opened" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.metrics.deliveryRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Delivery Rate</div>
                    <div className="mt-2">
                      {analytics.metrics.deliveryRate >= 95 ? (
                        <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.metrics.openRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                    <div className="mt-2">
                      {analytics.metrics.openRate >= 20 ? (
                        <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics.metrics.clickRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                    <div className="mt-2">
                      {analytics.metrics.clickRate >= 3 ? (
                        <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}