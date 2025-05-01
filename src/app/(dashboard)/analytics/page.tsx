"use client"

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import AnalyticsCard from '@/components/analytics/analytics-card';
import { Activity, BarChart, FileText, LineChart, PieChart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  // Mock user for header
  const user = {
    name: "John Doe",
    avatarUrl: "https://github.com/shadcn.png"
  };

  // Mock sidebar items
  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
    { key: 'calendar', label: 'Calendar', icon: <FileText size={16} /> },
    { key: 'analytics', label: 'Analytics', icon: <Activity size={16} />, isActive: true },
    { key: 'projects', label: 'Projects', icon: <Users size={16} /> },
    { key: 'creators', label: 'Creators', icon: <Users size={16} /> },
    { key: 'messages', label: 'Messages', icon: <FileText size={16} /> },
    { key: 'settings', label: 'Settings', icon: <FileText size={16} /> }
  ];

  // Mock analytics metrics
  const overviewMetrics = [
    { key: 'views', label: 'Total Views', value: '21,120' },
    { key: 'engagement', label: 'Engagement Rate', value: '63%' },
    { key: 'conversion', label: 'Conversion Rate', value: '49%' },
    { key: 'revenue', label: 'Revenue', value: '$12,500' }
  ];

  const socialMetrics = [
    { key: 'followers', label: 'Total Followers', value: '5,732' },
    { key: 'growth', label: 'Follower Growth', value: '12%' },
    { key: 'reactions', label: 'Post Reactions', value: '8,941' },
    { key: 'shares', label: 'Content Shares', value: '1,432' }
  ];

  const contentMetrics = [
    { key: 'posts', label: 'Posts Published', value: '87' },
    { key: 'avgEngagement', label: 'Avg. Engagement', value: '243' },
    { key: 'topPerforming', label: 'Top Performing', value: 'Video' },
    { key: 'impressions', label: 'Total Impressions', value: '103,562' }
  ];

  // Mock date range for analytics
  const dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end: new Date().toISOString()
  };

  return (
    <MainLayout 
      headerProps={{ 
        user,
        onSearch: (query) => console.log(`Searching: ${query}`)
      }}
      sidebarItems={sidebarItems}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Button>Export Reports</Button>
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
          icon={<PieChart />}
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
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard 
                metrics={overviewMetrics}
                dateRange={dateRange}
              />
              <div className="h-[300px] mt-6 border rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Performance chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard 
                metrics={socialMetrics}
                dateRange={dateRange}
              />
              <div className="h-[300px] mt-6 border rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Social media metrics chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard 
                metrics={contentMetrics}
                dateRange={dateRange}
              />
              <div className="h-[300px] mt-6 border rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Content metrics chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}