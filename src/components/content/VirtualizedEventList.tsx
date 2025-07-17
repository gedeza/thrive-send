'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { CalendarEvent } from './types';
import { format, isSameDay, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimezone } from '@/hooks/use-timezone';
import { eventTypeColorMap } from './content-calendar';
import { Edit, Trash2, Calendar, Clock, ExternalLink } from 'lucide-react';

interface VirtualizedEventListProps {
  events: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onEventSelect?: (event: CalendarEvent) => void;
  selectedEventIds?: Set<string>;
  isLoading?: boolean;
  loadMoreEvents?: () => void;
  hasMore?: boolean;
  height?: number;
  itemHeight?: number;
  searchTerm?: string;
  filterType?: string;
  className?: string;
}

interface EventItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    events: CalendarEvent[];
    onEventEdit: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
    onEventSelect?: (event: CalendarEvent) => void;
    selectedEventIds?: Set<string>;
    userTimezone: string;
  };
}

const EventItem: React.FC<EventItemProps> = ({ index, style, data }) => {
  const { events, onEventEdit, onEventDelete, onEventSelect, selectedEventIds, userTimezone } = data;
  const event = events[index];

  if (!event) {
    return (
      <div style={style} className="p-4 border-b">
        <EventItemSkeleton />
      </div>
    );
  }

  const isSelected = selectedEventIds?.has(event.id);
  const colorClasses = eventTypeColorMap[event.type];
  const startTime = parseISO(event.startTime);
  const endTime = parseISO(event.endTime);

  return (
    <div
      style={style}
      className={cn(
        "p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
        isSelected && "bg-primary/10 border-primary"
      )}
      onClick={() => onEventSelect?.(event)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={cn("text-xs", colorClasses.bg, colorClasses.text)}>
              {event.type}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatInTimeZone(startTime, userTimezone, 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatInTimeZone(startTime, userTimezone, 'h:mm a')} - {formatInTimeZone(endTime, userTimezone, 'h:mm a')}
            </div>
          </div>
          
          <h3 className="font-medium text-sm mb-1 truncate">{event.title}</h3>
          
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {event.description}
            </p>
          )}

          {/* Platform badges for social content */}
          {event.type === 'social' && event.socialMediaContent?.platforms && (
            <div className="flex gap-1 flex-wrap">
              {event.socialMediaContent.platforms.map((platform) => (
                <Badge key={platform} variant="outline" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEventEdit(event);
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEventDelete(event.id);
            }}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const EventItemSkeleton: React.FC = () => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

const LoadingIndicator: React.FC = () => (
  <div className="p-4 text-center">
    <div className="flex items-center justify-center gap-2">
      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Loading more events...</span>
    </div>
  </div>
);

export const VirtualizedEventList: React.FC<VirtualizedEventListProps> = ({
  events,
  onEventEdit,
  onEventDelete,
  onEventSelect,
  selectedEventIds,
  isLoading = false,
  loadMoreEvents,
  hasMore = false,
  height = 600,
  itemHeight = 120,
  searchTerm = '',
  filterType = '',
  className
}) => {
  const { userTimezone } = useTimezone();
  const listRef = useRef<List>(null);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);

  // Filter events based on search and filter criteria
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    return filtered;
  }, [events, searchTerm, filterType]);

  // Handle scroll to load more events
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }: any) => {
    if (scrollUpdateWasRequested) return;

    const containerHeight = height;
    const totalHeight = filteredEvents.length * itemHeight;
    const scrollPercentage = (scrollOffset + containerHeight) / totalHeight;

    // Load more when scrolled to 80% of the list
    if (scrollPercentage > 0.8 && hasMore && !isLoading && !shouldLoadMore) {
      setShouldLoadMore(true);
    }
  }, [height, itemHeight, filteredEvents.length, hasMore, isLoading, shouldLoadMore]);

  // Trigger load more when needed
  useEffect(() => {
    if (shouldLoadMore && loadMoreEvents) {
      loadMoreEvents();
      setShouldLoadMore(false);
    }
  }, [shouldLoadMore, loadMoreEvents]);

  // Create item data for react-window
  const itemData = useMemo(() => ({
    events: filteredEvents,
    onEventEdit,
    onEventDelete,
    onEventSelect,
    selectedEventIds,
    userTimezone
  }), [filteredEvents, onEventEdit, onEventDelete, onEventSelect, selectedEventIds, userTimezone]);

  if (filteredEvents.length === 0 && !isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No events found</h3>
        <p className="text-sm text-muted-foreground text-center">
          {searchTerm || filterType ? 'Try adjusting your filters' : 'Create your first event to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <List
        ref={listRef}
        height={height}
        itemCount={filteredEvents.length + (hasMore ? 1 : 0)}
        itemSize={itemHeight}
        itemData={itemData}
        onScroll={handleScroll}
        overscanCount={5}
      >
        {({ index, style }) => {
          // Show loading indicator at the end
          if (index === filteredEvents.length) {
            return (
              <div style={style}>
                <LoadingIndicator />
              </div>
            );
          }

          return <EventItem index={index} style={style} data={itemData} />;
        }}
      </List>
    </div>
  );
};