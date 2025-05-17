"use client"

import { Activity, BarChart, Calendar, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Skeleton className="h-4 w-[100px]" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <Skeleton className="h-8 w-[80px]" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Skeleton className="h-4 w-[120px]" />
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-4">
                <Card className="bg-destructive/10">
                  <CardContent className="pt-6">
                    <p className="text-destructive">{error}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              analyticsData?.metrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                    </CardTitle>
                    {metric.percentChange !== 0 && (
                      <div className={`flex items-center ${metric.percentChange > 0 ? 'text-success' : 'text-destructive'}`}>
                        {metric.percentChange > 0 ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )}
                        <span className="text-xs ml-1">
                          {Math.abs(metric.percentChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {metric.comparison}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Add your chart component here */}
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Chart placeholder
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add your activity feed component here */}
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Activity feed placeholder
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
