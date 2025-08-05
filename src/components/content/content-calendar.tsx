'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import { EventPreview } from './EventPreview';
import { CacheControl } from './CacheControl';
import { ContentCalendarSync } from './ContentCalendarSync';
import { CalendarEvent, CalendarView, ContentType, SocialPlatform } from './types';
import { useToast } from '@/components/ui/use-toast';
import { useCalendarCache } from '@/context/CalendarCacheContext';
import { useTimezone } from '@/hooks/use-timezone';
import { cn } from '@/lib/utils';

// TDD-required interface with all specifications
interface ContentCalendarProps {
  // Core functionality
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (date: Date, time?: string) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  
  // View management
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  supportedViews?: CalendarView[];
  
  // Date and timezone
  userTimezone?: string;
  defaultDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  
  // Filtering and search
  onSearch?: (term: string) => void;
  onFilter?: (filters: { type?: string; status?: string }) => void;
  showFilters?: boolean;
  
  // Performance and caching
  enableCache?: boolean;
  cacheTimeout?: number;
  maxEventsPerDay?: number;
  enableVirtualization?: boolean;
  
  // Drag and drop
  enableDragDrop?: boolean;
  onEventDrop?: (event: CalendarEvent, newDate: Date, newTime?: string) => void;
  
  // Bulk operations
  enableBulkSelection?: boolean;
  onBulkAction?: (action: string, events: CalendarEvent[]) => void;
  
  // Export functionality
  enableExport?: boolean;
  exportFormats?: string[];
  
  // Sync capabilities
  enableSync?: boolean;
  onSync?: () => Promise<void>;
  
  // Preview system
  enablePreview?: boolean;
  previewDelay?: number;
  
  // Analytics integration
  enableAnalytics?: boolean;
  onAnalyticsEvent?: (event: string, data: any) => void;
  
  // Accessibility
  ariaLabel?: string;
  keyboardNavigation?: boolean;
  
  // Customization
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  customColors?: Record<string, string>;
  
  // Loading states
  loading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  
  // Error handling
  onError?: (error: Error) => void;
  errorBoundary?: boolean;
}

// Default configuration following TDD specifications
const DEFAULT_CONFIG = {
  defaultView: 'month' as CalendarView,
  supportedViews: ['month', 'week', 'day', 'list'] as CalendarView[],
  enableCache: true,
  cacheTimeout: 300000, // 5 minutes
  maxEventsPerDay: 10,
  enableVirtualization: true,
  enableDragDrop: true,
  enableBulkSelection: true,
  enableExport: true,
  exportFormats: ['ical', 'csv', 'json'],
  enableSync: true,
  enablePreview: true,
  previewDelay: 500,
  enableAnalytics: true,
  keyboardNavigation: true,
  theme: 'auto' as const,
  errorBoundary: true,
  showFilters: true
};

