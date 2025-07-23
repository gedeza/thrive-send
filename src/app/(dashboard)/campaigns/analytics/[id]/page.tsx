"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download,
  Mail,
  Users,
  MousePointerClick,
  Eye,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  BarChart3,
  Target,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ABTestAnalytics } from '@/components/analytics/ABTestAnalytics';
import { MultiChannelAttribution } from '@/components/analytics/MultiChannelAttribution';
import { AudienceInsights } from '@/components/analytics/AudienceInsights';
import { CampaignPerformance } from '@/components/analytics/CampaignPerformance';
import { useAnalytics } from '@/lib/api/analytics-service';
import { cn } from '@/lib/utils';

// Helper function to get icon components
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'eye': <Eye className="h-5 w-5" />,
    'mouse-pointer-click': <MousePointerClick className="h-5 w-5" />,
    'users': <Users className="h-5 w-5" />,
    'mail': <Mail className="h-5 w-5" />,
    'alert-triangle': <AlertTriangle className="h-4 w-4" />,
    'trending-up': <TrendingUp className="h-4 w-4" />,
    'smartphone': <Smartphone className="h-4 w-4" />,
    'monitor': <Monitor className="h-4 w-4" />,
    'tablet': <Tablet className="h-4 w-4" />,
  };
  return iconMap[iconName] || <BarChart3 className="h-5 w-5" />;
};

// Fallback data for graceful degradation when APIs are unavailable
const fallbackDeviceData = [
  { device: 'Mobile', count: 4520, percentage: 61.0, icon: 'smartphone', color: 'text-indigo-600' },
  { device: 'Desktop', count: 2650, percentage: 35.8, icon: 'monitor', color: 'text-blue-600' },
  { device: 'Tablet', count: 240, percentage: 3.2, icon: 'tablet', color: 'text-slate-600' },
];

const fallbackLinksData = [
  { label: 'Main Sale Page', url: 'https://example.com/sale', clicks: 1800, percentage: 50.3 },
  { label: 'Featured Products', url: 'https://example.com/products/featured', clicks: 920, percentage: 25.7 },
  { label: 'Discount Code', url: 'https://example.com/discount-code', clicks: 720, percentage: 20.1 },
  { label: 'About Us', url: 'https://example.com/about', clicks: 140, percentage: 3.9 },
];

// Metric Card Component matching the pattern from other pages
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
  compact?: boolean;
}

