'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Activity,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Zap,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types for cross-client analytics
interface ClientPerformanceMetrics {
  clientId: string;
  clientName: string;
  clientType: string;
  metrics: {
    totalPosts: number;
    totalEngagement: number;
    averageEngagementRate: number;
    totalReach: number;
    totalImpressions: number;
    conversionRate: number;
    revenue: number;
    growthRate: number;
  };
  socialPlatforms: {
    platform: string;
    followers: number;
    engagementRate: number;
    postsCount: number;
  }[];
  contentTypes: {
    type: string;
    count: number;
    averageEngagement: number;
  }[];
  topPerformingContent: {
    id: string;
    title: string;
    platform: string;
    engagement: number;
    reach: number;
  }[];
}

interface CrossClientComparison {
  metric: string;
  clients: {
    clientId: string;
    clientName: string;
    value: number;
    change: number;
    rank: number;
  }[];
}

interface IndustryBenchmarks {
  industry: string;
  metrics: {
    averageEngagementRate: number;
    averageReach: number;
    averageConversionRate: number;
    postFrequency: number;
  };
  clientComparison: {
    clientId: string;
    clientName: string;
    performanceVsBenchmark: {
      engagement: number; // percentage above/below benchmark
      reach: number;
      conversion: number;
    };
  }[];
}

interface TrendAnalysis {
  period: string;
  metrics: {
    engagement: { value: number; change: number };
    reach: { value: number; change: number };
    conversions: { value: number; change: number };
    revenue: { value: number; change: number };
  };
  topTrends: {
    trend: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    affectedClients: string[];
  }[];
}

// Demo data
const demoClientMetrics: ClientPerformanceMetrics[] = [
  {
    clientId: 'demo-client-1',
    clientName: 'City of Springfield',
    clientType: 'Municipality',
    metrics: {
      totalPosts: 127,
      totalEngagement: 45680,
      averageEngagementRate: 4.2,
      totalReach: 890000,
      totalImpressions: 1240000,
      conversionRate: 2.8,
      revenue: 12450,
      growthRate: 15.3
    },
    socialPlatforms: [
      { platform: 'Facebook', followers: 12400, engagementRate: 5.1, postsCount: 45 },
      { platform: 'Twitter', followers: 8900, engagementRate: 3.2, postsCount: 67 },
      { platform: 'Instagram', followers: 6700, engagementRate: 6.8, postsCount: 15 }
    ],
    contentTypes: [
      { type: 'Announcements', count: 35, averageEngagement: 420 },
      { type: 'Events', count: 28, averageEngagement: 580 },
      { type: 'Public Safety', count: 22, averageEngagement: 290 },
      { type: 'Community', count: 42, averageEngagement: 340 }
    ],
    topPerformingContent: [
      { id: '1', title: 'Annual Town Hall Meeting', platform: 'Facebook', engagement: 1240, reach: 12000 },
      { id: '2', title: 'New Park Opening', platform: 'Instagram', engagement: 890, reach: 8500 },
      { id: '3', title: 'Budget Proposal Update', platform: 'Twitter', engagement: 560, reach: 6200 }
    ]
  },
  {
    clientId: 'demo-client-2',
    clientName: 'Regional Health District',
    clientType: 'Government',
    metrics: {
      totalPosts: 89,
      totalEngagement: 32100,
      averageEngagementRate: 3.8,
      totalReach: 567000,
      totalImpressions: 890000,
      conversionRate: 3.2,
      revenue: 8920,
      growthRate: 22.7
    },
    socialPlatforms: [
      { platform: 'Facebook', followers: 18600, engagementRate: 4.3, postsCount: 34 },
      { platform: 'Instagram', followers: 9200, engagementRate: 5.9, postsCount: 28 },
      { platform: 'LinkedIn', followers: 5400, engagementRate: 2.1, postsCount: 27 }
    ],
    contentTypes: [
      { type: 'Health Tips', count: 25, averageEngagement: 480 },
      { type: 'Prevention', count: 20, averageEngagement: 390 },
      { type: 'Updates', count: 18, averageEngagement: 270 },
      { type: 'Programs', count: 26, averageEngagement: 350 }
    ],
    topPerformingContent: [
      { id: '4', title: 'Flu Prevention Campaign', platform: 'Facebook', engagement: 1580, reach: 15200 },
      { id: '5', title: 'Mental Health Awareness', platform: 'Instagram', engagement: 1120, reach: 9800 },
      { id: '6', title: 'Vaccination Drive', platform: 'LinkedIn', engagement: 340, reach: 4100 }
    ]
  },
  {
    clientId: 'demo-client-3',
    clientName: 'TechFlow Innovations',
    clientType: 'Startup',
    metrics: {
      totalPosts: 156,
      totalEngagement: 67890,
      averageEngagementRate: 6.4,
      totalReach: 1240000,
      totalImpressions: 1890000,
      conversionRate: 4.1,
      revenue: 6780,
      growthRate: 45.2
    },
    socialPlatforms: [
      { platform: 'LinkedIn', followers: 15600, engagementRate: 4.8, postsCount: 52 },
      { platform: 'Twitter', followers: 23400, engagementRate: 5.2, postsCount: 78 },
      { platform: 'Instagram', followers: 8900, engagementRate: 8.1, postsCount: 26 }
    ],
    contentTypes: [
      { type: 'Product Updates', count: 42, averageEngagement: 560 },
      { type: 'Tech Tips', count: 38, averageEngagement: 420 },
      { type: 'Company News', count: 31, averageEngagement: 380 },
      { type: 'Industry Insights', count: 45, averageEngagement: 490 }
    ],
    topPerformingContent: [
      { id: '7', title: 'AI Feature Launch', platform: 'LinkedIn', engagement: 2340, reach: 18900 },
      { id: '8', title: 'Behind the Scenes', platform: 'Instagram', engagement: 1890, reach: 12400 },
      { id: '9', title: 'Industry Report', platform: 'Twitter', engagement: 1120, reach: 8700 }
    ]
  }
];

