/**
 * Bundle optimization utilities for calendar components
 * Implements code splitting and lazy loading strategies
 */

import { lazy, ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Lazy load calendar components for better performance
export const LazyMonthView = lazy(() => import('@/components/content/MonthView').then(module => ({ default: module.MonthView })));
export const LazyWeekView = lazy(() => import('@/components/content/WeekView').then(module => ({ default: module.WeekView })));
export const LazyDayView = lazy(() => import('@/components/content/DayView').then(module => ({ default: module.DayView })));
export const LazyListView = lazy(() => import('@/components/content/ListView').then(module => ({ default: module.ListView })));

// Dynamic imports for heavy components
export const DynamicVirtualizedEventList = dynamic(
  () => import('@/components/content/VirtualizedEventList').then(mod => ({ default: mod.VirtualizedEventList })),
  {
    loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />,
    ssr: false
  }
);

export const DynamicInfiniteEventLoader = dynamic(
  () => import('@/components/content/InfiniteEventLoader').then(mod => ({ default: mod.InfiniteEventLoader })),
  {
    loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />,
    ssr: false
  }
);

export const DynamicProgressiveCalendar = dynamic(
  () => import('@/components/content/ProgressiveCalendar').then(mod => ({ default: mod.ProgressiveCalendar })),
  {
    loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />,
    ssr: false
  }
);

export const DynamicTemplateSelector = dynamic(
  () => import('@/components/content/TemplateSelector').then(mod => ({ default: mod.TemplateSelector })),
  {
    loading: () => <div className="animate-pulse bg-muted h-48 rounded-lg" />,
    ssr: false
  }
);

export const DynamicRecurrenceSelector = dynamic(
  () => import('@/components/content/RecurrenceSelector').then(mod => ({ default: mod.RecurrenceSelector })),
  {
    loading: () => <div className="animate-pulse bg-muted h-32 rounded-lg" />,
    ssr: false
  }
);

// Preload functions for better UX
export const preloadCalendarComponents = {
  monthView: () => import('@/components/content/MonthView'),
  weekView: () => import('@/components/content/WeekView'),
  dayView: () => import('@/components/content/DayView'),
  listView: () => import('@/components/content/ListView'),
  virtualizedList: () => import('@/components/content/VirtualizedEventList'),
  infiniteLoader: () => import('@/components/content/InfiniteEventLoader'),
  templateSelector: () => import('@/components/content/TemplateSelector'),
  recurrenceSelector: () => import('@/components/content/RecurrenceSelector'),
};

// Bundle analyzer helper
export const getBundleInfo = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');
    
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      resources: resources.map(resource => ({
        name: resource.name,
        size: resource.transferSize,
        duration: resource.duration,
        type: resource.initiatorType
      })),
      totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
    };
  }
  return null;
};

// Chunk splitting configuration
export const chunkConfig = {
  vendor: {
    name: 'vendor',
    chunks: 'all',
    test: /[\\/]node_modules[\\/]/,
    priority: 10,
    reuseExistingChunk: true
  },
  common: {
    name: 'common',
    chunks: 'all',
    minChunks: 2,
    priority: 5,
    reuseExistingChunk: true
  },
  calendar: {
    name: 'calendar',
    chunks: 'all',
    test: /[\\/]components[\\/]content[\\/]/,
    priority: 20,
    reuseExistingChunk: true
  }
};

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Long Task Observer
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn('Long task detected:', entry.duration, 'ms');
        this.metrics.set(`longTask-${Date.now()}`, entry.duration);
      });
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    this.observers.push(longTaskObserver);

    // Largest Contentful Paint Observer
    const lcpObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.set('lcp', entry.startTime);
      });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // First Input Delay Observer
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.set('fid', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift Observer
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.set('cls', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  measureComponent(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    this.metrics.set(`component-${name}`, end - start);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics() {
    this.metrics.clear();
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Resource hints for better loading
export const resourceHints = {
  prefetch: (url: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  },
  preload: (url: string, as: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = as;
      document.head.appendChild(link);
    }
  },
  preconnect: (url: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    }
  }
};

// Image optimization utilities
export const imageOptimization = {
  shouldLazyLoad: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    return rect.top > viewportHeight * 1.5; // Load when within 1.5x viewport
  },
  
  getOptimizedImageUrl: (url: string, width: number, height: number, quality = 80) => {
    // This would typically integrate with your image optimization service
    // For now, return the original URL
    return url;
  },
  
  supportsWebP: () => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  }
};

// Memory management utilities
export const memoryManagement = {
  clearUnusedCaches: () => {
    // Clear expired cache entries
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('calendar-') && cacheName.includes('expired')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  },
  
  monitorMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }
};

// Export all utilities
export default {
  components: {
    LazyMonthView,
    LazyWeekView,
    LazyDayView,
    LazyListView,
    DynamicVirtualizedEventList,
    DynamicInfiniteEventLoader,
    DynamicProgressiveCalendar,
    DynamicTemplateSelector,
    DynamicRecurrenceSelector
  },
  preload: preloadCalendarComponents,
  performance: performanceMonitor,
  resources: resourceHints,
  images: imageOptimization,
  memory: memoryManagement,
  bundle: {
    getInfo: getBundleInfo,
    chunkConfig
  }
};