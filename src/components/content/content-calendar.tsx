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
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";

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
type CalendarView = "month" | "week" | "list";

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

  // Render loading state
  if (loading) {
    return (
      <div 
        data-testid="content-calendar-loading" 
        className="p-8 text-center rounded-lg border border-border bg-card"
      >
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading calendar...</p>
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

  return (
    <div 
      data-testid="content-calendar-container" 
      className="space-y-4 border rounded-lg p-4 bg-card"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Next month</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={calendarView === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setCalendarView("month")}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={calendarView === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setCalendarView("week")}
          >
            Week
          </Button>
          <Button
            variant={calendarView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setCalendarView("list")}
          >
            <LayoutList className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
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

        {onEventCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new calendar event</DialogTitle>
              <DialogDescription>
                Schedule a new content item or event in your calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right">
                  Title
                </label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="Email Newsletter #45"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <Input
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Monthly product updates"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-right">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="time" className="text-right">
                  Time
                </label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="type" className="text-right">
                  Type
                </label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value: "email" | "social" | "blog" | "other") => 
                    setNewEvent(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
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
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateEvent} disabled={!newEvent.title || !newEvent.date}>
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Month View */}
      {calendarView === "month" && (
        <div className="mt-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
                    isToday ? "bg-primary/5 border-primary/30" : ""
                  }`}
                  onClick={() => onDateSelect?.(format(day, "yyyy-MM-dd"))}
                >
                  <div className="p-1">
                    <span 
                      className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm ${
                        isToday 
                          ? "bg-primary text-primary-foreground font-medium" 
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
                        className={`text-xs p-1 px-2 rounded truncate cursor-pointer ${
                          event.type === "email" ? "bg-blue-100 dark:bg-blue-900/30" :
                          event.type === "social" ? "bg-green-100 dark:bg-green-900/30" :
                          event.type === "blog" ? "bg-purple-100 dark:bg-purple-900/30" :
                          "bg-gray-100 dark:bg-gray-700/30"
                        }`}
                        title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show event details or allow editing
                          if (onEventUpdate) {
                            alert(`Edit event: ${event.id}`);
                          } else {
                            alert(`Event: ${event.title}`);
                          }
                        }}
                      >
                        {event.time && <span className="mr-1 opacity-70">{event.time.substring(0, 5)}</span>}
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <button 
                        className="text-xs text-primary w-full text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show all events for this day
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

      {/* Week View */}
      {calendarView === "week" && (
        <div className="mt-4 border rounded-md overflow-hidden">
          <div className="grid grid-cols-8 divide-x divide-border">
            {/* Time column */}
            <div className="text-center">
              <div className="h-12 border-b">
                <span className="sr-only">Time</span>
              </div>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="h-20 border-b p-1 text-xs text-muted-foreground">
                  {`${hour}:00`}
                </div>
              ))}
            </div>
            
            {/* Days of the week */}
            {Array.from({ length: 7 }).map((_, dayOffset) => {
              const date = new Date(currentDate);
              date.setDate(date.getDate() - date.getDay() + dayOffset);
              const dayEvents = getEventsForDay(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div key={dayOffset} className="relative">
                  {/* Day header */}
                  <div className={`h-12 border-b p-2 text-center ${isToday ? "bg-primary/5" : ""}`}>
                    <div className="font-medium">{format(date, "EEE")}</div>
                    <div className={`text-sm ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {format(date, "MMM d")}
                    </div>
                  </div>
                  
                  {/* Hour cells */}
                  <div>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div key={hour} className="h-20 border-b"></div>
                ))}
                  </div>
                  
                  {/* Positioned events */}
                  <div className="absolute top-12 left-0 right-0 bottom-0 pointer-events-none">
                    {dayEvents.map((event) => {
                      // Position events based on time
                      const eventTime = event.time || "00:00";
                      const [hours, minutes] = eventTime.split(":").map(Number);
                      const topPosition = (hours * 60 + minutes) * (20 / 60); // 20px per hour
                      
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 p-2 rounded text-xs pointer-events-auto ${
                            event.type === "email" ? "bg-blue-100 dark:bg-blue-900/30" :
                            event.type === "social" ? "bg-green-100 dark:bg-green-900/30" :
                            event.type === "blog" ? "bg-purple-100 dark:bg-purple-900/30" :
                            "bg-gray-100 dark:bg-gray-700/30"
                          }`}
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
      )}
      
      {/* List View */}
      {calendarView === "list" && (
        <div className="mt-4 border rounded-md overflow-hidden divide-y">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No events found.</p>
            </div>
          ) : (
            filteredEvents
              .sort((a, b) => {
                // Safeguard for missing date/time values
                const dateA = typeof a.date === "string" ? a.date : '';
                const dateB = typeof b.date === "string" ? b.date : '';
                const dateResult = dateA.localeCompare(dateB);
                if (dateResult !== 0) return dateResult;
                const timeA = typeof a.time === "string" ? a.time : '';
                const timeB = typeof b.time === "string" ? b.time : '';
                return timeA.localeCompare(timeB);
              })
              .map((event) => {
                const eventDate = event.date ? parseISO(event.date) : new Date();
                
                return (
                  <div key={event.id} className="p-4 hover:bg-muted/30 flex items-center space-x-4">
                    <div 
                      className={`w-3 h-12 rounded-full ${
                        event.type === "email" ? "bg-blue-500" :
                        event.type === "social" ? "bg-green-500" :
                        event.type === "blog" ? "bg-purple-500" :
                        "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.description}
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <div className="font-medium">{event.date ? format(eventDate, "MMM d, yyyy") : "No date"}</div>
                      {event.time && <div className="text-muted-foreground">{event.time}</div>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (onEventUpdate) {
                          alert(`Edit event: ${event.id}`);
                        }
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                        if (onEventDelete) {
                          onEventDelete(event.id).then(success => {
                            if (success) {
                              setEvents(prev => prev.filter(e => e.id !== event.id));
                            }
                          });
                        }
                      }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}
