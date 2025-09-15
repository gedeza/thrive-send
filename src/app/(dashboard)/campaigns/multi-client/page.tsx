import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Users, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartCampaignHint } from '@/components/campaigns/SmartCampaignHint';

export const metadata: Metadata = {
  title: 'Multi-Client Campaigns | ThriveSend',
  description: 'Manage campaigns across multiple clients with ThriveSend'
};

function MultiClientCampaignPageContent() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/campaigns" className="hover:text-foreground">
          Campaigns
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Multi-Client</span>
      </nav>
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">
            Multi-Client Campaigns
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create and manage campaigns that span across multiple clients with unified analytics and reporting.
        </p>

        {/* Context-aware hint for individual campaign users */}
        <div className="mt-4 max-w-md mx-auto">
          <SmartCampaignHint currentPath="/campaigns/multi-client" variant="inline" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Multi-Client Campaigns</p>
                <p className="text-3xl font-bold text-primary">12</p>
                <p className="text-sm text-muted-foreground">Across 8 clients</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-3xl font-bold text-primary">45.2K</p>
                <p className="text-sm text-muted-foreground">Combined audience</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
                <p className="text-3xl font-bold text-success">8.4%</p>
                <p className="text-sm text-muted-foreground">Cross-client rate</p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Revenue Impact</p>
                <p className="text-3xl font-bold text-primary">$32.1K</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/campaigns/multi-client/create">
            Create Multi-Client Campaign
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/campaigns/multi-client/analytics">
            View Analytics
          </Link>
        </Button>
      </div>

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Unified Campaign Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create campaigns that automatically distribute content across multiple client channels with unified tracking and analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cross-Client Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get comprehensive insights across all clients with performance comparisons, trend analysis, and ROI tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audience Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Leverage combined audience data to optimize targeting and improve engagement rates across all clients.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Multi-Client Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Multi-Client Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Holiday Season Promotion</h4>
                <p className="text-sm text-muted-foreground">5 clients • Email + Social • Active</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">12.3% engagement</p>
                <p className="text-sm text-muted-foreground">8,250 total reach</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Q4 Product Launch</h4>
                <p className="text-sm text-muted-foreground">3 clients • Multi-channel • Completed</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">15.7% engagement</p>
                <p className="text-sm text-muted-foreground">5,840 total reach</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Customer Retention Drive</h4>
                <p className="text-sm text-muted-foreground">7 clients • Email • Scheduled</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">9.8% engagement</p>
                <p className="text-sm text-muted-foreground">12,100 total reach</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MultiClientCampaignPage() {
  return <MultiClientCampaignPageContent />;
}