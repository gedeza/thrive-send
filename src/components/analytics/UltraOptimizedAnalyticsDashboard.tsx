'use client';

import React, { memo, useMemo, useCallback, Suspense, lazy, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOptimizedAnalytics, useAnalyticsWidget, useRealTimeAnalytics } from '@/hooks/useOptimizedAnalytics';
import { UltraOptimizedBarChart, UltraOptimizedLineChart, UltraOptimizedPieChart } from './UltraOptimizedChartComponents';
import { OptimizedHeatMap } from './OptimizedChartComponents';
import { TrendingUp, TrendingDown, Activity, Eye, Users, MousePointer, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load heavy components for better performance
const AdvancedFilters = lazy(() => import('./AdvancedFilters').then(module => ({ default: module.AdvancedFilters })));
const ExportReporting = lazy(() => import('./ExportReporting').then(module => ({ default: module.ExportReporting })));

interface UltraOptimizedAnalyticsDashboardProps {
  className?: string;
  timeframe?: string;
  includeAdvanced?: boolean;
  refreshInterval?: number;
  priority?: 'low' | 'medium' | 'high';
  onDataUpdate?: (data: any) => void;
}

// Memoized metric card component
const MetricCard = memo<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}>(({ title, value, change, icon: Icon, trend, isLoading }) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-20" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit">
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change !== undefined && (
            <div className={`text-xs ${trendColor} flex items-center mt-1`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {change > 0 ? '+' : ''}{change.toFixed(1)}% from last period
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

// Memoized performance badge component
const PerformanceBadge = memo<{ performance: any }>(({ performance }) => {
  const responseTime = parseFloat(performance.lastFetchTime || '0');
  const variant = responseTime < 100 ? 'default' : responseTime < 300 ? 'secondary' : 'destructive';
  const cacheHit = performance.cacheHitRate > 0.7;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>
        {responseTime.toFixed(0)}ms
      </Badge>
      {cacheHit && (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Cached
        </Badge>
      )}
    </div>
  );
});

PerformanceBadge.displayName = 'PerformanceBadge';

// Error fallback component
const ErrorFallback = memo<{ error: any; resetErrorBoundary: () => void }>(
  ({ error, resetErrorBoundary }) => (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Analytics Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to load analytics data. {error?.message}
        </p>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
);

ErrorFallback.displayName = 'ErrorFallback';

// Main dashboard component
export const UltraOptimizedAnalyticsDashboard = memo<UltraOptimizedAnalyticsDashboardProps>(({
  className = '',
  timeframe = '30d',
  includeAdvanced = false,
  refreshInterval = 60000,
  priority = 'medium',
  onDataUpdate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(includeAdvanced);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  // Main analytics query with optimized parameters
  const {
    data,
    metrics,
    charts,
    isLoading,
    isError,
    error,
    refresh,
    performance,
    derivedMetrics,
  } = useOptimizedAnalytics({
    timeframe,
    include: {
      audience: showAdvanced,
      engagement: true,
      revenue: showAdvanced,
      overview: true,
    },
    refreshInterval: realTimeEnabled ? undefined : refreshInterval,
    priority,
  });

  // Real-time analytics hook
  const realTimeAnalytics = useRealTimeAnalytics({
    timeframe,
    include: {
      audience: showAdvanced,
      engagement: true,
      revenue: showAdvanced,
      overview: true,
    },
    priority,
  });

  // Use real-time data when available, fallback to regular data
  const activeData = realTimeEnabled && realTimeAnalytics.isConnected ? realTimeAnalytics.data : data;
  const activeMetrics = activeData?.metrics || metrics;
  const activeCharts = activeData?.charts || charts;

  // Notify parent component of data updates
  useEffect(() => {
    if (data && onDataUpdate) {
      onDataUpdate(data);
    }
  }, [data, onDataUpdate]);

  // Memoized metric cards data with real-time support
  const metricCardsData = useMemo(() => {
    if (!activeMetrics) return [];
    
    return [
      {
        title: 'Total Views',
        value: activeMetrics.totalViews,
        change: activeMetrics.viewsChange,
        icon: Eye,
        trend: activeMetrics.viewsChange > 0 ? 'up' : activeMetrics.viewsChange < 0 ? 'down' : 'neutral' as const,
      },
      {
        title: 'Total Reach',
        value: activeMetrics.totalReach,
        change: activeMetrics.reachChange,
        icon: Users,
        trend: activeMetrics.reachChange > 0 ? 'up' : activeMetrics.reachChange < 0 ? 'down' : 'neutral' as const,
      },
      {
        title: 'Conversions',
        value: activeMetrics.totalConversions,
        change: activeMetrics.conversionsChange,
        icon: MousePointer,
        trend: activeMetrics.conversionsChange > 0 ? 'up' : activeMetrics.conversionsChange < 0 ? 'down' : 'neutral' as const,
      },
      {
        title: 'Engagement Rate',
        value: activeMetrics.engagementRate,
        change: activeMetrics.engagementChange,
        icon: Activity,
        trend: activeMetrics.engagementChange > 0 ? 'up' : activeMetrics.engagementChange < 0 ? 'down' : 'neutral' as const,
      },
    ];
  }, [activeMetrics]);

  // Memoized chart data with real-time support
  const chartData = useMemo(() => {
    if (!activeCharts) return null;

    return {
      performanceTrend: {
        labels: activeCharts.performanceTrend?.map((item: any) => item.date) || [],
        datasets: [
          {
            label: 'Views',
            data: activeCharts.performanceTrend?.map((item: any) => item.views) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
          {
            label: 'Engagement',
            data: activeCharts.performanceTrend?.map((item: any) => item.engagement) || [],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }
        ],
      },
      platformPerformance: {
        labels: activeCharts.platformPerformance?.map((item: any) => item.platform) || [],
        datasets: [
          {
            label: 'Performance',
            data: activeCharts.platformPerformance?.map((item: any) => item.views) || [],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
            ],
          },
        ],
      },
    };
  }, [activeCharts]);

  // Refresh handler with loading state
  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [refresh]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} title="" value="" icon={Activity} isLoading />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleRefresh}>
      <div className={`space-y-6 ${className}`}>
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Comprehensive performance insights for the last {timeframe}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <PerformanceBadge performance={performance} />
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              onClick={() => {
                setRealTimeEnabled(!realTimeEnabled);
                if (!realTimeEnabled) {
                  realTimeAnalytics.enableRealTime();
                } else {
                  realTimeAnalytics.disableRealTime();
                }
              }}
              variant={realTimeEnabled ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 transition-all duration-200 ${
                realTimeEnabled ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {realTimeEnabled && realTimeAnalytics.isConnected ? (
                <Wifi className="h-4 w-4 animate-pulse" />
              ) : realTimeEnabled && realTimeAnalytics.hasError && process.env.NODE_ENV === 'production' ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : realTimeEnabled && realTimeAnalytics.connectionStatus === 'connecting' ? (
                <Wifi className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {realTimeEnabled ? 'Live' : 'Real-time'}
            </Button>
            
            <Button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost" 
              size="sm"
            >
              {showAdvanced ? 'Simple' : 'Advanced'} View
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {metricCardsData.map((metric, index) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Performance Score */}
        {derivedMetrics && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {derivedMetrics.performanceScore.toFixed(1)}
                </div>
                <Badge variant={derivedMetrics.engagementTrend === 'up' ? 'default' : 'secondary'}>
                  {derivedMetrics.engagementTrend}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Total engagements: {derivedMetrics.totalEngagements.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UltraOptimizedLineChart
              title="Performance Trend"
              data={chartData.performanceTrend}
              isLoading={isLoading}
              error={isError ? error : null}
              onRetry={handleRefresh}
              enableLazyLoading={true}
              enableDataDecimation={true}
              maxDataPoints={100}
            />
            
            <UltraOptimizedBarChart
              title="Platform Performance"
              data={chartData.platformPerformance}
              isLoading={isLoading}
              error={isError ? error : null}
              onRetry={handleRefresh}
              enableLazyLoading={true}
              enableDataDecimation={true}
              maxDataPoints={50}
            />
          </div>
        )}

        {/* Advanced Features */}
        {showAdvanced && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OptimizedHeatMap
                title="Activity Heatmap"
                data={charts?.activityHeatmap?.[0]}
                isLoading={isLoading}
                error={isError ? error : null}
                onRetry={handleRefresh}
              />
            </div>
            
            <div className="space-y-4">
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <AdvancedFilters onFilterChange={(filters) => console.log('Filters:', filters)} />
              </Suspense>
              
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <ExportReporting data={data} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <div>Render count: {performance.renderCount}</div>
              <div>Cache hit rate: {(performance.cacheHitRate * 100).toFixed(1)}%</div>
              <div>Average response: {performance.averageResponseTime.toFixed(1)}ms</div>
              <div>Total requests: {performance.totalRequests}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
});

UltraOptimizedAnalyticsDashboard.displayName = 'UltraOptimizedAnalyticsDashboard';

export default UltraOptimizedAnalyticsDashboard;