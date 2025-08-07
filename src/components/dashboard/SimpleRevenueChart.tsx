/**
 * Simple Revenue Chart Component
 * Replaces placeholder chart content with basic visualization
 */

import React from 'react';
import { REVENUE_DASHBOARD_TEXT } from '@/constants/dashboard-text';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface SimpleRevenueChartProps {
  data?: RevenueDataPoint[];
  title: string;
  type: 'trend' | 'category';
}

export function SimpleRevenueChart({ data = [], title, type }: SimpleRevenueChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-muted-foreground/20 rounded" />
          </div>
          <p className="font-medium mb-2">Chart Integration Ready</p>
          <p className="text-sm">
            {type === 'trend' 
              ? 'Revenue trend data will be displayed here once integrated with Chart.js or Recharts'
              : 'Category breakdown will be visualized here with pie chart integration'
            }
          </p>
        </div>
      </div>
    );
  }

  if (type === 'trend') {
    // Simple trend visualization using CSS
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    
    return (
      <div className="h-64 p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((point, index) => {
            const height = (point.revenue / maxRevenue) * 100;
            const date = new Date(point.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all hover:bg-primary/80"
                  style={{ height: `${height}%` }}
                  title={`${date}: $${point.revenue.toLocaleString()}`}
                />
                <span className="text-xs text-muted-foreground mt-2 text-center">
                  {date}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>Revenue Trend</span>
          <span>Total: ${data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</span>
        </div>
      </div>
    );
  }

  // Simple category breakdown
  return (
    <div className="h-64 p-4">
      <div className="space-y-4">
        {/* Mock category data for demonstration */}
        {[
          { category: 'Government', percentage: 45, color: 'bg-secondary' },
          { category: 'Business', percentage: 35, color: 'bg-primary' },
          { category: 'Startup', percentage: 20, color: 'bg-accent' }
        ].map((item) => (
          <div key={item.category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.category}</span>
              <span className="text-sm text-muted-foreground">{item.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${item.color}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Revenue distribution by client type
      </div>
    </div>
  );
}