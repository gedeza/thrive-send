import React, { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Performance Monitor
export const performanceMonitor = {
  metrics: {} as Record<string, number>,
  observer: null as PerformanceObserver | null,

  getMetrics() {
    return this.metrics;
  },

  measureComponent(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    this.metrics[`component-${name}`] = end - start;
  },

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  clearMetrics() {
    this.metrics = {};
  },

  init() {
    if (typeof window === 'undefined') return;

    try {
      // Monitor Core Web Vitals
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.lcp = entry.startTime;
          }
          if (entry.entryType === 'first-input') {
            this.metrics.fid = (entry as any).processingStart - entry.startTime;
          }
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.metrics.cls = (this.metrics.cls || 0) + (entry as any).value;
          }
        });
      });

      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }
};

// Memory Management
export const memoryManagement = {
  monitorMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  },

  clearUnusedCaches() {
    if (typeof window === 'undefined') return;

    // Clear any unused caches
    try {
      // Clear old performance entries
      if (performance.clearResourceTimings) {
        performance.clearResourceTimings();
      }
    } catch (error) {
      console.warn('Cache clearing failed:', error);
    }
  }
};

// Resource Hints
export const resourceHints = {
  preconnect(url: string) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  },

  prefetch(url: string) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },

  preload(url: string, as: string) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Dynamic Progressive Calendar Component
const ProgressiveCalendar = lazy(() => 
  import('@/components/content/content-calendar').then(mod => ({ 
    default: mod.ContentCalendar 
  }))
);

export const DynamicProgressiveCalendar = dynamic(
  () => import('@/components/content/content-calendar').then(mod => mod.ContentCalendar),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false
  }
);

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

// Bundle optimization utilities
export const bundleOptimization = {
  // Lazy load components
  lazyImport: <T extends Record<string, any>>(
    importFn: () => Promise<T>,
    namedExport?: keyof T
  ) => {
    return lazy(() =>
      importFn().then((module) => ({
        default: namedExport ? module[namedExport as string] : module.default
      }))
    );
  },

  // Preload critical resources
  preloadCriticalResources() {
    resourceHints.preconnect('https://fonts.googleapis.com');
    resourceHints.preconnect('https://fonts.gstatic.com');
  },

  // Monitor bundle performance
  trackBundleMetrics() {
    if (typeof window === 'undefined') return;

    // Track bundle load times
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      performanceMonitor.metrics.loadTime = loadTime;
    });
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  bundleOptimization.preloadCriticalResources();
  bundleOptimization.trackBundleMetrics();
}