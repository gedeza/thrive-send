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
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, addDays, addHours, setHours, setMinutes, addMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Day } from "./day";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventForm } from './EventForm';
import { EventDetails } from './EventDetails';
import { useTimezone } from "@/hooks/use-timezone";
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// Enhanced content type definitions
export type SocialPlatform = 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN';

export interface SocialMediaContent {
  platforms: SocialPlatform[];
  mediaUrls: string[];
  crossPost: boolean;
  platformSpecificContent: {
    [key in SocialPlatform]?: {
      text: string;
      mediaUrls: string[];
      scheduledTime?: string;
    };
  };
}

// Update the content type to match the backend expectations
export type ContentType = 'social' | 'blog' | 'email' | 'custom' | 'article';

// Update the event type color map to include all content types
export const eventTypeColorMap: Record<ContentType, { bg: string; text: string }> = {
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

// Add these interfaces after the existing interfaces
interface DragData {
  event: CalendarEvent;
  sourceDate: string;
  sourceTime?: string;
}

interface DropData {
  date: string;
  time?: string;
}

// Add these constants after the existing constants
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => i);
const TIME_SLOT_HEIGHT = 60; // pixels per hour
const HOURS_TO_SHOW = 12; // Show 12 hours by default (8 AM to 8 PM)
const START_HOUR = 8; // Start at 8 AM

// Add these constants after the existing constants
const DAY_VIEW_HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_VIEW_SLOT_HEIGHT = 60; // pixels per hour
const DAY_VIEW_EVENT_MIN_HEIGHT = 40; // minimum height for events in pixels

// Add these constants after the existing constants
const MAX_VISIBLE_EVENTS = 3; // Maximum number of events to show before "more" button
const EVENT_HEIGHT = 24; // Height of each event in pixels
const EVENT_MARGIN = 2; // Margin between events in pixels

// Add this interface for drag data
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

// Add these constants at the top of the file, after the imports
const DEFAULT_DURATIONS: Record<ContentType, number> = {
  social: 30, // 30 minutes for social posts
  blog: 120,  // 2 hours for blog posts
  email: 60,  // 1 hour for emails
  custom: 60, // 1 hour default for custom content
  article: 120 // 2 hours for articles
};

