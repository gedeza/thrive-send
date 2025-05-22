import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Select } from '@/components/ui/select';
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

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData[]>({
    queryKey: ['analytics', selectedTimeRange.value, selectedPlatform],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/overview?timeRange=${selectedTimeRange.value}&platform=${selectedPlatform}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
  });

  const totalViews = analyticsData?.reduce((sum, data) => sum + data.metrics.views, 0) ?? 0;
  const totalEngagement = analyticsData?.reduce(
    (sum, data) =>
      sum +
      data.metrics.engagement.likes +
      data.metrics.engagement.shares +
      data.metrics.engagement.comments,
    0
  ) ?? 0;
  const totalReach = analyticsData?.reduce((sum, data) => sum + data.metrics.reach, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
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
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
          <Select
            value={selectedPlatform}
            onValueChange={setSelectedPlatform}
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
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
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData?.map((data) => ({
                date: format(new Date(data.metrics.timestamp), 'MMM d'),
                views: data.metrics.views,
                engagement:
                  data.metrics.engagement.likes +
                  data.metrics.engagement.shares +
                  data.metrics.engagement.comments,
                reach: data.metrics.reach,
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