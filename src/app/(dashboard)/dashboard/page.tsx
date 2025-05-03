"use client"

import { Activity, BarChart, Calendar, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <div className="flex -mb-px">
          <div className="py-2 px-4 text-sm font-medium text-primary border-b-2 border-primary">
            Overview
          </div>
          <Link href="/analytics" className="py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Analytics
          </Link>
          <Link href="/calendar" className="py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Calendar
          </Link>
          <Link href="/clients" className="py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Clients
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21,120</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">63%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">49%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,500</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
            <Link href="/calendar">
              <Calendar className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button>Create Campaign</Button>
              <Button variant="outline" asChild>
                <Link href="/calendar">Schedule Content</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/analytics">View Reports</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
