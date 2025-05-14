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
        <TabsContent value="devices">
          <div className="border rounded-lg p-6 bg-slate-50 dark:bg-card shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Devices Opened From</h2>
            <ul className="flex flex-col gap-3">
              {mockDeviceData.map(device => (
                <li key={device.device} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{device.device}</span>
                  <span className={`font-mono font-extrabold text-lg ${device.color}`}>
                    {device.count.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links">
          <div className="border rounded-lg p-6 bg-white dark:bg-card shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Clicked Links</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pr-4 text-gray-700 font-semibold">Label</th>
                  <th className="pr-4 text-gray-700 font-semibold">URL</th>
                  <th className="text-gray-700 font-semibold">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {mockLinksClicked.map(link => (
                  <tr key={link.label}>
                    <td className="pr-4 text-gray-800">{link.label}</td>
                    <td className="pr-4 text-blue-600 underline">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                    </td>
                    <td className="font-mono font-bold text-blue-700">{link.clicks.toLocaleString()}</td>
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