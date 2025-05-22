"use client"

import { useState } from 'react';
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
  const [timeframe, setTimeframe] = useState('month');
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);

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
  } = useAnalyticsQueries({
    startDate: dateRange.from,
    endDate: dateRange.to,
    timeframe: timeframe as any,
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your audience engagement and performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchAll()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 md:flex-none">
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange} 
            disabled={{ after: new Date() }}
          />
        </div>
        
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={campaignId || "all"} onValueChange={(val) => setCampaignId(val === "all" ? undefined : val)}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="All Campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="campaign-1">Summer Campaign</SelectItem>
            <SelectItem value="campaign-2">Fall Promotion</SelectItem>
            <SelectItem value="campaign-3">Holiday Special</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Metric summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metricsLoading ? (
              Array(4).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)
            ) : metrics && metrics.length > 0 ? (
              metrics.map((metric, index) => {
                // Assign icons based on metric title
                const icons = [BarChart, PieChart, LineChart, BarChart];
                return (
                  <MetricCard 
                    key={metric.title} 
                    {...metric} 
                    icon={icons[index]} 
                  />
                );
              })
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-muted-foreground">No metrics data available</p>
              </div>
            )}
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsLoading || audienceLoading || engagementLoading || performanceLoading ? (
              Array(3).fill(0).map((_, i) => <ChartSkeleton key={i} />)
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Audience Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {audienceData ? (
                      <BarChartWidget
                        title="Audience Growth"
                        data={audienceData}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Engagement Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {engagementData ? (
                      <PieChartWidget
                        title="Engagement Breakdown"
                        data={engagementData}
                        options={{
                          responsive: true,
                          plugins: { legend: { position: "bottom" } },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceData ? (
                      <LineChartWidget
                        title="Performance Trends"
                        data={performanceData}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: { y: { beginAtZero: true } },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="audience">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium">Detailed Audience Analytics</h3>
            <p className="text-muted-foreground">
              Additional audience metrics and demographics would be displayed here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium">Detailed Engagement Analytics</h3>
            <p className="text-muted-foreground">
              Deeper engagement metrics and platform breakdowns would be displayed here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium">Revenue & Conversion Analytics</h3>
            <p className="text-muted-foreground">
              ROI calculations and conversion funnels would be displayed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
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
