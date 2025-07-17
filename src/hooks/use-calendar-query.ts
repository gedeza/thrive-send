/**
 * Calendar Query Hooks
 * React Query integration with intelligent caching for calendar data
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { CalendarEvent } from '@/components/content/types';
import { calendarCache, generateCacheKey, CACHE_CONFIGS } from '@/lib/cache/calendar-cache';
import { generateRecurringEvents, RecurringEventData } from '@/lib/utils/recurring-events';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

// Types for API responses
interface CalendarEventResponse {
  events: CalendarEvent[];
  totalCount: number;
  hasMore: boolean;
}

interface CalendarFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Query keys factory
export const calendarQueryKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarQueryKeys.all, 'events'] as const,
  eventsList: (filters: CalendarFilters) => [...calendarQueryKeys.events(), 'list', filters] as const,
  eventsDetail: (id: string) => [...calendarQueryKeys.events(), 'detail', id] as const,
  eventsMonth: (date: string, timezone: string) => [...calendarQueryKeys.events(), 'month', date, timezone] as const,
  eventsWeek: (date: string, timezone: string) => [...calendarQueryKeys.events(), 'week', date, timezone] as const,
  eventsDay: (date: string, timezone: string) => [...calendarQueryKeys.events(), 'day', date, timezone] as const,
  templates: (type?: string) => [...calendarQueryKeys.all, 'templates', type] as const,
  recurring: (seriesId: string) => [...calendarQueryKeys.all, 'recurring', seriesId] as const,
  stats: () => [...calendarQueryKeys.all, 'stats'] as const
};

// API functions
const calendarApi = {
  async getEvents(filters: CalendarFilters = {}): Promise<CalendarEventResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/calendar/events?${params}`, {
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return response.json();
  },

  async getEvent(id: string): Promise<CalendarEvent> {
    const response = await fetch(`/api/calendar/events/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    return response.json();
  },

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    }

    return response.json();
  },

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(`/api/calendar/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.status}`);
    }

    return response.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`/api/calendar/events/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }
  },

  async createRecurringEvents(data: RecurringEventData): Promise<CalendarEvent[]> {
    const response = await fetch('/api/calendar/events/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create recurring events: ${response.status}`);
    }

    return response.json();
  }
};

// Custom hooks

/**
 * Hook for fetching calendar events with intelligent caching
 */
export function useCalendarEvents(
  filters: CalendarFilters = {},
  options?: Partial<UseQueryOptions<CalendarEventResponse>>
) {
  const cacheKey = generateCacheKey.events(filters);
  
  return useQuery({
    queryKey: calendarQueryKeys.eventsList(filters),
    queryFn: async () => {
      // Try cache first
      const cached = await calendarCache.get(
        cacheKey,
        CACHE_CONFIGS.events,
        () => calendarApi.getEvents(filters)
      );
      
      if (cached) return cached;
      
      // Fallback to direct API call
      return calendarApi.getEvents(filters);
    },
    staleTime: CACHE_CONFIGS.events.ttl,
    gcTime: CACHE_CONFIGS.events.ttl * 2,
    ...options
  });
}

/**
 * Hook for fetching events for a specific month with view-optimized caching
 */
export function useMonthEvents(date: Date, timezone: string) {
  const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
  const cacheKey = generateCacheKey.monthView(format(date, 'yyyy-MM'), timezone);

  return useQuery({
    queryKey: calendarQueryKeys.eventsMonth(format(date, 'yyyy-MM'), timezone),
    queryFn: async () => {
      const cached = await calendarCache.get(
        cacheKey,
        CACHE_CONFIGS.monthView,
        () => calendarApi.getEvents({
          startDate: monthStart,
          endDate: monthEnd
        })
      );
      
      return cached || calendarApi.getEvents({
        startDate: monthStart,
        endDate: monthEnd
      });
    },
    staleTime: CACHE_CONFIGS.monthView.ttl,
    select: (data) => data.events || [],
  });
}

/**
 * Hook for fetching events for a specific week
 */
export function useWeekEvents(date: Date, timezone: string) {
  const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(date), 'yyyy-MM-dd');
  const cacheKey = generateCacheKey.weekView(format(date, 'yyyy-MM-dd'), timezone);

  return useQuery({
    queryKey: calendarQueryKeys.eventsWeek(format(date, 'yyyy-MM-dd'), timezone),
    queryFn: async () => {
      const cached = await calendarCache.get(
        cacheKey,
        CACHE_CONFIGS.monthView,
        () => calendarApi.getEvents({
          startDate: weekStart,
          endDate: weekEnd
        })
      );
      
      return cached || calendarApi.getEvents({
        startDate: weekStart,
        endDate: weekEnd
      });
    },
    staleTime: CACHE_CONFIGS.monthView.ttl,
    select: (data) => data.events || [],
  });
}

/**
 * Hook for fetching events for a specific day
 */
