"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AnalyticsDashboard, { AnalyticMetric } from '@/components/analytics/analytics-dashboard';
import { ABTestAnalytics } from '@/components/analytics/ABTestAnalytics';
import { MultiChannelAttribution } from '@/components/analytics/MultiChannelAttribution';
import { AudienceInsights } from '@/components/analytics/AudienceInsights';
import { CampaignPerformance } from '@/components/analytics/CampaignPerformance';

// --- MOCK DATA, replace with real API calls as needed ---
const mockDateRange = {
  start: "2023-11-01",
  end: "2023-11-30"
};

const mockMetrics: AnalyticMetric[] = [
  { key: 'openRate', label: 'Open Rate', value: '59.8%' },
  { key: 'clickRate', label: 'Click Rate', value: '28.7%' },
  { key: 'recipients', label: 'Recipients', value: 12500 },
  { key: 'delivered', label: 'Delivered', value: 12350 },
  { key: 'opened', label: 'Opens', value: 7410 },
  { key: 'clicked', label: 'Clicks', value: 3580 },
  { key: 'unsubscribed', label: 'Unsubscribes', value: 45 },
  { key: 'bounced', label: 'Bounced', value: 150 },
];

// Color map by metric type for funnel/stats
const metricColors: Record<string, string> = {
  delivered: 'text-green-600',
  deliveredLabel: 'text-gray-800',
  opened: 'text-indigo-600',
  openedLabel: 'text-gray-800',
  openRate: 'text-indigo-600',
  clickRate: 'text-blue-600',
  clicked: 'text-blue-600',
  clickedLabel: 'text-gray-800',
  bounces: 'text-red-600',
  bouncesLabel: 'text-gray-800',
  unsubscribed: 'text-red-600',
  unsubscribedLabel: 'text-gray-800',
  recipients: 'text-slate-900',
  recipientsLabel: 'text-gray-800',
  genericLabel: 'text-gray-800',
  genericValue: 'text-slate-900',
};

const mockDeviceData = [
  { device: 'Mobile', count: 4520, color: 'text-indigo-600' },
  { device: 'Desktop', count: 2650, color: 'text-blue-600' },
  { device: 'Tablet', count: 240, color: 'text-slate-900' },
];

const mockLinksClicked = [
  { label: 'Main Sale Page', url: 'https://example.com/sale', clicks: 1800 },
  { label: 'Featured Products', url: 'https://example.com/products/featured', clicks: 920 },
  { label: 'Discount Code', url: 'https://example.com/discount-code', clicks: 720 },
];

export default function CampaignAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaign Analytics</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Analytics Summary – the dashboard card */}
      <div className="border rounded-xl p-6 bg-white shadow-lg">
        <AnalyticsDashboard
          metrics={mockMetrics}
          dateRange={mockDateRange}
        />
      </div>

      {/* Campaign Performance */}
      <CampaignPerformance
        campaignId={params.id}
        dateRange={{
          start: new Date(mockDateRange.start),
          end: new Date(mockDateRange.end)
        }}
      />

      {/* Detailed Metrics & Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Device Stats</TabsTrigger>
          <TabsTrigger value="links">Links Clicked</TabsTrigger>
          <TabsTrigger value="ab_testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Delivery Funnel */}
            <div className="border rounded-lg p-6 bg-slate-50 dark:bg-card shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Delivery Funnel</h2>
              <ol className="ml-2 list-decimal text-base mt-2 space-y-2 font-medium">
                <li>
                  <span className={`${metricColors.genericLabel}`}>Sent:</span>
                  <span className={`ml-2 ${metricColors.genericValue} text-lg font-extrabold`}>12,500</span>
                </li>
                <li>
                  <span className={`${metricColors.deliveredLabel}`}>Delivered:</span>
                  <span className={`ml-2 ${metricColors.delivered} text-lg font-extrabold`}>12,350 <span className="ml-1 text-xs text-green-800">(98.8%)</span></span>
                </li>
                <li>
                  <span className={`${metricColors.openedLabel}`}>Opened:</span>
                  <span className={`ml-2 ${metricColors.opened} text-lg font-extrabold`}>7,410 <span className="ml-1 text-xs text-indigo-700">(59.8%)</span></span>
                </li>
                <li>
                  <span className={`${metricColors.clickedLabel}`}>Clicked:</span>
                  <span className={`ml-2 ${metricColors.clicked} text-lg font-extrabold`}>3,580 <span className="ml-1 text-xs text-blue-700">(28.7%)</span></span>
                </li>
                <li>
                  <span className={`${metricColors.bouncesLabel}`}>Bounced:</span>
                  <span className={`ml-2 ${metricColors.bounces || "text-red-600"} text-lg font-extrabold`}>150 <span className="ml-1 text-xs text-red-700">(1.2%)</span></span>
                </li>
                <li>
                  <span className={`${metricColors.unsubscribedLabel}`}>Unsubscribes:</span>
                  <span className={`ml-2 ${metricColors.unsubscribed} text-lg font-extrabold`}>45</span>
                </li>
              </ol>
            </div>
            {/* Key Insights */}
            <div className="border rounded-lg p-6 bg-white dark:bg-card shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Key Insights</h2>
              <ul className="list-disc ml-4 text-sm mt-2 font-medium text-gray-700 space-y-1">
                <li>
                  <span className="text-indigo-700 font-semibold">Most opens</span>{" "}
                  occurred on mobile devices.
                </li>
                <li>
                  <span className="text-blue-700 font-semibold">Highest clicks</span>{" "}
                  to the "Main Sale Page".
                </li>
                <li>
                  <span className="text-green-700 font-semibold">Bounce rate</span>{" "}
                  is within healthy range.
                </li>
                <li>
                  Recommend <span className="font-semibold text-primary">A/B testing subject lines</span> for higher engagement.
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="border rounded-lg p-6 bg-slate-50 dark:bg-card shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Devices Opened From</h2>
            <div className="space-y-4">
              {mockDeviceData.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <span className="font-medium">{device.device}</span>
                  <div className="flex items-center gap-2">
                    <span className={`${device.color} font-semibold`}>
                      {device.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({((device.count / 7410) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-4">
          <div className="border rounded-lg p-6 bg-white dark:bg-card shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Clicked Links</h2>
            <div className="space-y-4">
              {mockLinksClicked.map((link) => (
                <div key={link.url} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-sm text-gray-500">{link.url}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {link.clicks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      ({((link.clicks / 3580) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab_testing" className="space-y-4">
          <ABTestAnalytics
            testId={params.id}
            dateRange={{
              start: new Date(mockDateRange.start),
              end: new Date(mockDateRange.end)
            }}
          />
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-4">
          <MultiChannelAttribution
            campaignId={params.id}
            dateRange={{
              start: new Date(mockDateRange.start),
              end: new Date(mockDateRange.end)
            }}
          />
        </TabsContent>

        {/* Audience Insights Tab */}
        <TabsContent value="audience" className="space-y-4">
          <AudienceInsights
            campaignId={params.id}
            dateRange={{
              start: new Date(mockDateRange.start),
              end: new Date(mockDateRange.end)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}