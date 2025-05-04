"use client"

import { 
  Activity, 
  BarChart, 
  Calendar, 
  FileText, 
  Users, 
  Mail, 
  MousePointerClick,
  TrendingUp,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// Mock data - would be replaced with actual data from API
const mockCampaignData = [
  { id: 1, name: 'Welcome Series', sent: 1247, opened: 876, clicked: 432, status: 'Active' },
  { id: 2, name: 'Monthly Newsletter', sent: 3500, opened: 2100, clicked: 980, status: 'Completed' },
  { id: 3, name: 'Product Launch', sent: 2800, opened: 1400, clicked: 750, status: 'Draft' },
];

const mockSubscriberGrowth = [
  { month: 'Jan', count: 1200 },
  { month: 'Feb', count: 1350 },
  { month: 'Mar', count: 1500 },
  { month: 'Apr', count: 1720 },
  { month: 'May', count: 2100 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome to your ThriveSend dashboard
        </h1>
        <Button asChild className="w-full md:w-auto">
          <Link href="/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{
          title: 'Total Subscribers',
          value: '8,720',
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          desc: (<span><span className="text-emerald-500">+18%</span> from last month</span>)
        }, {
          title: 'Average Open Rate',
          value: '24.8%',
          icon: <Mail className="h-4 w-4 text-muted-foreground" />,
          desc: 'Industry avg: 21.5%'
        }, {
          title: 'Average Click Rate',
          value: '3.2%',
          icon: <MousePointerClick className="h-4 w-4 text-muted-foreground" />,
          desc: 'Industry avg: 2.8%'
        }, {
          title: 'Active Campaigns',
          value: '4',
          icon: <Activity className="h-4 w-4 text-muted-foreground" />,
          desc: '2 scheduled for next week'
        }].map((card, idx) => (
          <Card key={idx} tabIndex={0} className="focus:ring-2 focus:ring-primary outline-none transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Campaign Performance */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCampaignData.map(campaign => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.sent} sent • {campaign.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{Math.round(campaign.opened/campaign.sent*100)}%</span>
                        </div>
                      </div>
                      <Progress value={campaign.opened/campaign.sent*100} className="h-2" />
                      <div className="flex flex-wrap justify-between text-xs text-muted-foreground">
                        <span>Opened: {campaign.opened}</span>
                        <span>Clicked: {campaign.clicked}</span>
                      </div>
                    </div>
                  ))}
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
          
          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>Improve your campaign performance with these tips</CardDescription>
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
                  <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">Adjust Schedule</Button>
                </div>
                
                <div className="flex flex-col gap-2 border rounded-lg p-4 hover:bg-accent-foreground/10 focus-within:ring-2 focus-within:ring-primary transition">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">Import Contacts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Grow your audience by importing contacts from your CRM or spreadsheet.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">Import Contacts</Button>
                </div>
                
                <div className="flex flex-col gap-2 border rounded-lg p-4 hover:bg-accent-foreground/10 focus-within:ring-2 focus-within:ring-primary transition">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold">A/B Test Subject Lines</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increase open rates by testing different subject lines.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">Create A/B Test</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calendar Preview Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Schedule</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/calendar" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  View Full Calendar
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Today", title: "Team Meeting", time: "2:00 PM" },
                  { date: "Tomorrow", title: "Content Publishing", time: "10:00 AM" },
                  { date: "May 15", title: "Campaign Launch", time: "9:00 AM" }
                ].map((event, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{event.date}</div>
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
        
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>Detailed performance metrics for all your campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20 text-muted-foreground">
                Detailed analytics will be implemented here. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20 text-muted-foreground">
                Campaign list with detailed metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20 text-muted-foreground">
                Subscriber management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
