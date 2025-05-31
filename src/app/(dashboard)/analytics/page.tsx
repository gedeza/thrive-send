"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, LineChart, FileDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateFilter } from '@/components/ui/date-filter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BarChartWidget from "@/components/analytics/BarChartWidget";
import PieChartWidget from "@/components/analytics/PieChartWidget";
import LineChartWidget from "@/components/analytics/LineChartWidget";
import { useAnalytics, type AnalyticsMetric } from '@/lib/api/analytics-service';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { DateRange } from 'react-day-picker';
import { useAnalyticsQueries } from '@/lib/hooks/useAnalyticsQueries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary';
import { HeatMapWidget } from '@/components/analytics/HeatMapWidget';

type AnalyticsTimeframe = 'day' | 'week' | 'month';

interface MetricData {
  key: string;
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

function AnalyticsPageContent() {
  const analytics = useAnalytics();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      from: sevenDaysAgo,
      to: today
    };
  });
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('day');
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [queryParams, setQueryParams] = useState<{
    startDate: Date;
    endDate: Date;
    timeframe: AnalyticsTimeframe;
    campaignId?: string;
  } | null>(null);

  // Initialize and update query params
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      setQueryParams({
        startDate: dateRange.from,
        endDate: dateRange.to,
        timeframe,
        campaignId
      });
    }
  }, [dateRange, timeframe, campaignId]);

  const {
    metrics,
    metricsLoading,
    metricsError,
    audienceData,
    audienceLoading,
    audienceError,
    engagementData,
    engagementLoading,
    engagementError,
    performanceData,
    performanceLoading,
    performanceError,
    refetchAll
  } = useAnalyticsQueries(queryParams || {
    startDate: dateRange.from,
    endDate: dateRange.to,
    timeframe,
    campaignId
  });

  const handleExport = async () => {
    try {
      // Implement export functionality
      toast({
        title: "Export started",
        description: "Your data is being prepared for download.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error preparing your data for export.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while initializing
  if (!queryParams) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your audience engagement and performance metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => refetchAll()} className="flex-1 md:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} className="flex-1 md:flex-none">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <DateFilter 
          value={dateRange} 
          onChange={setDateRange}
          className="w-full md:w-auto"
        />
        
        <Select 
          value={timeframe} 
          onValueChange={(value) => setTimeframe(value as AnalyticsTimeframe)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-4 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))
        ) : metricsError ? (
          <div className="col-span-4 text-center text-destructive">
            {metricsError.toString()}
          </div>
        ) : Array.isArray(metrics) ? (
          metrics.map((metric: MetricData) => (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.label}
                </CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-4 text-center text-muted-foreground">
            No metrics data available
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {engagementLoading ? (
              <Skeleton className="h-[300px]" />
            ) : engagementError ? (
              <div className="text-center text-destructive">{engagementError.toString()}</div>
            ) : (
              <LineChartWidget 
                data={engagementData} 
                title="Engagement Overview"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {audienceLoading ? (
              <Skeleton className="h-[300px]" />
            ) : audienceError ? (
              <div className="text-center text-destructive">{audienceError.toString()}</div>
            ) : (
              <PieChartWidget 
                data={audienceData} 
                title="Audience Distribution"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <Skeleton className="h-[300px]" />
            ) : performanceError ? (
              <div className="text-center text-destructive">{performanceError.toString()}</div>
            ) : (
              <BarChartWidget 
                data={performanceData} 
                title="Performance Metrics"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Heat Map Section */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatMapWidget />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsErrorBoundary>
        <AnalyticsPageContent />
      </AnalyticsErrorBoundary>
    </QueryClientProvider>
  );
}
