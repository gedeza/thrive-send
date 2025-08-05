"use client";

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import BaseChartWidget from './BaseChartWidget';
import { getHeatmapColor, validateChartData } from '@/lib/analytics/chart-theme';

interface HeatMapData {
  date: string;
  value: number;
}

interface HeatMapWidgetProps {
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

export function HeatMapWidget({ data, isLoading, error, title = "Activity Heatmap", className, onRetry }: HeatMapWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredCell, setHoveredCell] = useState<HeatMapData | null>(null);

  // Validate data
  const dataError = data && !validateChartData(data) ? 'Invalid chart data format' : null;
  const finalError = error || dataError;

  // Use mock data if no data is provided
  const mockData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Engagement',
        data: [100, 120, 115, 134, 168, 132, 200]
      }
    ]
  };

  const displayData = data || mockData;

  // Validate data structure before processing
  const hasValidData = displayData?.datasets?.[0]?.data && Array.isArray(displayData.datasets[0].data) && displayData.datasets[0].data.length > 0;
  const hasValidLabels = displayData?.labels && Array.isArray(displayData.labels) && displayData.labels.length > 0;

  // Group data by week
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Transform data into a matrix
  const matrix = Array(7).fill(null).map(() => Array(52).fill(0));
  
  // Only process data if valid structure exists
  if (hasValidData) {
    displayData.datasets[0].data.forEach((value, i) => {
      const date = new Date(2024, 0, i + 1);
      const day = date.getDay();
      const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000)) % 52;
      matrix[day][week] = value;
    });
  }

  // Find max value for color scaling - with fallback
  const maxValue = hasValidData ? Math.max(...displayData.datasets[0].data) : 200;

  return (
    <BaseChartWidget
      title={title}
      isLoading={isLoading}
      error={finalError}
      className={className}
      onRetry={onRetry}
    >
      <div className="relative">
        {/* Day labels */}
        <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
          {(hasValidLabels ? displayData.labels : days).map(day => (
            <div key={day} className="h-[calc(100%/7)] flex items-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Week labels */}
        <div className="absolute -top-6 left-0 w-full flex justify-between text-xs text-muted-foreground">
          {weeks.map(week => (
            <div key={week} className="w-[calc(100%/52)] text-center">
              {week % 4 === 0 ? week : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="ml-12 mt-6 grid grid-cols-52 gap-0.5">
          {matrix.map((row, dayIndex) => (
            row.map((value, weekIndex) => {
              const color = getHeatmapColor(value, maxValue, isDark);
              
              return (
                <TooltipProvider key={`${dayIndex}-${weekIndex}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-primary/50"
                        style={{ backgroundColor: color }}
                        onMouseEnter={() => setHoveredCell({ date: new Date(2024, 0, weekIndex * 7 + dayIndex).toISOString(), value })}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Date: {new Date(2024, 0, weekIndex * 7 + dayIndex).toLocaleDateString()}</p>
                      <p>Value: {value}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className={`flex-1 h-2 rounded-full ${
            isDark 
              ? 'bg-gradient-to-r from-blue-900/20 via-blue-500/50 to-blue-400' 
              : 'bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500'
          }`} />
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </BaseChartWidget>
  );
} 