const demoCrossClientComparisons: CrossClientComparison[] = [
  {
    metric: 'Engagement Rate',
    clients: [
      { clientId: 'demo-client-3', clientName: 'TechFlow Innovations', value: 6.4, change: 12.5, rank: 1 },
      { clientId: 'demo-client-1', clientName: 'City of Springfield', value: 4.2, change: 8.3, rank: 2 },
      { clientId: 'demo-client-2', clientName: 'Regional Health District', value: 3.8, change: 15.7, rank: 3 }
    ]
  },
  {
    metric: 'Growth Rate',
    clients: [
      { clientId: 'demo-client-3', clientName: 'TechFlow Innovations', value: 45.2, change: 18.3, rank: 1 },
      { clientId: 'demo-client-2', clientName: 'Regional Health District', value: 22.7, change: 7.2, rank: 2 },
      { clientId: 'demo-client-1', clientName: 'City of Springfield', value: 15.3, change: 4.1, rank: 3 }
    ]
  },
  {
    metric: 'Total Revenue',
    clients: [
      { clientId: 'demo-client-1', clientName: 'City of Springfield', value: 12450, change: 15.3, rank: 1 },
      { clientId: 'demo-client-2', clientName: 'Regional Health District', value: 8920, change: 22.7, rank: 2 },
      { clientId: 'demo-client-3', clientName: 'TechFlow Innovations', value: 6780, change: 45.2, rank: 3 }
    ]
  }
];

