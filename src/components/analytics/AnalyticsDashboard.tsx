import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryConfig } from '@/lib/react-query-config';
import { format } from 'date-fns';
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  contentId: string;
  platform: string;
  metrics: {
    views: number;
    engagement: {
      likes: number;
      shares: number;
      comments: number;
    };
    reach: number;
    clicks: number;
    timestamp: string;
  };
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const timeRanges: TimeRange[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
];

export function AnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const { data: rawAnalyticsData, isLoading } = useQuery({
    queryKey: ['analytics', selectedTimeRange.value, selectedPlatform],
    queryFn: async () => {
      const response = await fetch('/api/analytics/unified-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          include: {
            metrics: true,
            overview: true,
            engagement: true,
            audience: true,
            performance: true
          },
          timeframe: selectedTimeRange.value,
          platform: selectedPlatform
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    ...queryConfig.analytics, // Use centralized analytics configuration
  });

  // Process the unified-simple API response
  const analyticsData = rawAnalyticsData?.data;
  
  // Extract metrics from the unified response
  const totalViews = analyticsData?.overview?.totalViews || 0;
  const totalEngagement = analyticsData?.overview?.totalEngagement || 0;
  const totalReach = analyticsData?.overview?.totalViews || 0; // Using views as reach fallback
  
  // Transform engagement data for Recharts
  const engagementChartData = analyticsData?.engagement?.labels?.map((label: string, index: number) => ({
    day: label,
    engagement: analyticsData.engagement.datasets[0]?.data[index] || 0
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" data-testid="skeleton" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" data-testid="skeleton" />
            <Skeleton className="h-8 w-32" data-testid="skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" data-testid="skeleton" />
          ))}
        </div>
        <Skeleton className="h-96" data-testid="skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Select
            value={selectedTimeRange.value}
            onValueChange={(value) =>
              setSelectedTimeRange(timeRanges.find((range) => range.value === value)!)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedPlatform}
            onValueChange={setSelectedPlatform}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Engagement</h3>
          <p className="text-2xl font-bold">{totalEngagement.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Reach</h3>
          <p className="text-2xl font-bold">{totalReach.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Performance Over Time</h3>
        <div className="h-96 w-full" style={{ minWidth: '500px' }}>
          <ResponsiveContainer width="100%" height="100%" aspect={2}>
            <LineChart
              data={engagementChartData.map((data, index) => ({
                date: data.day,
                views: analyticsData?.performance?.datasets[0]?.data[index] || 0,
                engagement: data.engagement,
                reach: analyticsData?.performance?.datasets[0]?.data[index] || 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#8884d8"
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#82ca9d"
                name="Engagement"
              />
              <Line
                type="monotone"
                dataKey="reach"
                stroke="#ffc658"
                name="Reach"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
} 