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
  Loader2,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ContextualTemplateWidget } from "@/components/campaigns/ContextualTemplateWidget";

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
          <p className="text-lg font-medium text-destructive">Error loading dashboard</p>
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
        <Card className="card-enhanced card-accent border-accent">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Audience Growth
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground">Total Subscribers</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border border-accent">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary tracking-tight">
                  {metrics.totalSubscribers.toLocaleString()}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span>{metrics.subscriberGrowth >= 0 ? '+' : ''}{metrics.subscriberGrowth}%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced border-l-2 border-success/20 bg-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email Performance
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground">Average Open Rate</h3>
                </div>
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <Mail className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-success tracking-tight">
                  {metrics.averageOpenRate}%
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  Industry average: 21.5% 
                  {metrics.averageOpenRate > 21.5 ? ' (Above average!)' : metrics.averageOpenRate < 18 ? ' (Needs improvement)' : ' (Good performance)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced border-l-2 border-muted/40 bg-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Engagement Rate
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground">Average Click Rate</h3>
                </div>
                <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
                  <MousePointerClick className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {metrics.averageClickRate}%
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  Industry average: 2.8%
                  {metrics.averageClickRate > 2.8 ? ' (Above average!)' : metrics.averageClickRate < 2 ? ' (Needs improvement)' : ' (Good performance)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced border-l-2 border-destructive/20 bg-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Campaign Activity
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground">Active Campaigns</h3>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <Activity className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-destructive tracking-tight">
                  {metrics.activeCampaigns}
                </p>
                <p className="text-sm text-muted-foreground font-medium">{metrics.scheduledCampaigns} scheduled for next week</p>
              </div>
            </div>
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
            <Card className="lg:col-span-4 card-enhanced card-accent border-accent">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-accent">
                    <BarChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Recent Campaign Performance</span>
                    <p className="text-sm text-muted-foreground font-normal">Latest campaign results</p>
                  </div>
                </CardTitle>
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
            <Card className="lg:col-span-3 card-enhanced border-l-2 border-success/20 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <UserPlus className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Subscriber Growth</span>
                    <p className="text-sm text-muted-foreground font-normal">New subscribers over the past 5 months</p>
                  </div>
                </CardTitle>
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

          {/* Smart Template Recommendations - Stage 2B */}
          <div className="mt-4">
            <ContextualTemplateWidget
              context="dashboard"
              limit={3}
              className="max-w-4xl mx-auto"
            />
          </div>

          {/* Action Items */}
          <Card className="card-enhanced border-l-2 border-muted/40 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-muted/10 rounded-lg border border-muted/20">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-lg font-medium">Recommended Actions</span>
                  <p className="text-sm text-muted-foreground font-normal">Improve your campaign performance with these tips</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="card-enhanced border-l-2 border-success/20 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <h3 className="font-medium">Optimize Send Times</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metrics.averageOpenRate < 21.5 
                        ? "Try testing different send times to improve your open rates."
                        : "Your campaigns are performing well! Consider A/B testing send times."
                      }
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">Adjust Schedule</Button>
                  </CardContent>
                </Card>
                
                <Card className="card-enhanced border-l-2 border-primary/20 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Import Contacts</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metrics.subscriberGrowth < 5 
                        ? "Boost your growth by importing contacts from your CRM or spreadsheet."
                        : "Keep growing! Consider setting up lead magnets to attract new subscribers."
                      }
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">Import Contacts</Button>
                  </CardContent>
                </Card>
                
                <Card className="card-enhanced border-l-2 border-muted/40 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">A/B Test Subject Lines</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metrics.averageClickRate < 2.8 
                        ? "Increase engagement by testing different subject lines and content."
                        : "Your engagement is good! Try A/B testing to optimize further."
                      }
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">Create A/B Test</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          {/* Content Scheduling Section */}
          <Card className="card-enhanced border-l-2 border-destructive/20 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <span className="text-lg font-medium">Content Scheduling</span>
                  <p className="text-sm text-muted-foreground font-normal">Professional content management</p>
                </div>
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/content/create" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Create Content
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card className="card-enhanced border-l-2 border-primary/20 bg-card">
                  <CardContent className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium">AdvancedContentScheduler</p>
                      <p className="text-sm text-muted-foreground">Professional scheduling tool</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/content/create">Open Scheduler</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="card-enhanced border-l-2 border-success/20 bg-card">
                  <CardContent className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium">Service Provider Tools</p>
                      <p className="text-sm text-muted-foreground">Multi-client scheduling</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/service-provider">View Tools</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="card-enhanced border-l-2 border-muted/40 bg-card">
                  <CardContent className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium">Content Templates</p>
                      <p className="text-sm text-muted-foreground">Reusable content templates</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/templates">Browse Templates</Link>
                    </Button>
                  </CardContent>
                </Card>
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
        
        <TabsContent value="analytics" className="mt-3 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Analytics Overview Card */}
            <Card className="card-enhanced border-l-2 border-primary/20 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <BarChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Campaign Analytics</span>
                    <p className="text-sm text-muted-foreground font-normal">Performance insights</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded border-l-2 border-primary/20">
                    <span className="text-sm font-medium">Average Open Rate</span>
                    <span className="text-lg font-bold text-primary">{metrics.averageOpenRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded">
                    <span className="text-sm font-medium">Click Through Rate</span>
                    <span className="text-lg font-bold">{metrics.averageClickRate}%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/analytics">View Detailed Analytics</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics Card */}
            <Card className="card-enhanced border-l-2 border-success/20 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Performance Trends</span>
                    <p className="text-sm text-muted-foreground font-normal">Growth metrics</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded border-l-2 border-success/20">
                    <span className="text-sm font-medium">Monthly Growth</span>
                    <span className="text-lg font-bold text-success">{metrics.subscriberGrowth >= 0 ? '+' : ''}{metrics.subscriberGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded">
                    <span className="text-sm font-medium">Engagement Rate</span>
                    <span className="text-lg font-bold">{((metrics.averageOpenRate + metrics.averageClickRate) / 2).toFixed(1)}%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/analytics">Export Reports</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-3 space-y-6">
          <div className="grid gap-6">
            {/* Campaign Overview */}
            <Card className="card-enhanced border-l-2 border-success/20 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <FileText className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Active Campaigns</span>
                    <p className="text-sm text-muted-foreground font-normal">Currently running campaigns</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {campaigns.length > 0 ? campaigns.slice(0, 3).map((campaign, index) => (
                      <Card key={campaign.id} className={`card-enhanced border-l-2 ${
                        campaign.status === 'Active' ? 'border-success/20' : 
                        campaign.status === 'Scheduled' ? 'border-primary/20' : 'border-muted/40'
                      } bg-card`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${
                              campaign.status === 'Active' ? 'bg-success' : 
                              campaign.status === 'Scheduled' ? 'bg-primary' : 'bg-muted-foreground'
                            }`}></div>
                            <h4 className="font-medium">{campaign.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{campaign.type} Campaign</p>
                          <div className={`text-lg font-bold ${
                            campaign.status === 'Active' ? 'text-success' : 
                            campaign.status === 'Scheduled' ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {campaign.sent > 0 ? 
                              `${Math.round((campaign.opened / campaign.sent) * 100)}% opened` :
                              campaign.status
                            }
                          </div>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        <p>No recent campaigns found</p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <Link href="/campaigns/new">Create Your First Campaign</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex gap-4">
                      <Button asChild>
                        <Link href="/content">View All Campaigns</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/content/create">Create Campaign</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscribers" className="mt-3 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Audience Overview */}
            <Card className="card-enhanced border-l-2 border-muted/40 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-muted/10 rounded-lg border border-muted/20">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Audience Overview</span>
                    <p className="text-sm text-muted-foreground font-normal">Subscriber statistics</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded border-l-2 border-muted/40">
                    <span className="text-sm font-medium">Total Subscribers</span>
                    <span className="text-xl font-bold text-primary">{metrics.totalSubscribers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded">
                    <span className="text-sm font-medium">Active This Month</span>
                    <span className="text-lg font-bold text-success">{Math.round(metrics.totalSubscribers * 0.85).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded">
                    <span className="text-sm font-medium">New This Week</span>
                    <span className="text-lg font-bold text-primary">{Math.round(metrics.totalSubscribers * 0.02).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card className="card-enhanced border-l-2 border-primary/20 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-medium">Growth Metrics</span>
                    <p className="text-sm text-muted-foreground font-normal">Subscriber growth</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded border-l-2 border-success/20">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className="text-lg font-bold text-success">{metrics.subscriberGrowth >= 0 ? '+' : ''}{metrics.subscriberGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/5 rounded">
                    <span className="text-sm font-medium">Retention Rate</span>
                    <span className="text-lg font-bold">{Math.min(95, Math.max(75, 100 - (metrics.subscriberGrowth < 0 ? Math.abs(metrics.subscriberGrowth) * 2 : 5))).toFixed(1)}%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/audiences">Manage All Audiences</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
