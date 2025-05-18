"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, addDays, addHours, setHours, setMinutes } from "date-fns";

// Types for our calendar system
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string;
  type: "email" | "social" | "blog" | "other";
  status: "draft" | "scheduled" | "sent" | "failed";
  campaignId?: string;
}

export interface ContentCalendarProps {
  events?: CalendarEvent[];
  onEventCreate?: (event: Omit<CalendarEvent, "id">) => Promise<CalendarEvent>;
  onEventUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>;
  onEventDelete?: (eventId: string) => Promise<boolean>;
  onDateSelect?: (day: string) => void;
  fetchEvents?: () => Promise<CalendarEvent[]>;
}

// Calendar views
type CalendarView = "month" | "week" | "day";

// Color mapping for event types
const eventTypeColorMap = {
  email: {
    bg: "bg-[var(--color-chart-blue)]/10",
    text: "text-[var(--color-chart-blue)]"
  },
  social: {
    bg: "bg-[var(--color-chart-green)]/10",
    text: "text-[var(--color-chart-green)]"
  },
  blog: {
    bg: "bg-[var(--color-chart-purple)]/10",
    text: "text-[var(--color-chart-purple)]"
  },
  other: {
    bg: "bg-[var(--color-chart-orange)]/10",
    text: "text-[var(--color-chart-orange)]"
  }
};

// Add this near the top of the file, after imports
const tabs = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
] as const;

