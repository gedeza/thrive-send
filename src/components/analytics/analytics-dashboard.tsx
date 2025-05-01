"use client";

import * as React from "react";
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Mail, 
  Share2, 
  Eye 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AnalyticsCard } from "./analytics-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track your newsletter performance and audience engagement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="7days">
            <TabsList>
              <TabsTrigger value="7days">7 days</TabsTrigger>
              <TabsTrigger value="30days">30 days</TabsTrigger>
              <TabsTrigger value="90days">90 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Subscribers"
          value="2,842"
          icon={<Users />}
          trend={12.5}
          trendText="from last month"
        />
        <AnalyticsCard
          title="Open Rate"
          value="48.2%"
          icon={<Mail />}
          trend={-2.3}
          trendText="from last month"
        />
        <AnalyticsCard
          title="Click-through Rate"
          value="24.5%"
          icon={<Eye />}
          trend={5.1}
          trendText="from last month"
        />
        <AnalyticsCard
          title="Shares"
          value="286"
          icon={<Share2 />}
          trend={18.4}
          trendText="from last month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>
              New subscribers over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <div className="flex flex-col items-center text-muted-foreground">
                <BarChart2 className="h-8 w-8 mb-2" />
                <p>Subscriber Growth Chart</p>
                <p className="text-xs">Chart visualization will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>
              Opens, clicks, and shares over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <div className="flex flex-col items-center text-muted-foreground">
                <TrendingUp className="h-8 w-8 mb-2" />
                <p>Engagement Metrics Chart</p>
                <p className="text-xs">Chart visualization will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>
            Performance metrics for your recent newsletters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 bg-muted/50 px-4 py-3 text-sm font-medium">
              <div className="col-span-3">Newsletter</div>
              <div className="text-center">Sent</div>
              <div className="text-center">Opens</div>
              <div className="text-center">Clicks</div>
              <div className="text-center">Shares</div>
            </div>
            {[
              {
                title: "Monthly Roundup: June 2023",
                sent: "2,830",
                opens: "1,324",
                opensRate: "46.8%",
                clicks: "684",
                clicksRate: "24.2%",
                shares: "128"
              },
              {
                title: "New Feature Announcement",
                sent: "2,804",
                opens: "1,482",
                opensRate: "52.9%",
                clicks: "812",
                clicksRate: "29.0%",
                shares: "205"
              },
              {
                title: "Industry Insights Q2",
                sent: "2,792",
                opens: "1,295",
                opensRate: "46.4%",
                clicks: "642",
                clicksRate: "23.0%",
                shares: "86"
              },
              {
                title: "Case Study: Success Story",
                sent: "2,758",
                opens: "1,378",
                opensRate: "50.0%",
                clicks: "724",
                clicksRate: "26.3%",
                shares: "142"
              }
            ].map((newsletter, i) => (
              <div 
                key={i}
                className="grid grid-cols-7 px-4 py-3 text-sm border-t"
              >
                <div className="col-span-3 font-medium">{newsletter.title}</div>
                <div className="text-center">{newsletter.sent}</div>
                <div className="text-center">
                  {newsletter.opens} <span className="text-xs text-muted-foreground">({newsletter.opensRate})</span>
                </div>
                <div className="text-center">
                  {newsletter.clicks} <span className="text-xs text-muted-foreground">({newsletter.clicksRate})</span>
                </div>
                <div className="text-center">{newsletter.shares}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}