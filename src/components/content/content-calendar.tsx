"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter, LayoutGrid, LayoutList, Clock, Facebook, Twitter, Instagram, Linkedin, Upload, X } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Day } from "./day";

// Enhanced content type definitions
export type SocialPlatform = "FACEBOOK" | "TWITTER" | "INSTAGRAM" | "LINKEDIN";

export interface SocialMediaContent {
  platforms: SocialPlatform[];
  mediaUrls: string[];
  crossPost: boolean;
  platformSpecificContent: {
    [key in SocialPlatform]?: {
      text?: string;
      mediaUrls?: string[];
      scheduledTime?: string;
    };
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: "email" | "social" | "blog" | "other";
  status: "draft" | "scheduled" | "sent" | "failed";
  campaignId?: string;
  socialMediaContent?: SocialMediaContent;
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

// Platform-specific color mapping
const platformColorMap = {
  FACEBOOK: {
    bg: "bg-[#1877F2]/10",
    text: "text-[#1877F2]",
    icon: <Facebook className="h-4 w-4" />
  },
  TWITTER: {
    bg: "bg-[#1DA1F2]/10",
    text: "text-[#1DA1F2]",
    icon: <Twitter className="h-4 w-4" />
  },
  INSTAGRAM: {
    bg: "bg-[#E4405F]/10",
    text: "text-[#E4405F]",
    icon: <Instagram className="h-4 w-4" />
  },
  LINKEDIN: {
    bg: "bg-[#0A66C2]/10",
    text: "text-[#0A66C2]",
    icon: <Linkedin className="h-4 w-4" />
  }
};

// Platform-specific content limits
const platformContentLimits = {
  FACEBOOK: {
    maxTextLength: 63206,
    maxMediaCount: 10,
    supportedMediaTypes: ["image", "video", "link"]
  },
  TWITTER: {
    maxTextLength: 280,
    maxMediaCount: 4,
    supportedMediaTypes: ["image", "video", "gif"]
  },
  INSTAGRAM: {
    maxTextLength: 2200,
    maxMediaCount: 10,
    supportedMediaTypes: ["image", "video", "carousel"]
  },
  LINKEDIN: {
    maxTextLength: 3000,
    maxMediaCount: 9,
    supportedMediaTypes: ["image", "video", "document"]
  }
};

// Add this near the top of the file, after imports
const tabs = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
] as const;

// Add this interface for drag data
interface DragData {
  event: CalendarEvent;
  sourceDate: string;
}

// Update the newEvent state type
interface NewEventState {
  title: string;
  description: string;
  start: Date;
  end: Date;
  type: ContentType;
  socialMediaContent: {
    platforms: SocialPlatform[];
    crossPost: boolean;
    mediaUrls: string[];
    platformSpecificContent: {
      [key in SocialPlatform]?: {
        text?: string;
        mediaUrls?: string[];
        scheduledTime?: string;
      };
    };
  };
}

// Add this component for media upload
function MediaUploader({ 
  platform, 
  maxCount, 
  supportedTypes,
  onUpload,
  onRemove,
  currentMedia
}: { 
  platform: SocialPlatform;
  maxCount: number;
  supportedTypes: string[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  currentMedia: string[];
}) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length + currentMedia.length > maxCount) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxCount} files allowed for ${platform}`,
        variant: "destructive",
      });
      return;
    }
    
    onUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + currentMedia.length > maxCount) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxCount} files allowed for ${platform}`,
        variant: "destructive",
      });
      return;
    }
    
    onUpload(files);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted",
          "transition-colors duration-200"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={supportedTypes.map(type => `.${type}`).join(",")}
          onChange={handleFileInput}
          className="hidden"
          id={`media-upload-${platform}`}
        />
        <label
          htmlFor={`media-upload-${platform}`}
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            Drag and drop or click to upload media
          </div>
          <div className="text-xs text-muted-foreground">
            Supported types: {supportedTypes.join(", ")}
          </div>
        </label>
      </div>

      {currentMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {currentMedia.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add ContentType definition
export type ContentType = "email" | "social" | "blog" | "other";

// Add Day component interface
interface DayProps {
  day: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onClick: () => void;
}

// Add Day component
function Day({ day, events, onEventClick, onClick }: DayProps) {
  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = isSameMonth(day, new Date());
  const dayStr = format(day, "yyyy-MM-dd");

  return (
    <div
      className={cn(
        "p-1 min-h-[100px] border border-muted rounded-sm transition-colors duration-200",
        isToday && "bg-[var(--color-chart-blue)]/5 border-[var(--color-chart-blue)]/30",
        !isCurrentMonth && "opacity-50",
        "hover:bg-muted/50 cursor-pointer"
      )}
      onClick={onClick}
      data-date={dayStr}
    >
      <div className="p-1 flex items-center justify-between">
        <span className={cn(
          "inline-flex items-center justify-center h-6 w-6 rounded-full text-sm transition-colors duration-200",
          isToday 
            ? "bg-[var(--color-chart-blue)] text-white font-medium" 
            : "text-muted-foreground hover:bg-muted"
        )}>
          {format(day, "d")}
        </span>
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>
      <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "text-xs p-1.5 px-2 rounded-md truncate cursor-pointer flex items-center gap-1.5 transition-colors duration-200",
              event.type === "social" && event.socialMediaContent?.platforms.length === 1
                ? platformColorMap[event.socialMediaContent.platforms[0]].bg
                : eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
              event.type === "social" && event.socialMediaContent?.platforms.length === 1
                ? platformColorMap[event.socialMediaContent.platforms[0]].text
                : eventTypeColorMap[event.type]?.text || "text-foreground",
              "hover:opacity-80"
            )}
            title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            {event.time && (
              <span className="text-[10px] font-medium opacity-70">
                {event.time.substring(0, 5)}
              </span>
            )}
            {event.type === "social" && event.socialMediaContent?.platforms.length === 1 && (
              platformColorMap[event.socialMediaContent.platforms[0]].icon
            )}
            <span className="truncate">{event.title}</span>
            {event.type === "social" && event.socialMediaContent?.platforms.length > 1 && (
              <div className="flex gap-1 mt-1">
                {event.socialMediaContent.platforms.map(platform => (
                  <span
                    key={platform}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      platformColorMap[platform].bg,
                      platformColorMap[platform].text
                    )}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContentCalendar({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateSelect,
  fetchEvents
}: ContentCalendarProps) {
  const { toast } = useToast();
  // State
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<NewEventState>({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
    type: "email",
    socialMediaContent: {
      platforms: [],
      crossPost: false,
      mediaUrls: [],
      platformSpecificContent: {}
    }
  });
  const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null);
  const [dragSourceDate, setDragSourceDate] = useState<string | null>(null);

  // Calculate days to display based on current month
  const daysInMonth = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  // Load events
  const loadEvents = async () => {
    if (!fetchEvents) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const events = await fetchEvents();
      setEvents(events);
    } catch (error) {
      console.error("Failed to load calendar data:", error);
      setError("Failed to load calendar data");
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [fetchEvents]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingEvent(null);
      setNewEvent({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(),
        type: "email",
        socialMediaContent: {
          platforms: [],
          crossPost: false,
          mediaUrls: [],
          platformSpecificContent: {}
        }
      });
    }
  }, [isDialogOpen]);

  // Handle creating a new event
  const handleCreateEvent = async () => {
    if (!onEventCreate) return;
    
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: format(newEvent.start, "yyyy-MM-dd"),
        time: format(newEvent.start, "HH:mm"),
        type: newEvent.type,
        status: "draft" as const,
        contentType: newEvent.type.toUpperCase(),
        socialMediaContent: newEvent.type === "social" ? {
          platforms: newEvent.socialMediaContent.platforms,
          crossPost: newEvent.socialMediaContent.crossPost,
          mediaUrls: newEvent.socialMediaContent.mediaUrls,
          platformSpecificContent: newEvent.socialMediaContent.platformSpecificContent
        } : undefined
      };

      const createdEvent = await onEventCreate(eventData);
      setEvents(prev => [...prev, createdEvent]);
      setIsDialogOpen(false);
      
      // Reset form
      setNewEvent({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(),
        type: "email",
        socialMediaContent: {
          platforms: [],
          crossPost: false,
          mediaUrls: [],
          platformSpecificContent: {}
        }
      });
      
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    } catch (error) {
      console.error("Failed to create event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return events.filter(event => typeof event.date === "string" && event.date.startsWith(dayStr));
  };

  // Get events for a specific time range
  const getEventsForTimeRange = (start: Date, end: Date) => {
    return events.filter(event => {
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

  // Handle editing an event
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      start: new Date(event.date),
      end: event.time ? new Date(event.date + "T" + event.time) : new Date(event.date),
      type: event.type,
      socialMediaContent: {
        platforms: event.socialMediaContent?.platforms || [],
        crossPost: event.socialMediaContent?.crossPost || false,
        mediaUrls: event.socialMediaContent?.mediaUrls || [],
        platformSpecificContent: event.socialMediaContent?.platformSpecificContent || {}
      }
    });
    setIsDialogOpen(true);
  };

  // Handle updating an event
  const handleUpdateEvent = async () => {
    if (!onEventUpdate || !editingEvent) return;
    
    try {
      const updatedEvent = await onEventUpdate({
        ...editingEvent,
        title: newEvent.title,
        description: newEvent.description,
        date: format(newEvent.start, "yyyy-MM-dd"),
        time: format(newEvent.start, "HH:mm"),
        type: newEvent.type,
        socialMediaContent: newEvent.type === "social" ? {
          platforms: newEvent.socialMediaContent.platforms,
          crossPost: newEvent.socialMediaContent.crossPost,
          mediaUrls: newEvent.socialMediaContent.mediaUrls,
          platformSpecificContent: newEvent.socialMediaContent.platformSpecificContent
        } : undefined
      });
      
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      console.error("Failed to update event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      });
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!onEventDelete) return;
    
    try {
      await onEventDelete(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragData;
    setActiveDragEvent(dragData.event);
    setDragSourceDate(dragData.sourceDate);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeDragEvent || !onEventUpdate) {
      setActiveDragEvent(null);
      setDragSourceDate(null);
      return;
    }

    const targetDate = over.id as string;
    
    try {
      const updatedEvent = await onEventUpdate({
        ...activeDragEvent,
        date: targetDate
      });
      
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      toast({
        title: "Success",
        description: "Event rescheduled successfully",
      });
    } catch (error) {
      console.error("Failed to reschedule event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reschedule event",
        variant: "destructive",
      });
    } finally {
      setActiveDragEvent(null);
      setDragSourceDate(null);
    }
  };

  // Update the platform selection handler
  const handlePlatformSelection = (platform: SocialPlatform) => {
    const currentPlatforms = newEvent.socialMediaContent.platforms;
    const updatedPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    setNewEvent(prev => ({
      ...prev,
      socialMediaContent: {
        ...prev.socialMediaContent,
        platforms: updatedPlatforms,
        crossPost: updatedPlatforms.length > 1,
        mediaUrls: prev.socialMediaContent.mediaUrls,
        platformSpecificContent: prev.socialMediaContent.platformSpecificContent
      }
    }));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-8 text-center rounded-lg border border-border bg-card">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-chart-blue)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading your content calendar...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-8 text-center rounded-lg border border-destructive bg-destructive/10">
        <p className="text-lg font-medium text-destructive mb-2">❌ Failed to load calendar</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadEvents} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-chart-blue)]">Content Calendar</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Content" : "Schedule New Content"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update your scheduled content." : "Create and schedule your content for the selected date."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter content title"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newEvent.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEvent.start ? format(newEvent.start, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.start}
                      onSelect={(date) => date && setNewEvent({ ...newEvent, start: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <div className="relative">
                  <Input
                    type="time"
                    value={format(newEvent.start, "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":").map(Number);
                      setNewEvent({
                        ...newEvent,
                        start: new Date(newEvent.start.toISOString().split("T")[0] + "T" + e.target.value)
                      });
                    }}
                    className="w-full"
                  />
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => 
                  setNewEvent({ ...newEvent, type: value as "email" | "social" | "blog" | "other" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="social">Social Media Post</SelectItem>
                  <SelectItem value="blog">Blog Article</SelectItem>
                  <SelectItem value="other">Other Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Add a description for your content"
                className="w-full"
              />
            </div>
            {newEvent.type === "social" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Media Platforms</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(platformColorMap).map(([platform, { bg, text, icon }]) => (
                      <Button
                        key={platform}
                        variant="outline"
                        className={cn(
                          "justify-start",
                          newEvent.socialMediaContent.platforms.includes(platform as SocialPlatform)
                            ? `${bg} ${text} border-current`
                            : ""
                        )}
                        onClick={() => handlePlatformSelection(platform as SocialPlatform)}
                      >
                        {icon}
                        <span className="ml-2">{platform}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {newEvent.socialMediaContent.platforms.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <div className="space-y-4">
                        {newEvent.socialMediaContent.platforms.map(platform => (
                          <div key={platform} className="space-y-2">
                            <div className="flex items-center gap-2">
                              {platformColorMap[platform].icon}
                              <span className="text-sm font-medium">{platform}</span>
                            </div>
                            <Input
                              placeholder={`Enter content for ${platform} (max ${platformContentLimits[platform].maxTextLength} characters)`}
                              maxLength={platformContentLimits[platform].maxTextLength}
                              value={newEvent.socialMediaContent.platformSpecificContent?.[platform]?.text || ""}
                              onChange={(e) => {
                                setNewEvent(prev => ({
                                  ...prev,
                                  socialMediaContent: {
                                    ...prev.socialMediaContent,
                                    platformSpecificContent: {
                                      ...prev.socialMediaContent.platformSpecificContent,
                                      [platform]: {
                                        ...prev.socialMediaContent.platformSpecificContent?.[platform],
                                        text: e.target.value
                                      }
                                    }
                                  }
                                }));
                              }}
                            />
                            <MediaUploader
                              platform={platform}
                              maxCount={platformContentLimits[platform].maxMediaCount}
                              supportedTypes={platformContentLimits[platform].supportedMediaTypes}
                              currentMedia={newEvent.socialMediaContent.platformSpecificContent?.[platform]?.mediaUrls || []}
                              onUpload={(files) => {
                                // Here you would typically upload the files to your storage service
                                // and get back URLs. For now, we'll use local URLs
                                const newUrls = files.map(file => URL.createObjectURL(file));
                                setNewEvent(prev => ({
                                  ...prev,
                                  socialMediaContent: {
                                    ...prev.socialMediaContent,
                                    platformSpecificContent: {
                                      ...prev.socialMediaContent.platformSpecificContent,
                                      [platform]: {
                                        ...prev.socialMediaContent.platformSpecificContent?.[platform],
                                        mediaUrls: [
                                          ...(prev.socialMediaContent.platformSpecificContent?.[platform]?.mediaUrls || []),
                                          ...newUrls
                                        ]
                                      }
                                    }
                                  }
                                }));
                              }}
                              onRemove={(index) => {
                                setNewEvent(prev => ({
                                  ...prev,
                                  socialMediaContent: {
                                    ...prev.socialMediaContent,
                                    platformSpecificContent: {
                                      ...prev.socialMediaContent.platformSpecificContent,
                                      [platform]: {
                                        ...prev.socialMediaContent.platformSpecificContent?.[platform],
                                        mediaUrls: prev.socialMediaContent.platformSpecificContent?.[platform]?.mediaUrls?.filter((_, i) => i !== index) || []
                                      }
                                    }
                                  }
                                }));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cross-post Settings</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="crossPost"
                          checked={newEvent.socialMediaContent.crossPost}
                          onChange={(e) => {
                            setNewEvent(prev => ({
                              ...prev,
                              socialMediaContent: {
                                ...prev.socialMediaContent,
                                crossPost: e.target.checked
                              }
                            }));
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="crossPost" className="text-sm">
                          Enable cross-posting (same content across all selected platforms)
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            {editingEvent && (
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteEvent(editingEvent.id)}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={editingEvent ? handleUpdateEvent : handleCreateEvent} 
                className="bg-[var(--color-chart-blue)] hover:bg-[var(--color-chart-blue)]/90"
              >
                {editingEvent ? "Update Content" : "Schedule Content"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <SelectItem value="all">All types</SelectItem>
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
              <SelectItem value="all">All statuses</SelectItem>
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
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
        <div className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy")}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
              <div className="grid grid-cols-7 gap-1 auto-rows-fr" style={{ minHeight: "500px" }}>
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <Day
                      key={day.toISOString()}
                      day={day}
                      events={dayEvents}
                      onEventClick={handleEditEvent}
                      onClick={() => {
                        setNewEvent(prev => ({ ...prev, start: day }));
                        setIsDialogOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {calendarView === "week" && renderWeekView()}
          {calendarView === "day" && renderDayView()}
        </div>

        <DragOverlay>
          {activeDragEvent && (
            <div
              className={cn(
                "text-xs p-1.5 px-2 rounded-md truncate flex items-center gap-1.5",
                eventTypeColorMap[activeDragEvent.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
                eventTypeColorMap[activeDragEvent.type]?.text || "text-foreground",
                "shadow-lg"
              )}
            >
              {activeDragEvent.time && (
                <span className="text-[10px] font-medium opacity-70">
                  {activeDragEvent.time.substring(0, 5)}
                </span>
              )}
              <span className="truncate">{activeDragEvent.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