// Add this function near the top of the file, after imports
async function fetchEventAnalytics(eventId: string): Promise<void> {
  // This is a placeholder for the actual analytics fetching logic
  // In a real application, this would make an API call to fetch analytics data
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  date: string;
  time?: string;
  duration?: number; // Duration in minutes
  startTime?: string; // ISO string for backend
  endTime?: string;   // ISO string for backend
  scheduledDate?: string;
  scheduledTime?: string;
  socialMediaContent: SocialMediaContent;
  analytics?: {
    views?: number;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    clicks?: number;
    lastUpdated?: string;
  };
  preview?: {
    thumbnail?: string;
    platformPreviews?: {
      [key in SocialPlatform]?: {
        previewUrl?: string;
        status?: 'pending' | 'approved' | 'rejected';
        rejectionReason?: string;
      };
    };
  };
  organizationId: string;
  createdBy: string;
  tags?: string[]; // Add tags property to match main app interface
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

export function ContentCalendar({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateSelect,
  fetchEvents
}: ContentCalendarProps) {
  const { toast } = useToast();
  const userTimezone = useTimezone();
  
  // State
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return toZonedTime(now, userTimezone);
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingDialogClose, setPendingDialogClose] = useState(false);

  // Calculate days to display based on current month
  const daysInMonth = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => toZonedTime(day, userTimezone));
  }, [currentDate, userTimezone]);

  // Load events
  const loadEvents = async () => {
    if (!fetchEvents) {
      console.log("No fetchEvents handler provided");
      setLoading(false);
      return;
    }
    
    console.log("Starting to load events...");
    setLoading(true);
    setError(null);
    
    try {
      console.log("Calling fetchEvents...");
      const events = await fetchEvents();
      console.log("Events fetched successfully:", events);
      setEvents(events);
    } catch (error) {
      console.error("Failed to load calendar data:", error);
      
      // Handle database connection errors
      if (error instanceof Error && 
          (error.message.includes('Database connection') || 
           error.message.includes('Failed to fetch'))) {
        setError("Database connection error. Please try again in a few moments.");
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please try again in a few moments.",
          variant: "destructive",
        });
      } else {
        setError("Failed to load calendar data");
        toast({
          title: "Error",
          description: "Failed to load calendar data",
          variant: "destructive",
        });
      }
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Calendar component mounted, calling loadEvents");
    loadEvents();
  }, [fetchEvents]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen && !pendingDialogClose) {
      setSelectedEvent(null);
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
  }, [isCreateDialogOpen, isEditDialogOpen, pendingDialogClose]);

  // Update the handleCreateEvent function
  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      console.log("Creating event:", eventData);
      if (!onEventCreate) {
        throw new Error("onEventCreate handler is not provided");
      }

      // Get the default duration in minutes for this content type
      const defaultDurationMinutes = DEFAULT_DURATIONS[eventData.type];

      // Validate date and time
      if (!eventData.date) {
        throw new Error("Date is required");
      }

      // Parse the date
      const dateObj = new Date(eventData.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }

      // If time is provided, validate it
      let startTime: string;
      if (eventData.time) {
        const [hours, minutes] = eventData.time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          throw new Error("Invalid time format");
        }
        // Create date with time
        const dateTime = new Date(dateObj);
        dateTime.setHours(hours, minutes, 0, 0);
        startTime = dateTime.toISOString();
      } else {
        // If no time provided, use start of day
        const dateTime = new Date(dateObj);
        dateTime.setHours(0, 0, 0, 0);
        startTime = dateTime.toISOString();
      }

      // Calculate endTime based on content type and any custom duration
      const endTime = new Date(
        new Date(startTime).getTime() + 
        (eventData.duration || defaultDurationMinutes) * 60 * 1000
      ).toISOString();

      // Transform the event data to match the backend requirements
      const eventToSend: Omit<CalendarEvent, 'id'> = {
        ...eventData,
        startTime,
        endTime,
        // Remove date and time fields as they're now in startTime/endTime
        date: eventData.date, // Keep the original date for display purposes
        time: eventData.time, // Keep the original time for display purposes
        // Ensure required fields are present
        type: eventData.type,
        status: eventData.status || 'draft',
        organizationId: eventData.organizationId,
        createdBy: eventData.createdBy
      };

      const newEvent = await onEventCreate(eventToSend);
      console.log("Event created successfully:", newEvent);
      setEvents(prev => [...prev, newEvent]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update the filteredEvents memo to properly handle search
  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    
    return events.filter(event => {
      // Search in title and description
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchLower) ||
        (event.description?.toLowerCase().includes(searchLower) ?? false);
      
      // Filter by type
      const matchesType = selectedType === "all" || event.type === selectedType;
      
      // Filter by status
      const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchTerm, selectedType, selectedStatus]);

  // Update getEventsForDay to use timezone-aware comparison
  const getEventsForDay = (day: Date) => {
    const dayStr = formatInTimeZone(day, userTimezone, "yyyy-MM-dd");
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.date);
      const eventDateStr = formatInTimeZone(eventDate, userTimezone, "yyyy-MM-dd");
      return eventDateStr === dayStr;
    });
  };

  // Update getEventsForTimeRange to use timezone-aware comparison
  const getEventsForTimeRange = (start: Date, end: Date) => {
    try {
      const startStr = formatInTimeZone(start, userTimezone, "yyyy-MM-dd'T'HH:mm:ss");
      const endStr = formatInTimeZone(end, userTimezone, "yyyy-MM-dd'T'HH:mm:ss");
      
      return filteredEvents.filter(event => {
        try {
          const eventDate = parseISO(event.date);
          if (isNaN(eventDate.getTime())) {
            console.error('Invalid event date:', event.date);
            return false;
          }

          // Format the time string properly if it exists
          let eventTime;
          if (event.time) {
            try {
              // Parse the time string and ensure it's in HH:mm format
              const [hours, minutes] = event.time.split(':').map(Number);
              if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                console.error('Invalid time values:', event.time);
                return false;
              }
              const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              eventTime = parseISO(`${event.date}T${formattedTime}:00`);
            } catch (timeError) {
              console.error('Error parsing time:', timeError);
              return false;
            }
          } else {
            eventTime = eventDate;
          }

          if (isNaN(eventTime.getTime())) {
            console.error('Invalid event time:', event.time);
            return false;
          }

          const eventStr = formatInTimeZone(eventTime, userTimezone, "yyyy-MM-dd'T'HH:mm:ss");
          return eventStr >= startStr && eventStr <= endStr;
        } catch (error) {
          console.error('Error processing event:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in getEventsForTimeRange:', error);
      return [];
    }
  };

  // Add a search handler to ensure immediate updates
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Update date formatting to use user's timezone
  const formatDate = (date: Date, format: string) => {
    return formatInTimeZone(date, userTimezone, format);
  };

  // Add this component for the day view timeline
  function DayViewTimeline({ date, events, onEventClick }: { 
    date: Date; 
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
  }) {
    const { toast } = useToast();
    const userTimezone = useTimezone();

    // Group events by hour for better organization
    const eventsByHour = React.useMemo(() => {
      const grouped: { [key: number]: CalendarEvent[] } = {};
      DAY_VIEW_HOURS.forEach(hour => {
        grouped[hour] = events.filter(event => {
          if (!event.time) return false;
          const [eventHour] = event.time.split(':').map(Number);
          return eventHour === hour;
        });
      });
      return grouped;
    }, [events]);

    return (
      <div className="flex flex-col border rounded-md overflow-hidden">
        {/* Timeline header */}
        <div className="grid grid-cols-2 border-b bg-muted/50">
          <div className="p-2 font-medium">Time</div>
          <div className="p-2 font-medium">Events</div>
        </div>

        {/* Timeline content */}
        <div className="flex flex-col divide-y">
          {DAY_VIEW_HOURS.map((hour) => {
            const { setNodeRef, isOver } = useDroppable({
              id: `day-time-${formatInTimeZone(date, userTimezone, 'yyyy-MM-dd')}-${hour}`,
              data: {
                date: formatInTimeZone(date, userTimezone, 'yyyy-MM-dd'),
                time: `${hour.toString().padStart(2, '0')}:00`
              } as DropData
            });

            const hourEvents = eventsByHour[hour] || [];

            return (
              <div
                key={hour}
                ref={setNodeRef}
                className={cn(
                  "grid grid-cols-2 min-h-[60px]",
                  isOver && "bg-primary/5"
                )}
              >
                {/* Time column */}
                <div className="p-2 text-sm text-muted-foreground border-r">
                  {formatInTimeZone(setHours(date, hour), userTimezone, "h:mm a")}
                </div>

                {/* Events column */}
                <div className="relative p-2">
                  {hourEvents.map((event) => {
                    const [hours, minutes] = event.time?.split(':').map(Number) || [0, 0];
                    const duration = event.duration || DEFAULT_DURATIONS[event.type] || 60;
                    const height = Math.max(
                      (duration / 60) * DAY_VIEW_SLOT_HEIGHT,
                      DAY_VIEW_EVENT_MIN_HEIGHT
                    );

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "absolute left-2 right-2 p-2 rounded-md text-sm cursor-pointer",
                          eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
                          eventTypeColorMap[event.type]?.text || "text-foreground",
                          "hover:opacity-80 shadow-sm"
                        )}
                        style={{
                          top: `${(minutes / 60) * DAY_VIEW_SLOT_HEIGHT}px`,
                          height: `${height}px`,
                          zIndex: 1
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.time?.substring(0, 5)} - {formatInTimeZone(
                                addMinutes(
                                  parseISO(`${event.date}T${event.time}`),
                                  duration
                                ),
                                userTimezone,
                                "h:mm a"
                              )}
                            </div>
                          </div>
                          {event.type === 'social' && event.socialMediaContent?.platforms?.length > 0 && (
                            <div className="flex gap-1 ml-2">
                              {event.socialMediaContent.platforms.map(platform => (
                                <span
                                  key={platform}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[10px]",
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
                        {event.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </div>
                        )}
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
  }

  // Update the renderDayView function
  const renderDayView = () => {
    const dayEvents = getEventsForTimeRange(
      setHours(currentDate, 0),
      setHours(currentDate, 23)
    );

    return (
      <div className="space-y-4">
        {/* Day header */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              {formatInTimeZone(currentDate, userTimezone, "EEEE, MMMM d")}
            </h2>
            <p className="text-muted-foreground">
              {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
            </p>
          </div>
          <Button
            onClick={() => {
              setNewEvent(prev => ({ ...prev, start: currentDate }));
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        </div>

        {/* Timeline */}
        <DayViewTimeline
          date={currentDate}
          events={dayEvents}
          onEventClick={handleEventClick}
        />
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: HOURS_TO_SHOW }, (_, i) => i + START_HOUR);

    return (
      <div className="mt-4 border rounded-md overflow-hidden">
        <div className="grid grid-cols-8 divide-x divide-border">
          {/* Time column */}
          <div className="text-center">
            <div className="h-12 border-b bg-muted/50">
              <span className="sr-only">Time</span>
            </div>
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b p-1 text-xs text-muted-foreground">
                {formatDate(setHours(currentDate, hour), "h:mm a")}
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
                <div className={cn(
                  "h-12 border-b p-2 text-center",
                  isToday && "bg-primary/5"
                )}>
                  <div className="font-medium">{formatDate(day, "EEE")}</div>
                  <div className={cn(
                    "text-sm",
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {formatDate(day, "MMM d")}
                  </div>
                </div>
                
                {/* Hour cells with droppable areas */}
                <div className="relative">
                  {hours.map((hour) => {
                    const { setNodeRef, isOver } = useDroppable({
                      id: `time-${formatDate(day, 'yyyy-MM-dd')}-${hour}`,
                      data: {
                        date: formatDate(day, 'yyyy-MM-dd'),
                        time: `${hour.toString().padStart(2, '0')}:00`
                      } as DropData
                    });

                    return (
                      <div
                        key={hour}
                        ref={setNodeRef}
                        className={cn(
                          "h-20 border-b relative",
                          isOver && "bg-primary/5"
                        )}
                      />
                    );
                  })}
                </div>
                
                {/* Positioned events */}
                <div className="absolute top-12 left-0 right-0 bottom-0 pointer-events-none">
                  {dayEvents.map((event) => {
                    if (!event.time) return null;
                    
                    const [hours, minutes] = event.time.split(':').map(Number);
                    if (isNaN(hours) || isNaN(minutes) || hours < START_HOUR || hours >= START_HOUR + HOURS_TO_SHOW) {
                      return null;
                    }

                    const topPosition = ((hours - START_HOUR) * 60 + minutes) * (TIME_SLOT_HEIGHT / 60);
                    const duration = event.duration || DEFAULT_DURATIONS[event.type] || 60;
                    const height = (duration / 60) * TIME_SLOT_HEIGHT;
                    
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "absolute left-1 right-1 p-2 rounded text-xs pointer-events-auto cursor-pointer",
                          eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
                          eventTypeColorMap[event.type]?.text || "text-foreground",
                          "hover:opacity-80 shadow-sm"
                        )}
                        style={{
                          top: `${topPosition}px`,
                          height: `${height}px`,
                          zIndex: 1
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {event.time.substring(0, 5)}
                        </div>
                        {event.type === 'social' && event.socialMediaContent?.platforms?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {event.socialMediaContent.platforms.map(platform => (
                              <span
                                key={platform}
                                className={cn(
                                  "px-1.5 py-0.5 rounded-full text-[10px]",
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
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  // Handle updating an event
  const handleUpdateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!selectedEvent) {
      throw new Error("No event selected for update");
    }

    try {
      console.log("Updating event:", { ...eventData, id: selectedEvent.id });
      if (!onEventUpdate) {
        throw new Error("onEventUpdate handler is not provided");
      }
      const updatedEvent = await onEventUpdate({
        ...eventData,
        id: selectedEvent.id
      });
      console.log("Event updated successfully:", updatedEvent);
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle event click to show details
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Handle edit button click from event details
  const handleEditClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(false);  // Close the details dialog
    setIsEditDialogOpen(true);   // Open the edit dialog
  };

  // Handle delete confirmation
  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    if (!eventToDelete || !onEventDelete) return;
    
    try {
      await onEventDelete(eventToDelete.id);
      setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
      setShowDeleteConfirm(false);
      setEventToDelete(null);
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

  // Add this function after handleEventClick
  const handleRefreshAnalytics = async () => {
    if (!selectedEvent) return;
    
    try {
      await fetchEventAnalytics(selectedEvent.id);
      // In a real application, you would update the event with new analytics data
      // For now, we'll just simulate a refresh
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                lastUpdated: new Date().toISOString()
              }
            }
          : event
      ));
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      throw error;
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

  // Update the drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragData;
    if (dragData?.event) {
      setActiveDragEvent(dragData.event);
      setDragSourceDate(dragData.sourceDate);
      
      // Add visual feedback by adding a class to the dragged element
      const draggedElement = document.getElementById(active.id as string);
      if (draggedElement) {
        draggedElement.classList.add('dragging');
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Remove the dragging class
    const draggedElement = document.getElementById(active.id as string);
    if (draggedElement) {
      draggedElement.classList.remove('dragging');
    }
    
    if (!over || !activeDragEvent || !onEventUpdate) {
      setActiveDragEvent(null);
      setDragSourceDate(null);
      return;
    }

    try {
      // Get the target data from the drop target
      const targetData = over.data.current as DropData;
      if (!targetData?.date) {
        throw new Error("Invalid drop target");
      }

      // Create a new event object with the updated date and time
      const updatedEvent = {
        ...activeDragEvent,
        date: targetData.date,
        time: targetData.time || activeDragEvent.time,
        // Update startTime and endTime based on the new date and time
        startTime: targetData.time 
          ? `${targetData.date}T${targetData.time}:00`
          : `${targetData.date}T00:00:00`,
        endTime: targetData.time
          ? `${targetData.date}T${targetData.time}:00`
          : `${targetData.date}T23:59:59`
      };

      // Call the update function
      const result = await onEventUpdate(updatedEvent);
      
      // Update the local state with the result from the server
      setEvents(prev => prev.map(event => 
        event.id === result.id ? result : event
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

  const handleDialogClose = () => {
    setPendingDialogClose(true);
    setShowUnsavedChangesDialog(true);
  };

  const handleConfirmClose = () => {
    setShowUnsavedChangesDialog(false);
    setPendingDialogClose(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleCancelClose = () => {
    setShowUnsavedChangesDialog(false);
    setPendingDialogClose(false);
  };

  // Add this component for the month view day cell
  function MonthViewDay({ 
    day, 
    events, 
    isCurrentMonth, 
    onEventClick, 
    onClick 
  }: { 
    day: Date; 
    events: CalendarEvent[];
    isCurrentMonth: boolean;
    onEventClick: (event: CalendarEvent) => void;
    onClick: () => void;
  }) {
    const userTimezone = useTimezone();
    const { setNodeRef, isOver } = useDroppable({
      id: formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'),
      data: {
        date: formatInTimeZone(day, userTimezone, 'yyyy-MM-dd')
      } as DropData
    });

    const isToday = isSameDay(day, new Date());
    const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
    const hasMoreEvents = events.length > MAX_VISIBLE_EVENTS;

    // Group events by type for better organization
    const eventsByType = React.useMemo(() => {
      const grouped: { [key in ContentType]?: CalendarEvent[] } = {};
      events.forEach(event => {
        if (!grouped[event.type]) {
          grouped[event.type] = [];
        }
        grouped[event.type]?.push(event);
      });
      return grouped;
    }, [events]);

    return (
      <div
        ref={setNodeRef}
        className={cn(
          "relative min-h-[120px] p-2 border rounded-md",
          isToday && "bg-primary/5",
          !isCurrentMonth && "opacity-50",
          isOver && "drop-target"
        )}
        onClick={onClick}
      >
        {/* Day number */}
        <div className="flex justify-between items-center mb-1">
          <span className={cn(
            "text-sm font-medium",
            isToday && "text-primary font-bold"
          )}>
            {formatInTimeZone(day, userTimezone, "d")}
          </span>
          {events.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>

        {/* Events list */}
        <div className="space-y-1">
          {Object.entries(eventsByType).map(([type, typeEvents]) => (
            <div key={type} className="space-y-1">
              {typeEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={cn(
                    "text-xs p-1.5 px-2 rounded-md truncate cursor-move",
                    eventTypeColorMap[event.type as ContentType]?.bg || "bg-gray-100 dark:bg-gray-700/30",
                    eventTypeColorMap[event.type as ContentType]?.text || "text-foreground",
                    "hover:opacity-80"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {event.time && (
                      <span className="text-[10px] font-medium opacity-70">
                        {event.time.substring(0, 5)}
                      </span>
                    )}
                    {event.type === 'social' && event.socialMediaContent?.platforms?.length === 1 && (
                      <span className="text-[10px]">
                        {platformColorMap[event.socialMediaContent.platforms[0]].icon}
                      </span>
                    )}
                    <span className="truncate">{event.title}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* More events button */}
          {hasMoreEvents && (
            <button
              className="text-xs text-primary hover:underline w-full text-left"
              onClick={(e) => {
                e.stopPropagation();
                // Show all events for this day
                const dayEvents = events;
                // You can implement a modal or expand the cell to show all events
                console.log('Show all events for', formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'), dayEvents);
              }}
            >
              +{events.length - MAX_VISIBLE_EVENTS} more
            </button>
          )}
        </div>

        {/* Quick add button */}
        <button
          className="absolute bottom-1 right-1 p-1 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  // Update the month view rendering in the main component
  const renderMonthView = () => {
    return (
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
        <div className="grid grid-cols-7 gap-1 auto-rows-fr" style={{ minHeight: "600px" }}>
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={formatInTimeZone(day, userTimezone, "yyyy-MM-dd")}
                id={formatInTimeZone(day, userTimezone, "yyyy-MM-dd")}
                className={cn(
                  "relative group",
                  !isCurrentMonth && "opacity-50"
                )}
              >
                <MonthViewDay
                  day={day}
                  events={dayEvents}
                  isCurrentMonth={isCurrentMonth}
                  onEventClick={handleEventClick}
                  onClick={() => {
                    const selectedDate = formatInTimeZone(day, userTimezone, "yyyy-MM-dd");
                    setNewEvent(prev => ({ ...prev, start: day }));
                    setIsCreateDialogOpen(true);
                    setSelectedEvent({
                      id: crypto.randomUUID(),
                      title: "",
                      description: "",
                      type: "email",
                      status: "draft",
                      date: selectedDate,
                      time: "",
                      socialMediaContent: {
                        platforms: [],
                        crossPost: false,
                        mediaUrls: [],
                        platformSpecificContent: {}
                      },
                      organizationId: "",
                      createdBy: ""
                    });
                  }}
                />
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

  // Add this new component for time slots
  const TimeSlot = ({ hour, date }: { hour: number; date: string }) => {
    const { setNodeRef } = useDroppable({
      id: `time-${date}-${hour}`,
      data: {
        date,
        time: `${hour.toString().padStart(2, '0')}:00`
      } as DropData
    });

    return (
      <div
        ref={setNodeRef}
        className="h-[60px] border-b border-border hover:bg-muted/50 transition-colors"
        style={{ height: TIME_SLOT_HEIGHT }}
      />
    );
  };

  // Update the calendar view rendering in the main component's return statement
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-chart-blue)]">Content Calendar</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new event.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => {
              setPendingDialogClose(false);
              setIsCreateDialogOpen(false);
            }}
            initialData={selectedEvent || undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              initialData={selectedEvent}
              mode="edit"
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setPendingDialogClose(false);
                setIsEditDialogOpen(false);
                setSelectedEvent(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View and manage your scheduled content.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onEdit={() => handleEditClick(selectedEvent)}
              onDelete={() => {
                setShowEventDetails(false);
                handleDeleteClick(selectedEvent);
              }}
              onRefreshAnalytics={handleRefreshAnalytics}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{eventToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
          <Button variant="outline" onClick={() => setCurrentDate(toZonedTime(new Date(), userTimezone))}>
            Today
          </Button>
        </div>
        <div className="text-lg font-medium">
          {formatDate(currentDate, "MMMM yyyy")}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Calendar Views */}
        <div className="mt-4">
          {calendarView === "month" && renderMonthView()}
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

      {/* Add these styles to the component's return statement, just before the closing div */}
      <style jsx global>{`
        .dragging {
          opacity: 0.5;
          cursor: grabbing;
        }
        
        .drop-target {
          background-color: var(--color-primary-100);
          border: 2px dashed var(--color-primary-500);
        }
      `}</style>
    </div>
  );
}
