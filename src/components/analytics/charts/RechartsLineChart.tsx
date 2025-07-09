import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';

interface RechartsLineChartProps {
  data?: any[];
  isLoading?: boolean;
  error?: Error | null;
  height?: number;
  lines?: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  xAxisKey?: string;
}

const DEFAULT_LINES = [
  { dataKey: 'value', color: '#3b82f6', name: 'Value' }
];

export function RechartsLineChart({
  data,
  isLoading,
  error,
  height = 400,
  lines = DEFAULT_LINES,
  xAxisKey = 'name'
}: RechartsLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return <Skeleton className={`w-full h-[${height}px]`} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Failed to load chart data</p>
          <p className="text-xs mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No data available</p>
          <p className="text-xs mt-1">Check your filters or try again later</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isDark ? '#374151' : '#e5e7eb'}
        />
        <XAxis 
          dataKey={xAxisKey}
          stroke={isDark ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <YAxis 
          stroke={isDark ? '#9ca3af' : '#6b7280'}
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '6px',
            color: isDark ? '#f9fafb' : '#111827'
          }}
          formatter={(value: any, name: any) => [
            typeof value === 'number' ? value.toLocaleString() : value,
            name
          ]}
        />
        <Legend />
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={line.name || line.dataKey}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}