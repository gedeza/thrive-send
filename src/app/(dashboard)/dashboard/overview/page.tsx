"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Activity, Users, FileText } from "lucide-react";
import AnalyticsCard from "@/components/analytics/analytics-card";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Detailed overview of your ThriveSend analytics
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
    </div>
  );
}