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
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-blue-500" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-200';
    case 'in_progress':
      return 'bg-blue-200';
    case 'delayed':
      return 'bg-yellow-200';
    case 'cancelled':
      return 'bg-red-200';
    default:
      return 'bg-gray-200';
  }
}

function TimelineItemSkeleton() {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[9px] top-8 h-full w-0.5 bg-gray-200" />
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
        <Skeleton className="h-5 w-5" />
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
      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
      <h3 className="text-lg font-medium mb-1">Unable to load timeline</h3>
      <p className="text-sm text-gray-500 mb-4">{error}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="flex items-center gap-2"
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
        <h3 className="text-lg font-medium">Timeline</h3>
        <CalendarDays className="h-5 w-5 text-gray-400" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No timeline events available</p>
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
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                    <time className="text-sm text-gray-500">
                      {formatDateTime(item.date)}
                    </time>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        item.status.toLowerCase() === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : item.status.toLowerCase() === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : item.status.toLowerCase() === 'delayed'
                          ? 'bg-yellow-100 text-yellow-700'
                          : item.status.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
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