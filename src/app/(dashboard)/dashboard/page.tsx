"use client"

import { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import AnalyticsCard from "@/components/analytics/analytics-card";
import ContentCalendar from "@/components/content/content-calendar";
import { BarChart, LineChart, Activity, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard | ThriveSend",
  description: "ThriveSend dashboard overview",
};

export default function DashboardPage() {
  // Mock analytics metrics
  const analyticsMetrics = [
    { key: 'views', label: 'Total Views', value: '21,120' },
    { key: 'engagement', label: 'Engagement Rate', value: '63%' },
    { key: 'conversion', label: 'Conversion Rate', value: '49%' },
    { key: 'revenue', label: 'Revenue', value: '$12,500' }
  ];

  // Mock date range for analytics
  const dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end: new Date().toISOString()
  };

  // Mock handler for calendar date selection
  const handleDateSelect = (date: string) => {
    console.log(`Selected date: ${date}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your ThriveSend dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          title="Total Views"
          value="21,120"
          description="Last 30 days"
          trend={{ value: 12, isPositive: true }}
          icon={<Activity />}
        />
        <AnalyticsCard
          title="Engagement"
          value="63%"
          description="Last 30 days"
          trend={{ value: 8, isPositive: true }}
          icon={<Users />}
        />
        <AnalyticsCard
          title="Conversion Rate"
          value="49%"
          description="Last 30 days"
          trend={{ value: 4, isPositive: true }}
          icon={<FileText />}
        />
        <AnalyticsCard
          title="Revenue"
          value="$12,500"
          description="Last 30 days"
          trend={{ value: 2, isPositive: true }}
          icon={<BarChart />}
        />
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your recent campaigns and activities will appear here.</p>
                <div className="h-[200px] flex items-center justify-center border rounded-md mt-4">
                  <p className="text-muted-foreground">Activity chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button>Create Campaign</Button>
                  <Button variant="outline">Schedule Content</Button>
                  <Button variant="outline">View Reports</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <AnalyticsDashboard 
            metrics={analyticsMetrics}
            dateRange={dateRange}
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <ContentCalendar onDateSelect={handleDateSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
