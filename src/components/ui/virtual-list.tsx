'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualListItem {
  id: string;
  height?: number;
  data: unknown;
}

interface VirtualListProps {
  items: VirtualListItem[];
  itemHeight: number;
  containerHeight: number;
  className?: string;
  renderItem: (item: VirtualListItem, index: number) => React.ReactNode;
  overscan?: number;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  getItemHeight?: (item: VirtualListItem, index: number) => number;
}

interface VisibleRange {
  start: number;
  end: number;
}

export function VirtualList({
  items,
  itemHeight: defaultItemHeight,
  containerHeight,
  className,
  renderItem,
  overscan = 5,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingComponent,
  emptyComponent,
  getItemHeight
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate item heights
  const itemHeights = useMemo(() => {
    if (getItemHeight) {
      return items.map((item, index) => getItemHeight(item, index));
    }
    return items.map(() => defaultItemHeight);
  }, [items, defaultItemHeight, getItemHeight]);

  // Calculate cumulative heights for fast position lookups
  const cumulativeHeights = useMemo(() => {
    const heights = [0];
    itemHeights.forEach(height => {
      heights.push(heights[heights.length - 1] + height);
    });
    return heights;
  }, [itemHeights]);

  const totalHeight = cumulativeHeights[cumulativeHeights.length - 1] || 0;

  // Find visible range using binary search for performance
  const visibleRange = useMemo((): VisibleRange => {
    if (items.length === 0) {
      return { start: 0, end: 0 };
    }

    const findIndex = (offset: number): number => {
      let low = 0;
      let high = cumulativeHeights.length - 1;
      
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (cumulativeHeights[mid] <= offset) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      
      return Math.max(0, high);
    };

    const start = Math.max(0, findIndex(scrollTop) - overscan);
    const end = Math.min(
      items.length,
      findIndex(scrollTop + containerHeight) + overscan + 1
    );

    return { start, end };
  }, [scrollTop, containerHeight, cumulativeHeights, items.length, overscan]);

  // Handle scroll events with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Load more items when approaching the end
    if (
      hasMore &&
      onLoadMore &&
      !loading &&
      scrollTop + containerHeight >= totalHeight - (containerHeight * 0.5)
    ) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, loading, totalHeight, containerHeight]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Get visible items with their positions
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => {
      const actualIndex = visibleRange.start + index;
      const top = cumulativeHeights[actualIndex];
      const height = itemHeights[actualIndex];
      
      return {
        item,
        index: actualIndex,
        top,
        height
      };
    });
  }, [items, visibleRange, cumulativeHeights, itemHeights]);

  // Handle empty state
  if (items.length === 0 && !loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height: containerHeight }}>
        {emptyComponent || (
          <div className="text-center text-muted-foreground">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Virtual container with total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ item, index, top, height }) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height,
              transform: isScrolling ? 'translateZ(0)' : undefined, // GPU acceleration during scroll
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: totalHeight,
              left: 0,
              right: 0,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loadingComponent || (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for managing virtual list state
export function useVirtualList<T extends VirtualListItem>(
  fetchItems: (offset: number, limit: number) => Promise<{ items: T[]; hasMore: boolean }>,
  initialLimit = 50
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (offset: number = 0, replace: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchItems(offset, initialLimit);
      
      setItems(prevItems => 
        replace ? result.items : [...prevItems, ...result.items]
      );
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [fetchItems, initialLimit, loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadItems(items.length, false);
    }
  }, [hasMore, loading, items.length, loadItems]);

  const refresh = useCallback(() => {
    loadItems(0, true);
  }, [loadItems]);

  // Initial load
  useEffect(() => {
    loadItems(0, true);
  }, [loadItems]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    refresh
  };
}

// Performance-optimized grid virtual list for calendar views
interface VirtualGridProps {
  items: VirtualListItem[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  className?: string;
  renderItem: (item: VirtualListItem, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
}

export function VirtualGrid({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  className,
  renderItem,
  gap = 0,
  overscan = 2
}: VirtualGridProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowCount = Math.ceil(items.length / itemsPerRow);
  const totalHeight = rowCount * (itemHeight + gap) - gap;

  const visibleRowStart = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const visibleRowEnd = Math.min(
    rowCount,
    Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
  );

  const visibleItems = useMemo(() => {
    const visible = [];
    for (let row = visibleRowStart; row < visibleRowEnd; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          const item = items[index];
          const x = col * (itemWidth + gap);
          const y = row * (itemHeight + gap);
          visible.push({ item, index, x, y });
        }
      }
    }
    return visible;
  }, [items, visibleRowStart, visibleRowEnd, itemsPerRow, itemWidth, itemHeight, gap]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ width: '100%', height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, x, y }) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}