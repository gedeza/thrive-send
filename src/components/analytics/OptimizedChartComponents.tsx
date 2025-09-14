import React, { useMemo, useCallback, memo, useState, useRef, useEffect, Suspense } from 'react';
import { useTheme } from 'next-themes';
import { getBaseChartOptions, getChartColors, validateChartData } from '@/lib/analytics/chart-theme';
import BaseChartWidget from './BaseChartWidget';
import ChartJS from './ChartSetup';
import { Skeleton } from '@/components/ui/skeleton';
import { throttle, debounce } from 'lodash-es';

// Lazy loaded chart components for better performance
const LazyBar = React.lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
const LazyLine = React.lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const LazyPie = React.lazy(() => import('react-chartjs-2').then(module => ({ default: module.Pie })));

/**
 * Optimized Chart Components with useMemo for performance
 * Prevents unnecessary re-renders and chart re-calculations
 */

interface OptimizedChartProps {
  title: string;
  data: {
    labels: string[];
    datasets: any[];
  };
  options?: any;
  isLoading?: boolean;
  error?: Error | string | null;
  className?: string;
  onRetry?: () => void;
}

/**
 * Intersection Observer hook for lazy chart rendering
 */
const useIntersectionObserver = (ref: React.RefObject<Element>, options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasBeenVisible) {
        setHasBeenVisible(true);
      }
    }, { threshold: 0.1, ...options });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasBeenVisible]);

  return { isIntersecting, hasBeenVisible };
};

/**
 * Enhanced memoized data transformer with performance optimizations
 */
const useChartData = (data: unknown, isDark: boolean, chartType: 'bar' | 'pie' | 'line') => {
  return useMemo(() => {
    if (!data || !validateChartData(data)) {
      return null;
    }

    const colors = getChartColors(data.datasets?.length || 1);
    
    return {
      ...data,
      datasets: data.datasets.map((dataset: any, index: number) => {
        const baseDataset = {
          ...dataset,
          backgroundColor: dataset.backgroundColor || colors[index % colors.length],
          borderColor: dataset.borderColor || colors[index % colors.length],
        };

        // Chart-specific optimizations
        switch (chartType) {
          case 'bar':
            return {
              ...baseDataset,
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
              hoverBackgroundColor: `${colors[index % colors.length]}CC`,
              hoverBorderColor: colors[index % colors.length],
            };
          
          case 'pie':
            return {
              ...baseDataset,
              backgroundColor: colors.slice(0, data.labels.length),
              borderColor: '#ffffff',
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverOffset: 4,
            };
          
          case 'line':
            return {
              ...baseDataset,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: colors[index % colors.length],
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              fill: dataset.fill || false,
              tension: 0.3,
            };
          
          default:
            return baseDataset;
        }
      })
    };
  }, [data, isDark, chartType]);
};

/**
 * Memoized chart options
 */
const useChartOptions = (customOptions: any, isDark: boolean, chartType: 'bar' | 'pie' | 'line') => {
  return useMemo(() => {
    const baseOptions = getBaseChartOptions(isDark);
    
    // Chart-specific option overrides
    let typeSpecificOptions = {};
    
    switch (chartType) {
      case 'pie':
        typeSpecificOptions = {
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: 'bottom' as const,
            },
          },
        };
        break;
      
      case 'line':
        typeSpecificOptions = {
          elements: {
            line: {
              tension: 0.3,
            },
          },
        };
        break;
      
      default:
        typeSpecificOptions = {};
    }
    
    return {
      ...baseOptions,
      ...typeSpecificOptions,
      ...customOptions,
      plugins: {
        ...baseOptions.plugins,
        ...typeSpecificOptions.plugins,
        ...customOptions?.plugins,
      },
    };
  }, [customOptions, isDark, chartType]);
};

/**
 * Optimized Bar Chart Component
 */
