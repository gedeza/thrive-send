"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, LineChart, FileDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
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

// Create a client
const queryClient = new QueryClient();

// Shared metric card component for summary/grid
function MetricCard({ title, value, icon: Icon, comparison, percentChange }: AnalyticsMetric & { icon: any }) {
  const isPositive = (percentChange ?? 0) >= 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">{value}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'} mt-1`}>
          {comparison}
        </p>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for metrics
function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-3 w-32 mt-1" />
      </CardContent>
    </Card>
  );
}

// Loading skeleton for charts
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

function AnalyticsPageContent() {
  const analytics = useAnalytics();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: firstDayOfMonth,
      to: today
    };
  });
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('month');
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
  
  // Function to handle data export
  const handleExport = async () => {
    try {
      if (!dateRange.from || !dateRange.to) {
        throw new Error('Please select a valid date range');
      }

    toast({
      title: "Export started",
      description: `Exporting analytics data from ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`,
    });
    
      const blob = await analytics.exportData('csv', {
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString()
      }, ['views', 'engagements', 'shares', 'likes', 'comments', 'conversions', 'follows', 'new_followers', 'revenue']);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export complete",
        description: "Analytics data has been exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "There was a problem exporting the data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle errors
  if (metricsError || audienceError || engagementError || performanceError) {
    toast({
      title: "Error loading data",
      description: "There was a problem loading analytics data. Please try again.",
      variant: "destructive"
    });
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
        <div className="w-full md:w-auto">
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange} 
            disabled={{ after: new Date() }}
          />
        </div>
        
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        ) : metrics && Array.isArray(metrics) ? (
          metrics.map((metric: AnalyticsMetric, index: number) => (
            <MetricCard
              key={index}
              {...metric}
              icon={[BarChart, PieChart, LineChart, FileDown][index % 4]}
            />
          ))
        ) : (
          Array(4).fill(0).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsErrorBoundary>
          <BarChartWidget
            data={engagementData}
            isLoading={engagementLoading}
            className="h-[400px]"
            title="Engagement Metrics"
          />
        </AnalyticsErrorBoundary>

        <AnalyticsErrorBoundary>
          <PieChartWidget
            data={audienceData}
            isLoading={audienceLoading}
            className="h-[400px]"
            title="Audience Distribution"
          />
        </AnalyticsErrorBoundary>

        <AnalyticsErrorBoundary>
          <LineChartWidget
            data={performanceData}
            isLoading={performanceLoading}
            className="h-[400px]"
            title="Performance Trends"
          />
        </AnalyticsErrorBoundary>

        <AnalyticsErrorBoundary>
          <HeatMapWidget
            data={performanceData?.heatmap || []}
            title="Activity Heatmap"
            isLoading={performanceLoading}
            className="h-[400px]"
          />
        </AnalyticsErrorBoundary>
      </div>
    </div>
  );
}

// Wrap the page with QueryClientProvider
export default function AnalyticsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsPageContent />
    </QueryClientProvider>
  );
}