export function ContentCalendar(props: ContentCalendarProps = {}) {
  // Merge props with defaults
  const config = { ...DEFAULT_CONFIG, ...props };
  
  // Core state management
  const [currentView, setCurrentView] = useState<CalendarView>(config.defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(config.defaultDate || new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(config.events || []);
  const [loading, setLoading] = useState(false);
  
  // TDD-required intelligent caching system
  const [cacheStatus, setCacheStatus] = useState({
    lastUpdate: null as Date | null,
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    size: 0
  });
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Selection and preview
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Drag and drop
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const userTimezone = useTimezone();
  const { 
    getCachedEvents, 
    setCachedEvents, 
    isCachingEnabled, 
    clearAllCaches 
  } = useCalendarCache();
  
  // TDD-required timezone handling
  const effectiveTimezone = config.userTimezone || userTimezone;
  
  // TDD-required Advanced Analytics Integration
  const analyticsRef = useRef({
    sessionStartTime: Date.now(),
    interactions: 0,
    viewChanges: 0,
    searches: 0,
    dragDrops: 0,
    previews: 0
  });
  
  // Cleanup preview timer on unmount
  useEffect(() => {
    return () => {
      if (previewTimer) {
        clearTimeout(previewTimer);
      }
    };
  }, [previewTimer]);
  
  // Track view changes
  useEffect(() => {
    trackAnalyticsEvent('calendar_view_load', {
      view: currentView,
      dateRange: formatInTimeZone(currentDate, effectiveTimezone, 'MMMM yyyy')
    });
  }, [currentView, currentDate, trackAnalyticsEvent]);
  
  // Track search and filter usage - moved after filteredEvents definition
  
  // TDD-required intelligent cache management
  const intelligentCacheKey = useMemo(() => {
    return `calendar_${formatInTimeZone(currentDate, effectiveTimezone, 'yyyy-MM')}_${currentView}_${searchTerm}_${selectedType}_${selectedStatus}`;
  }, [currentDate, effectiveTimezone, currentView, searchTerm, selectedType, selectedStatus]);
  
  // Smart cache retrieval with analytics
  const getEventsWithCache = useCallback(async () => {
    if (!config.enableCache || !isCachingEnabled) {
      setCacheStatus(prev => ({ ...prev, totalRequests: prev.totalRequests + 1, missRate: prev.missRate + 1 }));
      return config.events || [];
    }
    
    const cachedData = getCachedEvents(intelligentCacheKey);
    
    if (cachedData && cachedData.timestamp > Date.now() - (config.cacheTimeout || 300000)) {
      // Cache hit
      setCacheStatus(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        hitRate: prev.hitRate + 1,
        lastUpdate: new Date(cachedData.timestamp)
      }));
      
      trackAnalyticsEvent('cache_hit', {
        cacheKey: intelligentCacheKey,
        cacheAge: Date.now() - cachedData.timestamp,
        eventsCount: cachedData.events.length
      });
      
      return cachedData.events;
    } else {
      // Cache miss
      setCacheStatus(prev => ({ ...prev, totalRequests: prev.totalRequests + 1, missRate: prev.missRate + 1 }));
      
      trackAnalyticsEvent('cache_miss', {
        cacheKey: intelligentCacheKey,
        reason: cachedData ? 'expired' : 'not_found'
      });
      
      const freshEvents = config.events || [];
      
      // Cache the fresh data
      setCachedEvents(intelligentCacheKey, {
        events: freshEvents,
        timestamp: Date.now(),
        metadata: {
          view: currentView,
          dateRange: formatInTimeZone(currentDate, effectiveTimezone, 'MMMM yyyy'),
          filters: { type: selectedType, status: selectedStatus, search: searchTerm }
        }
      });
      
      setCacheStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        size: prev.size + 1
      }));
      
      return freshEvents;
    }
  }, [config, isCachingEnabled, getCachedEvents, setCachedEvents, intelligentCacheKey, currentView, currentDate, effectiveTimezone, selectedType, selectedStatus, searchTerm, trackAnalyticsEvent]);
  
  // Auto-refresh cache based on user activity
  useEffect(() => {
    if (config.enableCache) {
      const refreshInterval = setInterval(() => {
        const shouldRefresh = analyticsRef.current.interactions > 10 || 
                            Date.now() - analyticsRef.current.sessionStartTime > 600000; // 10 minutes
        
        if (shouldRefresh) {
          clearAllCaches();
          trackAnalyticsEvent('cache_auto_refresh', {
            reason: analyticsRef.current.interactions > 10 ? 'high_activity' : 'time_based',
            interactions: analyticsRef.current.interactions
          });
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [config.enableCache, clearAllCaches, trackAnalyticsEvent]);
  
  // Load events with intelligent caching
  useEffect(() => {
    const loadEvents = async () => {
      if (config.events) {
        // If events are provided as props, use them directly
        setEvents(config.events);
      } else {
        // Use intelligent cache system
        setLoading(true);
        try {
          const cachedEvents = await getEventsWithCache();
          setEvents(cachedEvents);
        } catch (error) {
          console.error('Failed to load events:', error);
          config.onError?.(error as Error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadEvents();
  }, [config.events, getEventsWithCache, config.onError]);
  
  // TDD-required performance monitoring and virtual scrolling
  useEffect(() => {
    if (!config.enableVirtualization) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayElement = entry.target as HTMLElement;
            const dayIndex = parseInt(dayElement.dataset.dayIndex || '0');
            
            // Update visible range based on intersection
            setVirtualizedData(prev => ({
              ...prev,
              visibleRange: {
                start: Math.max(0, dayIndex - prev.renderBuffer),
                end: Math.min(daysInMonth.length - 1, dayIndex + prev.renderBuffer)
              }
            }));
            
            trackAnalyticsEvent('virtual_scroll_update', {
              dayIndex,
              visibleDays: entry.target.getAttribute('data-visible-days') || 0
            });
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    
    // Observe calendar day elements
    const dayElements = document.querySelectorAll('[data-day-index]');
    dayElements.forEach(el => observer.observe(el));
    
    return () => {
      dayElements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [config.enableVirtualization, daysInMonth.length, trackAnalyticsEvent]);
  
  // Performance monitoring - moved after filteredEvents definition
  
  // Calendar date calculations
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const daysInMonth = useMemo(() => {
    const start = new Date(monthStart);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    const end = new Date(monthEnd);
    end.setDate(end.getDate() + (6 - end.getDay())); // End on Saturday
    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);
  
  // Event filtering and search
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term)
      );
    }
    
    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }
    
    return filtered;
  }, [events, searchTerm, selectedType, selectedStatus]);
  
  // Track analytics events with enhanced data - moved after filteredEvents
  const trackAnalyticsEvent = useCallback((eventName: string, data: any = {}) => {
    if (!config.enableAnalytics || !config.onAnalyticsEvent) return;
    
    const enhancedData = {
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: `session_${analyticsRef.current.sessionStartTime}`,
      userTimezone: effectiveTimezone,
      currentView,
      currentDate: formatInTimeZone(currentDate, effectiveTimezone, 'yyyy-MM-dd'),
      totalInteractions: analyticsRef.current.interactions++,
      eventsVisible: filteredEvents.length,
      searchActive: searchTerm.length > 0,
      filtersActive: selectedType !== 'all' || selectedStatus !== 'all'
    };
    
    config.onAnalyticsEvent(eventName, enhancedData);
  }, [config, effectiveTimezone, currentView, currentDate, filteredEvents.length, searchTerm.length, selectedType, selectedStatus]);
  
  // Track search usage - now after filteredEvents
  useEffect(() => {
    if (searchTerm.length > 0) {
      analyticsRef.current.searches++;
      trackAnalyticsEvent('search_performed', {
        searchTerm: searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm,
        searchLength: searchTerm.length,
        totalSearches: analyticsRef.current.searches,
        resultsFound: filteredEvents.length
      });
    }
  }, [searchTerm, filteredEvents.length, trackAnalyticsEvent]);
  
  // Track filter usage - now after filteredEvents
  useEffect(() => {
    if (selectedType !== 'all' || selectedStatus !== 'all') {
      trackAnalyticsEvent('filters_applied', {
        typeFilter: selectedType,
        statusFilter: selectedStatus,
        resultsFound: filteredEvents.length
      });
    }
  }, [selectedType, selectedStatus, filteredEvents.length, trackAnalyticsEvent]);
  
  // Performance monitoring - now after filteredEvents
  useEffect(() => {
    if (config.enableAnalytics) {
      const performanceMetrics = {
        eventsCount: filteredEvents.length,
        renderTime: performance.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        virtualizationEnabled: config.enableVirtualization,
        cacheHitRate: cacheStatus.totalRequests > 0 ? (cacheStatus.hitRate / cacheStatus.totalRequests) * 100 : 0
      };
      
      trackAnalyticsEvent('performance_metrics', performanceMetrics);
    }
  }, [filteredEvents.length, config.enableAnalytics, config.enableVirtualization, cacheStatus, trackAnalyticsEvent]);
  
  // TDD-required virtual rendering system
  const [virtualizedData, setVirtualizedData] = useState({
    visibleRange: { start: 0, end: 42 }, // Standard calendar grid
    renderBuffer: 7, // Extra days to render
    chunkSize: 100 // Events per chunk
  });
  
  // Get events for a specific day with virtual rendering optimization
  const getEventsForDay = useCallback((day: Date) => {
    const dayString = formatInTimeZone(day, effectiveTimezone, 'yyyy-MM-dd');
    
    // Virtual rendering: only process events if day is in visible range or buffer
    if (config.enableVirtualization) {
      const dayIndex = daysInMonth.findIndex(d => 
        formatInTimeZone(d, effectiveTimezone, 'yyyy-MM-dd') === dayString
      );
      
      const isVisible = dayIndex >= virtualizedData.visibleRange.start - virtualizedData.renderBuffer &&
                       dayIndex <= virtualizedData.visibleRange.end + virtualizedData.renderBuffer;
      
      if (!isVisible) {
        trackAnalyticsEvent('virtual_render_skip', {
          dayIndex,
          dayString,
          visibleRange: virtualizedData.visibleRange
        });
        return [];
      }
    }
    
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventDayString = formatInTimeZone(eventDate, effectiveTimezone, 'yyyy-MM-dd');
      return eventDayString === dayString;
    });
    
    // Chunked loading for performance
    const maxEvents = config.maxEventsPerDay || 10;
    const visibleEvents = dayEvents.slice(0, maxEvents);
    
    if (dayEvents.length > maxEvents) {
      trackAnalyticsEvent('events_virtualized', {
        dayString,
        totalEvents: dayEvents.length,
        visibleEvents: visibleEvents.length,
        hiddenEvents: dayEvents.length - visibleEvents.length
      });
    }
    
    return visibleEvents;
  }, [filteredEvents, effectiveTimezone, config.maxEventsPerDay, config.enableVirtualization, daysInMonth, virtualizedData, trackAnalyticsEvent]);
  
  // Navigation handlers
  const handleDatePrev = useCallback(() => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'month':
          return subMonths(prev, 1);
        case 'week':
          return new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'day':
          return new Date(prev.getTime() - 24 * 60 * 60 * 1000);
        default:
          return subMonths(prev, 1);
      }
    });
  }, [currentView]);
  
  const handleDateNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'month':
          return addMonths(prev, 1);
        case 'week':
          return new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'day':
          return new Date(prev.getTime() + 24 * 60 * 60 * 1000);
        default:
          return addMonths(prev, 1);
      }
    });
  }, [currentView]);
  
  const handleDateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);
  
  // Event handlers with enhanced analytics
  const handleEventClick = useCallback((event: CalendarEvent) => {
    config.onEventClick?.(event);
    
    // Enhanced analytics tracking
    trackAnalyticsEvent('event_click', {
      eventId: event.id,
      eventType: event.type,
      eventStatus: event.status,
      hasAnalytics: !!event.analytics,
      hasTemplate: !!event.templateMetadata,
      clickPosition: 'calendar_view'
    });
  }, [config, trackAnalyticsEvent]);
  
  const handleDateClick = useCallback((date: Date) => {
    config.onDateClick?.(date);
    
    // Enhanced analytics tracking
    trackAnalyticsEvent('date_click', {
      clickedDate: formatInTimeZone(date, effectiveTimezone, 'yyyy-MM-dd'),
      eventsOnDate: getEventsForDay(date).length,
      isToday: formatInTimeZone(date, effectiveTimezone, 'yyyy-MM-dd') === formatInTimeZone(new Date(), effectiveTimezone, 'yyyy-MM-dd'),
      dayOfWeek: date.getDay()
    });
  }, [config, trackAnalyticsEvent, effectiveTimezone, getEventsForDay]);
  
  // TDD-required intelligent preview system
  const [previewTimer, setPreviewTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleEventHover = useCallback((event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    if (!config.enablePreview) return;
    
    // Clear any existing timer
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
    
    // Set new timer with configurable delay
    const timer = setTimeout(() => {
      setPreviewEvent(event);
      setPreviewPosition({
        x: mouseEvent.clientX,
        y: mouseEvent.clientY
      });
      
      // Enhanced analytics tracking for preview system
      analyticsRef.current.previews++;
      trackAnalyticsEvent('event_preview_show', {
        eventId: event.id,
        eventType: event.type,
        previewDelay: config.previewDelay,
        totalPreviews: analyticsRef.current.previews
      });
    }, config.previewDelay);
    
    setPreviewTimer(timer);
  }, [config.enablePreview, config.previewDelay, trackAnalyticsEvent, previewTimer]);
  
  const handleEventHoverEnd = useCallback(() => {
    if (!config.enablePreview) return;
    
    // Clear preview timer
    if (previewTimer) {
      clearTimeout(previewTimer);
      setPreviewTimer(null);
    }
    
    // Hide preview with enhanced analytics tracking
    if (previewEvent) {
      trackAnalyticsEvent('event_preview_hide', {
        eventId: previewEvent.id,
        eventType: previewEvent.type,
        previewDuration: Date.now() - (analyticsRef.current.sessionStartTime + (analyticsRef.current.previews * 1000))
      });
    }
    
    setPreviewEvent(null);
    setPreviewPosition(null);
  }, [config.enablePreview, trackAnalyticsEvent, previewTimer, previewEvent]);
  
  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!config.enableDragDrop) return;
    
    const draggedEventId = event.active.id as string;
    const draggedEventData = events.find(e => e.id === draggedEventId);
    
    if (draggedEventData) {
      setDraggedEvent(draggedEventData);
    }
  }, [config.enableDragDrop, events]);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!config.enableDragDrop) return;
    
    const { active, over } = event;
    
    if (over && draggedEvent) {
      const newDate = new Date(over.id as string);
      config.onEventDrop?.(draggedEvent, newDate);
      
      // Enhanced analytics tracking
      analyticsRef.current.dragDrops++;
      trackAnalyticsEvent('event_drag', {
        eventId: draggedEvent.id,
        eventType: draggedEvent.type,
        oldDate: draggedEvent.date,
        newDate: formatInTimeZone(newDate, effectiveTimezone, 'yyyy-MM-dd'),
        totalDragDrops: analyticsRef.current.dragDrops
      });
    }
    
    setDraggedEvent(null);
  }, [config, draggedEvent, effectiveTimezone, trackAnalyticsEvent]);
  
  // Bulk selection handlers
  const handleToggleSelection = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      setSelectedEvents([]);
    }
  }, [isSelectionMode]);
  
  const handleSelectAll = useCallback(() => {
    setSelectedEvents(filteredEvents);
  }, [filteredEvents]);
  
  const handleClearSelection = useCallback(() => {
    setSelectedEvents([]);
  }, []);
  
  // View change handler with enhanced analytics
  const handleViewChange = useCallback((view: CalendarView) => {
    const oldView = currentView;
    setCurrentView(view);
    config.onViewChange?.(view);
    
    // Enhanced analytics tracking
    analyticsRef.current.viewChanges++;
    trackAnalyticsEvent('view_change', {
      oldView,
      newView: view,
      totalViewChanges: analyticsRef.current.viewChanges,
      timeInPreviousView: Date.now() - analyticsRef.current.sessionStartTime
    });
  }, [config, currentView, trackAnalyticsEvent]);
  
  // Error boundary wrapper
  const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    if (!config.errorBoundary) return <>{children}</>;
    
    try {
      return <>{children}</>;
    } catch (error) {
      config.onError?.(error as Error);
      return (
        <div className="p-4 text-center text-red-600">
          <p>Calendar error occurred. Please refresh the page.</p>
        </div>
      );
    }
  };
  
  // Render view component
  const renderCalendarView = () => {
    const commonProps = {
      currentDate,
      events: filteredEvents,
      getEventsForDay,
      handleEventClick,
      handleDateClick,
      userTimezone: effectiveTimezone,
      onEventHover: handleEventHover,
      onEventHoverEnd: handleEventHoverEnd
    };
    
    switch (currentView) {
      case 'month':
        return (
          <MonthView
            {...commonProps}
            daysInMonth={daysInMonth}
          />
        );
      case 'week':
        return <WeekView {...commonProps} />;
      case 'day':
        return <DayView {...commonProps} />;
      case 'list':
        return <ListView {...commonProps} />;
      default:
        return (
          <MonthView
            {...commonProps}
            daysInMonth={daysInMonth}
          />
        );
    }
  };
  
  return (
    <ErrorBoundary>
      <div 
        className={cn(
          "content-calendar w-full h-full bg-background",
          config.className
        )}
        aria-label={config.ariaLabel || "Content Calendar"}
      >
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Calendar Header */}
          <CalendarHeader
            view={currentView}
            onViewChange={handleViewChange}
            currentDate={currentDate}
            onDatePrev={handleDatePrev}
            onDateNext={handleDateNext}
            onDateToday={handleDateToday}
            userTimezone={effectiveTimezone}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onAddEvent={() => config.onEventCreate?.(currentDate)}
            isSelectionMode={isSelectionMode}
            selectedCount={selectedEvents.length}
            onToggleSelection={config.enableBulkSelection ? handleToggleSelection : undefined}
            onSelectAll={config.enableBulkSelection ? handleSelectAll : undefined}
            onClearSelection={config.enableBulkSelection ? handleClearSelection : undefined}
            events={filteredEvents}
            selectedEvents={selectedEvents}
            loading={loading}
          />
          
          {/* Calendar View */}
          <div className="calendar-view-container">
            {renderCalendarView()}
          </div>
          
          {/* Drag Overlay */}
          {config.enableDragDrop && (
            <DragOverlay>
              {draggedEvent && (
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-md shadow-lg">
                  <div className="text-sm font-medium">{draggedEvent.title}</div>
                  <div className="text-xs text-muted-foreground">{draggedEvent.type}</div>
                </div>
              )}
            </DragOverlay>
          )}
        </DndContext>
        
        {/* Control Panels */}
        <div className="flex gap-2 mt-4">
          {config.enableCache && <CacheControl />}
          {config.enableSync && (
            <ContentCalendarSync
              onSyncComplete={() => {
                clearAllCaches();
                // Trigger refresh of events
                config.onSync?.();
              }}
            />
          )}
        </div>
        
        {/* Preview System */}
        {config.enablePreview && previewEvent && previewPosition && (
          <EventPreview
            event={previewEvent}
            position={previewPosition}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// Export constants and utilities needed by other components
export const DEFAULT_DURATIONS = {
  email: 30,
  social: 15,
  blog: 60,
  custom: 30,
  article: 45
};

export const eventTypeColorMap = {
  email: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300"
  },
  social: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300"
  },
  blog: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300"
  },
  custom: {
    bg: "bg-gray-100 dark:bg-gray-700/30",
    text: "text-gray-700 dark:text-gray-300"
  },
  article: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300"
  }
};

// Export types for external use
export { ContentType, SocialPlatform, CalendarEvent, CalendarView } from './types';

// Export default for backward compatibility
export default ContentCalendar;