export const OptimizedBarChart = memo<OptimizedChartProps>(({ 
  title, 
  data, 
  options, 
  isLoading, 
  error, 
  className, 
  onRetry 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const chartData = useChartData(data, isDark, 'bar');
  const chartOptions = useChartOptions(options, isDark, 'bar');
  
  // Memoized chart component to prevent unnecessary re-renders
  const ChartComponent = useMemo(() => {
    if (!chartData) return null;
    
    // Dynamic import to avoid SSR issues
    const { Bar } = require('react-chartjs-2');
    return <Bar key={`bar-${JSON.stringify(chartData.labels)}`} data={chartData} options={chartOptions} />;
  }, [chartData, chartOptions]);

  return (
    <BaseChartWidget
      title={title}
      isLoading={isLoading}
      error={error}
      className={className}
      onRetry={onRetry}
    >
      {ChartComponent}
    </BaseChartWidget>
  );
});

OptimizedBarChart.displayName = 'OptimizedBarChart';

/**
 * Optimized Pie Chart Component
 */
export const OptimizedPieChart = memo<OptimizedChartProps>(({ 
  title, 
  data, 
  options, 
  isLoading, 
  error, 
  className, 
  onRetry 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const chartData = useChartData(data, isDark, 'pie');
  const chartOptions = useChartOptions(options, isDark, 'pie');
  
  // Memoized chart component to prevent unnecessary re-renders
  const ChartComponent = useMemo(() => {
    if (!chartData) return null;
    
    // Dynamic import to avoid SSR issues
    const { Pie } = require('react-chartjs-2');
    return <Pie key={`pie-${JSON.stringify(chartData.labels)}`} data={chartData} options={chartOptions} />;
  }, [chartData, chartOptions]);

  return (
    <BaseChartWidget
      title={title}
      isLoading={isLoading}
      error={error}
      className={className}
      onRetry={onRetry}
    >
      {ChartComponent}
    </BaseChartWidget>
  );
});

OptimizedPieChart.displayName = 'OptimizedPieChart';

/**
 * Optimized Line Chart Component
 */
export const OptimizedLineChart = memo<OptimizedChartProps>(({ 
  title, 
  data, 
  options, 
  isLoading, 
  error, 
  className, 
  onRetry 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const chartData = useChartData(data, isDark, 'line');
  const chartOptions = useChartOptions(options, isDark, 'line');
  
  // Memoized chart component to prevent unnecessary re-renders
  const ChartComponent = useMemo(() => {
    if (!chartData) return null;
    
    // Dynamic import to avoid SSR issues
    const { Line } = require('react-chartjs-2');
    return <Line key={`line-${JSON.stringify(chartData.labels)}`} data={chartData} options={chartOptions} />;
  }, [chartData, chartOptions]);

  return (
    <BaseChartWidget
      title={title}
      isLoading={isLoading}
      error={error}
      className={className}
      onRetry={onRetry}
    >
      {ChartComponent}
    </BaseChartWidget>
  );
});

OptimizedLineChart.displayName = 'OptimizedLineChart';

/**
 * Optimized HeatMap Component with better performance
 */
interface OptimizedHeatMapProps {
  data?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  isLoading?: boolean;
  error?: Error | string | null;
  title?: string;
  className?: string;
  onRetry?: () => void;
}

export const OptimizedHeatMap = memo<OptimizedHeatMapProps>(({ 
  data, 
  isLoading, 
  error, 
  title = "Activity Heatmap", 
  className, 
  onRetry 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Memoized heat map matrix calculation
  const heatMapData = useMemo(() => {
    if (!data || !validateChartData(data)) {
      // Use mock data if no data is provided
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Engagement',
          data: [100, 120, 115, 134, 168, 132, 200]
        }]
      };
    }
    return data;
  }, [data]);
  
  // Memoized matrix transformation
  const { matrix, maxValue } = useMemo(() => {
    const matrixData = Array(7).fill(null).map(() => Array(52).fill(0));
    
    heatMapData.datasets[0].data.forEach((value, i) => {
      const date = new Date(2024, 0, i + 1);
      const day = date.getDay();
      const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000)) % 52;
      matrixData[day][week] = value;
    });
    
    const maxVal = Math.max(...heatMapData.datasets[0].data);
    
    return {
      matrix: matrixData,
      maxValue: maxVal
    };
  }, [heatMapData]);
  
  // Memoized color function
  const getHeatmapColor = useCallback((value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    return isDark 
      ? `rgba(96, 165, 250, ${intensity})`
      : `rgba(59, 130, 246, ${intensity})`;
  }, [maxValue, isDark]);
  
  // Memoized grid cells
  const gridCells = useMemo(() => {
    return matrix.map((row, dayIndex) => 
      row.map((value, weekIndex) => {
        const color = getHeatmapColor(value);
        const key = `${dayIndex}-${weekIndex}`;
        const date = new Date(2024, 0, weekIndex * 7 + dayIndex);
        
        return {
          key,
          color,
          value,
          date: date.toLocaleDateString(),
          style: { backgroundColor: color }
        };
      })
    );
  }, [matrix, getHeatmapColor]);
  
  // Memoized legend gradient
  const legendGradient = useMemo(() => {
    return isDark 
      ? 'bg-gradient-to-r from-blue-900/20 via-blue-500/50 to-blue-400'
      : 'bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500';
  }, [isDark]);
  
  const HeatMapContent = useMemo(() => (
    <div className="relative">
      {/* Day labels */}
      <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
        {heatMapData.labels.map(day => (
          <div key={day} className="h-[calc(100%/7)] flex items-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Week labels */}
      <div className="absolute -top-6 left-0 w-full flex justify-between text-xs text-muted-foreground">
        {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
          <div key={week} className="w-[calc(100%/52)] text-center">
            {week % 4 === 0 ? week : ''}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="ml-12 mt-6 grid grid-cols-52 gap-0.5">
        {gridCells.map((row, dayIndex) => (
          row.map((cell) => (
            <div
              key={cell.key}
              className="w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-primary/50"
              style={cell.style}
              title={`${cell.date}: ${cell.value}`}
            />
          ))
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className={`flex-1 h-2 rounded-full ${legendGradient}`} />
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  ), [heatMapData.labels, gridCells, legendGradient]);

  return (
    <BaseChartWidget
      title={title}
      isLoading={isLoading}
      error={error}
      className={className}
      onRetry={onRetry}
    >
      {HeatMapContent}
    </BaseChartWidget>
  );
});

OptimizedHeatMap.displayName = 'OptimizedHeatMap';

/**
 * Performance monitoring hook for chart components
 */
export const useChartPerformance = (componentName: string) => {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development' && renderCount.current % 10 === 0) {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });
  
  return {
    renderCount: renderCount.current,
    lastRenderTime: performance.now() - startTime.current
  };
};

/**
 * Chart data comparison utility for debugging re-renders
 */
export const useChartDataComparison = (data: unknown, name: string) => {
  const prevData = React.useRef(data);
  
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const hasChanged = JSON.stringify(prevData.current) !== JSON.stringify(data);
      if (hasChanged) {
        console.log(`${name} data changed:`, {
          previous: prevData.current,
          current: data
        });
      }
    }
    prevData.current = data;
  }, [data, name]);
};