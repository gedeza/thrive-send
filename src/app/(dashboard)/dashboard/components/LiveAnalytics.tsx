import React, { useCallback } from "react";
import AnalyticsDashboard, { AnalyticMetric } from "@/components/analytics/analytics-dashboard";
import { fetchAnalyticsData } from "@/lib/api";

export default function LiveAnalytics({ dateRange }: { dateRange: { start: string, end: string } }) {
  const fetchData = useCallback(async (): Promise<AnalyticMetric[]> => {
    const metrics = await fetchAnalyticsData({
      startDate: dateRange.start,
      endDate: dateRange.end,
      metrics: ["views", "clicks", "impressions"], // Specify as needed
    });
    // Transform as needed to { key, label, value }[]
    return Object.entries(metrics).map(([key, value]) => ({
      key,
      label: key.replace(/^\w/, c => c.toUpperCase()),
      value,
    }));
  }, [dateRange]);
  
  return <AnalyticsDashboard fetchData={fetchData} dateRange={dateRange} />;
}