'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Zap, AlertTriangle } from 'lucide-react';

/**
 * Performance Monitor Component
 * Debug tool to track component render performance
 */
interface PerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
}

export function PerformanceMonitor({
  componentName,
  enabled = process.env.NODE_ENV === 'development'
}: PerformanceMonitorProps) {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState<number>(0);
  const [avgRenderTime, setAvgRenderTime] = useState<number>(0);
  const [renderTimes, setRenderTimes] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    setRenderCount(prev => prev + 1);

    // Measure render time
    setTimeout(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setLastRenderTime(renderTime);
      setRenderTimes(prev => {
        const newTimes = [...prev, renderTime].slice(-10); // Keep last 10 renders
        const avg = newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length;
        setAvgRenderTime(avg);
        return newTimes;
      });
    }, 0);
  });

  if (!enabled) return null;

  const getPerformanceStatus = () => {
    if (avgRenderTime < 5) return { status: 'excellent', color: 'bg-green-100 text-green-800' };
    if (avgRenderTime < 10) return { status: 'good', color: 'bg-blue-100 text-blue-800' };
    if (avgRenderTime < 20) return { status: 'fair', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'poor', color: 'bg-red-100 text-red-800' };
  };

  const { status, color } = getPerformanceStatus();

  return (
    <Card className="w-72 border-dashed border-2 border-gray-300 opacity-75 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Performance: {componentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge className={color}>
            {status === 'excellent' && <Zap className="h-3 w-3 mr-1" />}
            {status === 'poor' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Renders:</span>
          <span className="text-xs font-mono">{renderCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Last render:</span>
          <span className="text-xs font-mono">{lastRenderTime.toFixed(2)}ms</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Avg render:</span>
          <span className="text-xs font-mono">{avgRenderTime.toFixed(2)}ms</span>
        </div>

        {renderTimes.length > 1 && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">Render timeline:</div>
            <div className="flex gap-1">
              {renderTimes.slice(-8).map((time, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-sm ${
                    time < 5 ? 'bg-green-400' :
                    time < 10 ? 'bg-blue-400' :
                    time < 20 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ height: `${Math.min(time * 2, 20)}px` }}
                  title={`${time.toFixed(2)}ms`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}