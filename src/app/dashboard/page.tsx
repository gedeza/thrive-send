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

const chartData = [
  { date: "2024-01", value: 400 },
  { date: "2024-02", value: 300 },
  { date: "2024-03", value: 600 },
  { date: "2024-04", value: 800 },
  { date: "2024-05", value: 700 },
  { date: "2024-06", value: 900 },
]

const activities: Activity[] = [
  {
    id: "1",
    type: "campaign",
    title: "New Campaign Created",
    description: "Spring Sale Campaign was created",
    timestamp: "2024-06-01T10:00:00Z",
    user: {
      id: "user1",
      name: "John Doe",
      image: "https://github.com/shadcn.png",
    },
    status: "published"
  },
  {
    id: "2",
    type: "email",
    title: "Email Sent",
    description: "Newsletter was sent to 1,000 subscribers",
    timestamp: "2024-06-01T09:30:00Z",
    status: "sent",
    recipientCount: 1000
  },
  {
    id: "3",
    type: "user",
    title: "New User Joined",
    description: "Sarah Smith joined the organization",
    timestamp: "2024-06-01T09:00:00Z",
    user: {
      id: "user2",
      name: "Sarah Smith",
    },
    action: "joined"
  },
  {
    id: "4",
    type: "system",
    title: "System Update",
    description: "System maintenance completed successfully",
    timestamp: "2024-06-01T08:30:00Z",
    severity: "info"
  },
];

export default function DashboardHomePage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
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
      {/* Date Filter Section */}
      <div className="mb-4">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

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