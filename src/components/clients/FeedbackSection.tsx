"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Star, Plus, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    email: string;
  } | null;
}

interface FeedbackResponse {
  feedback: Feedback[];
  averageRating: number;
  totalCount: number;
}

async function getFeedbackData(clientId: string, limit?: number): Promise<FeedbackResponse> {
  try {
    // Use absolute URL with origin to avoid Invalid URL errors
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(
      `${baseUrl}/api/clients/${clientId}/feedback${limit ? `?limit=${limit}` : ''}`,
      { 
        credentials: 'include', // Include cookies for auth
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch feedback data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    throw error;
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function FeedbackCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

function FeedbackLoadingState() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <FeedbackCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function FeedbackErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
      <h3 className="text-lg font-medium mb-1">Unable to load feedback</h3>
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

export default function FeedbackSection({
  clientId,
  limit,
}: {
  clientId: string;
  limit?: number;
}) {
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const responseData = await getFeedbackData(clientId, limit);
      setData(responseData);
    } catch (err) {
      console.error('Error in feedback component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, limit]);

  if (loading) return <FeedbackLoadingState />;
  if (error) return <FeedbackErrorState error={error} onRetry={fetchData} />;
  if (!data) return <FeedbackErrorState error="No data available" onRetry={fetchData} />;

  const { feedback, averageRating, totalCount } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Client Feedback</h3>
          <div className="flex items-center gap-3">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-gray-500">
              {averageRating.toFixed(1)} average from {totalCount} reviews
            </span>
          </div>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Feedback
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {feedback.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">
                    {item.createdBy?.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    item.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : item.status === 'ARCHIVED'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.status.toLowerCase()}
                </span>
              </div>

              <div className="space-y-2">
                <StarRating rating={item.rating} />
                {item.comment && (
                  <p className="text-sm text-gray-600">{item.comment}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <time>{formatDate(item.createdAt)}</time>
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 