const demoIndustryBenchmarks: IndustryBenchmarks[] = [
  {
    industry: 'Government/Municipal',
    metrics: {
      averageEngagementRate: 3.5,
      averageReach: 650000,
      averageConversionRate: 2.1,
      postFrequency: 4.2
    },
    clientComparison: [
      {
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        performanceVsBenchmark: {
          engagement: 20.0, // 20% above benchmark
          reach: 36.9, // 36.9% above benchmark
          conversion: 33.3 // 33.3% above benchmark
        }
      },
      {
        clientId: 'demo-client-2',
        clientName: 'Regional Health District',
        performanceVsBenchmark: {
          engagement: 8.6,
          reach: -12.8, // below benchmark
          conversion: 52.4
        }
      }
    ]
  },
  {
    industry: 'Technology/Startup',
    metrics: {
      averageEngagementRate: 4.8,
      averageReach: 890000,
      averageConversionRate: 3.2,
      postFrequency: 6.1
    },
    clientComparison: [
      {
        clientId: 'demo-client-3',
        clientName: 'TechFlow Innovations',
        performanceVsBenchmark: {
          engagement: 33.3,
          reach: 39.3,
          conversion: 28.1
        }
      }
    ]
  }
];

// Utility functions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function getClientTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'municipality': return 'bg-primary/10 text-primary';
    case 'government': return 'bg-success/10 text-success';
    case 'startup': return 'bg-accent/10 text-accent';
    case 'business': return 'bg-warning/10 text-warning';
    default: return 'bg-muted/10 text-muted-foreground';
  }
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1: return <Award className="h-4 w-4 text-warning" />;
    case 2: return <Award className="h-4 w-4 text-muted-foreground" />;
    case 3: return <Award className="h-4 w-4 text-accent" />;
    default: return <Target className="h-4 w-4 text-muted-foreground" />;
  }
}

// Client comparison card component
interface ClientComparisonCardProps {
  comparison: CrossClientComparison;
}

