"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ContentCalendar, ContentType, SocialPlatform, CalendarEvent as ContentCalendarEvent } from "@/components/content/content-calendar";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchCalendarEvents } from "@/lib/api/calendar-service";
import { ContentCalendarSync } from "@/components/content/ContentCalendarSync";
import { syncContentToCalendar } from "@/lib/api/content-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar as CalendarIcon, List, Grid, Settings, Edit, Trash2, X, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, formatDistanceToNow } from "date-fns";

// Use the CalendarEvent type from the content calendar component
type CalendarEvent = ContentCalendarEvent;

// Update the type definitions at the top of the file
type CalendarEventType = 'social' | 'blog' | 'email' | 'custom' | 'article';
// Keep this compatible with the content-calendar component, but add a comment explaining the situation
type CalendarEventStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
// API status includes 'published' instead of 'sent', so we need to map between them
type ApiEventStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface ApiCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: CalendarEventType;
  status: ApiEventStatus;
  socialMediaContent?: {
    platform: SocialPlatform;
    postType: string;
    content: string;
    mediaUrls?: string[];
    scheduledTime?: string;
    status: ApiEventStatus;
  };
  articleContent?: {
    content: string;
    metadata?: Record<string, any>;
  };
  analytics?: {
    views?: number;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    clicks?: number;
    lastUpdated: string;
  };
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export default function CalendarPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [filterType, setFilterType] = useState<string>("all");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showSync, setShowSync] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState({
    defaultView: "month",
    showWeekends: true,
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    defaultEventDuration: 60, // in minutes
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [listViewSort, setListViewSort] = useState<{
    field: 'date' | 'title' | 'type' | 'status';
    direction: 'asc' | 'desc';
  }>({ field: 'date', direction: 'asc' });
  const [listViewGroupBy, setListViewGroupBy] = useState<'none' | 'type' | 'status'>('none');
  const [listViewPage, setListViewPage] = useState(1);
  const [listViewPageSize, setListViewPageSize] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    },
    platforms: [] as SocialPlatform[],
    hasAnalytics: false,
    engagementThreshold: 0,
    customTags: [] as string[]
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Utility functions for mapping statuses between API and UI
  const mapApiStatusToUi = (status: string): CalendarEventStatus => {
    return status === 'published' ? 'sent' : status as CalendarEventStatus;
  };

  const mapUiStatusToApi = (status: CalendarEventStatus): ApiEventStatus => {
    return status === 'sent' ? 'published' : status as ApiEventStatus;
  };

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem('has_visited_calendar');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowWelcome(true);
      localStorage.setItem('has_visited_calendar', 'true');
    }
  }, []);

  const fetchEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    try {
      console.log('Fetching calendar events...');
      const events = await fetchCalendarEvents();
      console.log('Calendar events fetched:', events.length);
      
      // Transform the events to match the ContentCalendar's CalendarEvent type
      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        type: event.type === 'custom' ? 'article' : event.type,
        status: mapApiStatusToUi(event.status),
        date: event.startTime,
        time: event.startTime,
        scheduledDate: event.startTime,
        scheduledTime: event.startTime,
        socialMediaContent: event.socialMediaContent ? {
          platforms: [event.socialMediaContent.platform as SocialPlatform],
          mediaUrls: event.socialMediaContent.mediaUrls || [],
          crossPost: false,
          platformSpecificContent: {
            [event.socialMediaContent.platform]: {
              text: event.socialMediaContent.content,
              mediaUrls: event.socialMediaContent.mediaUrls,
              scheduledTime: event.socialMediaContent.scheduledTime
            }
          }
        } : {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        },
        analytics: event.analytics,
        organizationId: event.organizationId,
        createdBy: event.createdBy,
        tags: event.tags || []
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load calendar events",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const handleEventCreate = async (event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> => {
    try {
      // Transform the event to match the API's expected format
      const apiEvent: Omit<ApiCalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
        title: event.title,
        description: event.description,
        startTime: event.startTime || event.date,
        endTime: event.endTime || event.date,
        type: event.type,
        status: mapUiStatusToApi(event.status),
        socialMediaContent: event.socialMediaContent && event.socialMediaContent.platforms.length > 0 ? {
          platform: event.socialMediaContent.platforms[0] as SocialPlatform,
          postType: 'post',
          content: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.text || '',
          mediaUrls: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.mediaUrls || [],
          scheduledTime: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.scheduledTime,
          status: mapUiStatusToApi(event.status)
        } : undefined,
        articleContent: event.type === 'article' ? {
          content: event.description || '',
          metadata: {}
        } : undefined,
        analytics: event.analytics ? {
          ...event.analytics,
          lastUpdated: event.analytics.lastUpdated || new Date().toISOString()
        } : undefined,
        organizationId: event.organizationId,
        createdBy: event.createdBy,
        tags: event.tags || []
      };

      const response = await createCalendarEvent(apiEvent);

      // Transform the response back to match CalendarEvent type
      const isValidPlatform = (p: any): p is SocialPlatform => ['FACEBOOK','TWITTER','INSTAGRAM','LINKEDIN'].includes(p);
      const transformedEvent: CalendarEvent = {
        id: response.id,
        title: response.title,
        description: response.description || '',
        type: response.type,
        status: mapApiStatusToUi(response.status),
        date: response.startTime,
        time: new Date(response.startTime).toLocaleTimeString(),
        startTime: response.startTime,
        endTime: response.endTime,
        socialMediaContent: response.socialMediaContent?.platform && isValidPlatform(response.socialMediaContent.platform)
          ? {
              platforms: [response.socialMediaContent.platform],
              mediaUrls: response.socialMediaContent.mediaUrls || [],
              crossPost: false,
              platformSpecificContent: {
                [response.socialMediaContent.platform]: {
                  text: response.socialMediaContent.content || '',
                  mediaUrls: response.socialMediaContent.mediaUrls || [],
                  scheduledTime: response.socialMediaContent.scheduledTime
                }
              }
            }
          : {
              platforms: [],
              mediaUrls: [],
              crossPost: false,
              platformSpecificContent: {}
            },
        analytics: response.analytics ? {
          ...response.analytics,
          lastUpdated: response.analytics.lastUpdated || new Date().toISOString()
        } : undefined,
        organizationId: response.organizationId,
        createdBy: response.createdBy,
        tags: response.tags || []
      };

      return transformedEvent;
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

  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      // Transform the event to match the API's expected format
      const apiEvent: ApiCalendarEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime || event.date,
        endTime: event.endTime || event.date,
        type: event.type,
        status: mapUiStatusToApi(event.status),
        socialMediaContent: event.socialMediaContent && event.socialMediaContent.platforms.length > 0 ? {
          platform: event.socialMediaContent.platforms[0] as SocialPlatform,
          postType: 'post',
          content: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.text || '',
          mediaUrls: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.mediaUrls || [],
          scheduledTime: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.scheduledTime,
          status: mapUiStatusToApi(event.status)
        } : undefined,
        articleContent: event.type === 'article' ? {
          content: event.description || '',
          metadata: {}
        } : undefined,
        analytics: event.analytics ? {
          ...event.analytics,
          lastUpdated: event.analytics.lastUpdated || new Date().toISOString()
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: event.organizationId,
        createdBy: event.createdBy
      };

      const updatedEvent = await updateCalendarEvent(apiEvent);
      
      // Transform the response back to match CalendarEvent type
      const isValidPlatform = (p: any): p is SocialPlatform => ['FACEBOOK','TWITTER','INSTAGRAM','LINKEDIN'].includes(p);
      const transformedEvent: CalendarEvent = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description || '',
        type: updatedEvent.type,
        status: mapApiStatusToUi(updatedEvent.status),
        date: updatedEvent.startTime,
        time: new Date(updatedEvent.startTime).toLocaleTimeString(),
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime,
        socialMediaContent: updatedEvent.socialMediaContent?.platform && isValidPlatform(updatedEvent.socialMediaContent.platform)
          ? {
              platforms: [updatedEvent.socialMediaContent.platform],
              mediaUrls: updatedEvent.socialMediaContent.mediaUrls || [],
              crossPost: false,
              platformSpecificContent: {
                [updatedEvent.socialMediaContent.platform]: {
                  text: updatedEvent.socialMediaContent.content || '',
                  mediaUrls: updatedEvent.socialMediaContent.mediaUrls || [],
                  scheduledTime: updatedEvent.socialMediaContent.scheduledTime
                }
              }
            }
          : {
              platforms: [],
              mediaUrls: [],
              crossPost: false,
              platformSpecificContent: {}
            },
        analytics: updatedEvent.analytics ? {
          ...updatedEvent.analytics,
          lastUpdated: updatedEvent.analytics.lastUpdated || new Date().toISOString()
        } : undefined,
        organizationId: updatedEvent.organizationId,
        createdBy: updatedEvent.createdBy,
        tags: updatedEvent.tags || []
      };
      
      return transformedEvent;
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

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteCalendarEvent(eventId);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await handleEventDelete(eventToDelete.id);
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

  const getGroupedEvents = (events: CalendarEvent[]) => {
    if (listViewGroupBy === 'none') return { 'All Events': events };
    
    return events.reduce((groups, event) => {
      const key = listViewGroupBy === 'type' ? event.type : event.status;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);
  };

  const applyAdvancedFilters = (events: CalendarEvent[]) => {
    return events.filter(event => {
      // Date range filter
      if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
        const eventDate = new Date(event.date || event.startTime || '');
        if (advancedFilters.dateRange.start && eventDate < advancedFilters.dateRange.start) return false;
        if (advancedFilters.dateRange.end && eventDate > advancedFilters.dateRange.end) return false;
      }

      // Platform filter
      if (advancedFilters.platforms.length > 0 && event.type === 'social') {
        const eventPlatforms = event.socialMediaContent?.platforms || [];
        if (!advancedFilters.platforms.some(platform => eventPlatforms.includes(platform))) return false;
      }

      // Analytics filter
      if (advancedFilters.hasAnalytics && (!event.analytics || !event.analytics.views)) return false;

      // Engagement threshold filter
      if (advancedFilters.engagementThreshold > 0 && event.analytics) {
        const engagement = (event.analytics.engagement?.likes || 0) +
                          (event.analytics.engagement?.shares || 0) +
                          (event.analytics.engagement?.comments || 0);
        if (engagement < advancedFilters.engagementThreshold) return false;
      }

      // Custom tags filter
      if (advancedFilters.customTags.length > 0) {
        const eventTags = event.tags || [];
        if (!advancedFilters.customTags.some(tag => eventTags.includes(tag))) return false;
      }

      return true;
    });
  };

  // Add auto-sync when switching to list view
  useEffect(() => {
    if (viewMode === 'list' && !isSyncing) {
      handleAutoSync();
    }
  }, [viewMode]);

  // Add background sync for list view
  useEffect(() => {
    if (viewMode === 'list') {
      const syncInterval = setInterval(() => {
        handleAutoSync();
      }, 5 * 60 * 1000); // Sync every 5 minutes

      return () => clearInterval(syncInterval);
    }
  }, [viewMode]);

  const handleAutoSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await syncContentToCalendar();
      if (result.synced > 0 || result.errors === 0) {
        // Only show toast if there were actual changes
        if (result.synced > 0) {
          toast({
            title: "Calendar Updated",
            description: `Successfully synced ${result.synced} content items to calendar`,
          });
        }
        // Refresh events after sync
        const updatedEvents = await fetchEvents();
        setEvents(updatedEvents);
        setLastSyncTime(new Date());
      } else if (result.errors > 0) {
        // Show error toast for failed syncs
        toast({
          title: "Sync Failed",
          description: `${result.errors} items failed to sync. Please try again or check the sync panel for details.`,
          variant: "destructive",
        });
        // Show the sync panel to allow manual retry
        setShowSync(true);
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      // Show error toast for unexpected errors
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during sync",
        variant: "destructive",
      });
      // Show the sync panel to allow manual retry
      setShowSync(true);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Content Calendar</h1>
          <p className="text-muted-foreground text-base">Schedule and manage your content publishing</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="font-medium"
            onClick={() => router.push("/analytics")}
          >
            View Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSync(!showSync)}
            className="font-medium"
          >
            {showSync ? "Hide Sync" : "Sync Content"}
          </Button>
          <Button
            className="bg-primary text-primary-foreground font-semibold"
            onClick={() => router.push("/content/new")}
          >
            + Create Content
          </Button>
        </div>
      </div>

      {/* Content Calendar Sync Section */}
      {showSync && (
        <div className="mb-6">
          <ContentCalendarSync
            onSyncComplete={() => {
              setShowSync(false);
              // Refresh the calendar events after sync
              fetchEvents().then(setEvents);
            }}
          />
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                All Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("social")}>
                Social Media
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("blog")}>
                Blog Posts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("email")}>
                Email Campaigns
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAdvancedFilters(true)}>
                Advanced Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List View
            {isSyncing && (
              <span className="ml-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <ContentCalendar
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            fetchEvents={fetchEvents}
          />
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {lastSyncTime && (
              <p className="text-sm text-muted-foreground">
                Last synced: {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
              </p>
            )}
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || filterType !== "all" 
                        ? "No events match your current filters. Try adjusting your search or filters."
                        : "Get started by creating your first content event."
                      }
                    </p>
                    <Button onClick={() => router.push("/content/new")}>
                      + Create Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* List View Header */}
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="text-lg font-semibold">All Events</h3>
                        <p className="text-sm text-muted-foreground">
                          {events.length} {events.length === 1 ? 'event' : 'events'} found
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="blog">Blog Posts</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="article">Articles</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={listViewGroupBy} onValueChange={(value) => setListViewGroupBy(value as 'none' | 'type' | 'status')}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Group by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Grouping</SelectItem>
                            <SelectItem value="type">Group by Type</SelectItem>
                            <SelectItem value="status">Group by Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={listViewSort.field} onValueChange={(value) => setListViewSort(prev => ({ ...prev, field: value as 'date' | 'title' | 'type' | 'status' }))}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setListViewSort(prev => ({
                            ...prev,
                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                          }))}
                        >
                          {listViewSort.direction === 'asc' ? '↑' : '↓'}
                        </Button>
                      </div>
                    </div>

                    {/* Events List */}
                    <div className="space-y-6">
                      {Object.entries(getGroupedEvents(applyAdvancedFilters(events
                        .filter(event => {
                          // Apply search filter
                          if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
                              !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                            return false;
                          }
                          // Apply type filter
                          if (selectedType !== "all" && event.type !== selectedType) {
                            return false;
                          }
                          // Apply status filter
                          if (selectedStatus !== "all" && event.status !== selectedStatus) {
                            return false;
                          }
                          return true;
                        })
                        .sort((a, b) => {
                          const direction = listViewSort.direction === 'asc' ? 1 : -1;
                          switch (listViewSort.field) {
                            case 'date':
                              return direction * (new Date(a.date || a.startTime || '').getTime() - new Date(b.date || b.startTime || '').getTime());
                            case 'title':
                              return direction * a.title.localeCompare(b.title);
                            case 'type':
                              return direction * a.type.localeCompare(b.type);
                            case 'status':
                              return direction * a.status.localeCompare(b.status);
                            default:
                              return 0;
                          }
                        })
                        .slice((listViewPage - 1) * listViewPageSize, listViewPage * listViewPageSize)
                      ))).map(([groupName, groupEvents]) => (
                        <div key={groupName} className="space-y-3">
                          {listViewGroupBy !== 'none' && (
                            <h4 className="text-sm font-medium text-muted-foreground">
                              {groupName} ({groupEvents.length})
                            </h4>
                          )}
                          {groupEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowEventDetails(true);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                                    <div className="flex items-center gap-2">
                                      <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        event.status === 'draft' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                                        event.status === 'scheduled' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                                        event.status === 'sent' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                                        event.status === 'failed' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                      )}>
                                        {event.status}
                                      </span>
                                      <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        event.type === 'email' && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                        event.type === 'social' && "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                                        event.type === 'blog' && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                                        event.type === 'article' && "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                      )}>
                                        {event.type}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {event.description && (
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>
                                        {new Date(event.date).toLocaleDateString()}
                                        {event.time && ` at ${event.time}`}
                                      </span>
                                    </div>
                                    
                                    {event.type === 'social' && event.socialMediaContent?.platforms && event.socialMediaContent.platforms.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs">Platforms:</span>
                                        <div className="flex gap-1">
                                          {event.socialMediaContent.platforms.map(platform => (
                                            <span key={platform} className="text-xs font-medium">
                                              {platform}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {event.analytics && (
                                      <div className="flex items-center gap-1">
                                        <span>Views: {event.analytics.views || 0}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(event);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Showing {Math.min((listViewPage - 1) * listViewPageSize + 1, events.length)} to {Math.min(listViewPage * listViewPageSize, events.length)} of {events.length} events
                        </span>
                        <Select
                          value={listViewPageSize.toString()}
                          onValueChange={(value) => {
                            setListViewPageSize(parseInt(value));
                            setListViewPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Page size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="25">25 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setListViewPage(prev => Math.max(1, prev - 1))}
                          disabled={listViewPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setListViewPage(prev => prev + 1)}
                          disabled={listViewPage * listViewPageSize >= events.length}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isFirstVisit && (
        <WelcomeFlow
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {/* Event Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Make changes to your event and save them.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    value={selectedEvent.title} 
                    onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={selectedEvent.description} 
                    onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={selectedEvent.type}
                      onValueChange={(value: CalendarEventType) => setSelectedEvent({...selectedEvent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={selectedEvent.status}
                      onValueChange={(value: CalendarEventStatus) => setSelectedEvent({...selectedEvent, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedEvent.date ? format(new Date(selectedEvent.date), 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedEvent.date ? new Date(selectedEvent.date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const formattedDate = format(date, 'yyyy-MM-dd');
                              setSelectedEvent({
                                ...selectedEvent, 
                                date: formattedDate,
                                startTime: formattedDate + 'T' + (selectedEvent.time || '00:00:00')
                              });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={selectedEvent.time ? selectedEvent.time.substring(0, 5) : ''}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setSelectedEvent({
                          ...selectedEvent, 
                          time: newTime,
                          startTime: selectedEvent.date + 'T' + newTime + ':00'
                        });
                      }}
                    />
                  </div>
                </div>
                
                {selectedEvent.type === 'social' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Social Media Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN'].map((platform) => (
                        <Button
                          key={platform}
                          variant={selectedEvent.socialMediaContent.platforms.includes(platform as SocialPlatform) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const currentPlatforms = selectedEvent.socialMediaContent.platforms;
                            const platformTyped = platform as SocialPlatform;
                            const newPlatforms = currentPlatforms.includes(platformTyped)
                              ? currentPlatforms.filter(p => p !== platformTyped)
                              : [...currentPlatforms, platformTyped];
                            
                            setSelectedEvent({
                              ...selectedEvent,
                              socialMediaContent: {
                                ...selectedEvent.socialMediaContent,
                                platforms: newPlatforms
                              }
                            });
                          }}
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (selectedEvent) {
                try {
                  await handleEventUpdate(selectedEvent);
                  setIsEditDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Event updated successfully",
                  });
                  
                  // Refresh events after update
                  const updatedEvents = await fetchEvents();
                  setEvents(updatedEvents);
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update event",
                    variant: "destructive",
                  });
                }
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View details for this scheduled content.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    selectedEvent.status === 'draft' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                    selectedEvent.status === 'scheduled' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                    selectedEvent.status === 'sent' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                    selectedEvent.status === 'failed' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  )}>
                    {selectedEvent.status}
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    selectedEvent.type === 'email' && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                    selectedEvent.type === 'social' && "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                    selectedEvent.type === 'blog' && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                    selectedEvent.type === 'article' && "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  )}>
                    {selectedEvent.type}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedEvent.date).toLocaleDateString()}
                    {selectedEvent.time && ` at ${selectedEvent.time}`}
                  </span>
                </div>
                
                {selectedEvent.type === 'social' && selectedEvent.socialMediaContent?.platforms && selectedEvent.socialMediaContent.platforms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Platforms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.socialMediaContent.platforms.map(platform => (
                        <span key={platform} className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.analytics && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Analytics:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-3">
                        <span className="text-sm text-muted-foreground">Views</span>
                        <p className="text-2xl font-bold">{selectedEvent.analytics.views || 0}</p>
                      </div>
                      <div className="border rounded-md p-3">
                        <span className="text-sm text-muted-foreground">Clicks</span>
                        <p className="text-2xl font-bold">{selectedEvent.analytics.clicks || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDetails(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={() => {
              if (selectedEvent) {
                setShowEventDetails(false);
                setSelectedEvent(selectedEvent);
                setIsEditDialogOpen(true);
              }
            }}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedEvent) {
                setShowEventDetails(false);
                handleDeleteClick(selectedEvent);
              }
            }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              {eventToDelete ? ` "${eventToDelete.title}"` : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Calendar Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
            <DialogDescription>
              Customize your calendar view and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default View</label>
              <Select
                value={calendarSettings.defaultView}
                onValueChange={(value) => setCalendarSettings(prev => ({ ...prev, defaultView: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Working Hours</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={calendarSettings.workingHours.start}
                    onChange={(e) => setCalendarSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End Time</label>
                  <Input
                    type="time"
                    value={calendarSettings.workingHours.end}
                    onChange={(e) => setCalendarSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Event Duration</label>
              <Select
                value={calendarSettings.defaultEventDuration.toString()}
                onValueChange={(value) => setCalendarSettings(prev => ({ ...prev, defaultEventDuration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Select
                value={calendarSettings.timezone}
                onValueChange={(value) => setCalendarSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showWeekends"
                checked={calendarSettings.showWeekends}
                onChange={(e) => setCalendarSettings(prev => ({ ...prev, showWeekends: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showWeekends" className="text-sm font-medium">
                Show Weekends
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Save settings to localStorage
              localStorage.setItem('calendarSettings', JSON.stringify(calendarSettings));
              setShowSettings(false);
              toast({
                title: "Settings saved",
                description: "Your calendar settings have been updated",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filters Dialog */}
      <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Apply multiple filters to narrow down your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Start Date</label>
                  <Calendar
                    mode="single"
                    selected={advancedFilters.dateRange.start || undefined}
                    onSelect={(date) => setAdvancedFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: date || null }
                    }))}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End Date</label>
                  <Calendar
                    mode="single"
                    selected={advancedFilters.dateRange.end || undefined}
                    onSelect={(date) => setAdvancedFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: date || null }
                    }))}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Social Media Platforms</label>
              <div className="flex flex-wrap gap-2">
                {['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN'].map((platform) => (
                  <Button
                    key={platform}
                    variant={advancedFilters.platforms.includes(platform as SocialPlatform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdvancedFilters(prev => ({
                      ...prev,
                      platforms: prev.platforms.includes(platform as SocialPlatform)
                        ? prev.platforms.filter(p => p !== platform)
                        : [...prev.platforms, platform as SocialPlatform]
                    }))}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            {/* Analytics Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Analytics</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasAnalytics"
                    checked={advancedFilters.hasAnalytics}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      hasAnalytics: e.target.checked
                    }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="hasAnalytics" className="text-sm">
                    Has Analytics
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Min Engagement:</label>
                  <Input
                    type="number"
                    min="0"
                    value={advancedFilters.engagementThreshold}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      engagementThreshold: parseInt(e.target.value) || 0
                    }))}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* Custom Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Tags</label>
              <div className="flex flex-wrap gap-2">
                {advancedFilters.customTags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                    <span className="text-sm">{tag}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdvancedFilters(prev => ({
                        ...prev,
                        customTags: prev.customTags.filter((_, i) => i !== index)
                      }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Input
                  placeholder="Add tag..."
                  className="w-32"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setAdvancedFilters(prev => ({
                        ...prev,
                        customTags: [...prev.customTags, e.currentTarget.value]
                      }));
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAdvancedFilters({
                dateRange: { start: null, end: null },
                platforms: [],
                hasAnalytics: false,
                engagementThreshold: 0,
                customTags: []
              });
            }}>
              Clear All
            </Button>
            <Button onClick={() => setShowAdvancedFilters(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 