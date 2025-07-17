'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { CalendarEvent } from '@/components/content/content-calendar';
import { fetchCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/api/calendar-service';
import { useCalendarCache } from '@/context/CalendarCacheContext';
import { useToast } from '@/components/ui/use-toast';

interface UseCalendarQueryOptions {
  enabled?: boolean;
  cacheKey?: string;
  staleTime?: number;
  refetchInterval?: number;
}

interface UseViewEventsOptions extends UseCalendarQueryOptions {
  view: 'month' | 'week' | 'day' | 'list';
  startDate: Date;
  endDate: Date;
}

interface UseInfiniteEventsOptions extends UseCalendarQueryOptions {
  pageSize: number;
  searchTerm?: string;
  filterType?: string;
  sortBy?: 'date' | 'title' | 'type';
  sortOrder?: 'asc' | 'desc';
}

interface EventsPage {
  events: CalendarEvent[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount: number;
}

export function useCalendarQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { get: getCached, set: setCached, invalidate } = useCalendarCache();

  // Basic events query
  const useEvents = (options: UseCalendarQueryOptions = {}) => {
    return useQuery({
      queryKey: ['calendar-events', options.cacheKey || 'default'],
      queryFn: async () => {
        const events = await fetchCalendarEvents({
          cacheEnabled: true,
          lastCacheInvalidation: Date.now()
        });
        return events;
      },
      enabled: options.enabled !== false,
      staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
      refetchInterval: options.refetchInterval,
    });
  };

  // View-specific events query
  const useViewEvents = (options: UseViewEventsOptions) => {
    return useQuery({
      queryKey: ['calendar-events', 'view', options.view, options.cacheKey],
      queryFn: async () => {
        const cacheKey = `view-${options.view}-${options.startDate.toISOString()}-${options.endDate.toISOString()}`;
        
        // Try cache first
        const cached = await getCached(cacheKey);
        if (cached) return cached;

        // Fetch fresh data
        const events = await fetchCalendarEvents({
          cacheEnabled: true,
          lastCacheInvalidation: Date.now()
        });

        // Filter events for the view
        const filtered = events.filter(event => {
          const eventDate = new Date(event.startTime);
          return eventDate >= options.startDate && eventDate <= options.endDate;
        });

        // Cache the filtered results
        await setCached(cacheKey, filtered, { ttl: 3 * 60 * 1000 }); // 3 minutes
        
        return filtered;
      },
      enabled: options.enabled !== false,
      staleTime: options.staleTime || 3 * 60 * 1000, // 3 minutes
    });
  };

  // Infinite events query for virtualization
  const useInfiniteEvents = (options: UseInfiniteEventsOptions) => {
    return useInfiniteQuery({
      queryKey: ['calendar-events', 'infinite', options.searchTerm, options.filterType, options.sortBy, options.sortOrder],
      queryFn: async ({ pageParam = '' }): Promise<EventsPage> => {
        // Simulate API call with cursor-based pagination
        const events = await fetchCalendarEvents({
          cacheEnabled: true,
          lastCacheInvalidation: Date.now()
        });

        let filteredEvents = events;

        // Apply search filter
        if (options.searchTerm) {
          const searchLower = options.searchTerm.toLowerCase();
          filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(searchLower) ||
            event.description?.toLowerCase().includes(searchLower)
          );
        }

        // Apply type filter
        if (options.filterType && options.filterType !== 'all') {
          filteredEvents = filteredEvents.filter(event => event.type === options.filterType);
        }

        // Apply sorting
        if (options.sortBy) {
          filteredEvents.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (options.sortBy) {
              case 'date':
                aValue = new Date(a.startTime);
                bValue = new Date(b.startTime);
                break;
              case 'title':
                aValue = a.title;
                bValue = b.title;
                break;
              case 'type':
                aValue = a.type;
                bValue = b.type;
                break;
              default:
                aValue = new Date(a.startTime);
                bValue = new Date(b.startTime);
            }

            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return options.sortOrder === 'desc' ? -comparison : comparison;
          });
        }

        // Implement pagination
        const startIndex = pageParam ? parseInt(pageParam) : 0;
        const endIndex = startIndex + options.pageSize;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
        const hasMore = endIndex < filteredEvents.length;
        const nextCursor = hasMore ? endIndex.toString() : undefined;

        return {
          events: paginatedEvents,
          nextCursor,
          hasMore,
          totalCount: filteredEvents.length
        };
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: options.enabled !== false,
      staleTime: options.staleTime || 5 * 60 * 1000,
    });
  };

  // Create event mutation
  const useCreateEvent = () => {
    return useMutation({
      mutationFn: async (eventData: Omit<CalendarEvent, 'id'>) => {
        return await createCalendarEvent(eventData);
      },
      onSuccess: (newEvent) => {
        // Invalidate and refetch calendar events
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        
        // Invalidate cache
        invalidate(/calendar-events/);
        
        toast({
          title: 'Event Created',
          description: `"${newEvent.title}" has been created successfully.`,
        });
      },
      onError: (error) => {
        console.error('Error creating event:', error);
        toast({
          title: 'Error',
          description: 'Failed to create event. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update event mutation
  const useUpdateEvent = () => {
    return useMutation({
      mutationFn: async (eventData: CalendarEvent) => {
        return await updateCalendarEvent(eventData);
      },
      onSuccess: (updatedEvent) => {
        // Invalidate and refetch calendar events
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        
        // Invalidate cache
        invalidate(/calendar-events/);
        
        toast({
          title: 'Event Updated',
          description: `"${updatedEvent.title}" has been updated successfully.`,
        });
      },
      onError: (error) => {
        console.error('Error updating event:', error);
        toast({
          title: 'Error',
          description: 'Failed to update event. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete event mutation
  const useDeleteEvent = () => {
    return useMutation({
      mutationFn: async (eventId: string) => {
        return await deleteCalendarEvent(eventId);
      },
      onSuccess: () => {
        // Invalidate and refetch calendar events
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        
        // Invalidate cache
        invalidate(/calendar-events/);
        
        toast({
          title: 'Event Deleted',
          description: 'Event has been deleted successfully.',
        });
      },
      onError: (error) => {
        console.error('Error deleting event:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete event. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    useEvents,
    useViewEvents,
    useInfiniteEvents,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
  };
}