"use client"

import { formatDateTime } from '@/lib/utils';
import { CalendarDays, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

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
    // Use absolute URL with origin to avoid Invalid URL errors
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(
      `${baseUrl}/api/clients/${clientId}/timeline${limit ? `?limit=${limit}` : ''}`,
      { 
        credentials: 'include' // Include cookies for auth
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch timeline data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
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
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'delayed':
      return 'bg-yellow-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
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

function TimelineErrorState({ error }: { error: string }) {
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
      <h3 className="text-lg font-medium mb-1">Unable to load timeline</h3>
      <p className="text-sm text-gray-500">{error}</p>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTimelineData(clientId, limit);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Error in timeline component:', err);
        setError(err instanceof Error ? err.message : 'Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, limit]);

  if (loading) return <TimelineLoadingState />;
  if (error) return <TimelineErrorState error={error} />;

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