"use client"

import { BarChart, Calendar, FileText, Users, Plus, Download, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SafeAnalyticsChart from "@/components/dashboard/analytics-chart"
import SafeActivityFeed from "@/components/activity/ActivityFeed"
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { Activity } from "@/types/activity";
import { DateFilter } from "@/components/ui/date-filter";
import { DateRange } from "react-day-picker";

interface AnalyticsData {
  metrics: {
    title: string;
    value: string;
    comparison: string;
    percentChange: number;
  }[];
  timestamp: string;
}

const defaultMetrics = [
  {
    title: "Total Views",
    value: "0",
    comparison: "No data available",
    percentChange: 0,
  },
  {
    title: "Engagement Rate",
    value: "0%",
    comparison: "No data available",
    percentChange: 0,
  },
  {
    title: "Conversion Rate",
    value: "0%",
    comparison: "No data available",
    percentChange: 0,
  },
  {
    title: "Revenue",
    value: "$0",
    comparison: "No data available",
    percentChange: 0,
  },
];

// Default fallback data for when API is unavailable
const defaultChartData = [
  { date: "No data", value: 0 },
]

const defaultActivities: Activity[] = [
  {
    id: "default",
    type: "system",
    title: "No activities available",
    description: "No recent activities to display",
    timestamp: new Date().toISOString(),
  },
];

export default function DashboardHomePage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState(defaultChartData);
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      from: sevenDaysAgo,
      to: today
    };
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch analytics data
        const analyticsResponse = await fetch('/api/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalyticsData({ 
            metrics: analyticsData.metrics, 
            timestamp: new Date().toISOString() 
          });
          
          // Use time series data for chart if available
          if (analyticsData.timeSeriesData?.datasets?.[0]?.data && analyticsData.timeSeriesData?.labels) {
            const chartDataFormatted = analyticsData.timeSeriesData.labels.map((label: string, index: number) => ({
              date: label,
              value: analyticsData.timeSeriesData.datasets[0].data[index] || 0
            }));
            setChartData(chartDataFormatted);
          }
        } else {
          console.warn('Failed to fetch analytics data');
          setAnalyticsData({ metrics: defaultMetrics, timestamp: new Date().toISOString() });
        }

        // Fetch activities data
        const activitiesResponse = await fetch('/api/activity');
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          if (activitiesData.activities && Array.isArray(activitiesData.activities)) {
            setActivities(activitiesData.activities);
          }
        } else {
          console.warn('Failed to fetch activities data');
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        // Fallback to default data if API fails
        setAnalyticsData({ metrics: defaultMetrics, timestamp: new Date().toISOString() });
        setChartData(defaultChartData);
        setActivities(defaultActivities);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-neutral-background">
      {/* Date Filter Section */}
      <div className="mb-4">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboard Overview Section */}
      <DashboardOverview dateRange="7d" />

      {/* Analytics Chart Section */}
      <div className="mt-8">
        <SafeAnalyticsChart
          data={chartData}
          title="Monthly Engagement"
          value="900"
          description="Engagement over the last 6 months"
        />
      </div>

      {/* Activity Feed Section */}
      <div className="mt-8">
        <SafeActivityFeed 
          activities={activities}
          showFilters={true}
          realTimeUpdates={true}
          maxHeight="400px"
        />
      </div>
    </div>
  );
}