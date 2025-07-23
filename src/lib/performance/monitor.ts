import { logger } from '@/lib/utils/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, any>;
}

interface APIPerformanceMetric extends PerformanceMetric {
  endpoint: string;
  method: string;
  status: number;
  userId?: string;
  organizationId?: string;
}

interface ComponentPerformanceMetric extends PerformanceMetric {
  component: string;
  renderTime: number;
  props?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  private performanceObserver?: PerformanceObserver;
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.initializePerformanceObserver();
    }
  }

  private initializePerformanceObserver() {
    if (!this.isClient || !('PerformanceObserver' in window)) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = ['navigation', 'resource', 'measure', 'paint'];
      
      for (const entryType of entryTypes) {
        try {
          this.performanceObserver.observe({ 
            type: entryType as any, 
            buffered: true 
          });
        } catch (e) {
          // Some entry types might not be supported
          console.warn(`Performance observer type ${entryType} not supported:`, e);
        }
      }
    } catch (error) {
      console.warn('Failed to initialize Performance Observer:', error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.duration || (entry as any).startTime,
      unit: 'ms',
      timestamp: Date.now(),
      context: {
        entryType: entry.entryType,
        startTime: entry.startTime,
      }
    };

    // Add specific context based on entry type
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      metric.context = {
        ...metric.context,
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
        domComplete: navEntry.domComplete - navEntry.navigationStart,
        loadComplete: navEntry.loadEventEnd - navEntry.navigationStart,
      };
    } else if (entry.entryType === 'resource') {
      const resourceEntry = entry as PerformanceResourceTiming;
      metric.context = {
        ...metric.context,
        transferSize: resourceEntry.transferSize,
        encodedBodySize: resourceEntry.encodedBodySize,
        decodedBodySize: resourceEntry.decodedBodySize,
      };
    }

    this.addMetric(metric);
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log critical performance issues
    if (metric.value > 3000) { // > 3 seconds
      logger.warn('Performance issue detected', {
        metric: metric.name,
        value: metric.value,
        unit: metric.unit,
        context: metric.context
      });
    }
  }

  /**
   * Time a function execution
   */
  async timeFunction<T>(
    name: string, 
    fn: () => Promise<T> | T,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      
      this.addMetric({
        name,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        context
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.addMetric({
        name: `${name}_error`,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }

  /**
   * Time an API request
   */
  async timeAPIRequest<T>(
    endpoint: string,
    method: string,
    fn: () => Promise<T>,
    userId?: string,
    organizationId?: string
  ): Promise<T> {
    const startTime = performance.now();
    let status = 200;
    
    try {
      const result = await fn();
      const endTime = performance.now();
      
      const metric: APIPerformanceMetric = {
        name: `api_${method.toLowerCase()}_${endpoint.replace(/\//g, '_')}`,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        endpoint,
        method,
        status,
        userId,
        organizationId
      };
      
      this.addMetric(metric);
      return result;
    } catch (error) {
      const endTime = performance.now();
      status = 500; // Assume server error if not specified
      
      const metric: APIPerformanceMetric = {
        name: `api_${method.toLowerCase()}_${endpoint.replace(/\//g, '_')}_error`,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        endpoint,
        method,
        status,
        userId,
        organizationId,
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      
      this.addMetric(metric);
      throw error;
    }
  }

  /**
   * Time a React component render
   */
  timeComponentRender(
    component: string,
    renderTime: number,
    props?: Record<string, any>
  ) {
    const metric: ComponentPerformanceMetric = {
      name: `component_${component.toLowerCase()}_render`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      component,
      renderTime,
      props: props ? Object.keys(props) : undefined // Don't log prop values for privacy
    };
    
    this.addMetric(metric);
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(context?: Record<string, any>) {
    if (!this.isClient) return;

    const memory = (performance as any).memory;
    if (!memory) return;

    this.addMetric({
      name: 'memory_usage',
      value: memory.usedJSHeapSize,
      unit: 'bytes',
      timestamp: Date.now(),
      context: {
        ...context,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      }
    });
  }

  /**
   * Track Core Web Vitals
   */
  trackCoreWebVitals() {
    if (!this.isClient) return;

    // Track Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.addMetric({
            name: 'core_web_vitals_lcp',
            value: entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            context: {
              element: (entry as any).element?.tagName,
              url: (entry as any).url,
            }
          });
        }
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Track First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          this.addMetric({
            name: 'core_web_vitals_fid',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
            timestamp: Date.now()
          });
        }
      }
    }).observe({ type: 'first-input', buffered: true });

    // Track Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      this.addMetric({
        name: 'core_web_vitals_cls',
        value: clsValue,
        unit: 'count',
        timestamp: Date.now()
      });
    }).observe({ type: 'layout-shift', buffered: true });
  }

  /**
   * Get performance metrics
   */
  getMetrics(filter?: {
    name?: string;
    timeRange?: { start: number; end: number };
    limit?: number;
  }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter(m => m.name.includes(filter.name!));
    }

    if (filter?.timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= filter.timeRange!.start && 
        m.timestamp <= filter.timeRange!.end
      );
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalMetrics: number;
    averageApiResponseTime: number;
    slowestApiEndpoints: Array<{ name: string; avgTime: number }>;
    memoryUsage?: { current: number; peak: number };
    coreWebVitals?: { lcp?: number; fid?: number; cls?: number };
  } {
    const apiMetrics = this.metrics.filter(m => m.name.startsWith('api_'));
    const avgApiTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;

    // Group by endpoint and calculate averages
    const endpointGroups: { [key: string]: number[] } = {};
    apiMetrics.forEach(metric => {
      if (!endpointGroups[metric.name]) {
        endpointGroups[metric.name] = [];
      }
      endpointGroups[metric.name].push(metric.value);
    });

    const slowestEndpoints = Object.entries(endpointGroups)
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const memoryMetrics = this.metrics.filter(m => m.name === 'memory_usage');
    const memoryUsage = memoryMetrics.length > 0 ? {
      current: memoryMetrics[memoryMetrics.length - 1].value,
      peak: Math.max(...memoryMetrics.map(m => m.value))
    } : undefined;

    const coreWebVitals = {
      lcp: this.metrics.find(m => m.name === 'core_web_vitals_lcp')?.value,
      fid: this.metrics.find(m => m.name === 'core_web_vitals_fid')?.value,
      cls: this.metrics.find(m => m.name === 'core_web_vitals_cls')?.value,
    };

    return {
      totalMetrics: this.metrics.length,
      averageApiResponseTime: avgApiTime,
      slowestApiEndpoints: slowestEndpoints,
      memoryUsage,
      coreWebVitals
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      summary: this.getPerformanceSummary(),
      metrics: this.metrics
    }, null, 2);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startRender = () => performance.now();
  
  const endRender = (startTime: number, props?: Record<string, any>) => {
    const renderTime = performance.now() - startTime;
    performanceMonitor.timeComponentRender(componentName, renderTime, props);
  };

  return { startRender, endRender };
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || Component.displayName || Component.name || 'UnknownComponent';
  
  return function PerformanceMonitoredComponent(props: P) {
    const startTime = performance.now();

    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.timeComponentRender(name, renderTime, props);
    });

    return React.createElement(Component, props);
  };
}