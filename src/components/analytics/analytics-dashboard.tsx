"use client"

import React, { useState, useEffect } from 'react';

export interface AnalyticMetric {
  key: string;
  label: string;
  value: number | string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface AnalyticsFilter {
  category?: string;
  [key: string]: any;
}

// Map metric keys to Tailwind color classes for numbers/text
const metricValueColors: Record<string, string> = {
  openRate:    "text-indigo-600",
  clickRate:   "text-blue-600",
  recipients:  "text-slate-900",
  delivered:   "text-green-600",
  opened:      "text-indigo-600",
  clicks:      "text-blue-600",
  clicked:     "text-blue-600",
  unsubscribed:"text-red-600",
  bounced:     "text-red-600"
};
const metricLabelColor = "text-gray-700";

interface AnalyticsDashboardProps {
  metrics?: AnalyticMetric[];
  fetchData?: (params?: any) => Promise<AnalyticMetric[]>;
  dateRange?: DateRange;
  filter?: AnalyticsFilter;
  refreshInterval?: number;
}

export function AnalyticsDashboard({ 
  metrics: initialMetrics = [], 
  fetchData,
  dateRange,
  filter,
  refreshInterval
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<AnalyticMetric[]>(initialMetrics);
  const [loading, setLoading] = useState<boolean>(!!fetchData);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!fetchData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      
      if (dateRange) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }
      
      if (filter) {
        Object.assign(params, filter);
      }
      
      const data = await fetchData(params);
      setMetrics(data);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on initial render and when dependencies change
  useEffect(() => {
    loadData();
  }, [fetchData, dateRange, filter]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      loadData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchData]);

  if (loading) return <div data-testid="analytics-loading">Loading analytics...</div>;
  if (error) return <div data-testid="analytics-error">{error}</div>;
  return (
    <section data-testid="analytics-dashboard">
      {dateRange && (
        <div data-testid="analytics-date-range" className="mb-4 flex items-center text-sm font-medium text-gray-500">
          <span className="px-2 py-1 rounded bg-slate-100 text-gray-900 font-semibold tracking-wider">
            {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
          </span>
        </div>
      )}
      
      {metrics.length === 0 ? (
        <p data-testid="analytics-empty" className="text-gray-500 font-medium text-base">No analytics data available</p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div 
              key={m.key} 
              data-testid={`analytics-metric-${m.key}`} 
              className="flex flex-col items-start border rounded-xl bg-gradient-to-br from-slate-50 to-white px-4 py-5 shadow group hover:shadow-md transition"
            >
              <span className={`${metricLabelColor} text-base mb-1 font-medium`}>{m.label}</span>
              <span
                className={`
                  ${
                    metricValueColors[m.key] ??
                    (typeof m.value === "number"
                      ? "text-slate-900"
                      : "text-blue-700")
                  }
                  text-2xl font-extrabold font-mono tracking-tight select-text
                  group-hover:scale-105 group-hover:shadow-sm transition
                `}
                style={{
                  lineHeight: "1.15"
                }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Also export as default for components that prefer default imports
export default AnalyticsDashboard;
