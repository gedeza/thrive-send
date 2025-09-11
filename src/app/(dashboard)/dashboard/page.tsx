"use client"

import { 
  Activity, 
  BarChart, 
  FileText, 
  Users, 
  Mail, 
  MousePointerClick,
  TrendingUp,
  UserPlus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 dashboard-compact">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-destructive">Error loading dashboard</p>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const { metrics, campaigns, subscriberGrowth } = dashboardData || {
    metrics: { totalSubscribers: 0, subscriberGrowth: 0, averageOpenRate: 0, averageClickRate: 0, activeCampaigns: 0, scheduledCampaigns: 0 },
    campaigns: [],
    subscriberGrowth: []
  };

  return (
    <div className="flex flex-col gap-3 dashboard-compact">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your ThriveSend dashboard
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${metrics.subscriberGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {metrics.subscriberGrowth >= 0 ? '+' : ''}{metrics.subscriberGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry average: 21.5%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageClickRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry average: 2.8%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.scheduledCampaigns} scheduled for next week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="scheduling" asChild>
            <Link href="/content/create">Scheduling</Link>
          </TabsTrigger>
          <TabsTrigger value="clients" asChild>
            <Link href="/clients">Clients</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-3 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Campaign Performance */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {campaigns.length > 0 ? campaigns.map(campaign => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.sent.toLocaleString()} sent • {campaign.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{Math.round(campaign.opened/campaign.sent*100)}%</span>
                        </div>
                      </div>
                      <Progress value={campaign.opened/campaign.sent*100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Opened: {campaign.opened.toLocaleString()}</span>
                        <span>Clicked: {campaign.clicked.toLocaleString()}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recent campaigns found</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/content/create">Create Your First Campaign</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Subscriber Growth */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>New subscribers over the past 5 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {subscriberGrowth.length > 0 ? subscriberGrowth.map((month, index) => {
                    const maxCount = Math.max(...subscriberGrowth.map(m => m.count));
                    return (
                      <div key={`${month.month}-${index}`} className="flex flex-col items-center gap-2">
                        <div
                          className="bg-primary/90 w-10 rounded-md"
                          style={{ height: `${(month.count / maxCount) * 160}px` }}
                        ></div>
                        <span className="text-xs font-medium">{month.month}</span>
                      </div>
                    );
                  }) : (
                    <div className="text-center text-muted-foreground w-full">
                      <p>No growth data available</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  {subscriberGrowth.length > 1 && (
                    <>
                      <div className="text-xl font-bold">
                        +{Math.round(((subscriberGrowth[subscriberGrowth.length - 1]?.count || 0) - 
                                     (subscriberGrowth[0]?.count || 0)) / 
                                     (subscriberGrowth[0]?.count || 1) * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Growth in {subscriberGrowth.length} months</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>Improve your campaign performance with these tips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">Optimize Send Times</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your campaigns perform best when sent on Tuesdays at 10 AM.
                    Consider adjusting your schedule.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">Adjust Schedule</Button>
                </div>
                
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">Import Contacts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Grow your audience by importing contacts from your CRM or spreadsheet.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">Import Contacts</Button>
                </div>
                
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">A/B Test Subject Lines</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increase open rates by testing different subject lines.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">Create A/B Test</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Content Scheduling Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content Scheduling</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/content/create" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Create Content
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">AdvancedContentScheduler</p>
                    <p className="text-sm text-muted-foreground">Professional scheduling tool</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/content/create">Open Scheduler</Link>
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Service Provider Tools</p>
                    <p className="text-sm text-muted-foreground">Multi-client scheduling</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/service-provider">View Tools</Link>
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Content Templates</p>
                    <p className="text-sm text-muted-foreground">Reusable content templates</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/templates">Browse Templates</Link>
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link 
                  href="/content" 
                  className="text-sm text-primary hover:underline"
                >
                  View all content
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>Detailed performance metrics for all your campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">
                  Access comprehensive analytics and reporting tools
                </p>
                <Button asChild>
                  <Link href="/analytics">View Analytics Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">
                  Manage and view all your content campaigns
                </p>
                <Button asChild>
                  <Link href="/content">View All Content</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">
                  Manage your audience and subscriber lists
                </p>
                <Button asChild>
                  <Link href="/audiences">Manage Audiences</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