export function ContentCalendar({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateSelect,
  fetchEvents
}: ContentCalendarProps) {
  // State
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(!!fetchEvents);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [newEvent, setNewEvent] = useState<{
    title: string;
    description: string;
    date: string;
    time: string;
    type: "email" | "social" | "blog" | "other";
  }>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    type: "email"
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Calculate days to display based on current month
  const daysInMonth = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  // Load events
  const loadEvents = useCallback(async () => {
    if (!fetchEvents) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to load calendar data");
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Navigation functions
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter events based on search and filters
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      // Search term filter
      const matchesSearch = searchTerm 
        ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.description || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      // Type filter
      const matchesType = selectedType
        ? event.type === selectedType
        : true;
      
      // Status filter
      const matchesStatus = selectedStatus
        ? event.status === selectedStatus
        : true;
        
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchTerm, selectedType, selectedStatus]);

  // Handle creating a new event
  const handleCreateEvent = async () => {
    if (!onEventCreate) return;
    
    try {
      const createdEvent = await onEventCreate({
        ...newEvent,
        status: "scheduled",
      });
      
      setEvents(prev => [...prev, createdEvent]);
      setIsDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "12:00",
        type: "email"
      });
    } catch (err) {
      console.error("Failed to create event:", err);
      setError("Failed to create event");
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return filteredEvents.filter(event => typeof event.date === "string" && event.date.startsWith(dayStr));
  };

  // Get events for a specific time range
  const getEventsForTimeRange = (start: Date, end: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.date);
      const eventTime = event.time ? parseISO(`${event.date}T${event.time}`) : eventDate;
      return eventTime >= start && eventTime <= end;
    });
  };

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForTimeRange(
      setHours(currentDate, 0),
      setHours(currentDate, 23)
    );

    return (
      <div className="mt-4 border rounded-md overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-border">
          {hours.map((hour) => {
            const hourStart = setHours(currentDate, hour);
            const hourEnd = setHours(currentDate, hour + 1);
            const hourEvents = dayEvents.filter(event => {
              const eventTime = event.time ? parseISO(`${event.date}T${event.time}`) : parseISO(event.date);
              return eventTime >= hourStart && eventTime < hourEnd;
            });

            return (
              <div key={hour} className="relative min-h-[60px] p-2">
                <div className="absolute left-0 top-0 w-16 text-sm text-muted-foreground">
                  {format(hourStart, "h:mm a")}
                </div>
                <div className="ml-16">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-2 rounded text-sm mb-1 ${
                        eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30"
                      } ${eventTypeColorMap[event.type]?.text || "text-foreground"}`}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.time && (
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(`${event.date}T${event.time}`), "h:mm a")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="mt-4 border rounded-md overflow-hidden">
        <div className="grid grid-cols-8 divide-x divide-border">
          {/* Time column */}
          <div className="text-center">
            <div className="h-12 border-b">
              <span className="sr-only">Time</span>
            </div>
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b p-1 text-xs text-muted-foreground">
                {format(setHours(currentDate, hour), "h:mm a")}
              </div>
            ))}
          </div>
          
          {/* Days of the week */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={day.toISOString()} className="relative">
                {/* Day header */}
                <div className={`h-12 border-b p-2 text-center ${isToday ? "bg-primary/5" : ""}`}>
                  <div className="font-medium">{format(day, "EEE")}</div>
                  <div className={`text-sm ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {format(day, "MMM d")}
                  </div>
                </div>
                
                {/* Hour cells */}
                <div>
                  {hours.map((hour) => (
                    <div key={hour} className="h-20 border-b"></div>
                  ))}
                </div>
                
                {/* Positioned events */}
                <div className="absolute top-12 left-0 right-0 bottom-0 pointer-events-none">
                  {dayEvents.map((event) => {
                    const eventTime = event.time || "00:00";
                    const [hours, minutes] = eventTime.split(":").map(Number);
                    const topPosition = (hours * 60 + minutes) * (20 / 60); // 20px per hour
                    
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 p-2 rounded text-xs pointer-events-auto ${
                          eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30"
                        } ${eventTypeColorMap[event.type]?.text || "text-foreground"}`}
                        style={{
                          top: `${topPosition}px`,
                          height: "50px"
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-muted-foreground">{eventTime}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div 
        data-testid="content-calendar-loading" 
        className="p-8 text-center rounded-lg border border-border bg-card"
      >
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-chart-blue)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading your content calendar...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div 
        data-testid="content-calendar-error" 
        className="p-8 text-center rounded-lg border border-destructive bg-destructive/10"
      >
        <p className="text-lg font-medium text-destructive mb-2">❌ Failed to load calendar</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadEvents} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (!loading && filteredEvents.length === 0) {
    return (
      <div className="p-12 text-center rounded-lg border border-border bg-card flex flex-col items-center justify-center">
        <CalendarIcon className="w-12 h-12 text-[var(--color-chart-blue)] mb-4" />
        <h2 className="text-xl font-semibold mb-2">No events scheduled yet</h2>
        <p className="text-muted-foreground mb-4">Start planning your content by adding your first event.</p>
        {onEventCreate && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      data-testid="content-calendar-container" 
      className="space-y-4 border rounded-lg p-4 bg-card"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-chart-blue)]">Content Calendar</h1>
        {onEventCreate && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <span className="absolute left-2.5 top-2.5 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center">
          <Tabs 
            defaultValue="month"
            value={calendarView} 
            onValueChange={(value) => setCalendarView(value as CalendarView)}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy")}
        </div>
      </div>

      {/* Calendar Views */}
      <div className="mt-4">
        {calendarView === "month" && (
          <div className="mt-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium py-1 text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div 
              className="grid grid-cols-7 gap-1 auto-rows-fr" 
              style={{ minHeight: "500px" }}
            >
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                    className={`p-1 min-h-[100px] border border-muted rounded-sm ${
                      isToday ? "bg-[var(--color-chart-blue)]/5 border-[var(--color-chart-blue)]/30" : ""
                    }`}
                    onClick={() => onDateSelect?.(format(day, "yyyy-MM-dd"))}
                  >
                    <div className="p-1">
                      <span 
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm ${
                          isToday 
                            ? "bg-[var(--color-chart-blue)] text-white font-medium" 
                            : "text-muted-foreground"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 px-2 rounded truncate cursor-pointer flex items-center gap-1 ${
                            eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30"
                          } ${eventTypeColorMap[event.type]?.text || "text-foreground"}`}
                          title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          {event.time && <span className="mr-1 opacity-70">{event.time.substring(0, 5)}</span>}
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <button 
                          className="text-xs text-[var(--color-chart-blue)] w-full text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`All events for ${format(day, "MMM d, yyyy")}`);
                          }}
                        >
                          +{dayEvents.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {calendarView === "week" && renderWeekView()}
        {calendarView === "day" && renderDayView()}
      </div>

      {/* Event Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => 
                  setNewEvent({ ...newEvent, type: value as "email" | "social" | "blog" | "other" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description"
              />
            </div>
          </div>
          <DialogFooter>
            {selectedEvent && (
              <Button
                variant="destructive"
                onClick={() => {
                  onEventDelete?.(selectedEvent.id);
                  setIsDialogOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button onClick={handleCreateEvent}>
              {selectedEvent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
