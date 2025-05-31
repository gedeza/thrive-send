"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Rectangle } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

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
  title?: string;
  className?: string;
}

export function HeatMapWidget({ data, isLoading, title = "Activity Heatmap", className }: HeatMapWidgetProps) {
  const { theme } = useTheme();
  const [hoveredCell, setHoveredCell] = useState<HeatMapData | null>(null);

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

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Group data by week
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Transform data into a matrix
  const matrix = Array(7).fill(null).map(() => Array(52).fill(0));
  
  displayData.datasets[0].data.forEach((value, i) => {
    const date = new Date(2024, 0, i + 1);
    const day = date.getDay();
    const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000)) % 52;
    matrix[day][week] = value;
  });

  // Find max value for color scaling
  const maxValue = Math.max(...displayData.datasets[0].data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Day labels */}
          <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            {displayData.labels.map(day => (
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
                const intensity = value / maxValue;
                const color = theme === 'dark'
                  ? `rgba(59, 130, 246, ${intensity})`
                  : `rgba(37, 99, 235, ${intensity})`;
                
                return (
                  <TooltipProvider key={`${dayIndex}-${weekIndex}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-3 h-3 rounded-sm transition-all duration-200",
                            "hover:scale-125 hover:ring-2 hover:ring-primary/50"
                          )}
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
            <div className="flex-1 h-2 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 rounded-full" />
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 