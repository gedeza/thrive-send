'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarEvent, CalendarView } from './types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { InfiniteEventLoader } from './InfiniteEventLoader';
import { CalendarHeader } from './CalendarHeader';
import { useCalendarQuery } from '@/hooks/use-calendar-query';
import { useCalendarCache } from '@/context/CalendarCacheContext';
import { useTimezone } from '@/hooks/use-timezone';
import { 
  CalendarGridSkeleton, 
  WeekViewSkeleton, 
  DayViewSkeleton, 
  EventListSkeleton,
  CalendarHeaderSkeleton
} from './LoadingSkeletons';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ProgressiveCalendarProps {
  events: CalendarEvent[];
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  onEventUpdate: (event: CalendarEvent) => Promise<CalendarEvent>;
  onEventDelete: (eventId: string) => Promise<boolean>;
  fetchEvents: () => Promise<CalendarEvent[]>;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
}

interface ViewportEvent extends CalendarEvent {
  isInViewport: boolean;
  priority: 'high' | 'medium' | 'low';
}

const EVENT_BATCH_SIZE = 100;
const VIEWPORT_BUFFER_DAYS = 7;

export const ProgressiveCalendar: React.FC<ProgressiveCalendarProps> = ({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  fetchEvents,
  defaultView = 'month',
  onViewChange,
  selectedDate = new Date(),
  onDateChange,
  className
}) => {
  const { userTimezone } = useTimezone();
  const { get: getCached, set: setCached, invalidate } = useCalendarCache();
  const { useViewEvents } = useCalendarQuery();

  // State management
  const [currentView, setCurrentView] = useState<CalendarView>(defaultView);
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedEvents, setLoadedEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());

  // Refs for performance optimization
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastViewportCheck = useRef<Date>(new Date());

  // Calculate viewport date range based on current view
  const getViewportDateRange = useCallback((view: CalendarView, date: Date) => {
    switch (view) {
      case 'month':
        return {
          start: startOfWeek(startOfMonth(date)),
          end: endOfWeek(endOfMonth(date))
        };
      case 'week':
        return {
          start: startOfWeek(date),
          end: endOfWeek(date)
        };
      case 'day':
        return {
          start: startOfDay(date),
          end: endOfDay(date)
        };
      case 'list':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      default:
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
    }
  }, []);

  // Query for view-specific events with progressive loading
  const { start: viewStart, end: viewEnd } = getViewportDateRange(currentView, currentDate);
  const {
    data: viewEvents,
    isLoading: isViewLoading,
    error: viewError,
    refetch: refetchViewEvents
  } = useViewEvents({
    view: currentView,
    startDate: viewStart,
    endDate: viewEnd,
    cacheKey: `${currentView}-${format(currentDate, 'yyyy-MM-dd')}`,
    enabled: true
  });

  // Prioritize events based on viewport and relevance
  const prioritizedEvents = useMemo(() => {
    const { start, end } = getViewportDateRange(currentView, currentDate);
    
    return loadedEvents.map(event => {
      const eventDate = new Date(event.startTime);
      const isInViewport = eventDate >= start && eventDate <= end;
      
      // Priority calculation
      let priority: 'high' | 'medium' | 'low' = 'low';
      
      if (isInViewport) {
        const daysFromToday = Math.abs(Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysFromToday <= 1) priority = 'high';
        else if (daysFromToday <= 7) priority = 'medium';
        else priority = 'low';
      }
      
      return {
        ...event,
        isInViewport,
        priority
      } as ViewportEvent;
    }).sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [loadedEvents, currentView, currentDate, getViewportDateRange]);

  // Handle view change with progressive loading
  const handleViewChange = useCallback(async (view: CalendarView) => {
    setCurrentView(view);
    setIsLoading(true);
    setError(null);
    
    try {
      // Preload events for the new view
      const { start, end } = getViewportDateRange(view, currentDate);
      const cacheKey = `${view}-${format(currentDate, 'yyyy-MM-dd')}`;
      
      // Check cache first
      const cachedEvents = await getCached(cacheKey);
      if (cachedEvents) {
        setLoadedEvents(cachedEvents);
      } else {
        // Fetch new events
        const newEvents = await fetchEvents();
        await setCached(cacheKey, newEvents, { ttl: 300000 }); // 5 minutes
        setLoadedEvents(newEvents);
      }
      
      onViewChange?.(view);
    } catch (error) {
      console.error('Error changing view:', error);
      setError('Failed to load calendar view');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, getViewportDateRange, getCached, setCached, fetchEvents, onViewChange]);

  // Handle date change with preloading
  const handleDateChange = useCallback(async (date: Date) => {
    setCurrentDate(date);
    setIsLoading(true);
    setError(null);
    
    try {
      // Preload events for the new date range
      const { start, end } = getViewportDateRange(currentView, date);
      const cacheKey = `${currentView}-${format(date, 'yyyy-MM-dd')}`;
      
      // Check cache first
      const cachedEvents = await getCached(cacheKey);
      if (cachedEvents) {
        setLoadedEvents(cachedEvents);
      } else {
        // Fetch new events
        const newEvents = await fetchEvents();
        await setCached(cacheKey, newEvents, { ttl: 300000 }); // 5 minutes
        setLoadedEvents(newEvents);
      }
      
      onDateChange?.(date);
    } catch (error) {
      console.error('Error changing date:', error);
      setError('Failed to load events for selected date');
    } finally {
      setIsLoading(false);
    }
  }, [currentView, getViewportDateRange, getCached, setCached, fetchEvents, onDateChange]);

  // Handle event operations with optimistic updates
  const handleEventCreate = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      // Optimistic update
      const tempEvent = { ...eventData, id: `temp-${Date.now()}` } as CalendarEvent;
      setLoadedEvents(prev => [...prev, tempEvent]);
      
      // Actual API call
      const createdEvent = await onEventCreate(eventData);
      
      // Replace temporary event with real one
      setLoadedEvents(prev => 
        prev.map(event => event.id === tempEvent.id ? createdEvent : event)
      );
      
      // Invalidate cache
      await invalidate('events');
      
      return createdEvent;
    } catch (error) {
      // Rollback optimistic update
      setLoadedEvents(prev => prev.filter(event => !event.id.startsWith('temp-')));
      throw error;
    }
  }, [onEventCreate, invalidate]);

  const handleEventUpdate = useCallback(async (event: CalendarEvent) => {
    try {
      // Optimistic update
      setLoadedEvents(prev => prev.map(e => e.id === event.id ? event : e));
      
      // Actual API call
      const updatedEvent = await onEventUpdate(event);
      
      // Update with server response
      setLoadedEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      
      // Invalidate cache
      await invalidate('events');
      
      return updatedEvent;
    } catch (error) {
      // Rollback optimistic update
      refetchViewEvents();
      throw error;
    }
  }, [onEventUpdate, invalidate, refetchViewEvents]);

  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      // Optimistic update
      setLoadedEvents(prev => prev.filter(e => e.id !== eventId));
      
      // Actual API call
      const success = await onEventDelete(eventId);
      
      if (!success) {
        // Rollback if failed
        refetchViewEvents();
      }
      
      // Invalidate cache
      await invalidate('events');
      
      return success;
    } catch (error) {
      // Rollback optimistic update
      refetchViewEvents();
      throw error;
    }
  }, [onEventDelete, invalidate, refetchViewEvents]);

  // Handle refresh with cache invalidation
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await invalidate('events');
      const freshEvents = await fetchEvents();
      setLoadedEvents(freshEvents);
    } catch (error) {
      console.error('Error refreshing calendar:', error);
      setError('Failed to refresh calendar');
    } finally {
      setIsLoading(false);
    }
  }, [invalidate, fetchEvents]);

  // Error boundary component
  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300 flex-1">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render calendar content based on view
  const renderCalendarContent = () => {
    if (isLoading || isViewLoading) {
      switch (currentView) {
        case 'month':
          return <CalendarGridSkeleton />;
        case 'week':
          return <WeekViewSkeleton />;
        case 'day':
          return <DayViewSkeleton />;
        case 'list':
          return <EventListSkeleton />;
        default:
          return <CalendarGridSkeleton />;
      }
    }

    const eventsToRender = viewEvents || prioritizedEvents;

    switch (currentView) {
      case 'month':
        return (
          <MonthView
            events={eventsToRender}
            selectedDate={currentDate}
            onDateSelect={handleDateChange}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            selectedEventIds={selectedEventIds}
            onEventSelectionChange={setSelectedEventIds}
          />
        );
      case 'week':
        return (
          <WeekView
            events={eventsToRender}
            selectedDate={currentDate}
            onDateSelect={handleDateChange}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            selectedEventIds={selectedEventIds}
            onEventSelectionChange={setSelectedEventIds}
          />
        );
      case 'day':
        return (
          <DayView
            events={eventsToRender}
            selectedDate={currentDate}
            onDateSelect={handleDateChange}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            selectedEventIds={selectedEventIds}
            onEventSelectionChange={setSelectedEventIds}
          />
        );
      case 'list':
        return (
          <InfiniteEventLoader
            initialEvents={eventsToRender}
            onEventEdit={handleEventUpdate}
            onEventDelete={handleEventDelete}
            onEventSelect={(event) => {
              setSelectedEventIds(new Set([event.id]));
            }}
            selectedEventIds={selectedEventIds}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full", className)} ref={viewportRef}>
      {/* Calendar Header */}
      {isLoading ? (
        <CalendarHeaderSkeleton />
      ) : (
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={handleDateChange}
          currentView={currentView}
          onViewChange={handleViewChange}
          events={prioritizedEvents}
          selectedEventIds={selectedEventIds}
          onEventSelectionChange={setSelectedEventIds}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}

      {/* Calendar Content */}
      <div className="mt-4">
        {renderCalendarContent()}
      </div>
    </div>
  );
};