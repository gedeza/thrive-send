'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Clock,
  Database,
  Gauge
} from 'lucide-react';
import { usePerformanceMonitoring, bundleAnalyzer } from '@/lib/utils/bundle-optimizer';
import { useCacheStats } from '@/hooks/use-calendar-query';
import { cn } from '@/lib/utils';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface PerformanceDashboardProps {
  className?: string;
  showTips?: boolean;
}

export function PerformanceDashboard({ className, showTips = true }: PerformanceDashboardProps) {
  const { getBundleReport, getOptimizationTips } = usePerformanceMonitoring();
  const { data: cacheStats } = useCacheStats();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Web Vitals state
  const [webVitals, setWebVitals] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0 // Time to First Byte
  });

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const bundleReport = getBundleReport();
      const newMetrics: PerformanceMetric[] = [
        {
          name: 'Average Load Time',
          value: bundleReport.averageLoadTime,
          unit: 'ms',
          status: bundleReport.averageLoadTime < 100 ? 'good' : 
                 bundleReport.averageLoadTime < 200 ? 'warning' : 'critical',
          description: 'Time taken to load components'
        },
        {
          name: 'Average Render Time',
          value: bundleReport.averageRenderTime,
          unit: 'ms',
          status: bundleReport.averageRenderTime < 16 ? 'good' : 
                 bundleReport.averageRenderTime < 32 ? 'warning' : 'critical',
          description: 'Time taken to render components'
        },
        {
          name: 'Memory Usage',
          value: bundleReport.totalMemoryUsage / (1024 * 1024), // Convert to MB
          unit: 'MB',
          status: bundleReport.totalMemoryUsage < 50 * 1024 * 1024 ? 'good' : 
                 bundleReport.totalMemoryUsage < 100 * 1024 * 1024 ? 'warning' : 'critical',
          description: 'Total memory consumption'
        },
        {
          name: 'Components Loaded',
          value: bundleReport.totalComponents,
          unit: '',
          status: 'good',
          description: 'Number of components currently loaded'
        }
      ];

      if (cacheStats) {
        newMetrics.push(
          {
            name: 'Cache Hit Rate',
            value: cacheStats.hitRate * 100,
            unit: '%',
            status: cacheStats.hitRate > 0.8 ? 'good' : 
                   cacheStats.hitRate > 0.6 ? 'warning' : 'critical',
            description: 'Percentage of cache hits vs misses'
          },
          {
            name: 'Cache Size',
            value: cacheStats.cacheSize,
            unit: 'items',
            status: 'good',
            description: 'Number of items in cache'
          },
          {
            name: 'Cache Memory',
            value: cacheStats.memoryUsage / (1024 * 1024), // Convert to MB
            unit: 'MB',
            status: cacheStats.memoryUsage < 10 * 1024 * 1024 ? 'good' : 'warning',
            description: 'Memory used by cache'
          }
        );
      }

      setMetrics(newMetrics);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Collect Web Vitals
  useEffect(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setWebVitals(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart
        }));
      }

      // Observe CLS
      if ('PerformanceObserver' in window) {
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            setWebVitals(prev => ({ ...prev, cls: clsValue }));
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          // Observe FCP and LCP
          const paintObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                setWebVitals(prev => ({ ...prev, fcp: entry.startTime }));
              }
            }
          });
          paintObserver.observe({ type: 'paint', buffered: true });

          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              setWebVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          return () => {
            clsObserver.disconnect();
            paintObserver.disconnect();
            lcpObserver.disconnect();
          };
        } catch (error) {
          console.warn('Performance observation not supported:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    refreshMetrics();
  }, [cacheStats]);

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'average load time':
      case 'average render time':
        return <Clock className="h-4 w-4" />;
      case 'memory usage':
      case 'cache memory':
        return <HardDrive className="h-4 w-4" />;
      case 'cache hit rate':
        return <TrendingUp className="h-4 w-4" />;
      case 'cache size':
        return <Database className="h-4 w-4" />;
      case 'components loaded':
        return <Cpu className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getWebVitalStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'good' : value < 3000 ? 'warning' : 'critical';
      case 'lcp':
        return value < 2500 ? 'good' : value < 4000 ? 'warning' : 'critical';
      case 'fid':
        return value < 100 ? 'good' : value < 300 ? 'warning' : 'critical';
      case 'cls':
        return value < 0.1 ? 'good' : value < 0.25 ? 'warning' : 'critical';
      case 'ttfb':
        return value < 800 ? 'good' : value < 1800 ? 'warning' : 'critical';
      default:
        return 'good';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor calendar performance and optimization metrics</p>
        </div>
        <Button 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          {showTips && <TabsTrigger value="tips">Optimization Tips</TabsTrigger>}
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getMetricIcon(metric.name)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(metric.name.includes('Rate') ? 1 : 0)}
                    <span className="text-sm font-normal ml-1">{metric.unit}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge className={cn("text-xs", getStatusColor(metric.status))}>
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(webVitals).map(([key, value]) => {
              const status = getWebVitalStatus(key, value);
              const labels = {
                fcp: 'First Contentful Paint',
                lcp: 'Largest Contentful Paint',
                fid: 'First Input Delay',
                cls: 'Cumulative Layout Shift',
                ttfb: 'Time to First Byte'
              };
              
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{labels[key as keyof typeof labels]}</CardTitle>
                      <Gauge className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {value.toFixed(key === 'cls' ? 3 : 0)}
                      <span className="text-sm font-normal ml-1">
                        {key === 'cls' ? '' : 'ms'}
                      </span>
                    </div>
                    <Badge className={cn("text-xs mt-2", getStatusColor(status))}>
                      {status}
                    </Badge>
                    <Progress 
                      value={key === 'cls' ? Math.min(value * 1000, 100) : Math.min(value / 50, 100)} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Performance</CardTitle>
              <CardDescription>Loading and rendering times for calendar components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getBundleReport().slowestComponents.map((component, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{component.name}</p>
                      <p className="text-sm text-muted-foreground">Load time</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{component.loadTime.toFixed(2)}ms</p>
                      <Badge 
                        className={cn(
                          "text-xs",
                          component.loadTime < 100 ? getStatusColor('good') :
                          component.loadTime < 200 ? getStatusColor('warning') :
                          getStatusColor('critical')
                        )}
                      >
                        {component.loadTime < 100 ? 'Fast' : 
                         component.loadTime < 200 ? 'Moderate' : 'Slow'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showTips && (
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>Tips to improve calendar performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getOptimizationTips().map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                  {getOptimizationTips().length === 0 && (
                    <div className="flex items-center gap-3 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <p className="text-sm">Performance is optimal! No recommendations at this time.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Lightweight performance monitor for production
export function PerformanceMonitor() {
  const [showDashboard, setShowDashboard] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDashboard(!showDashboard)}
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur"
      >
        <Activity className="h-4 w-4" />
      </Button>
      {showDashboard && (
        <div className="fixed inset-4 z-50 bg-background/95 backdrop-blur rounded-lg border shadow-lg overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Monitor</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDashboard(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PerformanceDashboard />
          </div>
        </div>
      )}
    </>
  );
}