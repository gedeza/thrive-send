"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter, LayoutGrid, LayoutList, Clock, Facebook, Twitter, Instagram, Linkedin, Upload, X, Settings as SettingsIcon, RefreshCw, Bug } from "lucide-react";
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
import { ContentCalendarSync } from "@/components/content/ContentCalendarSync";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import debounce from 'lodash/debounce';
import { MonthView } from './MonthView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import { WeekView } from './WeekView';
import { CalendarHeader } from './CalendarHeader';
// Add these constants at the top of the file, after the imports
export const DEFAULT_DURATIONS: Record<ContentType, number> = {
  social: 30, // 30 minutes for social posts
  blog: 120,  // 2 hours for blog posts
  email: 60,  // 1 hour for emails
  custom: 60, // 1 hour default for custom content
  article: 120 // 2 hours for articles
};
// NOTE: This file contains inline definitions for components that were originally defined in separate files.
// The MonthView, WeekView, DayView, ListView, CalendarHeader, and CalendarFilters components are defined inline
// rather than imported from separate files.

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

// Define CalendarView type here since we can't import it
export type CalendarView = "month" | "week" | "day" | "list";

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
const platformColorMap: Record<SocialPlatform, { bg: string; text: string; icon: React.ReactNode }> = {
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
  { value: "list", label: "List" }
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



// Add this function near the top of the file, after imports
async function fetchEventAnalytics(eventId: string): Promise<void> {
  return new Promise((resolve) => {
  });
}

export interface ContentCalendarProps {
  events?: CalendarEvent[];
  onEventCreate?: (event: Omit<CalendarEvent, "id">) => Promise<CalendarEvent>;
  onEventUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>;
  onEventDelete?: (eventId: string) => Promise<boolean>;
  onDateSelect?: (day: string) => void;
  fetchEvents?: () => Promise<CalendarEvent[]>;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  onSyncClick?: () => void;
  onSettingsClick?: () => void;
}

// Add these utility functions before the ContentCalendar component
function groupEventsByHour(events: CalendarEvent[]): { [key: number]: CalendarEvent[] } {
  const grouped: { [key: number]: CalendarEvent[] } = {};
  events.forEach(event => {
    if (!event.time) return;
    const [hours] = event.time.split(':').map(Number);
    if (!grouped[hours]) {
      grouped[hours] = [];
    }
    grouped[hours].push(event);
  });
  return grouped;
}

function groupEventsByType(events: CalendarEvent[]): { [key: string]: CalendarEvent[] } {
  const grouped: { [key: string]: CalendarEvent[] } = {};
  events.forEach(event => {
    if (!grouped[event.type]) {
      grouped[event.type] = [];
    }
    grouped[event.type].push(event);
  });
  return grouped;
}

// Add this type guard function
function isValidContentType(type: any): type is ContentType {
  return ['social', 'blog', 'email', 'custom', 'article'].includes(type);
}

// Define CalendarEvent interface
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  date: string;
  time?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
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
  tags?: string[];
}

