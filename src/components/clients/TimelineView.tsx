"use client"

import { formatDateTime } from '@/lib/utils';
import { CalendarDays, CheckCircle2, Circle, Clock, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TimelineItem {
  id: string;
  type: 'milestone' | 'goal' | 'feedback' | 'project';
  title: string;
  description?: string;
  status: string;
  date: string;
}

async function getTimelineData(clientId: string, limit?: number): Promise<TimelineItem[]> {
  try {
    const response = await fetch(
      `/api/clients/${clientId}/timeline${limit ? `?limit=${limit}` : ''}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch timeline data: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle both old direct data format and new standardized format
    const timelineData = data.data ? data.data.items : data.items;
    return timelineData || [];
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-primary" />;
    case 'delayed':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case 'cancelled':
      return <Circle className="h-5 w-5 text-destructive" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-success/30 border-l border-success/50';
    case 'in_progress':
      return 'bg-primary/30 border-l border-primary/50';
    case 'delayed':
      return 'bg-destructive/30 border-l border-destructive/50';
    case 'cancelled':
      return 'bg-destructive/30 border-l border-destructive/50';
    default:
      return 'bg-muted/30 border-l border-muted/50';
  }
}

function TimelineItemSkeleton() {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[9px] top-8 h-full w-0.5 bg-muted/20 border-l border-muted/10" />
      <div className="absolute left-0 mt-1">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function TimelineLoadingState() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <div className="p-2 bg-muted/10 rounded-lg border border-muted/20">
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
      <div className="relative space-y-8">
        {[1, 2, 3].map((i) => (
          <TimelineItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TimelineErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 w-fit mx-auto mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-destructive mb-1">Unable to load timeline</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="flex items-center gap-2 border-destructive/20 hover:bg-destructive/10"
      >
        <RefreshCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

export default function TimelineView({
  clientId,
  limit,
}: {
  clientId: string;
  limit?: number;
}) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTimelineData(clientId, limit);
      setItems(data);
    } catch (err) {
      console.error('Error in timeline component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, limit]);

  if (loading) return <TimelineLoadingState />;
  if (error) return <TimelineErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Timeline</h3>
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="p-3 bg-muted/10 rounded-lg border border-muted/20 w-fit mx-auto mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No timeline events available</p>
        </div>
      ) : (
        <div className="relative space-y-8">
          {items.map((item, index) => (
            <div key={item.id} className="relative pl-8">
              {index !== items.length - 1 && (
                <div
                  className={`absolute left-[9px] top-8 h-full w-0.5 ${getStatusColor(
                    item.status
                  )}`}
                />
              )}

              <div className="flex items-start gap-4">
                <div className="absolute left-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <time className="text-sm text-muted-foreground">
                      {formatDateTime(item.date)}
                    </time>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize border ${
                        item.status.toLowerCase() === 'completed'
                          ? 'bg-success/10 text-success border-success/20'
                          : item.status.toLowerCase() === 'in_progress'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : item.status.toLowerCase() === 'delayed'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : item.status.toLowerCase() === 'cancelled'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-muted/10 text-muted-foreground border-muted/20'
                      }`}
                    >
                      {item.status.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 