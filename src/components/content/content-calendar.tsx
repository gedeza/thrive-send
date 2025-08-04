"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
// Temporarily disable bundle optimizer import to fix lazy loading issue
// import { 
//   preloadCriticalComponents, 
//   progressiveEnhancement, 
//   usePerformanceMonitoring
// } from "@/lib/utils/bundle-optimizer";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter, LayoutGrid, LayoutList, Clock, Facebook, Twitter, Instagram, Linkedin, Video, Upload, X, Settings as SettingsIcon, RefreshCw, Trash2 } from "lucide-react";
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
import { format, parseISO, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, setHours, addMinutes, addMonths, subMonths } from 'date-fns';
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
// Lazy load heavy components
const EventForm = React.lazy(() => import('./EventForm'));
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
const TemplateSelector = React.lazy(() => import('./TemplateSelector'));
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
  facebook: {
    bg: "bg-[#1877F2]/10",
    text: "text-[#1877F2]",
    icon: <Facebook className="h-4 w-4" />
  },
  twitter: {
    bg: "bg-[#1DA1F2]/10",
    text: "text-[#1DA1F2]",
    icon: <Twitter className="h-4 w-4" />
  },
  instagram: {
    bg: "bg-[#E4405F]/10",
    text: "text-[#E4405F]",
    icon: <Instagram className="h-4 w-4" />
  },
  linkedin: {
    bg: "bg-[#0A66C2]/10",
    text: "text-[#0A66C2]",
    icon: <Linkedin className="h-4 w-4" />
  },
  tiktok: {
    bg: "bg-[#000000]/10",
    text: "text-[#000000]",
    icon: <Video className="h-4 w-4" />
  }
};

