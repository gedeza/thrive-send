/**
 * Bundle Optimization Utilities
 * Tools for analyzing and optimizing bundle sizes
 */

// Dynamic import utilities for code splitting
export const dynamicImports = {
  // Calendar components
  EventForm: () => import('@/components/content/EventForm'),
  TemplateSelector: () => import('@/components/content/TemplateSelector'),
  RecurrenceSelector: () => import('@/components/content/RecurrenceSelector'),
  
  // Chart components (heavy libraries)
  LineChart: () => import('recharts').then(mod => ({ LineChart: mod.LineChart })),
  BarChart: () => import('recharts').then(mod => ({ BarChart: mod.BarChart })),
  PieChart: () => import('recharts').then(mod => ({ PieChart: mod.PieChart })),
  
  // Rich text editor
  RichTextEditor: () => import('@/components/rich-text-editor'),
  
  // Date utilities (large library)
  DateFns: () => import('date-fns'),
  DateFnsTz: () => import('date-fns-tz'),
  
  // Export utilities
  CalendarExport: () => import('@/lib/utils/calendar-export'),
  
  // Virtual list components
  VirtualList: () => import('@/components/ui/virtual-list'),
  ProgressiveLoader: () => import('@/components/ui/progressive-loader'),
};

// Preload critical components
export const preloadCriticalComponents = async () => {
  const criticalComponents = [
    'EventForm',
    'TemplateSelector'
  ] as const;

  const preloadPromises = criticalComponents.map(async (component) => {
    try {
      await dynamicImports[component]();
    } catch (error) {
      console.warn(`Failed to preload ${component}:`, error);
    }
  });

  await Promise.allSettled(preloadPromises);
};

// Lazy load heavy dependencies
export const lazyLoadHeavyDeps = {
  charts: async () => {
    const [lineChart, barChart, pieChart] = await Promise.all([
      dynamicImports.LineChart(),
      dynamicImports.BarChart(),
      dynamicImports.PieChart()
    ]);
    return { lineChart, barChart, pieChart };
  },

  dateUtils: async () => {
    const [dateFns, dateFnsTz] = await Promise.all([
      dynamicImports.DateFns(),
      dynamicImports.DateFnsTz()
    ]);
    return { dateFns, dateFnsTz };
  },

  exportUtils: async () => {
    return await dynamicImports.CalendarExport();
  }
};

// Bundle size monitoring
interface BundleMetrics {
  componentSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

class BundleAnalyzer {
  private metrics = new Map<string, BundleMetrics>();
  
  async measureComponentLoad(componentName: string, loadFn: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const component = await loadFn();
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      this.metrics.set(componentName, {
        componentSize: this.estimateComponentSize(component),
        loadTime: endTime - startTime,
        renderTime: 0, // Will be updated during render
        memoryUsage: endMemory - startMemory
      });
      
      return component;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      throw error;
    }
  }

  measureRenderTime(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    const metrics = this.metrics.get(componentName);
    if (metrics) {
      metrics.renderTime = endTime - startTime;
    }
  }

  getMetrics(componentName: string): BundleMetrics | undefined {
    return this.metrics.get(componentName);
  }

  getAllMetrics(): Map<string, BundleMetrics> {
    return new Map(this.metrics);
  }

