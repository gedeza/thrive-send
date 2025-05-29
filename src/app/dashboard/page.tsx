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
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { ActivityFeed, type Activity as ActivityType } from "@/components/dashboard/activity-feed"
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

interface AnalyticsData {
  metrics: {
    title: string;
    value: string;
    comparison: string;
    percentChange: number;
  }[];
  timestamp: string;
}

// Default metrics when analytics data is not available
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

// Sample data for the analytics chart
const chartData = [
  { date: "2024-01", value: 400 },
  { date: "2024-02", value: 300 },
  { date: "2024-03", value: 600 },
  { date: "2024-04", value: 800 },
  { date: "2024-05", value: 700 },
  { date: "2024-06", value: 900 },
]

// Sample data for the activity feed
const activities: ActivityType[] = [
  {
    id: "1",
    type: "campaign",
    title: "New Campaign Created",
    description: "Spring Sale Campaign was created",
    timestamp: "2024-06-01T10:00:00Z",
    user: {
      name: "John Doe",
      image: "https://github.com/shadcn.png",
    },
  },
  {
    id: "2",
    type: "email",
    title: "Email Sent",
    description: "Newsletter was sent to 1,000 subscribers",
    timestamp: "2024-06-01T09:30:00Z",
  },
  {
    id: "3",
    type: "user",
    title: "New User Joined",
    description: "Sarah Smith joined the organization",
    timestamp: "2024-06-01T09:00:00Z",
    user: {
      name: "Sarah Smith",
    },
  },
  {
    id: "4",
    type: "system",
    title: "System Update",
    description: "System maintenance completed successfully",
    timestamp: "2024-06-01T08:30:00Z",
  },
]

export default function DashboardHomePage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/analytics/events');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
            setAnalyticsData({ metrics: defaultMetrics, timestamp: new Date().toISOString() });
          } else {
            setAnalyticsData(data);
            setError(null);
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
          setError('Failed to parse analytics data');
          setAnalyticsData({ metrics: defaultMetrics, timestamp: new Date().toISOString() });
          setIsLoading(false);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setError('Failed to connect to analytics stream');
        setAnalyticsData({ metrics: defaultMetrics, timestamp: new Date().toISOString() });
        setIsLoading(false);
        eventSource?.close();
      };
    } catch (error) {
      console.error('Error setting up SSE:', error);
      setError('Failed to set up analytics stream');
      setAnalyticsData({ metrics: defaultMetrics, timestamp: new Date().toISOString() });
      setIsLoading(false);
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-neutral-background">
      {/* Dashboard Overview Section */}
      <DashboardOverview dateRange="7d" />

      {/* Analytics Chart Section */}
      <div className="mt-8">
        <AnalyticsChart
          data={chartData}
          title="Monthly Engagement"
          value="900"
          description="Engagement over the last 6 months"
        />
      </div>

      {/* Activity Feed Section */}
      <div className="mt-8">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
} 