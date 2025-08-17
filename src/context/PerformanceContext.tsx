'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { performanceMonitor, memoryManagement, resourceHints } from '@/lib/utils/bundle-optimization';
import { useCalendarCache } from './CalendarCacheContext';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  loadTime?: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null;
  componentRenderTimes: Record<string, number>;
  cacheHitRate: number;
  bundleSize?: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  isOptimizedMode: boolean;
  setOptimizedMode: (enabled: boolean) => void;
  measureComponent: (name: string, fn: () => void) => void;
  preloadComponent: (componentName: string) => void;
  reportMetrics: () => void;
  clearMetrics: () => void;
  updateCacheHitRate: (hits: number, misses: number) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableOptimizations?: boolean;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableOptimizations = true
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentRenderTimes: {},
    cacheHitRate: 0
  });
  const [isOptimizedMode, setIsOptimizedMode] = useState(enableOptimizations);
  const metricsUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const cacheStats = useRef({ hits: 0, misses: 0 });
  const { getStats } = useCalendarCache();

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && isOptimizedMode) {
      // Start metrics collection
      const updateMetrics = () => {
        const performanceMetrics = performanceMonitor.getMetrics();
        const memoryUsage = memoryManagement.monitorMemoryUsage();
        const cacheStats = getStats();
        
        setMetrics(prev => ({
          ...prev,
          ...performanceMetrics,
          memoryUsage,
          cacheHitRate: cacheStats.hitRate || 0
        }));
      };

      // Update metrics every 5 seconds
      metricsUpdateInterval.current = setInterval(updateMetrics, 5000);
      
      // Initial update
      updateMetrics();

      // Preconnect to common resources
      resourceHints.preconnect('https://fonts.googleapis.com');
      resourceHints.preconnect('https://api.example.com');

      return () => {
        if (metricsUpdateInterval.current) {
          clearInterval(metricsUpdateInterval.current);
        }
      };
    }
  }, [isOptimizedMode, getStats]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      performanceMonitor.disconnect();
      if (metricsUpdateInterval.current) {
        clearInterval(metricsUpdateInterval.current);
      }
    };
  }, []);

  // Measure component performance
  const measureComponent = useCallback((name: string, fn: () => void) => {
    if (!isOptimizedMode) {
      fn();
      return;
    }

    performanceMonitor.measureComponent(name, fn);
    
    // Update component render times
    const newMetrics = performanceMonitor.getMetrics();
    const componentTime = newMetrics[`component-${name}`];
    
    if (componentTime) {
      setMetrics(prev => ({
        ...prev,
        componentRenderTimes: {
          ...prev.componentRenderTimes,
          [name]: componentTime
        }
      }));
    }
  }, [isOptimizedMode]);

  // Preload component
  const preloadComponent = useCallback((componentName: string) => {
    if (!isOptimizedMode) return;

    const preloadMap: Record<string, () => Promise<any>> = {
      'month-view': () => import('@/components/content/MonthView'),
      'week-view': () => import('@/components/content/WeekView'),
      'day-view': () => import('@/components/content/DayView'),
      'list-view': () => import('@/components/content/ListView'),
      'virtualized-list': () => import('@/components/content/VirtualizedEventList'),
      'infinite-loader': () => import('@/components/content/InfiniteEventLoader'),
      // Note: TemplateSelector and RecurrenceSelector will be available when created
    };

    const preloadFn = preloadMap[componentName];
    if (preloadFn) {
      preloadFn().catch(() => {});
    }
  }, [isOptimizedMode]);

  // Report metrics to analytics
  const reportMetrics = useCallback(() => {
    if (!isOptimizedMode) return;

    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        ...metrics,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      }
    };

    // In a real app, you would send this to your analytics service
    // Performance Report generated
    
    // Optional: Send to analytics service
    // analyticsService.track('performance_metrics', report);
  }, [metrics, isOptimizedMode]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
    setMetrics({
      componentRenderTimes: {},
      cacheHitRate: 0
    });
    cacheStats.current = { hits: 0, misses: 0 };
  }, []);

  // Update cache hit rate
  const updateCacheHitRate = useCallback((hits: number, misses: number) => {
    cacheStats.current = { hits, misses };
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate
    }));
  }, []);

  // Set optimized mode
  const setOptimizedMode = useCallback((enabled: boolean) => {
    setIsOptimizedMode(enabled);
    
    if (enabled) {
      // Clean up unused caches when enabling optimizations
      memoryManagement.clearUnusedCaches();
    }
  }, []);

  // Performance warnings
  useEffect(() => {
    if (!isOptimizedMode) return;

    const { componentRenderTimes, memoryUsage, lcp, fid, cls } = metrics;
    
    // Warn about slow components
    Object.entries(componentRenderTimes).forEach(([name, time]) => {
      if (time > 100) {
        // Component took too long to render
      }
    });

    // Warn about memory usage
    if (memoryUsage && memoryUsage.percentage > 80) {
      // High memory usage detected
    }

    // Warn about Core Web Vitals
    if (lcp && lcp > 2500) {
      // Poor LCP performance
    }
    
    if (fid && fid > 100) {
      // Poor FID performance
    }
    
    if (cls && cls > 0.1) {
      // Poor CLS performance
    }
  }, [metrics, isOptimizedMode]);

  const value: PerformanceContextType = {
    metrics,
    isOptimizedMode,
    setOptimizedMode,
    measureComponent,
    preloadComponent,
    reportMetrics,
    clearMetrics,
    updateCacheHitRate
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const { metrics } = usePerformance();
  return metrics;
};

// Component performance measurement hook
export const useComponentPerformance = (componentName: string) => {
  const { measureComponent } = usePerformance();
  
  return useCallback((fn: () => void) => {
    measureComponent(componentName, fn);
  }, [measureComponent, componentName]);
};

// Preload hook for components
export const usePreload = () => {
  const { preloadComponent } = usePerformance();
  return preloadComponent;
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const { reportMetrics, clearMetrics } = usePerformance();
  
  useEffect(() => {
    // Report metrics when component unmounts
    return () => {
      reportMetrics();
    };
  }, [reportMetrics]);
  
  return { reportMetrics, clearMetrics };
};