function MetricCard({ title, value, description, icon, change, isLoading, compact = false }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className={cn("p-4", compact && "p-3")}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className={cn("h-3 w-20", compact && "h-3 w-16")} />
              <Skeleton className={cn("h-6 w-16", compact && "h-5 w-12")} />
              <Skeleton className={cn("h-3 w-24", compact && "h-2 w-20")} />
            </div>
            <Skeleton className={cn("h-6 w-6 rounded", compact && "h-5 w-5")} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={cn("text-sm text-muted-foreground", compact && "text-xs")}>{title}</p>
            <p className={cn("text-2xl font-bold", compact && "text-lg font-semibold")}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className={cn("text-xs text-muted-foreground", compact && "text-xs")}>{description}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center text-xs ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="mr-1 h-3 w-3" />
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const analytics = useAnalytics();
  
  // State for dynamic data
  const [metricsData, setMetricsData] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [linkData, setLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generate insights from current data (memoized to prevent re-computation)
  const keyInsights = useMemo(() => {
    const insights = [];
    
    // Device insights from deviceData
    if (deviceData?.length > 0) {
      const topDevice = deviceData.reduce((prev: any, current: any) => 
        (prev.percentage > current.percentage) ? prev : current
      );
      insights.push({
        color: 'bg-blue-500',
        text: `${topDevice.device} devices drove <strong>${topDevice.percentage}%</strong> of opens`
      });
    } else if (fallbackDeviceData?.length > 0) {
      const topDevice = fallbackDeviceData[0];
      insights.push({
        color: 'bg-blue-500',
        text: `${topDevice.device} devices drove <strong>${topDevice.percentage}%</strong> of opens`
      });
    }

    // Link insights from linkData
    if (linkData?.length > 0) {
      const topLink = linkData[0];
      insights.push({
        color: 'bg-green-500',
        text: `${topLink.label} had <strong>${topLink.percentage}%</strong> of clicks`
      });
    } else if (fallbackLinksData?.length > 0) {
      const topLink = fallbackLinksData[0];
      insights.push({
        color: 'bg-green-500',
        text: `${topLink.label} had <strong>${topLink.percentage}%</strong> of clicks`
      });
    }

    // Bounce rate insight from metricsData
    if (metricsData?.secondary) {
      const bouncedMetric = metricsData.secondary.find((m: any) => m.title === 'Bounced');
      const deliveredMetric = metricsData.primary?.find((m: any) => m.title === 'Delivered');
      if (bouncedMetric && deliveredMetric) {
        const bounceRate = ((bouncedMetric.value / deliveredMetric.value) * 100).toFixed(1);
        const isHealthy = parseFloat(bounceRate) < 2;
        insights.push({
          color: isHealthy ? 'bg-orange-500' : 'bg-red-500',
          text: `Bounce rate at ${isHealthy ? 'healthy' : 'concerning'} <strong>${bounceRate}%</strong>`
        });
      }
    }

    // Smart recommendations based on data
    if (metricsData?.primary) {
      const openRateMetric = metricsData.primary.find((m: any) => m.title === 'Open Rate');
      const clickRateMetric = metricsData.primary.find((m: any) => m.title === 'Click Rate');
      
      if (openRateMetric && clickRateMetric) {
        const openRate = parseFloat(openRateMetric.value?.replace('%', '') || '0');
        const clickRate = parseFloat(clickRateMetric.value?.replace('%', '') || '0');
        
        if (openRate < 20) {
          insights.push({
            color: 'bg-purple-500',
            text: 'Consider A/B testing subject lines to improve open rates'
          });
        } else if (clickRate < 3) {
          insights.push({
            color: 'bg-purple-500',
            text: 'Consider optimizing email content to improve click rates'
          });
        } else {
          insights.push({
            color: 'bg-purple-500',
            text: 'Campaign performing well - consider scaling to larger audience'
          });
        }
      }
    }

    // Fallback insights if no data available
    if (insights.length === 0) {
      insights.push(
        { color: 'bg-gray-400', text: 'Loading insights...' },
        { color: 'bg-gray-400', text: 'Analyzing campaign performance...' },
        { color: 'bg-gray-400', text: 'Generating recommendations...' }
      );
    }

    return insights.slice(0, 4);
  }, [metricsData, deviceData, linkData]);

  // Static date range to prevent infinite loops
  const dateRange = {
    start: "2023-11-01",
    end: "2023-11-30"
  };

  // Manual refresh function
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel
      const [metrics, devices, links] = await Promise.all([
        analytics.getCampaignOverviewMetrics(params.id, dateRange),
        analytics.getDeviceAnalytics(params.id, dateRange),
        analytics.getLinkAnalytics(params.id, dateRange)
      ]);
      
      setMetricsData(metrics);
      setDeviceData(devices);
      setLinkData(links);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Keep existing mock data as fallback
    } finally {
      setLoading(false);
    }
  }, [params.id]); // Only depend on campaign ID

  // Fetch data only once on component mount
  useEffect(() => {
    refreshData();
  }, [params.id]); // Simplified dependency

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance insights and metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </Badge>
            <span className="text-xs text-muted-foreground">Campaign ID: {params.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Primary Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData?.primary ? (
          metricsData.primary.map((metric: any, index: number) => (
          <MetricCard 
            key={index} 
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={getIconComponent(metric.icon)}
            change={metric.change}
            isLoading={loading}
          />
          ))
        ) : (
          // Loading state for primary metrics
          Array.from({ length: 4 }).map((_, index) => (
            <MetricCard 
              key={`loading-primary-${index}`}
              title="Loading..."
              value="--"
              description="Loading metric data..."
              icon={<div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />}
              isLoading={true}
            />
          ))
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData?.secondary ? (
          metricsData.secondary.map((metric: any, index: number) => (
          <MetricCard 
            key={index} 
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={getIconComponent(metric.icon)}
            isLoading={loading}
            compact 
          />
          ))
        ) : (
          // Loading state for secondary metrics
          Array.from({ length: 4 }).map((_, index) => (
            <MetricCard 
              key={`loading-secondary-${index}`}
              title="Loading..."
              value="--"
              description="Loading metric data..."
              icon={<div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />}
              isLoading={true}
              compact
            />
          ))
        )}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="devices" className="text-xs">Devices</TabsTrigger>
          <TabsTrigger value="links" className="text-xs">Links</TabsTrigger>
          <TabsTrigger value="ab_testing" className="text-xs">A/B Test</TabsTrigger>
          <TabsTrigger value="attribution" className="text-xs">Attribution</TabsTrigger>
          <TabsTrigger value="audience" className="text-xs">Audience</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {/* Delivery Funnel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Delivery Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {metricsData?.funnel ? (
                    metricsData.funnel.map((item: any, index: number) => (
                      <div key={item.label} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", item.color)} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{item.value.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Loading delivery funnel data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Key Insights */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2 text-sm">
                  {keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-1 h-4 ${insight.color} rounded`} />
                      <span dangerouslySetInnerHTML={{ __html: insight.text }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Campaign Performance Component */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <CampaignPerformance
                campaignId={params.id}
                dateRange={{
                  start: new Date(dateRange.start),
                  end: new Date(dateRange.end)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Device Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-2 sm:grid-cols-3">
                {(deviceData || fallbackDeviceData).map((device: any) => (
                  <div key={device.device} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {getIconComponent(device.icon)}
                      <span className="text-sm font-medium">{device.device}</span>
                    </div>
                    <div className="space-y-1">
                      <div className={cn("text-lg font-bold", device.color)}>
                        {loading ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          device.count.toLocaleString()
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {loading ? (
                          <Skeleton className="h-3 w-20" />
                        ) : (
                          `${device.percentage}% of total opens`
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Top Clicked Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {(linkData || fallbackLinksData).map((link: any, index: number) => (
                  <div key={link.url} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {loading ? <Skeleton className="h-4 w-32" /> : link.label}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {loading ? <Skeleton className="h-3 w-48" /> : link.url}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-semibold text-blue-600">
                        {loading ? <Skeleton className="h-4 w-12" /> : link.clicks.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {loading ? <Skeleton className="h-3 w-8" /> : `${link.percentage}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab_testing" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">A/B Test Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ABTestAnalytics
                testId={params.id}
                dateRange={{
                  start: new Date(dateRange.start),
                  end: new Date(dateRange.end)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Multi-Channel Attribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <MultiChannelAttribution
                campaignId={params.id}
                dateRange={{
                  start: new Date(dateRange.start),
                  end: new Date(dateRange.end)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Insights Tab */}
        <TabsContent value="audience" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Audience Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <AudienceInsights
                campaignId={params.id}
                dateRange={{
                  start: new Date(dateRange.start),
                  end: new Date(dateRange.end)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}