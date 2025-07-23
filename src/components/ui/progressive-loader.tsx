'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressiveLoaderProps<T> {
  fetchData: (offset: number, limit: number) => Promise<{
    data: T[];
    hasMore: boolean;
    total?: number;
  }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderError?: (error: Error, retry: () => void) => React.ReactNode;
  itemsPerPage?: number;
  className?: string;
  containerClassName?: string;
  autoLoad?: boolean;
  threshold?: number; // Distance from bottom to trigger load
  getItemKey?: (item: T, index: number) => string;
  onDataChange?: (data: T[], total: number) => void;
  loadingText?: string;
  emptyText?: string;
  errorText?: string;
}

interface LoadingState {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
}

export function ProgressiveLoader<T extends { id?: string }>({
  fetchData,
  renderItem,
  renderSkeleton,
  renderEmpty,
  renderError,
  itemsPerPage = 20,
  className,
  containerClassName,
  autoLoad = true,
  threshold = 300,
  getItemKey,
  onDataChange,
  loadingText = 'Loading...',
  emptyText = 'No items to display',
  errorText = 'Failed to load data'
}: ProgressiveLoaderProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    error: null
  });

  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const loadData = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (state.isLoading || state.isLoadingMore) return;

    setState(prev => ({
      ...prev,
      isLoading: offset === 0,
      isLoadingMore: offset > 0,
      error: null
    }));

    try {
      const result = await fetchData(offset, itemsPerPage);
      
      setData(prevData => append ? [...prevData, ...result.data] : result.data);
      setTotal(result.total || result.data.length);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        hasMore: result.hasMore,
        error: null
      }));

      onDataChange?.(append ? [...data, ...result.data] : result.data, result.total || result.data.length);
      retryCountRef.current = 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: err
      }));
    }
  }, [fetchData, itemsPerPage, onDataChange, state.isLoading, state.isLoadingMore, data]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoadingMore) {
      loadData(data.length, true);
    }
  }, [state.hasMore, state.isLoadingMore, data.length, loadData]);

  const retry = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      loadData(0, false);
    }
  }, [loadData]);

  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    setData([]);
    setTotal(0);
    setState({
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null
    });
    loadData(0, false);
  }, [loadData]);

  // Set up intersection observer for auto-loading
  useEffect(() => {
    if (!autoLoad || !loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && state.hasMore && !state.isLoadingMore) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [autoLoad, threshold, state.hasMore, state.isLoadingMore, loadMore]);

  // Initial load
  useEffect(() => {
    loadData(0, false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Default skeleton renderer
  const defaultSkeleton = useCallback(() => (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  ), []);

  // Default empty state renderer
  const defaultEmpty = useCallback(() => (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <ChevronDown className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium mb-2">No data available</p>
        <p className="text-sm">{emptyText}</p>
      </div>
      <Button onClick={refresh} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  ), [emptyText, refresh]);

  // Default error renderer
  const defaultError = useCallback((error: Error, retryFn: () => void) => (
    <div className="text-center py-12">
      <div className="text-destructive mb-4">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Something went wrong</p>
        <p className="text-sm mb-4">{error.message || errorText}</p>
      </div>
      <div className="space-x-2">
        <Button onClick={retryFn} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button onClick={refresh} variant="ghost" size="sm">
          Reset
        </Button>
      </div>
    </div>
  ), [errorText, refresh]);

  // Render loading state
  if (state.isLoading) {
    return (
      <div className={cn("w-full", containerClassName)}>
        {renderSkeleton ? renderSkeleton() : defaultSkeleton()}
      </div>
    );
  }

  // Render error state
  if (state.error && data.length === 0) {
    return (
      <div className={cn("w-full", containerClassName)}>
        {renderError ? renderError(state.error, retry) : defaultError(state.error, retry)}
      </div>
    );
  }

  // Render empty state
  if (data.length === 0 && !state.isLoading) {
    return (
      <div className={cn("w-full", containerClassName)}>
        {renderEmpty ? renderEmpty() : defaultEmpty()}
      </div>
    );
  }

  // Render data
  return (
    <div className={cn("w-full", containerClassName)}>
      <div className={className}>
        {data.map((item, index) => (
          <div key={getItemKey ? getItemKey(item, index) : item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Load more trigger/button */}
      {state.hasMore && (
        <div ref={loadMoreRef} className="py-4">
          {state.isLoadingMore ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">{loadingText}</span>
              </div>
            </div>
          ) : !autoLoad ? (
            <div className="text-center">
              <Button onClick={loadMore} variant="outline" size="sm">
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Load complete indicator */}
      {!state.hasMore && data.length > 0 && (
        <div className="text-center py-4 text-xs text-muted-foreground">
          All {total} items loaded
        </div>
      )}
    </div>
  );
}

// Hook for managing progressive loading state
export function useProgressiveLoader<T>(
  fetchData: (offset: number, limit: number) => Promise<{
    data: T[];
    hasMore: boolean;
    total?: number;
  }>,
  itemsPerPage: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (isLoading || isLoadingMore) return;

    try {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await fetchData(offset, itemsPerPage);
      
      setData(prevData => append ? [...prevData, ...result.data] : result.data);
      setTotal(result.total || result.data.length);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchData, itemsPerPage, isLoading, isLoadingMore]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadData(data.length, true);
    }
  }, [hasMore, isLoadingMore, data.length, loadData]);

  const refresh = useCallback(() => {
    setData([]);
    setTotal(0);
    setHasMore(true);
    setError(null);
    loadData(0, false);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData(0, false);
  }, [loadData]);

  return {
    data,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    setData
  };
}