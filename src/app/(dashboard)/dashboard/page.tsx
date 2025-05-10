"use client"

import { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import MobileMenu from "./components/MobileMenu";
// Mock analytics metrics similar to statCards
const mockAnalyticsStats = [
  {
    title: "Total Campaign Views",
    value: "18,240",
    icon: "activity",
    desc: "+12% last 30 days"
  },
  {
    title: "Unique Opens",
    value: "8,931",
    icon: "mail",
    desc: "+2.3% week over week"
  },
  {
    title: "Link Clicks",
    value: "1,520",
    icon: "click",
    desc: "+5.4% week over week"
  },
  {
    title: "Unsubscribes",
    value: "67",
    icon: "users",
    desc: "-8% compared to last month"
  }
];

// Mock chart data for open rate over months
const mockOpenRateTrend = [
  { month: "Jan", value: 21 },
  { month: "Feb", value: 22 },
  { month: "Mar", value: 23 },
  { month: "Apr", value: 24 },
  { month: "May", value: 25 }
];
import {
  TrendingUp,
  UserPlus,
  BarChart,
  Calendar as CalendarIcon,
  CheckCircle,
  Loader2,
  AlertOctagon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// More detailed demo/mock data for campaigns/subscribers
const campaigns = [
  {
    id: 101,
    name: "Spring Sale",
    status: "Sent",
    sent: 500,
    opened: 350,
    clicked: 80,
    date: "2024-06-01 09:00",
  },
  {
    id: 102,
    name: "Newsletter May",
    status: "Draft",
    sent: 0,
    opened: 0,
    clicked: 0,
    date: "2024-05-25 13:45",
  },
  {
    id: 103,
    name: "Beta Invite",
    status: "Scheduled",
    sent: 0,
    opened: 0,
    clicked: 0,
    date: "2024-06-12 10:30",
  },
];

const subscribers = [
  {
    email: "alice@email.com",
    joinedAt: "2024-06-01",
    status: "active",
  },
  {
    email: "bob@email.com",
    joinedAt: "2024-05-30",
    status: "bounced",
  },
  {
    email: "chris@email.com",
    joinedAt: "2024-05-29",
    status: "unsubscribed",
  },
  {
    email: "dan@email.com",
    joinedAt: "2024-05-28",
    status: "active",
  },
];

function statusBadge(status: string) {
  switch (status) {
    case "Sent":
      return <Badge variant="success"><CheckCircle className="w-4 h-4 mr-1" />Sent</Badge>;
    case "Draft":
      return <Badge variant="secondary"><Loader2 className="w-4 h-4 animate-spin mr-1" />Draft</Badge>;
    case "Scheduled":
      return <Badge variant="accent"><CalendarIcon className="w-4 h-4 mr-1" />Scheduled</Badge>;
    case "active":
      return <Badge variant="success"><CheckCircle className="w-4 h-4 mr-1" />Active</Badge>;
    case "bounced":
      return <Badge variant="destructive"><AlertOctagon className="w-4 h-4 mr-1" />Bounced</Badge>;
    case "unsubscribed":
      return <Badge variant="outline"><UserPlus className="w-4 h-4 mr-1" />Unsubscribed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

import {
  statCards,
  mockCampaignData,
  mockSubscriberGrowth,
  upcomingSchedule
} from "./dashboard.mock-data";
import { StatSummaryCard } from "./components/stat-card";

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <SignedIn>
        {/* Mobile Menu */}
        <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Hamburger only on mobile */}
          <button
            className="md:hidden p-2 rounded hover:bg-accent focus:outline-none transition"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome to your ThriveSend dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your stats, audience growth, recent campaigns, and more—all in one place.
            </p>
          </div>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      {/* Stat Summaries */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatSummaryCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="calendar" asChild>
            <Link href="/calendar">Calendar</Link>
          </TabsTrigger>
          <TabsTrigger value="clients" asChild>
            <Link href="/clients">Clients</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Recent Campaign Performance + Subscriber Growth */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCampaignData.map((campaign) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.sent} sent • {campaign.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {/* Handle potential divide by zero */}
                            {campaign.sent ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <Progress value={campaign.sent ? (campaign.opened / campaign.sent) * 100 : 0} className="h-2" />
                      <div className="flex flex-wrap justify-between text-xs text-muted-foreground">
                        <span>Opened: {campaign.opened}</span>
                        <span>Clicked: {campaign.clicked}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>New subscribers over the past 5 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {mockSubscriberGrowth.map((month) => (
                    <div key={month.month} className="flex flex-col items-center gap-2">
                      <div
                        className="bg-primary/90 w-10 rounded-md"
                        style={{ height: `${(month.count / 2100) * 160}px` }}
                      ></div>
                      <span className="text-xs font-medium">{month.month}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <div className="text-xl font-bold">+75%</div>
                  <p className="text-xs text-muted-foreground">Growth in 5 months</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>
                Improve your campaign performance with these tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2 border rounded-lg p-4 hover:bg-accent-foreground/10 focus-within:ring-2 focus-within:ring-primary transition">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">Optimize Send Times</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your campaigns perform best when sent on Tuesdays at 10 AM.
                    Consider adjusting your schedule.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                    Adjust Schedule
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2 border rounded-lg p-4 hover:bg-accent-foreground/10 focus-within:ring-2 focus-within:ring-primary transition">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">Import Contacts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Grow your audience by importing contacts from your CRM or spreadsheet.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                    Import Contacts
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2 border rounded-lg p-4 hover:bg-accent-foreground/10 focus-within:ring-2 focus-within:ring-primary transition">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">A/B Test Subject Lines</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increase open rates by testing different subject lines.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                    Create A/B Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Schedule Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Schedule</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/calendar" className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  View Full Calendar
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSchedule.map((event, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.date}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link 
                  href="/calendar" 
                  className="text-sm text-primary hover:underline"
                >
                  View all scheduled events
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4 space-y-6">
          {/* Stat Cards for quick metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockAnalyticsStats.map((card) => (
              <StatSummaryCard key={card.title} {...card} />
            ))}
          </div>

          {/* Open Rate Trend (chart-like) */}
          <Card>
            <CardHeader>
              <CardTitle>Open Rate Trend</CardTitle>
              <CardDescription>
                Average open rate across all campaigns, last 5 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between gap-2">
                {mockOpenRateTrend.map((month) => (
                  <div key={month.month} className="flex flex-col items-center gap-2">
                    <div
                      className="bg-primary/90 w-10 rounded-md"
                      style={{ height: `${(month.value / 30) * 160}px` }}
                      title={`${month.value}%`}
                    ></div>
                    <span className="text-xs font-medium">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <div className="text-xl font-bold">Last: {mockOpenRateTrend[mockOpenRateTrend.length - 1].value}%</div>
                <p className="text-xs text-muted-foreground">
                  +4% change since Jan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Table: Campaign Analytics Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Breakdown</CardTitle>
              <CardDescription>
                Opens, clicks and status, recent campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg bg-white">
                  <thead>
                    <tr className="text-muted-foreground border-b">
                      <th className="p-2 text-left">Campaign</th>
                  <th className="p-2 text-right">Sent</th>
                      <th className="p-2 text-right">Opened</th>
                      <th className="p-2 text-right">Clicked</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCampaignData.map((c) => (
                      <tr key={c.id} className="border-b last:border-b-0">
                        <td className="p-2">{c.name}</td>
                        <td className="p-2 text-right">{c.sent}</td>
                        <td className="p-2 text-right">{c.opened}</td>
                        <td className="p-2 text-right">{c.clicked}</td>
                        <td className="p-2">{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Campaigns</CardTitle>
                <Button asChild size="sm" variant="primary">
                  <Link href="/campaigns/new">+ New Campaign</Link>
                </Button>
              </div>
              <CardDescription>
                Your recent campaigns and their performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg bg-white">
                  <thead>
                    <tr className="text-muted-foreground border-b">
                      <th className="p-2 text-left">Campaign</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Sent</th>
                      <th className="p-2 text-right">Opened</th>
                      <th className="p-2 text-right">Clicked</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b last:border-b-0">
                        <td className="p-2">{c.name}</td>
                        <td className="p-2">{statusBadge(c.status)}</td>
                        <td className="p-2 text-right">{c.sent}</td>
                        <td className="p-2 text-right">{c.opened}</td>
                        <td className="p-2 text-right">{c.clicked}</td>
                        <td className="p-2">{c.date}</td>
                        <td className="p-2 text-right">
                          <Button asChild size="sm" variant="link">
                            <Link href={`/campaigns/${c.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/campaigns" className="text-sm text-primary hover:underline">
                  View all campaigns →
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Subscribers</CardTitle>
                <Button asChild size="sm" variant="primary">
                  <Link href="/subscribers">Manage Subscribers</Link>
                </Button>
              </div>
              <CardDescription>
                Latest subscribers and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg bg-white">
                  <thead>
                    <tr className="text-muted-foreground border-b">
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="p-2">{s.email}</td>
                        <td className="p-2">{statusBadge(s.status)}</td>
                        <td className="p-2">{s.joinedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="font-semibold">{subscribers.length}</span> recent subscribers
                </div>
                <Link href="/subscribers" className="text-sm text-primary hover:underline">
                  See all subscribers →
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