function ClientComparisonCard({ comparison }: ClientComparisonCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {comparison.metric}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comparison.clients.map((client) => (
            <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getRankIcon(client.rank)}
                <div>
                  <p className="font-medium">{client.clientName}</p>
                  <p className="text-sm text-muted-foreground">Rank #{client.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {comparison.metric.includes('Rate') ? `${client.value}%` :
                   comparison.metric.includes('Revenue') ? formatCurrency(client.value) :
                   formatNumber(client.value)}
                </p>
                <p className={cn(
                  "text-sm flex items-center gap-1",
                  client.change >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {client.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {formatPercentage(client.change)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Industry benchmark card component
interface BenchmarkCardProps {
  benchmark: IndustryBenchmarks;
}

function BenchmarkCard({ benchmark }: BenchmarkCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {benchmark.industry} Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Benchmark metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-lg font-bold">{benchmark.metrics.averageEngagementRate}%</p>
              <p className="text-xs text-muted-foreground">Avg Engagement</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-lg font-bold">{formatNumber(benchmark.metrics.averageReach)}</p>
              <p className="text-xs text-muted-foreground">Avg Reach</p>
            </div>
          </div>
          
          {/* Client comparisons */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Your Clients vs Industry</h4>
            {benchmark.clientComparison.map((client) => (
              <div key={client.clientId} className="p-3 border rounded-lg">
                <p className="font-medium text-sm mb-2">{client.clientName}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className={cn(
                      "font-medium",
                      client.performanceVsBenchmark.engagement >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {formatPercentage(client.performanceVsBenchmark.engagement)}
                    </p>
                    <p className="text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "font-medium",
                      client.performanceVsBenchmark.reach >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {formatPercentage(client.performanceVsBenchmark.reach)}
                    </p>
                    <p className="text-muted-foreground">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "font-medium",
                      client.performanceVsBenchmark.conversion >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {formatPercentage(client.performanceVsBenchmark.conversion)}
                    </p>
                    <p className="text-muted-foreground">Conversion</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CrossClientAnalyticsReports() {
  const [timeRange, setTimeRange] = useState('last-30-days');
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  const [clientMetrics] = useState<ClientPerformanceMetrics[]>(demoClientMetrics);
  const [comparisons] = useState<CrossClientComparison[]>(demoCrossClientComparisons);
  const [benchmarks] = useState<IndustryBenchmarks[]>(demoIndustryBenchmarks);
  const [isLoading, setIsLoading] = useState(false);
  const { state: { organizationId } } = useServiceProvider();

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleExportReport = () => {
    // TODO: Implement cross-client analytics export
    console.log('Exporting cross-client analytics report...');
  };

  // Calculate aggregated metrics
  const aggregatedMetrics = {
    totalClients: clientMetrics.length,
    totalPosts: clientMetrics.reduce((sum, client) => sum + client.metrics.totalPosts, 0),
    totalEngagement: clientMetrics.reduce((sum, client) => sum + client.metrics.totalEngagement, 0),
    totalRevenue: clientMetrics.reduce((sum, client) => sum + client.metrics.revenue, 0),
    averageEngagementRate: clientMetrics.reduce((sum, client) => sum + client.metrics.averageEngagementRate, 0) / clientMetrics.length,
    averageGrowthRate: clientMetrics.reduce((sum, client) => sum + client.metrics.growthRate, 0) / clientMetrics.length
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Cross-Client Analytics
            </h2>
            <p className="text-muted-foreground mt-1">
              Compare performance across all clients and industry benchmarks
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Aggregated Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{aggregatedMetrics.totalClients}</p>
              <p className="text-xs text-muted-foreground">Total Clients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.totalPosts)}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.totalEngagement)}</p>
              <p className="text-xs text-muted-foreground">Total Engagement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(aggregatedMetrics.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{aggregatedMetrics.averageEngagementRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg Engagement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">{aggregatedMetrics.averageGrowthRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg Growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Client Performance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {comparisons.map((comparison) => (
            <ClientComparisonCard key={comparison.metric} comparison={comparison} />
          ))}
        </div>

        {/* Detailed Client Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Performance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {clientMetrics.map((client) => (
                <div key={client.clientId} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{client.clientName}</h3>
                      <Badge className={getClientTypeColor(client.clientType)}>
                        {client.clientType}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="text-lg font-bold text-success">
                        {formatPercentage(client.metrics.growthRate)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Key metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{client.metrics.totalPosts}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{formatNumber(client.metrics.totalEngagement)}</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{formatNumber(client.metrics.totalReach)}</p>
                      <p className="text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{formatCurrency(client.metrics.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                  
                  {/* Platform breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Platform Performance</h4>
                      <div className="space-y-2">
                        {client.socialPlatforms.map((platform) => (
                          <div key={platform.platform} className="flex items-center justify-between text-sm">
                            <span>{platform.platform}</span>
                            <div className="flex items-center gap-2">
                              <span>{formatNumber(platform.followers)}</span>
                              <Badge variant="outline" className="text-xs">
                                {platform.engagementRate}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Content Types</h4>
                      <div className="space-y-2">
                        {client.contentTypes.slice(0, 3).map((type) => (
                          <div key={type.type} className="flex items-center justify-between text-sm">
                            <span>{type.type}</span>
                            <div className="flex items-center gap-2">
                              <span>{type.count}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatNumber(type.averageEngagement)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {benchmarks.map((benchmark) => (
            <BenchmarkCard key={benchmark.industry} benchmark={benchmark} />
          ))}
        </div>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Key Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <h4 className="font-semibold text-success">Top Performer</h4>
                <p className="text-sm text-success mt-1">
                  TechFlow Innovations leads with 6.4% engagement rate
                </p>
              </div>
              
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-primary">Growth Leader</h4>
                <p className="text-sm text-primary mt-1">
                  Regional Health District shows 22.7% growth rate
                </p>
              </div>
              
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <Target className="h-8 w-8 text-warning mx-auto mb-2" />
                <h4 className="font-semibold text-warning">Above Industry</h4>
                <p className="text-sm text-warning mt-1">
                  All clients perform above industry benchmarks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}