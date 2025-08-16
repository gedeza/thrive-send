"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateFilter } from '@/components/ui/date-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/components/ui/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary';
import { 
  RefreshCw, 
  FileDown, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Plus,
  ChevronDown,
  Info,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Lazy-loaded chart components for better performance
import { 
  RechartsBarChartLazy as RechartsBarChart,
  RechartsPieChartLazy as RechartsPieChart,
  RechartsLineChartLazy as RechartsLineChart,
  RechartsHeatMapLazy as RechartsHeatMap,
  ConversionFunnelLazy as ConversionFunnel
} from '@/components/lazy/LazyComponents';
import { useAnalyticsData } from '@/lib/hooks/useAnalyticsData';
import { ServiceProviderAnalyticsDashboard } from '@/components/analytics/ServiceProviderAnalyticsDashboard';
import { useServiceProvider } from '@/context/ServiceProviderContext';

// Types
type AnalyticsTimeframe = 'day' | 'week' | 'month' | 'year';
type AnalyticsTab = 'overview' | 'audience' | 'engagement' | 'revenue' | 'funnels' | 'service-provider';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
}

// Data source indicator component
function DataSourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  
  const variants = {
    'live': { bg: 'bg-green-100 text-green-800 border-green-200', icon: '🟢', label: 'Live Data' },
    'service-provider': { bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵', label: 'Service Data' },
    'demo': { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡', label: 'Demo Data' },
    'unknown': { bg: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⚪', label: 'Data' }
  };
  
  const variant = variants[source as keyof typeof variants] || variants.unknown;
  
  return (
    <Badge variant="outline" className={`${variant.bg} border text-xs font-medium`}>
      <span className="mr-1">{variant.icon}</span>
      {variant.label}
    </Badge>
  );
}

// Empty state component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = "" 
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; };
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Chart empty state wrapper
function ChartEmptyState({ 
  isLoading, 
  hasData, 
  error,
  children,
  emptyTitle = "No Data Available",
  emptyDescription = "There's no data to display for the selected filters. Try adjusting your date range or filters.",
  emptyIcon = BarChart3,
  chartType = "line"
}: {
  isLoading: boolean;
  hasData: boolean;
  error?: any;
  children: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  chartType?: "line" | "bar" | "pie" | "heatmap";
}) {
  if (isLoading) {
    const skeletonComponents = {
      line: LineChartSkeleton,
      bar: BarChartSkeleton,
      pie: PieChartSkeleton,
      heatmap: HeatmapSkeleton
    };
    
    const SkeletonComponent = skeletonComponents[chartType];
    return <SkeletonComponent />;
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm text-destructive">Failed to load chart data</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        className="h-[300px]"
      />
    );
  }

  return <>{children}</>;
}

