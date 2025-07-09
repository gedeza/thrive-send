import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';

interface HeatMapData {
  day: string;
  week: number;
  value: number;
  date?: string;
}

interface RechartsHeatMapProps {
  data?: HeatMapData[];
  isLoading?: boolean;
  error?: Error | null;
  height?: number;
  cellSize?: number;
  gap?: number;
}

export function RechartsHeatMap({
  data,
  isLoading,
  error,
  height = 200,
  cellSize = 12,
  gap = 2
}: RechartsHeatMapProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Generate mock data if none provided
  const mockData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeks = 52;
    const data: HeatMapData[] = [];
    
    for (let week = 0; week < weeks; week++) {
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const value = Math.floor(Math.random() * 5); // 0-4 intensity
        data.push({
          day: days[dayIndex],
          week,
          value,
          date: `Week ${week + 1}, ${days[dayIndex]}`
        });
      }
    }
    return data;
  }, []);

  const heatmapData = data || mockData;

  const maxValue = useMemo(() => {
    return Math.max(...heatmapData.map(d => d.value));
  }, [heatmapData]);

  const getIntensityColor = (value: number) => {
    const intensity = value / maxValue;
    if (isDark) {
      return `rgba(96, 165, 250, ${intensity * 0.8 + 0.1})`; // blue with opacity
    } else {
      return `rgba(59, 130, 246, ${intensity * 0.8 + 0.1})`; // blue with opacity
    }
  };

  if (isLoading) {
    return <Skeleton className={`w-full h-[${height}px]`} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Failed to load heatmap data</p>
          <p className="text-xs mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = 52;

  const gridWidth = weeks * (cellSize + gap) - gap;
  const gridHeight = days.length * (cellSize + gap) - gap;

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative" style={{ minWidth: gridWidth + 40 }}>
        {/* Day labels */}
        <div className="absolute left-0 top-0 flex flex-col" style={{ width: '30px' }}>
          {days.map((day, index) => (
            <div
              key={day}
              className="text-xs text-muted-foreground flex items-center justify-end pr-2"
              style={{ 
                height: cellSize,
                marginBottom: index < days.length - 1 ? gap : 0
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="ml-8">
          <svg width={gridWidth} height={gridHeight} className="overflow-visible">
            {heatmapData.map((cell, index) => {
              const x = cell.week * (cellSize + gap);
              const y = days.indexOf(cell.day) * (cellSize + gap);
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={cell.value === 0 ? (isDark ? '#374151' : '#f3f4f6') : getIntensityColor(cell.value)}
                    stroke={isDark ? '#4b5563' : '#e5e7eb'}
                    strokeWidth={0.5}
                    rx={2}
                    className="hover:stroke-2 transition-all cursor-pointer"
                  >
                    <title>{`${cell.date}: ${cell.value} activities`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>

          {/* Month labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <span key={month} style={{ marginLeft: index === 0 ? 0 : '8px' }}>
                {month}
              </span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm border"
                  style={{
                    backgroundColor: level === 0 
                      ? (isDark ? '#374151' : '#f3f4f6')
                      : getIntensityColor(level),
                    borderColor: isDark ? '#4b5563' : '#e5e7eb'
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}