"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AnalyticsDashboard, { AnalyticMetric } from '@/components/analytics/analytics-dashboard';

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

// Additional mock data for tabs, for illustration
const mockDeviceData = [
  { device: 'Mobile', count: 4520 },
  { device: 'Desktop', count: 2650 },
  { device: 'Tablet', count: 240 },
];

const mockLinksClicked = [
  { label: 'Main Sale Page', url: 'https://example.com/sale', clicks: 1800 },
  { label: 'Featured Products', url: 'https://example.com/products/featured', clicks: 920 },
  { label: 'Discount Code', url: 'https://example.com/discount-code', clicks: 720 },
];

export default function CampaignAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Campaign Analytics</h1>
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

      {/* Analytics Summary */}
      <div className="border rounded-md p-4 bg-card shadow-sm">
        <AnalyticsDashboard
          metrics={mockMetrics}
          dateRange={mockDateRange}
        />
      </div>

      {/* Detailed Metrics & Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Device Stats</TabsTrigger>
          <TabsTrigger value="links">Links Clicked</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4 bg-white dark:bg-card">
              <h2 className="text-lg font-semibold mb-1">Delivery Funnel</h2>
              <ol className="ml-4 list-decimal text-sm mt-2">
                <li>Sent: 12,500</li>
                <li>Delivered: 12,350 (98.8%)</li>
                <li>Opened: 7,410 (59.8%)</li>
                <li>Clicked: 3,580 (28.7%)</li>
                <li>Bounced: 150 (1.2%)</li>
                <li>Unsubscribes: 45</li>
              </ol>
            </div>
            <div className="border rounded-lg p-4 bg-white dark:bg-card">
              <h2 className="text-lg font-semibold mb-1">Key Insights</h2>
              <ul className="list-disc ml-4 text-sm mt-2">
                <li>Most opens occurred on mobile devices.</li>
                <li>Highest clicks to the "Main Sale Page".</li>
                <li>Bounce rate is within healthy range.</li>
                <li>Recommend A/B testing subject lines for higher engagement.</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        {/* Devices Tab */}
        <TabsContent value="devices">
          <div className="border rounded-lg p-4 bg-white dark:bg-card">
            <h2 className="text-lg font-semibold mb-4">Devices Opened From</h2>
            <ul className="flex flex-col gap-2">
              {mockDeviceData.map(device => (
                <li key={device.device} className="flex items-center justify-between">
                  <span>{device.device}</span>
                  <span className="font-mono font-bold">{device.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links">
          <div className="border rounded-lg p-4 bg-white dark:bg-card">
            <h2 className="text-lg font-semibold mb-4">Top Clicked Links</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pr-4">Label</th>
                  <th className="pr-4">URL</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {mockLinksClicked.map(link => (
                  <tr key={link.label}>
                    <td className="pr-4">{link.label}</td>
                    <td className="pr-4 text-blue-600 underline"><a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a></td>
                    <td>{link.clicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}