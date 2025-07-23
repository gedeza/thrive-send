'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { VirtualList, VirtualListItem, useVirtualList } from '@/components/ui/virtual-list';
import { CalendarEvent } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualCalendarListProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
  className?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filterType?: string;
  onFilterChange?: (type: string) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

interface EventListItem extends VirtualListItem {
  data: CalendarEvent;
}

const EVENT_ITEM_HEIGHT = 120; // Base height for event items
const CONTAINER_HEIGHT = 600; // Default container height

// Get status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'approved': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

// Get type colors
const getTypeColor = (type: string) => {
  switch (type) {
    case 'social': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    case 'blog': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    case 'email': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

// Event item component optimized for virtual rendering
const EventItem = React.memo(({ 
  event, 
  onEventClick, 
  onEventEdit, 
  onEventDelete, 
  onEventDuplicate 
}: {
  event: CalendarEvent;
  onEventClick?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}) => {
  const handleClick = useCallback(() => {
    onEventClick?.(event);
  }, [event, onEventClick]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventEdit?.(event);
  }, [event, onEventEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventDelete?.(event);
  }, [event, onEventDelete]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventDuplicate?.(event);
  }, [event, onEventDuplicate]);

  const eventDate = useMemo(() => {
    try {
      const date = parseISO(event.date);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  }, [event.date]);

  const eventTime = useMemo(() => {
    if (!event.time) return null;
    try {
      return format(new Date(`2000-01-01T${event.time}`), 'h:mm a');
    } catch {
      return event.time;
    }
  }, [event.time]);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 mb-2"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header with title and badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                {event.title}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                <Badge className={cn("text-xs", getStatusColor(event.status))}>
                  {event.status}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", getTypeColor(event.type))}>
                  {event.type}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {event.description}
              </p>
            )}

            {/* Date and time */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{eventDate}</span>
              </div>
              {eventTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{eventTime}</span>
                </div>
              )}
            </div>

            {/* Social platforms for social content */}
            {event.type === 'social' && event.socialContent?.platforms && (
              <div className="flex gap-1 flex-wrap">
                {event.socialContent.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleClick}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
});

EventItem.displayName = 'EventItem';

// Loading skeleton for event items
const EventSkeleton = React.memo(() => (
  <Card className="mb-2">
    <CardContent className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
));

EventSkeleton.displayName = 'EventSkeleton';

export function VirtualCalendarList({
  events,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventDuplicate,
  className,
  searchTerm = '',
  onSearchChange,
  filterType = 'all',
  onFilterChange,
  loading = false,
  hasMore = false,
  onLoadMore
}: VirtualCalendarListProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Convert events to virtual list items
  const listItems = useMemo((): EventListItem[] => {
    return events.map(event => ({
      id: event.id,
      height: EVENT_ITEM_HEIGHT,
      data: event
    }));
  }, [events]);

  // Filter events based on search and type
  const filteredItems = useMemo(() => {
    return listItems.filter(item => {
      const event = item.data;
      
      // Type filter
      if (filterType !== 'all' && event.type !== filterType) {
        return false;
      }
      
      // Search filter
      if (localSearchTerm) {
        const searchLower = localSearchTerm.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.type.toLowerCase().includes(searchLower) ||
          event.status.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [listItems, filterType, localSearchTerm]);

  // Handle search change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
    // Debounce the external callback
    const timeoutId = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [onSearchChange]);

  // Render individual event item
  const renderItem = useCallback((item: VirtualListItem, index: number) => {
    const eventItem = item as EventListItem;
    return (
      <EventItem
        event={eventItem.data}
        onEventClick={onEventClick}
        onEventEdit={onEventEdit}
        onEventDelete={onEventDelete}
        onEventDuplicate={onEventDuplicate}
      />
    );
  }, [onEventClick, onEventEdit, onEventDelete, onEventDuplicate]);

  // Loading component
  const loadingComponent = useMemo(() => (
    <div className="p-4">
      {Array.from({ length: 3 }, (_, i) => (
        <EventSkeleton key={i} />
      ))}
    </div>
  ), []);

  // Empty state component
  const emptyComponent = useMemo(() => (
    <div className="text-center p-8">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No events found</h3>
      <p className="text-muted-foreground">
        {localSearchTerm || filterType !== 'all' 
          ? 'Try adjusting your search or filter criteria.'
          : 'Create your first event to get started.'
        }
      </p>
    </div>
  ), [localSearchTerm, filterType]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-background/50 backdrop-blur">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={onFilterChange}>
            <SelectTrigger className="w-32 h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Virtual list */}
      <div className="flex-1">
        <VirtualList
          items={filteredItems}
          itemHeight={EVENT_ITEM_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
          renderItem={renderItem}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          loadingComponent={loadingComponent}
          emptyComponent={emptyComponent}
          overscan={3}
          className="px-4"
        />
      </div>
    </div>
  );
}

// Hook for managing virtual calendar list state
export function useVirtualCalendarList(
  fetchEvents: (offset: number, limit: number, filters?: any) => Promise<{
    events: CalendarEvent[];
    hasMore: boolean;
  }>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const virtualListData = useVirtualList<EventListItem>(
    useCallback(async (offset: number, limit: number) => {
      const result = await fetchEvents(offset, limit, {
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType
      });
      
      const items: EventListItem[] = result.events.map(event => ({
        id: event.id,
        height: EVENT_ITEM_HEIGHT,
        data: event
      }));
      
      return {
        items,
        hasMore: result.hasMore
      };
    }, [fetchEvents, searchTerm, filterType])
  );

  return {
    ...virtualListData,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType
  };
}