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
  analytics?: {
    lastUpdated: string;
  };
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

// Add this function near the top of the file, after imports
async function fetchEventAnalytics(eventId: string): Promise<void> {
  // This is a placeholder for the actual analytics fetching logic
  // In a real application, this would make an API call to fetch analytics data
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
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
    if (!isCreateDialogOpen && !isEditDialogOpen) {
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
  }, [isCreateDialogOpen, isEditDialogOpen]);

  // Handle creating a new event
  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      if (onEventCreate) {
        const newEvent = await onEventCreate(eventData);
        setEvents(prev => [...prev, newEvent]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  };

  // Update the filteredEvents memo to properly handle search
  const filteredEvents = React.useMemo(() => {
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

  // Update getEventsForDay to use filteredEvents
  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return filteredEvents.filter(event => event.date.startsWith(dayStr));
  };

  // Update getEventsForTimeRange to use filteredEvents
  const getEventsForTimeRange = (start: Date, end: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.date);
      const eventTime = event.time ? parseISO(`${event.date}T${event.time}`) : eventDate;
      return eventTime >= start && eventTime <= end;
    });
  };

  // Add a search handler to ensure immediate updates
  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
                      className={cn(
                        "p-2 rounded text-sm mb-1 cursor-pointer",
                        eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
                        eventTypeColorMap[event.type]?.text || "text-foreground",
                        "hover:opacity-80"
                      )}
                      onClick={() => handleEventClick(event)}
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
                        className={cn(
                          "absolute left-1 right-1 p-2 rounded text-xs pointer-events-auto cursor-pointer",
                          eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
                          eventTypeColorMap[event.type]?.text || "text-foreground",
                          "hover:opacity-80"
                        )}
                        style={{
                          top: `${topPosition}px`,
                          height: "50px"
                        }}
                        onClick={() => handleEventClick(event)}
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
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  // Handle updating an event
  const handleUpdateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!selectedEvent) return;

    try {
      if (onEventUpdate) {
        const updatedEvent = await onEventUpdate({
          ...eventData,
          id: selectedEvent.id
        });
        setEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ));
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };

  // Handle event click to show details
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
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
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeDragEvent || !onEventUpdate) {
      setActiveDragEvent(null);
      setDragSourceDate(null);
      return;
    }

    try {
      // Get the target date from the drop target's data
      const targetDate = over.data.current?.date as string;
      if (!targetDate) {
        throw new Error("Invalid drop target");
      }

      // Create a new event object with the updated date
      const updatedEvent = {
        ...activeDragEvent,
        date: targetDate,
        // Preserve the original time if it exists
        time: activeDragEvent.time || undefined
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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new event.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                setIsEditDialogOpen(false);
                setSelectedEvent(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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
              onEdit={() => {
                setShowEventDetails(false);
                handleEditEvent(selectedEvent);
              }}
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
        modifiers={[restrictToWindowEdges]}
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
                  const dayStr = format(day, "yyyy-MM-dd");
                  return (
                    <div
                      key={dayStr}
                      id={dayStr}
                      className="relative"
                    >
                      <Day
                        day={day}
                        events={dayEvents}
                        onEventClick={handleEventClick}
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, start: day }));
                          setIsCreateDialogOpen(true);
                        }}
                      />
                    </div>
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
