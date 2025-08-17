"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  AlertCircle,
  HelpCircle,
  X,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Zap,
  AlertTriangle,
  ThumbsUp,
  Clock
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
import { useRealtimeAnalytics } from '@/lib/realtime/websocket-service';
import { RealTimeAnalyticsIndicator } from '@/components/content/RealTimeAnalyticsIndicator';
import { ABTestingDashboard } from '@/components/analytics/ABTestingDashboard';
import { AdvancedFilters } from '@/components/analytics/AdvancedFilters';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { ExportReporting } from '@/components/analytics/ExportReporting';
import { RealTimeCollaboration } from '@/components/analytics/RealTimeCollaboration';
import { AdvancedDataVisualization } from '@/components/analytics/AdvancedDataVisualization';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Types
type AnalyticsTimeframe = 'day' | 'week' | 'month' | 'year';
type AnalyticsTab = 'overview' | 'audience' | 'engagement' | 'revenue' | 'funnels' | 'abtesting' | 'predictive' | 'collaboration' | 'visualization' | 'service-provider';

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
  // Enhanced color patterns with better visual hierarchy
  const getStyles = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('views') || lowerTitle.includes('reach')) {
      return {
        iconBg: 'p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm',
        iconColor: 'h-7 w-7 text-blue-600',
        numberColor: 'text-4xl font-extrabold text-blue-700 tracking-tight',
        cardBorder: 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent',
        changeColor: 'bg-blue-50 text-blue-700',
        category: 'Reach & Visibility'
      };
    } else if (lowerTitle.includes('engagement')) {
      return {
        iconBg: 'p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-sm',
        iconColor: 'h-7 w-7 text-pink-600',
        numberColor: 'text-4xl font-extrabold text-pink-700 tracking-tight',
        cardBorder: 'border-l-4 border-pink-500 bg-gradient-to-r from-pink-50/50 to-transparent',
        changeColor: 'bg-pink-50 text-pink-700',
        category: 'User Interaction'
      };
    } else if (lowerTitle.includes('conversion') || lowerTitle.includes('revenue')) {
      return {
        iconBg: 'p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm',
        iconColor: 'h-7 w-7 text-green-600',
        numberColor: 'text-4xl font-extrabold text-green-700 tracking-tight',
        cardBorder: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50/50 to-transparent',
        changeColor: 'bg-green-50 text-green-700',
        category: 'Business Impact'
      };
    } else {
      return {
        iconBg: 'p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm',
        iconColor: 'h-7 w-7 text-gray-600',
        numberColor: 'text-4xl font-extrabold text-gray-700 tracking-tight',
        cardBorder: 'border-l-4 border-gray-500 bg-gradient-to-r from-gray-50/50 to-transparent',
        changeColor: 'bg-gray-50 text-gray-700',
        category: 'General Metrics'
      };
    }
  };

  const styles = getStyles(title);

  if (isLoading) {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 ${styles.cardBorder}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-10 w-24 rounded" />
              </div>
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${styles.cardBorder}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with category and icon */}
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {styles.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
            <div className={styles.iconBg}>
              <div className={styles.iconColor}>
                {icon}
              </div>
            </div>
          </div>
          
          {/* Main value */}
          <div className="space-y-2">
            <p className={styles.numberColor}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground font-medium">{description}</p>
            )}
          </div>
          
          {/* Change indicator */}
          {change !== undefined && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${styles.changeColor}`}>
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rotate-180">
                  <TrendingUp className="h-3 w-3" />
                </div>
              )}
              <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
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
  
  // Progressive loading states
  const [essentialMetricsLoaded, setEssentialMetricsLoaded] = useState(false);
  const [detailedChartsLoaded, setDetailedChartsLoaded] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'essential' | 'detailed' | 'complete'>('essential');
  
  // Onboarding tour states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('analytics-tour-completed') === 'true';
    }
    return false;
  });
  
  // Real-time analytics integration
  const {
    isConnected: isRealtimeConnected,
    lastUpdate: realtimeLastUpdate,
    hasRecentUpdates,
    subscribe,
    unsubscribe,
    requestMetrics
  } = useRealtimeAnalytics('org-123', 'user-456'); // TODO: Get from auth context
  
  // Tour steps configuration
  const tourSteps = [
    {
      id: 'metrics-overview',
      title: 'Key Performance Metrics',
      description: 'These cards show your most important analytics at a glance. Each category uses color coding for quick identification.',
      target: '[data-tour="metrics"]',
      position: 'bottom' as const
    },
    {
      id: 'data-source',
      title: 'Data Source Indicator',
      description: 'This badge shows whether you\'re viewing live data, service provider data, or demo data.',
      target: '[data-tour="data-source"]',
      position: 'bottom' as const
    },
    {
      id: 'filters',
      title: 'Advanced Filtering',
      description: 'Use these filters to narrow down your data by time period, campaign, or platform.',
      target: '[data-tour="filters"]',
      position: 'bottom' as const
    },
    {
      id: 'charts',
      title: 'Performance Charts',
      description: 'Visual insights into your data trends and platform comparisons. Charts load progressively for better performance.',
      target: '[data-tour="charts"]',
      position: 'top' as const
    },
    {
      id: 'tabs',
      title: 'Analytics Categories',
      description: 'Switch between different analytics views: Audience, Engagement, Revenue, Funnels, and B2B2G insights.',
      target: '[data-tour="tabs"]',
      position: 'bottom' as const
    }
  ];

  // Data fetching with progressive loading
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
  
  // Progressive loading effect
  useEffect(() => {
    if (metrics && !essentialMetricsLoaded) {
      setEssentialMetricsLoaded(true);
      setLoadingPhase('detailed');
      
      // Delay detailed charts loading for better UX
      setTimeout(() => {
        setDetailedChartsLoaded(true);
        setLoadingPhase('complete');
      }, 500);
    }
  }, [metrics, essentialMetricsLoaded]);
  
  // Check if user should see onboarding tour
  useEffect(() => {
    if (!hasSeenTour && essentialMetricsLoaded && !showOnboarding) {
      // Show tour after essential metrics load and a brief delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, essentialMetricsLoaded, showOnboarding]);
  
  // Real-time analytics subscription effect
  useEffect(() => {
    if (isRealtimeConnected) {
      // Subscribe to relevant channels based on current tab
      subscribe('metrics');
      subscribe('charts');
      
      if (activeTab === 'overview') {
        subscribe('alerts');
      }
      
      // Request initial metrics update
      requestMetrics(['totalViews', 'engagementRate', 'totalReach', 'conversions']);
    }

    return () => {
      if (isRealtimeConnected) {
        unsubscribe('metrics');
        unsubscribe('charts');
        unsubscribe('alerts');
      }
    };
  }, [isRealtimeConnected, activeTab, subscribe, unsubscribe, requestMetrics]);
  
  // Onboarding tour handlers
  const startTour = () => {
    setShowOnboarding(true);
    setCurrentTourStep(0);
  };
  
  const nextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    } else {
      completeTour();
    }
  };
  
  const completeTour = () => {
    setShowOnboarding(false);
    setHasSeenTour(true);
    localStorage.setItem('analytics-tour-completed', 'true');
    toast({
      title: "Tour Completed! 🎉",
      description: "You're all set to explore your analytics dashboard.",
    });
  };
  
  const skipTour = () => {
    setShowOnboarding(false);
    setHasSeenTour(true);
    localStorage.setItem('analytics-tour-completed', 'true');
  };
  
  // Generate actionable insights based on current data
  const generateInsights = useMemo(() => {
    if (!metrics) return [];
    
    const insights = [];
    
    // Engagement insights
    if (metrics.engagementChange !== undefined) {
      if (metrics.engagementChange < -10) {
        insights.push({
          type: 'warning' as const,
          title: 'Engagement Declining',
          description: `Engagement has dropped by ${Math.abs(metrics.engagementChange).toFixed(1)}% from last period.`,
          recommendation: 'Consider reviewing your content strategy and posting times.',
          action: 'Review Content Strategy',
          icon: <AlertTriangle className="h-4 w-4" />,
          priority: 'high' as const
        });
      } else if (metrics.engagementChange > 15) {
        insights.push({
          type: 'success' as const,
          title: 'Strong Engagement Growth',
          description: `Engagement has increased by ${metrics.engagementChange.toFixed(1)}% - excellent work!`,
          recommendation: 'Double down on current content themes and posting schedule.',
          action: 'Analyze Top Content',
          icon: <ThumbsUp className="h-4 w-4" />,
          priority: 'medium' as const
        });
      }
    }
    
    // Views insights
    if (metrics.viewsChange !== undefined) {
      if (metrics.viewsChange > 25) {
        insights.push({
          type: 'opportunity' as const,
          title: 'Growing Audience',
          description: `Views have increased by ${metrics.viewsChange.toFixed(1)}%. Time to capitalize on this growth.`,
          recommendation: 'Consider increasing posting frequency or launching new campaigns.',
          action: 'Plan New Campaign',
          icon: <Zap className="h-4 w-4" />,
          priority: 'high' as const
        });
      }
    }
    
    // Conversions insights
    if (metrics.conversionsChange !== undefined) {
      if (metrics.conversionsChange < -5) {
        insights.push({
          type: 'warning' as const,
          title: 'Conversion Rate Needs Attention',
          description: 'Conversion rates are below expected levels.',
          recommendation: 'Review your call-to-action placement and landing page optimization.',
          action: 'Optimize CTAs',
          icon: <Target className="h-4 w-4" />,
          priority: 'high' as const
        });
      }
    }
    
    // Time-based insights
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 17) {
      insights.push({
        type: 'info' as const,
        title: 'Peak Engagement Window',
        description: 'You\'re in a high-engagement time period. Perfect for posting new content.',
        recommendation: 'Schedule your most important content during business hours for maximum reach.',
        action: 'Schedule Content',
        icon: <Clock className="h-4 w-4" />,
        priority: 'low' as const
      });
    }
    
    return insights.slice(0, 3); // Show max 3 insights
  }, [metrics]);

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
        {/* Enhanced Header with better visual hierarchy */}
        <div className="text-center mb-12">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
                  Analytics
                </h1>
                <p className="text-xl font-semibold text-muted-foreground tracking-wide">
                  Dashboard
                </p>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Comprehensive performance insights and engagement analytics across all your content platforms.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multi-platform tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Advanced insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mb-8">
          <div className="flex items-center gap-2">
            {hasSeenTour && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startTour}
                className="text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Take Tour
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Advanced Export
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Export & Reporting</DialogTitle>
                </DialogHeader>
                <ExportReporting />
              </DialogContent>
            </Dialog>
            <Select onValueChange={(value) => handleExport(value as 'csv' | 'pdf')}>
              <SelectTrigger className="w-32">
                <FileDown className="mr-2 h-4 w-4" />
                Quick Export
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
        <Card className="mb-6" data-tour="filters">
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

        {/* Advanced Filters */}
        <AdvancedFilters 
          onFiltersChange={(filters) => {
            console.log('Advanced filters applied:', filters);
            // TODO: Apply filters to analytics data
          }}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)} data-tour="tabs">
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
                <SelectItem value="abtesting">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    A/B Testing
                  </div>
                </SelectItem>
                <SelectItem value="predictive">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    AI Insights
                  </div>
                </SelectItem>
                <SelectItem value="collaboration">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Collaborate
                  </div>
                </SelectItem>
                <SelectItem value="visualization">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Advanced Viz
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
          <TabsList className="hidden md:grid w-full grid-cols-5 lg:grid-cols-10 gap-1">
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
            <TabsTrigger value="abtesting" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">A/B Testing</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Lightbulb className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Collaborate</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Advanced Viz</span>
            </TabsTrigger>
            <TabsTrigger value="service-provider" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
              <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">B2B2G Analytics</span>
              <span className="hidden sm:inline lg:hidden">B2B2G</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Essential Metrics - Load First */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Key Performance Metrics</h2>
                  <p className="text-muted-foreground">
                    Real-time overview of your most important analytics
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Real-time Analytics Indicator */}
                  <RealTimeAnalyticsIndicator
                    isConnected={isRealtimeConnected}
                    lastUpdateTime={realtimeLastUpdate}
                    hasRecentUpdates={hasRecentUpdates}
                    onRefresh={() => requestMetrics(['totalViews', 'engagementRate', 'totalReach', 'conversions'])}
                    size="sm"
                    showLastUpdate={false}
                  />
                  
                  {/* Data Source Indicator */}
                  {dataSource && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium" data-tour="data-source">
                      <div className={`w-2 h-2 rounded-full ${
                        dataSource === 'live' ? 'bg-green-500' : 
                        dataSource === 'service-provider' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <span>{dataSource === 'live' ? 'Live Data' : dataSource === 'service-provider' ? 'Service Data' : 'Demo Data'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour="metrics">
                <MetricCard
                  title="Total Views"
                  value={metrics?.totalViews || 0}
                  description="Across all platforms"
                  icon={<Eye className="h-6 w-6" />}
                  change={metrics?.viewsChange}
                  isLoading={!essentialMetricsLoaded}
                />
                <MetricCard
                  title="Engagement Rate"
                  value={metrics?.engagementRate || '0%'}
                  description="Average across content"
                  icon={<Heart className="h-6 w-6" />}
                  change={metrics?.engagementChange}
                  isLoading={!essentialMetricsLoaded}
                />
                <MetricCard
                  title="Total Reach"
                  value={metrics?.totalReach || 0}
                  description="Unique users reached"
                  icon={<Users className="h-6 w-6" />}
                  change={metrics?.reachChange}
                  isLoading={!essentialMetricsLoaded}
                />
                <MetricCard
                  title="Conversions"
                  value={metrics?.totalConversions || 0}
                  description="Goal completions"
                  icon={<TrendingUp className="h-6 w-6" />}
                  change={metrics?.conversionsChange}
                  isLoading={!essentialMetricsLoaded}
                />
              </div>
            </div>

            {/* Detailed Charts - Load Second */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Performance Analysis</h2>
                  <p className="text-muted-foreground">
                    Detailed trends and platform-specific insights
                  </p>
                </div>
                {loadingPhase !== 'complete' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading detailed charts...</span>
                  </div>
                )}
              </div>
              
              <div className="grid gap-6 md:grid-cols-2" data-tour="charts">
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <LineChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold">Performance Trend</span>
                        <p className="text-sm text-muted-foreground font-normal">Growth over time</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RechartsLineChart
                      data={chartData?.performanceTrend}
                      isLoading={!detailedChartsLoaded}
                      error={error}
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 bg-gradient-to-r from-green-50/30 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold">Platform Performance</span>
                        <p className="text-sm text-muted-foreground font-normal">Cross-platform comparison</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RechartsBarChart
                      data={chartData?.platformPerformance}
                      isLoading={!detailedChartsLoaded}
                      error={error}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Actionable Insights Section */}
            {generateInsights.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Actionable Insights</h2>
                  <p className="text-muted-foreground">
                    AI-powered recommendations based on your current performance
                  </p>
                </div>
                
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {generateInsights.map((insight, index) => {
                    const getInsightStyles = (type: string, priority: string) => {
                      const baseStyles = "p-4 sm:p-6 rounded-xl border transition-all duration-300 hover:shadow-lg";
                      
                      if (type === 'success') {
                        return `${baseStyles} bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:border-green-300`;
                      } else if (type === 'warning') {
                        return `${baseStyles} bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 hover:border-amber-300`;
                      } else if (type === 'opportunity') {
                        return `${baseStyles} bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300`;
                      } else {
                        return `${baseStyles} bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200 hover:border-gray-300`;
                      }
                    };
                    
                    return (
                      <Card key={index} className={getInsightStyles(insight.type, insight.priority)}>
                        <CardContent className="p-0">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                insight.type === 'success' ? 'bg-green-100 text-green-600' :
                                insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                insight.type === 'opportunity' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {insight.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm leading-tight">{insight.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {insight.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {insight.description}
                                </p>
                              </div>
                            </div>
                            
                            {/* Recommendation */}
                            <div className="bg-white/60 rounded-lg p-2.5 sm:p-3 border border-white/40">
                              <p className="text-xs font-medium text-foreground mb-2">
                                💡 Recommendation:
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                {insight.recommendation}
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary hover:text-primary-foreground transition-colors duration-200 border-2 hover:border-primary font-medium"
                                onClick={() => {
                                  // Handle action based on insight type
                                  if (insight.action === 'Schedule Content') {
                                    toast({
                                      title: "Content Scheduler",
                                      description: "Opening content scheduler interface...",
                                    });
                                    // Here you could navigate to content scheduler or open a modal
                                    // router.push('/dashboard/content/schedule');
                                  } else if (insight.action === 'Review Content Strategy') {
                                    toast({
                                      title: "Content Strategy Review",
                                      description: "Analyzing your content performance patterns...",
                                    });
                                  } else if (insight.action === 'Plan New Campaign') {
                                    toast({
                                      title: "Campaign Planner",
                                      description: "Let's create a new campaign to capitalize on your growth!",
                                    });
                                  } else if (insight.action === 'Optimize CTAs') {
                                    toast({
                                      title: "CTA Optimization",
                                      description: "Opening conversion optimization toolkit...",
                                    });
                                  } else if (insight.action === 'Analyze Top Content') {
                                    toast({
                                      title: "Content Analysis",
                                      description: "Identifying your best-performing content patterns...",
                                    });
                                  } else {
                                    toast({
                                      title: insight.action,
                                      description: "Feature coming soon! We're working on this enhancement.",
                                    });
                                  }
                                }}
                              >
                                <span className="flex items-center justify-center gap-1.5">
                                  {insight.action === 'Schedule Content' && <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {insight.action === 'Review Content Strategy' && <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {insight.action === 'Plan New Campaign' && <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {insight.action === 'Optimize CTAs' && <Target className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  {insight.action === 'Analyze Top Content' && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />}
                                  <span className="truncate">{insight.action}</span>
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Advanced Analytics - Load Last */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Advanced Insights</h2>
                <p className="text-muted-foreground">
                  Deep dive into user behavior patterns and engagement timing
                </p>
              </div>
              
              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/30 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Activity className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold">Activity Heatmap</span>
                      <p className="text-sm text-muted-foreground font-normal">Peak engagement times</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RechartsHeatMap
                    data={chartData?.activityHeatmap}
                    isLoading={!detailedChartsLoaded}
                    error={error}
                  />
                </CardContent>
              </Card>
            </div>
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
          <TabsContent value="abtesting" className="space-y-6">
            <ABTestingDashboard />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <RealTimeCollaboration
              dashboardId={`analytics-${state.organizationId || 'demo'}`}
              currentUserId="user-current" // TODO: Get from auth context
            />
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <AdvancedDataVisualization
              data={chartData}
              isInteractive={true}
            />
          </TabsContent>

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
        
        {/* Onboarding Tour Overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform">
              <div className="p-6">
                {/* Tour Progress */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {currentTourStep + 1} of {tourSteps.length}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={skipTour}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentTourStep + 1) / tourSteps.length) * 100}%` }}
                  ></div>
                </div>
                
                {/* Tour Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {tourSteps[currentTourStep]?.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {tourSteps[currentTourStep]?.description}
                    </p>
                  </div>
                  
                  {/* Visual indicator */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span>Look for the highlighted area on the dashboard</span>
                    </div>
                  </div>
                </div>
                
                {/* Tour Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={skipTour}
                    className="text-muted-foreground"
                  >
                    Skip Tour
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {currentTourStep > 0 && (
                      <Button 
                        variant="ghost" 
                        onClick={() => setCurrentTourStep(currentTourStep - 1)}
                        size="sm"
                      >
                        Back
                      </Button>
                    )}
                    <Button onClick={nextTourStep} className="flex items-center gap-2">
                      {currentTourStep === tourSteps.length - 1 ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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