export function ContentCalendar({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateSelect,
  fetchEvents,
  defaultView = "month",
  onViewChange,
  onSyncClick,
  onSettingsClick
}: ContentCalendarProps) {
  const { toast } = useToast();
  const userTimezone = useTimezone();
  
  // State
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return toZonedTime(now, userTimezone);
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>(defaultView);
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
  const isFetchingRef = useRef<boolean>(false);
  const initialEventsRef = useRef<boolean>(false);

  // Add a ref to track if we're already fetching
  const lastFetchTime = useRef(0);
  
  // Direct fetch function - moved up before it's used
  const fetchCalendarEventsDirectly = async () => {
    try {
      console.log("==== DEBUGGING CALENDAR DATA ISSUES ====");
      // Try the debug endpoint first to check if data exists
      const debugResponse = await fetch('/api/calendar/debug', {
        credentials: 'include'
      });
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log("Debug API response:", debugData);
        console.log("Calendar events count:", debugData.calendarEvents?.count);
        console.log("Calendar events sample:", debugData.calendarEvents?.sample);
        
        // If debug shows events exist but we're not getting them, try direct fetch
        if (debugData.calendarEvents?.count > 0) {
          const response = await fetch('/api/calendar/events', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            credentials: 'include'
          });
          
          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
          
          const data = await response.json();
          console.log(`Direct fetch found ${data.events?.length || 0} events`);
          console.log("Raw API events sample:", data.events?.slice(0, 2));
          
          if (data.events && Array.isArray(data.events)) {
            try {
              const calendarEvents = data.events.map((event: any, index: number) => {
                console.log(`Converting event ${index}:`, event);
                try {
                  const convertedEvent = convertApiEventToCalendarEvent(event);
                  console.log(`Successfully converted event ${index}:`, convertedEvent);
                  return convertedEvent;
                } catch (convErr: unknown) {
                  console.error(`Error converting event ${index}:`, convErr);
                  console.error("Problematic event:", event);
                  // Return a minimal valid event to prevent the whole array from failing
                  return {
                    id: event.id || `error-${index}`,
                    title: event.title || "Conversion Error",
                    description: `Error converting event: ${convErr instanceof Error ? convErr.message : String(convErr)}`,
                    type: 'custom',
                    status: 'draft',
                    date: event.startTime?.split('T')[0] || new Date().toISOString().split('T')[0],
                    socialMediaContent: {
                      platforms: [],
                      mediaUrls: [],
                      crossPost: false,
                      platformSpecificContent: {}
                    },
                    organizationId: event.organizationId || '',
                    createdBy: event.createdBy || ''
                  };
                }
              });
              console.log(`Converted ${calendarEvents.length} events successfully`);
              return calendarEvents;
            } catch (mapErr) {
              console.error("Error mapping API events to calendar events:", mapErr);
              throw mapErr;
            }
          } else {
            console.warn("No events array found in API response:", data);
          }
        } else {
          console.log("Debug API shows no events exist in database");
        }
      } else {
        console.error("Debug API failed:", await debugResponse.text());
      }
      
      return [];
    } catch (err) {
      console.error("Error in direct fetch:", err);
      setError(err instanceof Error ? err.message : "Failed to directly load calendar events");
      return [];
    }
  };
  
  // Define the loadEvents function
  const loadEvents = useCallback(async () => {
    try {
      console.log("Fetching calendar events...");
      if (!fetchEvents) {
        console.log("No fetchEvents function provided, trying direct fetch");
        return await fetchCalendarEventsDirectly();
      }
      const fetchedEvents = await fetchEvents();
      console.log(`Fetched ${fetchedEvents.length} events:`, fetchedEvents);
      setError(null);
      return fetchedEvents;
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError(err instanceof Error ? err.message : "Failed to load calendar events");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load calendar events",
        variant: "destructive",
      });
      return [];
    }
  }, [fetchEvents, toast, fetchCalendarEventsDirectly]);
  
  // Debounce the loadEvents function to prevent rapid refetching
  const debouncedLoadEvents = useCallback(
    debounce(async () => {
      if (isFetchingRef.current) return;
      
      // Rate limiting: don't fetch more than once every 2 seconds
      const now = Date.now();
      if (now - lastFetchTime.current < 2000) return;
      
      isFetchingRef.current = true;
      lastFetchTime.current = now;
      
      try {
        setLoading(true);
        const newEvents = await loadEvents();
        
        // Only update events if there are actual changes to prevent unnecessary re-renders
        if (JSON.stringify(newEvents) !== JSON.stringify(events)) {
          setEvents(newEvents);
        }
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }, 500),
    [loadEvents, events]
  );

  // Replace the useEffect that loads events
  useEffect(() => {
    // Skip loading on initial render if we already have events
    if (events.length > 0 && initialEventsRef.current) {
      console.log('[ContentCalendar] Skipping initial load as events are already provided');
      return;
    }
    
    // Track that we've now seen the initial events
    initialEventsRef.current = true;
    
    // Only load events when relevant filters change or when explicitly requested
    debouncedLoadEvents();
    
    // Clean up the debounced function on unmount
    return () => {
      debouncedLoadEvents.cancel();
    };
  }, [debouncedLoadEvents]); // Only depend on debouncedLoadEvents

  // Add a separate effect for filter changes
  useEffect(() => {
    // Don't run on initial render
    if (!initialEventsRef.current) return;
    
    // When filters change, load with a longer delay
    const timeoutId = setTimeout(() => {
      debouncedLoadEvents();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [currentDate, selectedType, selectedStatus, searchTerm]);

  // Calculate days to display based on current month
  const daysInMonth = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => toZonedTime(day, userTimezone));
  }, [currentDate, userTimezone]);

  // Helper function to convert API event to calendar event
  const convertApiEventToCalendarEvent = (event: any): CalendarEvent => {
    console.log("Converting event with structure:", Object.keys(event));
    
    // Extract platforms from socialMediaContent if available
    const platforms: SocialPlatform[] = [];
    
    // Handle different formats of socialMediaContent
    if (event.socialMediaContent) {
      if (typeof event.socialMediaContent === 'object') {
        // Handle v2 format (object with platform property)
        if (event.socialMediaContent.platform) {
          try {
            platforms.push(event.socialMediaContent.platform as SocialPlatform);
          } catch (err) {
            console.error("Error adding platform:", err);
          }
        } 
        // Handle v1 format (array of platforms)
        else if (Array.isArray(event.socialMediaContent)) {
          try {
            event.socialMediaContent.forEach((platform: string) => {
              if (platform && typeof platform === 'string') {
                platforms.push(platform as SocialPlatform);
              }
            });
          } catch (err) {
            console.error("Error processing platforms array:", err);
          }
        }
      }
    }
    
    // Create socialMediaContent structure
    const socialMediaContent: SocialMediaContent = {
      platforms,
      mediaUrls: event.socialMediaContent?.mediaUrls || [],
      crossPost: Boolean(event.socialMediaContent?.crossPost),
      platformSpecificContent: {}
    };
    
    // Add platform-specific content if available
    if (event.socialMediaContent?.platform && event.socialMediaContent?.content) {
      try {
        const platform = event.socialMediaContent.platform as SocialPlatform;
        socialMediaContent.platformSpecificContent[platform] = {
          text: event.socialMediaContent.content,
          mediaUrls: event.socialMediaContent.mediaUrls || [],
          scheduledTime: event.socialMediaContent.scheduledTime
        };
      } catch (err) {
        console.error("Error adding platform-specific content:", err);
      }
    }
    
    // Extract date and time from various possible formats
    let date = '';
    let time = '';
    try {
      if (event.startTime) {
        const startDate = new Date(event.startTime);
        date = startDate.toISOString().split('T')[0];
        time = startDate.toTimeString().split(' ')[0].substring(0, 5);
      } else if (event.date) {
        date = event.date;
        time = event.time || '';
      } else if (event.scheduledAt) {
        const scheduledDate = new Date(event.scheduledAt);
        date = scheduledDate.toISOString().split('T')[0];
        time = scheduledDate.toTimeString().split(' ')[0].substring(0, 5);
      } else {
        console.warn("No date information found in event:", event);
        // Default to today's date if no date info is available
        date = new Date().toISOString().split('T')[0];
      }
    } catch (err) {
      console.error("Error extracting date/time:", err);
      date = new Date().toISOString().split('T')[0];
    }
    
    // Ensure type is valid
    const eventType = isValidContentType(event.type) ? event.type : 'custom';
    
    // Map status values
    let status: 'draft' | 'scheduled' | 'sent' | 'failed' = 'draft';
    if (event.status) {
      if (event.status === 'published' || event.status === 'PUBLISHED') {
        status = 'sent';
      } else if (event.status === 'scheduled' || event.status === 'SCHEDULED') {
        status = 'scheduled';
      } else if (event.status === 'failed' || event.status === 'FAILED') {
        status = 'failed';
      } else if (typeof event.status === 'string') {
        status = event.status.toLowerCase() as any;
      }
    }
    
    return {
      id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      type: eventType,
      status,
      date,
      time,
      startTime: event.startTime,
      endTime: event.endTime,
      socialMediaContent,
      analytics: event.analytics,
      organizationId: event.organizationId || '',
      createdBy: event.createdBy || ''
    };
  };

  // Memoize the filteredEvents calculation to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
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

  // Memoize utility functions to prevent recreating them on each render
  const formatDate = useCallback((date: Date, format: string) => {
    return formatInTimeZone(date, userTimezone, format);
  }, [userTimezone]);

  const getEventsForDay = useCallback((day: Date) => {
    const dayStr = formatInTimeZone(day, userTimezone, "yyyy-MM-dd");
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.date);
      const eventDateStr = formatInTimeZone(eventDate, userTimezone, "yyyy-MM-dd");
      return eventDateStr === dayStr;
    });
  }, [filteredEvents, userTimezone]);

  // Event handlers as callbacks to prevent recreation on each render
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  }, []);

  const handleEditClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(false);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((event: CalendarEvent) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  }, []);

  const handleDateClick = useCallback((day: Date) => {
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
  }, [userTimezone]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
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
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
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
  }, [activeDragEvent, onEventUpdate, toast]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // View components
  const MonthViewDay = ({ 
    day, 
    events, 
    isCurrentMonth, 
    onEventClick, 
    onClick,
    userTimezone 
  }: { 
    day: Date; 
    events: CalendarEvent[];
    isCurrentMonth: boolean;
    onEventClick: (event: CalendarEvent) => void;
    onClick: () => void;
    userTimezone: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'),
      data: {
        date: formatInTimeZone(day, userTimezone, 'yyyy-MM-dd')
      } as DropData
    });

    const isToday = isSameDay(day, toZonedTime(new Date(), userTimezone));
    const eventsByType = groupEventsByType(events);
    const hasMoreEvents = events.length > MAX_VISIBLE_EVENTS;
    const dateString = formatInTimeZone(day, userTimezone, 'EEEE, MMMM d, yyyy');

    return (
      <div
        ref={setNodeRef}
        className={cn(
          "relative min-h-[120px] p-2 border rounded-md hover:bg-muted/50 transition-colors",
          isToday && "bg-primary/5",
          !isCurrentMonth && "opacity-50",
          isOver && "bg-muted/80",
          "flex flex-col h-full"
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${dateString}${events.length > 0 ? `, ${events.length} ${events.length === 1 ? 'event' : 'events'}` : ', no events'}`}
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
        <div className="space-y-1 flex-1 overflow-y-auto">
          {Object.entries(eventsByType).map(([type, typeEvents]) => (
            <div key={type} className="space-y-1">
              {(typeEvents as CalendarEvent[]).slice(0, MAX_VISIBLE_EVENTS).map((event: CalendarEvent) => (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={cn(
                    "text-xs p-1.5 px-2 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity",
                    isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100 dark:bg-gray-700/30",
                    isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-foreground",
                    "flex items-center gap-1.5"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onEventClick(event);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${event.title}, ${event.type} event${event.time ? ` at ${event.time}` : ''}`}
                >
                  {event.time && (
                    <span className="text-[10px] font-medium opacity-70 whitespace-nowrap">
                      {event.time.substring(0, 5)}
                    </span>
                  )}
                  {event.type === 'social' && event.socialMediaContent?.platforms?.length === 1 && (
                    <span className="text-[10px] flex-shrink-0" aria-hidden="true">
                      {platformColorMap[event.socialMediaContent.platforms[0] as SocialPlatform]?.icon}
                    </span>
                  )}
                  <span className="truncate flex-1">{event.title}</span>
                </div>
              ))}
            </div>
          ))}

          {/* More events button */}
          {hasMoreEvents && (
            <button
              className="text-xs text-primary hover:underline w-full text-left mt-1"
              onClick={(e) => {
                e.stopPropagation();
                // Show all events for this day
                const dayEvents = events;
                // You can implement a modal or expand the cell to show all events
                console.log('Show all events for', formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'), dayEvents);
              }}
              aria-label={`Show all ${events.length} events for ${dateString}`}
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
          aria-label={`Add event on ${dateString}`}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  };

  const TimeSlot = ({ 
    hour, 
    date,
    userTimezone 
  }: { 
    hour: number; 
    date: string;
    userTimezone: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `time-${date}-${hour}`,
      data: {
        date,
        time: `${hour.toString().padStart(2, '0')}:00`
      } as DropData
    });

    return (
      <div
        ref={setNodeRef}
        className={cn(
          "h-20 border-b relative min-h-[80px]",
          isOver && "bg-primary/5"
        )}
      />
    );
  };

  const DayViewTimeSlot = ({ 
    hour, 
    date, 
    events, 
    onEventClick,
    userTimezone 
  }: { 
    hour: number; 
    date: Date; 
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    userTimezone: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `day-time-${formatInTimeZone(date, userTimezone, 'yyyy-MM-dd')}-${hour}`,
      data: {
        date: formatInTimeZone(date, userTimezone, 'yyyy-MM-dd'),
        time: `${hour.toString().padStart(2, '0')}:00`
      } as DropData
    });

    return (
      <div
        ref={setNodeRef}
        className={cn(
          "grid grid-cols-2 min-h-[60px]",
          isOver && "bg-muted/80"
        )}
      >
        {/* Time column */}
        <div className="p-2 text-sm text-muted-foreground border-r">
          {formatInTimeZone(setHours(date, hour), userTimezone, "h:mm a")}
        </div>

        {/* Events column */}
        <div className="relative p-2">
          {events.map((event: CalendarEvent) => {
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
                  "absolute left-2 right-2 p-2 rounded-md text-sm cursor-pointer hover:opacity-80 transition-opacity",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100 dark:bg-gray-700/30",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-foreground",
                  "shadow-sm"
                )}
                style={{
                  top: `${(minutes / 60) * DAY_VIEW_SLOT_HEIGHT}px`,
                  height: `${height}px`,
                  zIndex: 1
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start justify-between h-full">
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
                      {event.socialMediaContent.platforms.map((platform: SocialPlatform) => (
                        <span key={platform} className="text-[10px]">
                          {platformColorMap[platform]?.icon}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ListView = ({ 
    events, 
    onEventClick,
  }: { 
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
  }) => {
    const userTimezone = useTimezone();
    
    // Sort events by date and time
    const sortedEvents = useMemo(() => {
      return [...events].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
    }, [events]);

    return (
      <div className="space-y-4">
        {/* Header row - responsive */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-muted/50 rounded-md font-medium text-sm">
          <div className="col-span-3">Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Date & Time</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Platforms</div>
        </div>
        
        {/* Mobile header */}
        <div className="md:hidden flex justify-between p-4 bg-muted/50 rounded-md font-medium text-sm">
          <div>Content</div>
          <div>Details</div>
        </div>
        
        {/* Event list */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {sortedEvents.map((event) => (
            <div 
              key={event.id} 
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onEventClick(event)}
            >
              {/* Mobile view */}
              <div className="md:hidden space-y-2">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-muted-foreground">{event.description}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                    isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100",
                    isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-gray-700"
                )}>
                  {event.type}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  event.status === 'draft' && "bg-yellow-100 text-yellow-800",
                  event.status === 'scheduled' && "bg-blue-100 text-blue-800",
                  event.status === 'sent' && "bg-green-100 text-green-800",
                  event.status === 'failed' && "bg-red-100 text-red-800"
                )}>
                  {event.status}
                </span>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:block md:col-span-3">
                <div className="font-medium truncate">{event.title}</div>
                {event.description && (
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </div>
                )}
              </div>
              
              <div className="hidden md:block md:col-span-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-gray-700"
                )}>
                  {event.type}
                </span>
              </div>
              
              {/* Date & Time column */}
              <div className="hidden md:block md:col-span-2">
                <div className="text-sm">
                  {formatInTimeZone(new Date(`${event.date}T${event.time || '00:00'}`), userTimezone, "MMM d, yyyy")}
                </div>
                {event.time && (
                  <div className="text-sm text-muted-foreground">
                    {formatInTimeZone(new Date(`${event.date}T${event.time}`), userTimezone, "h:mm a")}
                  </div>
                )}
              </div>

              {/* Status column */}
              <div className="hidden md:block md:col-span-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  event.status === 'draft' && "bg-yellow-100 text-yellow-800",
                  event.status === 'scheduled' && "bg-blue-100 text-blue-800",
                  event.status === 'sent' && "bg-green-100 text-green-800",
                  event.status === 'failed' && "bg-red-100 text-red-800"
                )}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>

              {/* Platforms column */}
              <div className="hidden md:block md:col-span-3">
                {event.type === 'social' && event.socialMediaContent?.platforms?.length > 0 ? (
                  <div className="flex gap-2">
                    {event.socialMediaContent.platforms.map((platform: SocialPlatform) => (
                      <span key={platform} className="text-sm">
                        {platformColorMap[platform]?.icon}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))}

          {sortedEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No events found
            </div>
          )}
        </div>
      </div>
    );
  };

  // View render functions
  const renderMonthView = (
    currentDate: Date,
    daysInMonth: Date[],
    getEventsForDay: (day: Date) => CalendarEvent[],
    handleEventClick: (event: CalendarEvent) => void,
    handleDateClick: (day: Date) => void,
    userTimezone: string
  ) => {
    return (
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium py-1 text-muted-foreground">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid - use min-height with aspect ratio */}
        <div className="grid grid-cols-7 gap-1 auto-rows-fr" style={{ minHeight: "calc(50vh)" }}>
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={formatInTimeZone(day, userTimezone, "yyyy-MM-dd")}
                className={cn(
                  "relative group h-full",
                  !isCurrentMonth && "opacity-50"
                )}
              >
                <MonthViewDay
                  day={day}
                  events={dayEvents}
                  isCurrentMonth={isCurrentMonth}
                  onEventClick={handleEventClick}
                  onClick={() => handleDateClick(day)}
                  userTimezone={userTimezone}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = (
    currentDate: Date,
    getEventsForDay: (day: Date) => CalendarEvent[],
    handleEventClick: (event: CalendarEvent) => void,
    userTimezone: string
  ) => {
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
                {formatInTimeZone(setHours(currentDate, hour), userTimezone, "h:mm a")}
              </div>
            ))}
          </div>
          
          {/* Days of the week */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, toZonedTime(new Date(), userTimezone));
            
            return (
              <div key={day.toISOString()} className="relative">
                {/* Day header */}
                <div className={cn(
                  "h-12 border-b p-2 text-center",
                  isToday && "bg-primary/5"
                )}>
                  <div className="font-medium">{formatInTimeZone(day, userTimezone, "EEE")}</div>
                  <div className={cn(
                    "text-sm",
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {formatInTimeZone(day, userTimezone, "MMM d")}
                  </div>
                </div>
                
                {/* Hour cells with droppable areas */}
                <div className="relative">
                  {hours.map((hour) => (
                    <TimeSlot
                      key={hour}
                      hour={hour}
                      date={formatInTimeZone(day, userTimezone, 'yyyy-MM-dd')}
                      userTimezone={userTimezone}
                    />
                  ))}
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
                          "absolute left-1 right-1 p-2 rounded text-xs pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity",
                          isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100 dark:bg-gray-700/30",
                          isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-foreground",
                          "shadow-sm"
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

  const renderDayView = (
    currentDate: Date,
    getEventsForDay: (day: Date) => CalendarEvent[],
    handleEventClick: (event: CalendarEvent) => void,
    userTimezone: string
  ) => {
    const date = currentDate;
    const eventsByHour = groupEventsByHour(getEventsForDay(date));

    return (
      <div className="flex flex-col border rounded-md overflow-hidden">
        {/* Timeline header */}
        <div className="grid grid-cols-2 border-b bg-muted/50">
          <div className="p-2 font-medium">Time</div>
          <div className="p-2 font-medium">Events</div>
        </div>

        {/* Timeline content */}
        <div className="flex flex-col divide-y overflow-y-auto max-h-[600px]">
          {DAY_VIEW_HOURS.map((hour) => (
            <DayViewTimeSlot
              key={hour}
              hour={hour}
              date={date}
              events={eventsByHour[hour] || []}
              onEventClick={handleEventClick}
              userTimezone={userTimezone}
            />
          ))}
        </div>
      </div>
    );
  };

  // Fix the MemoizedMonthView component
  const MemoizedMonthView = React.memo(({ 
    currentDate, 
    daysInMonth, 
    getEventsForDay, 
    handleEventClick, 
    handleDateClick, 
    userTimezone 
  }: {
    currentDate: Date; 
    daysInMonth: Date[]; 
    getEventsForDay: (day: Date) => CalendarEvent[]; 
    handleEventClick: (event: CalendarEvent) => void; 
    handleDateClick: (day: Date) => void; 
    userTimezone: string;
  }) => {
    // Implement the MonthView functionality directly here
    return renderMonthView(
      currentDate,
      daysInMonth,
      getEventsForDay,
      handleEventClick,
      handleDateClick,
      userTimezone
    );
  });

  // Add a display name to the memoized component
  MemoizedMonthView.displayName = 'MemoizedMonthView';

  return (
    <div className="space-y-4 border rounded-xl p-4 bg-card shadow-sm">
      <CalendarHeader
        calendarView={calendarView}
        onViewChange={(view) => {
          setCalendarView(view);
          onViewChange?.(view);
        }}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onAddEvent={() => {
          setNewEvent(prev => ({ ...prev, start: currentDate }));
          setIsCreateDialogOpen(true);
        }}
        onDebug={async () => {
          try {
            setLoading(true);
            await fetchCalendarEventsDirectly();
            toast({
              title: "Debug",
              description: `Attempted direct data fetch. Check console for details.`,
            });
          } catch (err) {
            toast({
              title: "Debug Error",
              description: err instanceof Error ? err.message : "Error during debug fetch",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }}
        loading={loading}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Calendar Views */}
        <div className="bg-background rounded-lg border">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading calendar events...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[50vh] p-8">
              <div className="text-destructive text-center mb-4">
                <X className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Database connection error</p>
              </div>
              <p className="text-muted-foreground text-center">
                Unable to connect to the database. Your Neon database has reached its compute allowance limit.
              </p>
              <div className="mt-4 flex gap-4">
                <Button variant="outline" onClick={() => fetchEvents && fetchEvents()}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Retry
                </Button>
                <Button variant="default" onClick={() => window.open('https://console.neon.tech', '_blank')}>
                  Upgrade Neon Plan
                </Button>
              </div>
            </div>
          ) : (
            <>
              {calendarView === "month" && (
                <div className="p-4">
                  <MonthView
                    currentDate={currentDate}
                    daysInMonth={daysInMonth}
                    getEventsForDay={getEventsForDay}
                    handleEventClick={handleEventClick}
                    handleDateClick={handleDateClick}
                    userTimezone={userTimezone}
                  />
                </div>
              )}
              {calendarView === "week" && (
                <div className="p-4">
                  {renderWeekView(
                    currentDate,
                    getEventsForDay,
                    handleEventClick,
                    userTimezone
                  )}
                </div>
              )}
              {calendarView === "day" && (
                <div className="p-4">
                  <DayView
                    date={currentDate}
                    getEventsForDay={getEventsForDay}
                    onEventClick={handleEventClick}
                    userTimezone={userTimezone}
                  />
                </div>
              )}
              {calendarView === "list" && (
                <div className="p-4">
                  <ListView events={filteredEvents} onEventClick={handleEventClick} />
                </div>
              )}
            </>
          )}
        </div>

        <DragOverlay>
          {activeDragEvent && (
            <div
              className={cn(
                "text-xs p-2 rounded-md truncate flex items-center gap-2 shadow-lg border",
                isValidContentType(activeDragEvent.type) ? eventTypeColorMap[activeDragEvent.type].bg : "bg-gray-100",
                isValidContentType(activeDragEvent.type) ? eventTypeColorMap[activeDragEvent.type].text : "text-foreground",
                "transform scale-105 transition-transform"
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

      {/* Dialogs */}
      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your content calendar.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            mode="create"
            initialData={{
              date: format(newEvent.start, "yyyy-MM-dd"),
              time: format(newEvent.start, "HH:mm"),
              status: "draft",
              type: "email"
            }}
            onSubmit={async (event) => {
              if (onEventCreate) {
                try {
                  const created = await onEventCreate(event);
                  setEvents(prev => [...prev, created]);
                  setIsCreateDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Event created successfully",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to create event",
                    variant: "destructive",
                  });
                }
              }
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Make changes to your event details.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              mode="edit"
              initialData={selectedEvent}
              onSubmit={async (event) => {
                if (onEventUpdate) {
                  try {
                    const updated = await onEventUpdate(event);
                    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
                    setIsEditDialogOpen(false);
                    toast({
                      title: "Success",
                      description: "Event updated successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to update event",
                      variant: "destructive",
                    });
                  }
                }
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onEdit={() => {
                setShowEventDetails(false);
                setIsEditDialogOpen(true);
              }}
              onDelete={() => {
                setShowEventDetails(false);
                setEventToDelete(selectedEvent);
                setShowDeleteConfirm(true);
              }}
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
              "{eventToDelete?.title}" from your calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (eventToDelete && onEventDelete) {
                  try {
                    await onEventDelete(eventToDelete.id);
                    setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
                    setShowDeleteConfirm(false);
                    setEventToDelete(null);
                    toast({
                      title: "Success",
                      description: "Event deleted successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to delete event",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setPendingDialogClose(false);
                if (isCreateDialogOpen) setIsCreateDialogOpen(false);
                if (isEditDialogOpen) setIsEditDialogOpen(false);
                setShowUnsavedChangesDialog(false);
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