  getPerformanceReport(): {
    totalComponents: number;
    averageLoadTime: number;
    averageRenderTime: number;
    totalMemoryUsage: number;
    slowestComponents: Array<{ name: string; loadTime: number }>;
    largestComponents: Array<{ name: string; size: number }>;
  } {
    const metrics = Array.from(this.metrics.entries());
    
    const totalComponents = metrics.length;
    const averageLoadTime = metrics.reduce((sum, [, m]) => sum + m.loadTime, 0) / totalComponents || 0;
    const averageRenderTime = metrics.reduce((sum, [, m]) => sum + m.renderTime, 0) / totalComponents || 0;
    const totalMemoryUsage = metrics.reduce((sum, [, m]) => sum + m.memoryUsage, 0);
    
    const slowestComponents = metrics
      .sort(([, a], [, b]) => b.loadTime - a.loadTime)
      .slice(0, 5)
      .map(([name, m]) => ({ name, loadTime: m.loadTime }));
    
    const largestComponents = metrics
      .sort(([, a], [, b]) => b.componentSize - a.componentSize)
      .slice(0, 5)
      .map(([name, m]) => ({ name, size: m.componentSize }));

    return {
      totalComponents,
      averageLoadTime,
      averageRenderTime,
      totalMemoryUsage,
      slowestComponents,
      largestComponents
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private estimateComponentSize(component: any): number {
    try {
      return JSON.stringify(component).length;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const bundleAnalyzer = new BundleAnalyzer();

// Hook for component performance monitoring
export function useComponentPerformance(componentName: string) {
  const measureLoad = async (loadFn: () => Promise<any>) => {
    return bundleAnalyzer.measureComponentLoad(componentName, loadFn);
  };

  const measureRender = (renderFn: () => void) => {
    bundleAnalyzer.measureRenderTime(componentName, renderFn);
  };

  const getMetrics = () => {
    return bundleAnalyzer.getMetrics(componentName);
  };

  return {
    measureLoad,
    measureRender,
    getMetrics
  };
}

// Utility for resource hints
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  const head = document.head;
  
  // Preconnect to external resources
  const preconnectUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.openai.com'
  ];

  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });

  // DNS prefetch for other resources
  const dnsPrefetchUrls = [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ];

  dnsPrefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    head.appendChild(link);
  });
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (criticalCSS: string) => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

// Progressive enhancement utilities
export const progressiveEnhancement = {
  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check connection quality
  getConnectionQuality(): 'fast' | 'slow' | 'offline' {
    if (typeof navigator === 'undefined') return 'fast';
    
    if (!navigator.onLine) return 'offline';
    
    const connection = (navigator as any).connection;
    if (!connection) return 'fast';
    
    // Consider 2G/slow-2g as slow, everything else as fast
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      return 'slow';
    }
    
    return 'fast';
  },

  // Adaptive loading based on device capabilities
  shouldUseOptimizedMode(): boolean {
    const connectionQuality = this.getConnectionQuality();
    const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Use optimized mode for slow connections or low-end devices
    return (
      connectionQuality === 'slow' ||
      deviceMemory < 4 ||
      hardwareConcurrency < 4
    );
  }
};

// Bundle optimization recommendations
export const getBundleOptimizationTips = (): string[] => {
  const tips: string[] = [];
  const report = bundleAnalyzer.getPerformanceReport();
  
  if (report.averageLoadTime > 100) {
    tips.push('Consider implementing more aggressive code splitting');
  }
  
  if (report.averageRenderTime > 16) {
    tips.push('Optimize component rendering with React.memo and useMemo');
  }
  
  if (report.totalMemoryUsage > 50 * 1024 * 1024) { // 50MB
    tips.push('Review memory usage and implement cleanup for large components');
  }
  
  if (report.slowestComponents.length > 0) {
    const slowest = report.slowestComponents[0];
    tips.push(`Consider optimizing ${slowest.name} component (${slowest.loadTime.toFixed(2)}ms load time)`);
  }
  
  return tips;
};

// Export performance monitoring hook
export function usePerformanceMonitoring() {
  const reportWebVitals = (metric: any) => {
    // Send to analytics service
    console.log('Web Vital:', metric);
  };

  const measurePerformance = (name: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    console.log(`${name} took ${endTime - startTime} milliseconds`);
  };

  return {
    reportWebVitals,
    measurePerformance,
    getBundleReport: () => bundleAnalyzer.getPerformanceReport(),
    getOptimizationTips: getBundleOptimizationTips
  };
}