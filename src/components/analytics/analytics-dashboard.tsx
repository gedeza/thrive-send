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

  if (loading) {
    return <div data-testid="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div data-testid="analytics-error">{error}</div>;
  }
  return (
    <section data-testid="analytics-dashboard">
      {dateRange && (
        <div data-testid="analytics-date-range">
          <span>{new Date(dateRange.start).toLocaleDateString()}</span>
          {" - "}
          <span>{new Date(dateRange.end).toLocaleDateString()}</span>
        </div>
      )}
      
      {metrics.length === 0 ? (
        <p data-testid="analytics-empty">No analytics data available</p>
      ) : (
        <div className="analytics-grid">
          {metrics.map((m) => (
            <div 
              key={m.key} 
              data-testid={`analytics-metric-${m.key}`} 
              className="analytics-card"
              style={{ marginBottom: 8 }}
            >
              <strong>{m.label}: </strong>
              <span>{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Also export as default for components that prefer default imports
export default AnalyticsDashboard;