export function useDayEvents(date: Date, timezone: string) {
  const dayStr = format(date, 'yyyy-MM-dd');
  const cacheKey = generateCacheKey.dayView(dayStr, timezone);

  return useQuery({
    queryKey: calendarQueryKeys.eventsDay(dayStr, timezone),
    queryFn: async () => {
      const cached = await calendarCache.get(
        cacheKey,
        CACHE_CONFIGS.monthView,
        () => calendarApi.getEvents({
          startDate: dayStr,
          endDate: dayStr
        })
      );
      
      return cached || calendarApi.getEvents({
        startDate: dayStr,
        endDate: dayStr
      });
    },
    staleTime: CACHE_CONFIGS.monthView.ttl,
    select: (data) => data.events || [],
  });
}

/**
 * Hook for creating events with optimistic updates and cache invalidation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: Partial<CalendarEvent>) => {
      // Handle recurring events
      if (event.recurringData) {
        const recurringData: RecurringEventData = {
          baseEvent: event as any,
          pattern: event.recurringData.pattern,
          seriesId: event.recurringData.seriesId
        };
        return calendarApi.createRecurringEvents(recurringData);
      }
      
      return [await calendarApi.createEvent(event)];
    },
    onMutate: async (newEvent) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticEvent: CalendarEvent = {
        id: tempId,
        title: newEvent.title || 'New Event',
        description: newEvent.description || '',
        type: newEvent.type || 'custom',
        status: newEvent.status || 'draft',
        date: newEvent.date || format(new Date(), 'yyyy-MM-dd'),
        ...newEvent
      } as CalendarEvent;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: calendarQueryKeys.events() });

      // Snapshot previous value
      const previousEvents = queryClient.getQueriesData({ queryKey: calendarQueryKeys.events() });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: calendarQueryKeys.events() },
        (old: CalendarEventResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            events: [...old.events, optimisticEvent],
            totalCount: old.totalCount + 1
          };
        }
      );

      return { previousEvents, optimisticEvent };
    },
    onError: (err, newEvent, context) => {
      // Revert optimistic update
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      });
    },
    onSuccess: (events) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.events() });
      
      // Update cache
      const eventsArray = Array.isArray(events) ? events : [events];
      eventsArray.forEach(event => {
        calendarCache.invalidate('events', 'create');
      });
      
      toast({
        title: 'Success',
        description: `${eventsArray.length > 1 ? 'Events' : 'Event'} created successfully`
      });
    }
  });
}

/**
 * Hook for updating events with cache invalidation
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, event }: { id: string; event: Partial<CalendarEvent> }) =>
      calendarApi.updateEvent(id, event),
    onSuccess: (updatedEvent, { id }) => {
      // Update specific event in cache
      queryClient.setQueriesData(
        { queryKey: calendarQueryKeys.events() },
        (old: CalendarEventResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.map(event => 
              event.id === id ? updatedEvent : event
            )
          };
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.eventsDetail(id) });
      
      // Update cache
      calendarCache.invalidate('events', 'update');
      
      toast({
        title: 'Success',
        description: 'Event updated successfully'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive'
      });
    }
  });
}

/**
 * Hook for deleting events with cache cleanup
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: calendarApi.deleteEvent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: calendarQueryKeys.events() });
      
      const previousEvents = queryClient.getQueriesData({ queryKey: calendarQueryKeys.events() });

      // Optimistically remove
      queryClient.setQueriesData(
        { queryKey: calendarQueryKeys.events() },
        (old: CalendarEventResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.filter(event => event.id !== id),
            totalCount: Math.max(0, old.totalCount - 1)
          };
        }
      );

      return { previousEvents };
    },
    onError: (err, id, context) => {
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.events() });
      queryClient.removeQueries({ queryKey: calendarQueryKeys.eventsDetail(id) });
      
      // Update cache
      calendarCache.invalidate('events', 'delete');
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully'
      });
    }
  });
}

/**
 * Hook for preloading calendar data
 */
export function useCalendarPreloader() {
  const queryClient = useQueryClient();

  const preloadMonth = async (date: Date, timezone: string) => {
    const monthKey = calendarQueryKeys.eventsMonth(format(date, 'yyyy-MM'), timezone);
    
    await queryClient.prefetchQuery({
      queryKey: monthKey,
      queryFn: () => calendarApi.getEvents({
        startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(date), 'yyyy-MM-dd')
      }),
      staleTime: CACHE_CONFIGS.monthView.ttl
    });
  };

  const preloadAdjacentMonths = async (currentDate: Date, timezone: string) => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    await Promise.all([
      preloadMonth(prevMonth, timezone),
      preloadMonth(nextMonth, timezone)
    ]);
  };

  return {
    preloadMonth,
    preloadAdjacentMonths
  };
}

/**
 * Hook for cache statistics monitoring
 */
export function useCacheStats() {
  return useQuery({
    queryKey: calendarQueryKeys.stats(),
    queryFn: () => calendarCache.getStats(),
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 30000
  });
}