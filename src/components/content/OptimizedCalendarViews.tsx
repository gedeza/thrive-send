'use client';

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { VirtualGrid } from '@/components/ui/virtual-list';
import { ProgressiveLoader } from '@/components/ui/progressive-loader';
import { CalendarEvent } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { Calendar, Clock, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

// Dynamic imports for code splitting
const EventForm = React.lazy(() => import('./EventForm'));
const TemplateSelector = React.lazy(() => import('./TemplateSelector'));

interface OptimizedMonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  loading?: boolean;
  className?: string;
}

interface OptimizedListViewProps {
  fetchEvents: (offset: number, limit: number) => Promise<{
    events: CalendarEvent[];
    hasMore: boolean;
    total?: number;
  }>;
  onEventClick?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  className?: string;
}

const GRID_CELL_WIDTH = 180;
const GRID_CELL_HEIGHT = 140;
const GRID_GAP = 8;

// Optimized month view with virtualization for large datasets
export function OptimizedMonthView({
  events,
  currentDate,
  onDateChange,
  onEventClick,
  onDateClick,
  loading = false,
  className
}: OptimizedMonthViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group events by date for efficient lookup
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const dateKey = event.date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    return grouped;
  }, [events]);

  // Calculate grid dimensions
  const containerWidth = useMemo(() => {
    return Math.min(window?.innerWidth || 1200, 1200);
  }, []);

  const itemsPerRow = Math.floor((containerWidth - 64) / (GRID_CELL_WIDTH + GRID_GAP));
  const gridWidth = itemsPerRow * (GRID_CELL_WIDTH + GRID_GAP) - GRID_GAP;
  const gridHeight = Math.ceil(calendarDays.length / itemsPerRow) * (GRID_CELL_HEIGHT + GRID_GAP);

  // Convert calendar days to virtual grid items
  const gridItems = useMemo(() => {
    return calendarDays.map((date, index) => ({
      id: format(date, 'yyyy-MM-dd'),
      data: {
        date,
        events: eventsByDate.get(format(date, 'yyyy-MM-dd')) || [],
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isSameDay(date, new Date())
      }
    }));
  }, [calendarDays, eventsByDate, currentDate]);

  const handleDateClick = useCallback((date: Date) => {
    onDateClick?.(date);
  }, [onDateClick]);

  const handleEventClick = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  }, [onEventClick]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1);
    onDateChange(newDate);
  }, [currentDate, onDateChange]);

  // Render calendar day cell
  const renderDayCell = useCallback((item: any, index: number) => {
    const { date, events, isCurrentMonth, isToday } = item.data;
    const isHovered = hoveredDate && isSameDay(date, hoveredDate);

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 h-full",
          !isCurrentMonth && "opacity-50",
          isToday && "ring-2 ring-primary",
          isHovered && "shadow-md scale-105",
          events.length > 0 && "border-primary/30"
        )}
        onClick={() => handleDateClick(date)}
        onMouseEnter={() => setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <CardContent className="p-2 h-full flex flex-col">
          {/* Date header */}
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-medium",
              isToday && "text-primary font-bold"
            )}>
              {format(date, 'd')}
            </span>
            {events.length > 0 && (
              <Badge variant="secondary" className="text-xs h-5">
                {events.length}
              </Badge>
            )}
          </div>

          {/* Events preview */}
          <div className="flex-1 space-y-1 overflow-hidden">
            {events.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={(e) => handleEventClick(event, e)}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{events.length - 3} more
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }, [handleDateClick, handleEventClick, hoveredDate]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Virtual grid calendar */}
      <div className="min-h-[600px]">
        <VirtualGrid
          items={gridItems}
          itemWidth={GRID_CELL_WIDTH}
          itemHeight={GRID_CELL_HEIGHT}
          containerWidth={gridWidth}
          containerHeight={600}
          gap={GRID_GAP}
          renderItem={renderDayCell}
          className="mx-auto"
        />
      </div>
    </div>
  );
}

// Optimized list view with progressive loading
export function OptimizedListView({
  fetchEvents,
  onEventClick,
  onEventEdit,
  onEventDelete,
  className
}: OptimizedListViewProps) {
  const renderEventItem = useCallback((event: CalendarEvent, index: number) => {
    const eventDate = parseISO(event.date);
    const eventTime = event.time ? format(new Date(`2000-01-01T${event.time}`), 'h:mm a') : null;

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onEventClick?.(event)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="font-medium line-clamp-2 flex-1">{event.title}</h3>
                <div className="flex gap-1 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {event.status}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {event.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(eventDate, 'MMM d, yyyy')}</span>
                </div>
                {eventTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{eventTime}</span>
                  </div>
                )}
              </div>
            </div>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [onEventClick]);

  const renderSkeleton = useCallback(() => (
    <div className="space-y-4">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} className="h-24" />
      ))}
    </div>
  ), []);

  const renderEmpty = useCallback(() => (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No events found</h3>
      <p className="text-muted-foreground">Create your first event to get started.</p>
    </div>
  ), []);

  return (
    <div className={cn("space-y-4", className)}>
      <ProgressiveLoader
        fetchData={fetchEvents}
        renderItem={renderEventItem}
        renderSkeleton={renderSkeleton}
        renderEmpty={renderEmpty}
        itemsPerPage={20}
        autoLoad={true}
        getItemKey={(event) => event.id}
        className="space-y-4"
        loadingText="Loading events..."
        emptyText="No events to display"
      />
    </div>
  );
}

// Performance-optimized calendar wrapper with lazy loading
interface OptimizedCalendarProps {
  view: 'month' | 'week' | 'day' | 'list';
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: string) => void;
  fetchEvents?: (offset: number, limit: number) => Promise<{
    events: CalendarEvent[];
    hasMore: boolean;
    total?: number;
  }>;
  onEventClick?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  loading?: boolean;
  className?: string;
}

export function OptimizedCalendar({
  view,
  events,
  currentDate,
  onDateChange,
  onViewChange,
  fetchEvents,
  onEventClick,
  onEventEdit,
  onEventDelete,
  loading = false,
  className
}: OptimizedCalendarProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleDateClick = useCallback((date: Date) => {
    setShowTemplateSelector(true);
  }, []);

  const renderView = useCallback(() => {
    switch (view) {
      case 'month':
        return (
          <OptimizedMonthView
            events={events}
            currentDate={currentDate}
            onDateChange={onDateChange}
            onEventClick={onEventClick}
            onDateClick={handleDateClick}
            loading={loading}
          />
        );
      
      case 'list':
        if (!fetchEvents) {
          return <div>List view requires fetchEvents prop</div>;
        }
        return (
          <OptimizedListView
            fetchEvents={fetchEvents}
            onEventClick={onEventClick}
            onEventEdit={onEventEdit}
            onEventDelete={onEventDelete}
          />
        );
      
      default:
        return <div>View not implemented with optimization</div>;
    }
  }, [view, events, currentDate, onDateChange, onEventClick, onEventEdit, onEventDelete, handleDateClick, loading, fetchEvents]);

  return (
    <div className={cn("w-full", className)}>
      {renderView()}

      {/* Lazy-loaded modals */}
      {showEventForm && (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EventForm 
            onCancel={() => setShowEventForm(false)}
            onSubmit={() => setShowEventForm(false)}
          />
        </Suspense>
      )}

      {showTemplateSelector && (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <TemplateSelector
            onCancel={() => setShowTemplateSelector(false)}
            onTemplateSelect={() => {
              setShowTemplateSelector(false);
              setShowEventForm(true);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}