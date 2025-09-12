"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Building,
  Globe,
  Filter,
  Calendar,
  Eye,
  MousePointerClick,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Mock data for multi-client analytics
const mockAnalyticsData = {
  overview: {
    totalCampaigns: 12,
    totalClients: 8,
    totalReach: 45200,
    averageEngagement: 8.4,
    totalRevenue: 124500,
    avgConversionRate: 3.2
  },
  clientPerformance: [
    { 
      id: '1', 
      name: 'City of Springfield', 
      campaigns: 3, 
      reach: 12500, 
      engagement: 7.2, 
      revenue: 35000,
      conversionRate: 2.8,
      status: 'High Performer' 
    },
    { 
      id: '2', 
      name: 'TechStart Inc.', 
      campaigns: 2, 
      reach: 8900, 
      engagement: 12.1, 
      revenue: 28000,
      conversionRate: 4.5,
      status: 'Top Performer' 
    },
    { 
      id: '3', 
      name: 'Local Coffee Co.', 
      campaigns: 2, 
      reach: 6200, 
      engagement: 5.8, 
      revenue: 15500,
      conversionRate: 2.1,
      status: 'Needs Attention' 
    },
    { 
      id: '4', 
      name: 'Green Energy Solutions', 
      campaigns: 1, 
      reach: 9800, 
      engagement: 9.3, 
      revenue: 22000,
      conversionRate: 3.7,
      status: 'High Performer' 
    },
    { 
      id: '5', 
      name: 'Metro Healthcare', 
      campaigns: 2, 
      reach: 5300, 
      engagement: 8.9, 
      revenue: 18000,
      conversionRate: 3.4,
      status: 'Good Performance' 
    },
    { 
      id: '6', 
      name: 'Downtown Restaurant Group', 
      campaigns: 2, 
      reach: 2500, 
      engagement: 6.7, 
      revenue: 6000,
      conversionRate: 2.9,
      status: 'Good Performance' 
    }
  ],
  campaignBreakdown: [
    { name: 'Holiday Season Promotion', clients: 5, reach: 18200, engagement: 12.3, revenue: 45000 },
    { name: 'Q4 Product Launch', clients: 3, reach: 8900, engagement: 15.7, revenue: 28000 },
    { name: 'Customer Retention Drive', clients: 7, reach: 12100, engagement: 9.8, revenue: 32000 },
    { name: 'Brand Awareness Campaign', clients: 4, reach: 6000, engagement: 7.4, revenue: 19500 }
  ]
};

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Top Performer':
      return 'default';
    case 'High Performer':
      return 'secondary';
    case 'Good Performance':
      return 'outline';
    case 'Needs Attention':
      return 'destructive';
    default:
      return 'outline';
  }
};

const MetricCard = ({ title, value, description, icon, change }: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-primary">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center text-xs ${
              change >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              <TrendingUp className="mr-1 h-3 w-3" />
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last period
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <div className="h-6 w-6 text-primary">
            {icon}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function MultiClientAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Mock API call
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleExport = useCallback(() => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Client,Campaigns,Reach,Engagement,Revenue,Conversion Rate\n"
      + mockAnalyticsData.clientPerformance.map(client => 
          `${client.name},${client.campaigns},${client.reach},${client.engagement}%,$${client.revenue},${client.conversionRate}%`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "multi_client_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/campaigns/multi-client">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Multi-Client Campaigns
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Multi-Client Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics across all your multi-client campaigns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Campaigns"
          value={mockAnalyticsData.overview.totalCampaigns}
          description="Multi-client campaigns"
          icon={<Target className="h-5 w-5" />}
          change={12.5}
        />
        <MetricCard
          title="Active Clients"
          value={mockAnalyticsData.overview.totalClients}
          description="Participating clients"
          icon={<Building className="h-5 w-5" />}
          change={8.3}
        />
        <MetricCard
          title="Total Reach"
          value={`${(mockAnalyticsData.overview.totalReach / 1000).toFixed(1)}K`}
          description="Combined audience"
          icon={<Users className="h-5 w-5" />}
          change={15.2}
        />
        <MetricCard
          title="Avg. Engagement"
          value={`${mockAnalyticsData.overview.averageEngagement}%`}
          description="Cross-client rate"
          icon={<MousePointerClick className="h-5 w-5" />}
          change={5.7}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(mockAnalyticsData.overview.totalRevenue / 1000).toFixed(0)}K`}
          description="Generated revenue"
          icon={<DollarSign className="h-5 w-5" />}
          change={22.1}
        />
        <MetricCard
          title="Avg. Conversion"
          value={`${mockAnalyticsData.overview.avgConversionRate}%`}
          description="Cross-client rate"
          icon={<TrendingUp className="h-5 w-5" />}
          change={3.8}
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Best Performing Client</span>
                    <Badge variant="default">TechStart Inc.</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Top Campaign</span>
                    <span className="font-medium">Q4 Product Launch</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Highest Engagement</span>
                    <span className="font-medium">15.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total ROI</span>
                    <span className="font-medium text-success">+284%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <p className="text-sm">Technology sector clients show 40% higher engagement</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <p className="text-sm">Multi-channel campaigns outperform single-channel by 25%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                    <p className="text-sm">3 clients need optimization for better conversion rates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.clientPerformance.map((client, index) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.campaigns} campaigns • {client.reach.toLocaleString()} reach
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusVariant(client.status)} className="mb-2">
                        {client.status}
                      </Badge>
                      <div className="text-sm space-y-1">
                        <div>{client.engagement}% engagement</div>
                        <div>${client.revenue.toLocaleString()} revenue</div>
                        <div>{client.conversionRate}% conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Client Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.campaignBreakdown.map((campaign, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.clients} clients • {campaign.reach.toLocaleString()} total reach
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm space-y-1">
                        <div className="font-medium">{campaign.engagement}% engagement</div>
                        <div className="text-muted-foreground">${campaign.revenue.toLocaleString()} revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}