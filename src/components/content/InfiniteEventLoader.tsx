'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarEvent } from './types';
import { VirtualizedEventList } from './VirtualizedEventList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { useCalendarQuery } from '@/hooks/use-calendar-query';
import { useCalendarCache } from '@/context/CalendarCacheContext';
import { useToast } from '@/components/ui/use-toast';

interface InfiniteEventLoaderProps {
  initialEvents?: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onEventSelect?: (event: CalendarEvent) => void;
  selectedEventIds?: Set<string>;
  pageSize?: number;
  className?: string;
}

interface EventsPage {
  events: CalendarEvent[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount: number;
}

const EVENTS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 300;

export const InfiniteEventLoader: React.FC<InfiniteEventLoaderProps> = ({
  initialEvents = [],
  onEventEdit,
  onEventDelete,
  onEventSelect,
  selectedEventIds,
  pageSize = EVENTS_PER_PAGE,
  className
}) => {
  const { toast } = useToast();
  const { invalidateCache } = useCalendarCache();
  const { useInfiniteEvents } = useCalendarQuery();

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Infinite query configuration
  const queryConfig = useMemo(() => ({
    pageSize,
    searchTerm: debouncedSearchTerm,
    filterType: filterType === 'all' ? undefined : filterType,
    sortBy,
    sortOrder
  }), [pageSize, debouncedSearchTerm, filterType, sortBy, sortOrder]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteEvents(queryConfig);

  // Flatten all pages into a single array
  const allEvents = useMemo(() => {
    if (!data?.pages) return initialEvents;
    
    const flattenedEvents = data.pages.flatMap(page => page.events);
    
    // Deduplicate events by ID
    const uniqueEvents = flattenedEvents.reduce((acc, event) => {
      if (!acc.some(e => e.id === event.id)) {
        acc.push(event);
      }
      return acc;
    }, [] as CalendarEvent[]);

    return uniqueEvents;
  }, [data?.pages, initialEvents]);

  // Total count from the last page
  const totalCount = data?.pages?.[data.pages.length - 1]?.totalCount ?? 0;

  // Handle load more events
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((value: string) => {
    setFilterType(value);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field: 'date' | 'title' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    invalidateCache('events');
    refetch();
    toast({
      title: 'Events Refreshed',
      description: 'Event list has been updated with the latest data',
    });
  }, [invalidateCache, refetch, toast]);

  // Handle event deletion with optimistic updates
  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      await onEventDelete(eventId);
      // Invalidate cache to refresh the list
      invalidateCache('events');
      refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onEventDelete, invalidateCache, refetch, toast]);

  // Handle event edit
  const handleEventEdit = useCallback(async (event: CalendarEvent) => {
    try {
      await onEventEdit(event);
      // Invalidate cache to refresh the list
      invalidateCache('events');
      refetch();
    } catch (error) {
      console.error('Error editing event:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit event. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onEventEdit, invalidateCache, refetch, toast]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive mb-4">
          <Calendar className="h-12 w-12 mx-auto mb-2" />
          <p className="text-center">Failed to load events</p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'title' | 'type')}>
            <SelectTrigger className="w-[120px]">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>
          Showing {allEvents.length} of {totalCount} events
          {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
        </span>
        {hasNextPage && (
          <span>
            {isFetchingNextPage ? 'Loading more...' : `${totalCount - allEvents.length} more available`}
          </span>
        )}
      </div>

      {/* Virtualized Event List */}
      <VirtualizedEventList
        events={allEvents}
        onEventEdit={handleEventEdit}
        onEventDelete={handleEventDelete}
        onEventSelect={onEventSelect}
        selectedEventIds={selectedEventIds}
        isLoading={isLoading}
        loadMoreEvents={handleLoadMore}
        hasMore={hasNextPage}
        searchTerm={debouncedSearchTerm}
        filterType={filterType}
        height={600}
        itemHeight={120}
      />
    </div>
  );
};