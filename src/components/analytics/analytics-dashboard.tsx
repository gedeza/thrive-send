"use client"

import React, { useState, useEffect } from 'react';

export interface AnalyticMetric {
  key: string;
  label: string;
  value: number | string;
}

interface AnalyticsDashboardProps {
  metrics?: AnalyticMetric[];
  fetchData?: () => Promise<AnalyticMetric[]>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function AnalyticsDashboard({ 
  metrics: initialMetrics = [], 
  fetchData,
  dateRange 
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<AnalyticMetric[]>(initialMetrics);
  const [loading, setLoading] = useState<boolean>(!!fetchData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchData) {
      setLoading(true);
      setError(null);
      
      fetchData()
        .then(data => {
          setMetrics(data);
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to load analytics data");
          setLoading(false);
          console.error("Analytics fetch error:", err);
        });
    }
  }, [fetchData, dateRange]);

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
        metrics.map((m) => (
          <div key={m.key} data-testid={`analytics-metric-${m.key}`} style={{ marginBottom: 8 }}>
            <strong>{m.label}: </strong>
            <span>{m.value}</span>
          </div>
        ))
      )}
    </section>
  );
}

// Also export as default for components that prefer default imports
export default AnalyticsDashboard;