// Platform-specific content limits
const platformContentLimits = {
  facebook: {
    maxTextLength: 63206,
    maxMediaCount: 10,
    supportedMediaTypes: ["image", "video", "link"]
  },
  twitter: {
    maxTextLength: 280,
    maxMediaCount: 4,
    supportedMediaTypes: ["image", "video", "gif"]
  },
  instagram: {
    maxTextLength: 2200,
    maxMediaCount: 10,
    supportedMediaTypes: ["image", "video", "carousel"]
  },
  linkedin: {
    maxTextLength: 3000,
    maxMediaCount: 9,
    supportedMediaTypes: ["image", "video", "document"]
  },
  tiktok: {
    maxTextLength: 2200,
    maxMediaCount: 1,
    supportedMediaTypes: ["video"]
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

// Event Preview Component
function EventPreview({ event, position }: { event: CalendarEvent; position: { x: number; y: number } }) {
  const userTimezone = useTimezone();
  
  const formatEventTime = (date: string, time?: string) => {
    if (!time) return formatInTimeZone(new Date(date), userTimezone, "MMM d, yyyy");
    return formatInTimeZone(new Date(`${date}T${time}`), userTimezone, "MMM d, yyyy 'at' h:mm a");
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    const icons = {
      facebook: <Facebook className="h-3 w-3 text-blue-600" />,
      twitter: <Twitter className="h-3 w-3 text-sky-500" />,
      instagram: <Instagram className="h-3 w-3 text-pink-600" />,
      linkedin: <Linkedin className="h-3 w-3 text-blue-700" />,
      youtube: "🎥",
      tiktok: "🎵",
      pinterest: "📌"
    };
    return icons[platform] || "📱";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className="fixed z-50 max-w-sm bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl p-4 pointer-events-none backdrop-blur-sm"
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 300),
        top: Math.min(position.y + 10, window.innerHeight - 200),
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight text-gray-900 dark:text-gray-100">{event.title}</h3>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(event.status)
          )}>
            {event.status}
          </span>
        </div>

        {/* Time and Type */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            <span>{formatEventTime(event.date, event.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100",
              isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-gray-700"
            )}>
              {event.type}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Social Media Platforms */}
        {event.type === 'social' && event.socialMediaContent?.platforms && event.socialMediaContent.platforms.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-700 dark:text-gray-300">Platforms:</span>
            <div className="flex gap-1">
              {event.socialMediaContent.platforms.map((platform, index) => (
                <span key={index} className="inline-flex items-center">
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Media Count */}
        {event.socialMediaContent?.mediaUrls && event.socialMediaContent.mediaUrls.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            <Upload className="h-3 w-3" />
            <span>{event.socialMediaContent.mediaUrls.length} media file{event.socialMediaContent.mediaUrls.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Click to view details
          </span>
        </div>
      </div>
    </div>
  );
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
  // Temporarily disable performance monitoring to fix lazy loading issue
  // const { measurePerformance, getBundleReport } = usePerformanceMonitoring();
  
  // Performance optimization: Check if we should use optimized mode
  // const useOptimizedMode = useMemo(() => {
  //   return progressiveEnhancement.shouldUseOptimizedMode();
  // }, []);
  
  // Preload critical components on mount
  // useEffect(() => {
  //   preloadCriticalComponents();
  // }, []);
  
  // State
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return now; // Initialize with local time, will be converted in useEffect
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [pendingEventDate, setPendingEventDate] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const initialEventsRef = useRef<boolean>(false);

  // Add a ref to track if we're already fetching
  const lastFetchTime = useRef(0);
  
  // Template selection handler
  const handleTemplateSelect = (eventData: Partial<CalendarEvent>) => {
    const templateDate = eventData.date || pendingEventDate || new Date().toISOString().split('T')[0];
    const startDate = new Date(templateDate);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration
    
    setNewEvent(prev => ({
      ...prev,
      title: eventData.title || "",
      description: eventData.description || "",
      start: startDate,
      end: endDate,
      type: eventData.type || "email",
      socialMediaContent: eventData.socialMediaContent || prev.socialMediaContent,
      // Include template metadata for analytics tracking
      templateMetadata: eventData.templateMetadata,
      analytics: eventData.analytics
    }));
    setIsTemplateSelectorOpen(false);
    setIsCreateDialogOpen(true);
  };
  
  // Direct fetch function - moved up before it's used
  const fetchCalendarEventsDirectly = async () => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });
      
      // Handle authentication issues gracefully
      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication required for calendar API");
        return [];
      }
      
      if (!response.ok) {
        console.warn(`Calendar API returned ${response.status}, showing empty calendar`);
        return [];
      }
      
      const data = await response.json();
      
      if (data.events && Array.isArray(data.events)) {
        const calendarEvents = data.events.map((event: any, index: number) => {
          try {
            return convertApiEventToCalendarEvent(event);
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
              time: '00:00',
              startTime: event.startTime || new Date().toISOString(),
              endTime: event.endTime || new Date().toISOString(),
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
        return calendarEvents;
      }
      
      return [];
    } catch (err) {
      console.warn("Error fetching calendar events:", err);
      return [];
    }
  };
  
  // Define the loadEvents function
  const loadEvents = useCallback(async () => {
    try {
      // TODO: Add proper loading state indication
      if (!fetchEvents) {
        // TODO: Handle case where fetchEvents function is not provided
        return await fetchCalendarEventsDirectly();
      }
      const fetchedEvents = await fetchEvents();
      // TODO: Add proper event logging for debugging
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
  }, [fetchEvents]);
  
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
        setEvents(newEvents);
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }, 500),
    [loadEvents]
  );

  // Replace the useEffect that loads events
  useEffect(() => {
    // Skip loading on initial render if we already have events
    if (events.length > 0 && initialEventsRef.current) {
      // Skipping initial load as events are already provided
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
    // TODO: Add proper event structure validation
    
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
        event.title?.toLowerCase().includes(searchLower) ||
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

  // Configure drag sensors with enhanced touch support and compatibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 12, // Increased for better touch compatibility
        delay: 100,   // Short delay to distinguish from scrolling
        tolerance: 5, // Allow slight movement during delay
      },
    })
  );

  // Gesture handling for calendar navigation
  const gestureStateRef = useRef({
    startX: 0,
    startY: 0,
    isGesturing: false,
    minSwipeDistance: 50, // Minimum distance for swipe recognition
    maxVerticalMovement: 100 // Max vertical movement to allow horizontal swipe
  });

  const handleGestureStart = useCallback((e: React.TouchEvent | React.PointerEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0];
      gestureStateRef.current = {
        ...gestureStateRef.current,
        startX: touch.clientX,
        startY: touch.clientY,
        isGesturing: true
      };
    } else {
      gestureStateRef.current = {
        ...gestureStateRef.current,
        startX: e.clientX,
        startY: e.clientY,
        isGesturing: true
      };
    }
  }, []);

  // Date navigation functions
  const handleDatePrev = useCallback(() => {
    setCurrentDate(prev => {
      switch (calendarView) {
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
  }, [calendarView]);

  const handleDateNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (calendarView) {
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
  }, [calendarView]);

  const handleDateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Bulk selection handlers
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedEvents(new Set());
    setShowBulkActions(false);
  }, [isSelectionMode]);

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  }, []);

  const selectAllEvents = useCallback(() => {
    const allEventIds = new Set(filteredEvents.map(event => event.id));
    setSelectedEvents(allEventIds);
    setShowBulkActions(allEventIds.size > 0);
  }, [filteredEvents]);

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set());
    setShowBulkActions(false);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (!onEventDelete || selectedEvents.size === 0) return;
    
    try {
      const eventIds = Array.from(selectedEvents);
      await Promise.all(eventIds.map(id => onEventDelete(id)));
      
      setEvents(prev => prev.filter(event => !selectedEvents.has(event.id)));
      setSelectedEvents(new Set());
      setShowBulkActions(false);
      
      toast({
        title: "Success",
        description: `${eventIds.length} events deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some events",
        variant: "destructive",
      });
    }
  }, [selectedEvents, onEventDelete, toast]);

  const handleBulkStatusChange = useCallback(async (newStatus: string) => {
    if (!onEventUpdate || selectedEvents.size === 0) return;
    
    try {
      const eventsToUpdate = events.filter(event => selectedEvents.has(event.id));
      const updatedEvents = await Promise.all(
        eventsToUpdate.map(event => onEventUpdate({ ...event, status: newStatus as any }))
      );
      
      setEvents(prev => prev.map(event => {
        const updated = updatedEvents.find(u => u.id === event.id);
        return updated || event;
      }));
      
      setSelectedEvents(new Set());
      setShowBulkActions(false);
      
      toast({
        title: "Success",
        description: `${updatedEvents.length} events updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some events",
        variant: "destructive",
      });
    }
  }, [selectedEvents, events, onEventUpdate, toast]);

  // Event preview handlers
  const handleEventHover = useCallback((event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    previewTimeoutRef.current = setTimeout(() => {
      setHoveredEvent(event);
      setPreviewPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
    }, 500); // Show preview after 500ms delay
  }, []);

  const handleEventHoverEnd = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
    
    // Keep preview open for a short time to allow mouse to move to it
    previewTimeoutRef.current = setTimeout(() => {
      setHoveredEvent(null);
      setPreviewPosition(null);
    }, 300);
  }, []);

  const handlePreviewHover = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  }, []);

  const handlePreviewLeave = useCallback(() => {
    setHoveredEvent(null);
    setPreviewPosition(null);
  }, []);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Don't interfere with form inputs
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).contentEditable === 'true') {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + Left = Previous period
          handleDatePrev();
        } else {
          // Arrow navigation within current view
          if (calendarView === 'month') {
            setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
          } else if (calendarView === 'week') {
            setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
          }
        }
        break;
      
      case 'ArrowRight':
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + Right = Next period
          handleDateNext();
        } else {
          // Arrow navigation within current view
          if (calendarView === 'month') {
            setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
          } else if (calendarView === 'week') {
            setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
          }
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (calendarView === 'month') {
          setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
        } else if (calendarView === 'day') {
          // Move up an hour in day view
          setCurrentDate(prev => new Date(prev.getTime() - 60 * 60 * 1000));
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (calendarView === 'month') {
          setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
        } else if (calendarView === 'day') {
          // Move down an hour in day view
          setCurrentDate(prev => new Date(prev.getTime() + 60 * 60 * 1000));
        }
        break;

      case 'Home':
        e.preventDefault();
        handleDateToday();
        break;

      case 'n':
      case 'N':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Ctrl/Cmd + N = New event
          setNewEvent(prev => ({ ...prev, start: currentDate }));
          setIsCreateDialogOpen(true);
        }
        break;

      case '1':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setCalendarView('month');
        }
        break;

      case '2':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setCalendarView('week');
        }
        break;

      case '3':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setCalendarView('day');
        }
        break;

      case '4':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setCalendarView('list');
        }
        break;

      case 's':
      case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Ctrl/Cmd + S = Toggle selection mode
          toggleSelectionMode();
        }
        break;

      case 'a':
      case 'A':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Ctrl/Cmd + A = Select all events (when in selection mode)
          if (isSelectionMode) {
            selectAllEvents();
          }
        }
        break;

      case 'Delete':
      case 'Backspace':
        if (selectedEvents.size > 0) {
          e.preventDefault();
          // Delete selected events
          handleBulkDelete();
        }
        break;

      case 'Escape':
        e.preventDefault();
        // Close any open dialogs or exit selection mode
        if (isSelectionMode) {
          setIsSelectionMode(false);
          clearSelection();
        } else {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setShowDeleteConfirm(false);
        }
        break;
    }
  }, [calendarView, currentDate, handleDatePrev, handleDateNext, handleDateToday, toggleSelectionMode, isSelectionMode, selectAllEvents, selectedEvents, handleBulkDelete, clearSelection]);

  // Cleanup preview timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const handleGestureEnd = useCallback((e: React.TouchEvent | React.PointerEvent) => {
    if (!gestureStateRef.current.isGesturing) return;

    const currentX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const currentY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    
    const deltaX = currentX - gestureStateRef.current.startX;
    const deltaY = Math.abs(currentY - gestureStateRef.current.startY);
    
    // Check if it's a valid horizontal swipe
    if (Math.abs(deltaX) >= gestureStateRef.current.minSwipeDistance && 
        deltaY <= gestureStateRef.current.maxVerticalMovement) {
      
      if (deltaX > 0) {
        // Swipe right - go to previous
        handleDatePrev();
      } else {
        // Swipe left - go to next  
        handleDateNext();
      }
    }

    gestureStateRef.current.isGesturing = false;
  }, [handleDatePrev, handleDateNext]);

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
                // TODO: implement a modal or expand the cell to show all events
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
                onMouseEnter={(e) => handleEventHover(event, e)}
                onMouseLeave={handleEventHoverEnd}
                onFocus={(e) => handleEventHover(event, e as any)}
                onBlur={handleEventHoverEnd}
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
                        onMouseEnter={(e) => handleEventHover(event, e)}
                        onMouseLeave={handleEventHoverEnd}
                        onFocus={(e) => handleEventHover(event, e as any)}
                        onBlur={handleEventHoverEnd}
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
        view={calendarView}
        onViewChange={(view) => {
          setCalendarView(view);
          onViewChange?.(view);
        }}
        currentDate={currentDate}
        onDatePrev={handleDatePrev}
        onDateNext={handleDateNext}
        onDateToday={handleDateToday}
        userTimezone={userTimezone}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onAddEvent={() => {
          setPendingEventDate(currentDate.toISOString().split('T')[0]);
          setIsTemplateSelectorOpen(true);
        }}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedEvents.size}
        onToggleSelection={toggleSelectionMode}
        onSelectAll={selectAllEvents}
        onClearSelection={clearSelection}
        events={events}
        selectedEvents={Array.from(selectedEvents).map(id => events.find(e => e.id === id)).filter(Boolean) as CalendarEvent[]}
        loading={loading}
      />

      {/* Keyboard shortcuts help (screen reader only) */}
      <div id="calendar-help" className="sr-only">
        Use arrow keys to navigate dates. Ctrl+Left/Right for previous/next period. 
        Home key returns to today. Ctrl+N creates new event. Ctrl+1-4 switches views. 
        Ctrl+S toggles selection mode. Ctrl+A selects all events. Delete key removes selected events.
        Escape closes dialogs or exits selection mode.
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Calendar Views with gesture and keyboard support */}
        <div 
          className="bg-background rounded-lg border touch-pan-y select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onTouchStart={handleGestureStart}
          onTouchEnd={handleGestureEnd}
          onPointerDown={handleGestureStart}
          onPointerUp={handleGestureEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="application"
          aria-label="Content Calendar"
          aria-describedby="calendar-help"
          style={{ touchAction: 'pan-y' }}
        >
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
                    onEventHover={handleEventHover}
                    onEventHoverEnd={handleEventHoverEnd}
                  />
                </div>
              )}
              {calendarView === "week" && (
                <div className="p-4">
                  <WeekView
                    currentDate={currentDate}
                    getEventsForDay={getEventsForDay}
                    onEventClick={handleEventClick}
                    userTimezone={userTimezone}
                    onEventHover={handleEventHover}
                    onEventHoverEnd={handleEventHoverEnd}
                  />
                </div>
              )}
              {calendarView === "day" && (
                <div className="p-4">
                  <DayView
                    date={currentDate}
                    getEventsForDay={getEventsForDay}
                    onEventClick={handleEventClick}
                    userTimezone={userTimezone}
                    onEventHover={handleEventHover}
                    onEventHoverEnd={handleEventHoverEnd}
                  />
                </div>
              )}
              {calendarView === "list" && (
                <div className="p-4">
                  <ListView 
                    events={filteredEvents} 
                    onEventClick={handleEventClick}
                    isSelectionMode={isSelectionMode}
                    selectedEvents={selectedEvents}
                    onToggleSelection={toggleEventSelection}
                    onEventHover={handleEventHover}
                    onEventHoverEnd={handleEventHoverEnd}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Bulk Actions Button */}
        {selectedEvents.size > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setShowBulkActions(true)}
              className="rounded-full shadow-lg h-12 w-12 p-0"
              size="sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium">{selectedEvents.size}</span>
                <span className="text-xs">Actions</span>
              </div>
            </Button>
          </div>
        )}

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
      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedEvents.size} selected event{selectedEvents.size !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleBulkStatusChange('draft')}
                className="justify-start"
              >
                Set as Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkStatusChange('scheduled')}
                className="justify-start"
              >
                Set as Scheduled
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkStatusChange('sent')}
                className="justify-start"
              >
                Set as Sent
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkStatusChange('failed')}
                className="justify-start"
              >
                Set as Failed
              </Button>
            </div>
            <div className="border-t pt-4">
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected Events
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <div className="px-6 pt-6 pb-2 border-b border-border/10">{/* Header with subtle separator */}
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your content calendar.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">{/* Scrollable container with custom scrollbar */}
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <EventForm
              mode="create"
              initialData={{
                date: format(newEvent.start, "yyyy-MM-dd"),
                time: format(newEvent.start, "HH:mm"),
                status: newEvent.status || "draft",
                type: newEvent.type || "email",
                title: newEvent.title || "",
                description: newEvent.description || "",
                ...newEvent
              }}
              onSubmit={async (event) => {
                if (onEventCreate) {
                  try {
                    // measurePerformance('create-event', () => {
                    //   // Performance measurement wrapper
                    // });
                    const created = await onEventCreate(event);
                    
                    // Track template usage for analytics if this event was created from a template
                    if (event.templateMetadata?.templateId) {
                      try {
                        await fetch('/api/templates/track-usage', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            templateId: event.templateMetadata.templateId,
                            eventId: created.id,
                            userId: created.createdBy,
                            organizationId: created.organizationId,
                            context: 'calendar',
                            modifications: {
                              titleChanged: event.title !== event.templateMetadata.originalTitle,
                              descriptionChanged: event.description !== event.templateMetadata.originalDescription,
                              timeChanged: event.time !== event.templateMetadata.originalTime,
                              platformsChanged: JSON.stringify(event.socialMediaContent?.platforms) !== 
                                               JSON.stringify(event.templateMetadata.originalPlatforms)
                            },
                            usedAt: new Date().toISOString()
                          }),
                        });
                      } catch (analyticsError) {
                        console.warn('Failed to track template usage:', analyticsError);
                        // Don't fail the event creation for analytics issues
                      }
                    }
                    
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
            </Suspense>
          </div>{/* End scrollable container */}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <div className="px-6 pt-6 pb-2 border-b border-border/10">{/* Header with subtle separator */}
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Make changes to your event details.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">{/* Scrollable container with custom scrollbar */}
            {selectedEvent && (
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <EventForm
                mode="edit"
                initialData={selectedEvent}
                onSubmit={async (event) => {
                  if (onEventUpdate) {
                    try {
                      // measurePerformance('update-event', () => {
                      //   // Performance measurement wrapper
                      // });
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
              </Suspense>
            )}
          </div>{/* End scrollable container */}
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

      {/* Template Selector Dialog */}
      {isTemplateSelectorOpen && (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <TemplateSelector
            isOpen={isTemplateSelectorOpen}
            onClose={() => setIsTemplateSelectorOpen(false)}
            onSelectTemplate={handleTemplateSelect}
            initialDate={pendingEventDate || undefined}
          />
        </Suspense>
      )}
      
      {/* Event Preview Tooltip */}
      {hoveredEvent && previewPosition && (
        <div 
          onMouseEnter={handlePreviewHover}
          onMouseLeave={handlePreviewLeave}
          className="pointer-events-auto"
        >
          <EventPreview event={hoveredEvent} position={previewPosition} />
        </div>
      )}
    </div>
  );
}