// Enhanced chart-specific skeletons
function LineChartSkeleton() {
  return (
    <div className="h-[300px] w-full p-4">
      <div className="flex justify-between items-end h-full">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className={`w-2 bg-blue-200 animate-pulse`} style={{ height: `${Math.random() * 200 + 50}px` }} />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function BarChartSkeleton() {
  return (
    <div className="h-[300px] w-full p-4">
      <div className="flex justify-between items-end h-full gap-2">
        {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map((platform, i) => (
          <div key={platform} className="flex flex-col items-center gap-2 flex-1">
            <Skeleton className={`w-full bg-green-200 animate-pulse max-w-12`} style={{ height: `${Math.random() * 180 + 80}px` }} />
            <Skeleton className="h-3 w-full max-w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChartSkeleton() {
  return (
    <div className="h-[300px] w-full p-4 flex items-center justify-center">
      <div className="relative">
        <Skeleton className="h-40 w-40 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-20 w-20 rounded-full bg-background" />
        </div>
      </div>
      <div className="ml-8 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="h-[300px] w-full p-4">
      <div className="grid grid-cols-7 gap-1 h-full">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-6 w-full" />
            {[...Array(24)].map((_, j) => (
              <Skeleton key={j} className={`h-2 w-full ${Math.random() > 0.3 ? 'bg-orange-200' : 'bg-orange-100'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value, description, icon, change, isLoading }: MetricCardProps) {
  // Color patterns matching project management page
  const getStyles = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('views') || lowerTitle.includes('reach')) {
      return {
        iconBg: 'p-3 bg-blue-100 rounded-full',
        iconColor: 'h-6 w-6 text-blue-600',
        numberColor: 'text-3xl font-bold text-blue-600'
      };
    } else if (lowerTitle.includes('engagement')) {
      return {
        iconBg: 'p-3 bg-pink-100 rounded-full',
        iconColor: 'h-6 w-6 text-pink-600',
        numberColor: 'text-3xl font-bold text-pink-600'
      };
    } else if (lowerTitle.includes('conversion') || lowerTitle.includes('revenue')) {
      return {
        iconBg: 'p-3 bg-green-100 rounded-full',
        iconColor: 'h-6 w-6 text-green-600',
        numberColor: 'text-3xl font-bold text-green-600'
      };
    } else {
      return {
        iconBg: 'p-3 bg-primary/10 rounded-full',
        iconColor: 'h-6 w-6 text-primary',
        numberColor: 'text-3xl font-bold'
      };
    }
  };

  const styles = getStyles(title);

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={styles.numberColor}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center text-xs ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="mr-1 h-3 w-3" />
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last period
              </div>
            )}
          </div>
          <div className={styles.iconBg}>
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AnalyticsPageContent() {
  // Service provider context
  const { state } = useServiceProvider();
  
  // State management
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('week');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return { from: sevenDaysAgo, to: today };
  });

  // Data fetching
  const {
    metrics,
    chartData,
    audienceData,
    engagementData,
    revenueData,
    isLoading,
    error,
    refetch,
    dataSource
  } = useAnalyticsData({
    timeframe,
    dateRange,
    campaign: selectedCampaign,
    platform: selectedPlatform
  });

  // Handlers
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Analytics Refreshed",
      description: "Latest data has been loaded successfully.",
    });
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!metrics || !chartData) {
      toast({
        title: "Export Failed",
        description: "No data available to export. Please wait for data to load.",
        variant: "destructive"
      });
      return;
    }

    try {
      const exportData = {
        metrics,
        chartData,
        audienceData,
        engagementData,
        revenueData,
        filters: {
          timeframe,
          dateRange,
          campaign: selectedCampaign,
          platform: selectedPlatform
        }
      };

      if (format === 'csv') {
        const { downloadCSV } = await import('@/lib/utils/export-utils');
        downloadCSV(exportData);
      } else {
        const { downloadPDF } = await import('@/lib/utils/export-utils');
        await downloadPDF(exportData);
      }

      toast({
        title: `${format.toUpperCase()} Export Successful`,
        description: `Your analytics report has been ${format === 'pdf' ? 'opened for printing' : 'downloaded'}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleReport = () => {
    // TODO: Implement scheduled reporting
    toast({
      title: "Schedule Report",
      description: "Report scheduling feature coming soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your content performance and engagement metrics across all platforms.
            </p>
            <DataSourceBadge source={dataSource} />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Select onValueChange={(value) => handleExport(value as 'csv' | 'pdf')}>
              <SelectTrigger className="w-32">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleReport}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            {/* Mobile: Collapsible filters */}
            <div className="md:hidden">
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <DateFilter
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                      />
                    </div>
                    
                    <Select value={timeframe} onValueChange={(value) => setTimeframe(value as AnalyticsTimeframe)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Campaigns</SelectItem>
                        <SelectItem value="welcome-series">Welcome Series</SelectItem>
                        <SelectItem value="monthly-newsletter">Monthly Newsletter</SelectItem>
                        <SelectItem value="product-launch">Product Launch</SelectItem>
                        <SelectItem value="holiday-special">Holiday Special</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop: Horizontal filters */}
            <div className="hidden md:flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <DateFilter
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              
              <Select value={timeframe} onValueChange={(value) => setTimeframe(value as AnalyticsTimeframe)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="welcome-series">Welcome Series</SelectItem>
                  <SelectItem value="monthly-newsletter">Monthly Newsletter</SelectItem>
                  <SelectItem value="product-launch">Product Launch</SelectItem>
                  <SelectItem value="holiday-special">Holiday Special</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)}>
          {/* Mobile: Dropdown tab selector */}
          <div className="md:hidden mb-4">
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Overview
                  </div>
                </SelectItem>
                <SelectItem value="audience">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Audience
                  </div>
                </SelectItem>
                <SelectItem value="engagement">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Engagement
                  </div>
                </SelectItem>
                <SelectItem value="revenue">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Revenue
                  </div>
                </SelectItem>
                <SelectItem value="funnels">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Funnels
                  </div>
                </SelectItem>
                <SelectItem value="service-provider">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    B2B2G Analytics
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Horizontal tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Activity className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="audience" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Audience</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Engagement</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Target className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Funnels</span>
            </TabsTrigger>
            <TabsTrigger value="service-provider" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">B2B2G</span>
              <span className="hidden sm:inline lg:hidden">Provider</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Views"
                value={metrics?.totalViews || 0}
                description="Across all platforms"
                icon={<Eye className="h-6 w-6" />}
                change={metrics?.viewsChange}
                isLoading={isLoading}
              />
              <MetricCard
                title="Engagement Rate"
                value={metrics?.engagementRate || '0%'}
                description="Average across content"
                icon={<Heart className="h-6 w-6" />}
                change={metrics?.engagementChange}
                isLoading={isLoading}
              />
              <MetricCard
                title="Total Reach"
                value={metrics?.totalReach || 0}
                description="Unique users reached"
                icon={<Users className="h-6 w-6" />}
                change={metrics?.reachChange}
                isLoading={isLoading}
              />
              <MetricCard
                title="Conversions"
                value={metrics?.totalConversions || 0}
                description="Goal completions"
                icon={<TrendingUp className="h-6 w-6" />}
                change={metrics?.conversionsChange}
                isLoading={isLoading}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Performance Trend
                    </CardTitle>
                    <DataSourceBadge source={dataSource} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartEmptyState
                    isLoading={isLoading}
                    hasData={chartData?.performanceTrend && chartData.performanceTrend.length > 0}
                    error={error}
                    emptyTitle="No Performance Data"
                    emptyDescription="No performance trends found for the selected time period. Try adjusting your date range or filters."
                    emptyIcon={LineChart}
                    chartType="line"
                  >
                    <RechartsLineChart
                      data={chartData?.performanceTrend}
                      isLoading={isLoading}
                      error={error}
                    />
                  </ChartEmptyState>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#22c55e' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Platform Performance
                    </CardTitle>
                    <DataSourceBadge source={dataSource} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartEmptyState
                    isLoading={isLoading}
                    hasData={chartData?.platformPerformance && chartData.platformPerformance.length > 0}
                    error={error}
                    emptyTitle="No Platform Data"
                    emptyDescription="No platform performance data available. Connect your social media accounts to see performance metrics."
                    emptyIcon={BarChart3}
                    chartType="bar"
                  >
                    <RechartsBarChart
                      data={chartData?.platformPerformance}
                      isLoading={isLoading}
                      error={error}
                    />
                  </ChartEmptyState>
                </CardContent>
              </Card>
            </div>

            {/* Activity Heatmap */}
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Heatmap
                  </CardTitle>
                  <DataSourceBadge source={dataSource} />
                </div>
              </CardHeader>
              <CardContent>
                <ChartEmptyState
                  isLoading={isLoading}
                  hasData={chartData?.activityHeatmap && chartData.activityHeatmap.length > 0}
                  error={error}
                  emptyTitle="No Activity Data"
                  emptyDescription="No activity patterns found. Start creating and publishing content to see activity heatmaps."
                  emptyIcon={Activity}
                  chartType="heatmap"
                >
                  <RechartsHeatMap
                    data={chartData?.activityHeatmap}
                    isLoading={isLoading}
                    error={error}
                  />
                </ChartEmptyState>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Device Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartEmptyState
                    isLoading={isLoading}
                    hasData={audienceData?.deviceDistribution && audienceData.deviceDistribution.length > 0}
                    error={error}
                    emptyTitle="No Device Data"
                    emptyDescription="No device distribution data available. Users need to visit your content to see device breakdown."
                    emptyIcon={PieChart}
                    chartType="pie"
                  >
                    <RechartsPieChart
                      data={audienceData?.deviceDistribution}
                      isLoading={isLoading}
                      error={error}
                    />
                  </ChartEmptyState>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#06b6d4' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartEmptyState
                    isLoading={isLoading}
                    hasData={audienceData?.demographics && audienceData.demographics.length > 0}
                    error={error}
                    emptyTitle="No Demographics Data"
                    emptyDescription="No demographic information available. User analytics will appear as your audience grows."
                    emptyIcon={BarChart3}
                    chartType="bar"
                  >
                    <RechartsBarChart
                      data={audienceData?.demographics}
                      isLoading={isLoading}
                      error={error}
                    />
                  </ChartEmptyState>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#ec4899' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Engagement Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RechartsLineChart
                    data={engagementData?.engagementTrend}
                    isLoading={isLoading}
                    error={error}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Total Revenue"
                value={revenueData?.totalRevenue || '$0'}
                description="This period"
                icon={<DollarSign className="h-6 w-6" />}
                change={revenueData?.revenueChange}
                isLoading={isLoading}
              />
              <MetricCard
                title="Conversion Rate"
                value={revenueData?.conversionRate || '0%'}
                description="Sales / Visitors"
                icon={<TrendingUp className="h-6 w-6" />}
                change={revenueData?.conversionChange}
                isLoading={isLoading}
              />
              <MetricCard
                title="Avg. Order Value"
                value={revenueData?.avgOrderValue || '$0'}
                description="Per transaction"
                icon={<DollarSign className="h-6 w-6" />}
                change={revenueData?.aovChange}
                isLoading={isLoading}
              />
            </div>

            <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: '#10b981' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RechartsLineChart
                  data={revenueData?.revenueTrend}
                  isLoading={isLoading}
                  error={error}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funnels Tab */}
          <TabsContent value="funnels" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Conversion Funnels</h3>
                <p className="text-sm text-muted-foreground">
                  Track user journey and optimize conversion paths
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Funnel
              </Button>
            </div>
            
            <ConversionFunnel 
              campaignId={selectedCampaign !== 'all' ? selectedCampaign : undefined}
              timeframe={timeframe === 'day' ? '7d' : timeframe === 'week' ? '30d' : timeframe === 'month' ? '90d' : '1y'}
              showControls={true}
            />
          </TabsContent>

          {/* Service Provider Analytics Tab */}
          <TabsContent value="service-provider" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Service Provider Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Advanced B2B2G analytics for managing multiple clients and cross-client performance comparison
              </p>
            </div>
            <ServiceProviderAnalyticsDashboard 
              organizationId={state.organizationId || ''}
              defaultTimeRange={timeframe === 'day' ? '7d' : timeframe === 'week' ? '30d' : timeframe === 'month' ? '90d' : '1y'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsErrorBoundary>
        <AnalyticsPageContent />
      </AnalyticsErrorBoundary>
    </QueryClientProvider>
  );
}