"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { metricsData, Metric } from './metrics.mock';
import BarChartWidget from "@/components/analytics/BarChartWidget";
import PieChartWidget from "@/components/analytics/PieChartWidget";
import LineChartWidget from "@/components/analytics/LineChartWidget";
import { audienceGrowthData, engagementPieData, performanceLineData } from './charts.mock';

// Shared metric card component for summary/grid
function MetricCard({ title, value, icon: Icon, comparison }: Metric) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">{value}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{comparison}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your audience engagement and performance metrics
          </p>
        </div>
        <div>
          <Button>Export Reports</Button>
        </div>
      </div>

      {/* Metric summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricsData.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Audience Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartWidget
              title="Audience Growth"
              data={audienceGrowthData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Engagement Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartWidget
              title="Engagement Breakdown"
              data={engagementPieData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartWidget
              title="Performance Trends"
              data={performanceLineData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
