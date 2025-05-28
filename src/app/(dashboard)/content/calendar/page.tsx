"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ContentCalendar, ContentType, SocialPlatform, CalendarEvent as ContentCalendarEvent } from "@/components/content/content-calendar";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchCalendarEvents } from "@/lib/api/calendar-service";
import { ContentCalendarSync } from "@/components/content/ContentCalendarSync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar as CalendarIcon, List, Grid, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Update the type definitions at the top of the file
type CalendarEventType = 'social' | 'blog' | 'email' | 'custom' | 'article';
type CalendarEventStatus = 'draft' | 'scheduled' | 'published' | 'sent' | 'failed';

interface ApiCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  socialMediaContent?: {
    platform: SocialPlatform;
    postType: string;
    content: string;
    mediaUrls?: string[];
    scheduledTime?: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
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
}

export default function CalendarPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [filterType, setFilterType] = useState<string>("all");
  const [events, setEvents] = useState<ContentCalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showSync, setShowSync] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem('has_visited_calendar');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowWelcome(true);
      localStorage.setItem('has_visited_calendar', 'true');
    }
  }, []);

  const fetchEvents = useCallback(async (): Promise<ContentCalendarEvent[]> => {
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
        status: event.status === 'published' ? 'sent' : event.status,
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
        createdBy: event.createdBy
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

  const handleEventCreate = async (event: Omit<ContentCalendarEvent, "id">): Promise<ContentCalendarEvent> => {
    try {
      // Transform the event to match the API's expected format
      const apiEvent: Omit<ApiCalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
        title: event.title,
        description: event.description,
        startTime: event.startTime || event.date,
        endTime: event.endTime || event.date,
        type: event.type,
        status: event.status === 'sent' ? 'published' : event.status,
        socialMediaContent: event.socialMediaContent.platforms.length > 0 ? {
          platform: event.socialMediaContent.platforms[0] as SocialPlatform,
          postType: 'post',
          content: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.text || '',
          mediaUrls: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.mediaUrls || [],
          scheduledTime: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.scheduledTime,
          status: event.status === 'sent' ? 'published' : 'draft'
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
        createdBy: event.createdBy
      };

      const response = await createCalendarEvent(apiEvent);

      // Transform the response back to match ContentCalendarEvent type
      const isValidPlatform = (p: any): p is SocialPlatform => ['FACEBOOK','TWITTER','INSTAGRAM','LINKEDIN'].includes(p);
      const transformedEvent: ContentCalendarEvent = {
        id: response.id,
        title: response.title,
        description: response.description || '',
        type: response.type,
        status: response.status === 'published' ? 'sent' : response.status,
        date: response.startTime,
        time: new Date(response.startTime).toLocaleTimeString(),
        startTime: response.startTime,
        endTime: response.endTime,
        socialMediaContent: {
          platforms: response.socialMediaContent?.platform && isValidPlatform(response.socialMediaContent.platform)
            ? [response.socialMediaContent.platform]
            : [],
          mediaUrls: response.socialMediaContent?.mediaUrls || [],
          crossPost: false,
          platformSpecificContent: response.socialMediaContent && isValidPlatform(response.socialMediaContent.platform) ? {
            [response.socialMediaContent.platform]: {
              text: response.socialMediaContent.content,
              mediaUrls: response.socialMediaContent.mediaUrls || [],
              scheduledTime: response.socialMediaContent.scheduledTime
            }
          } : {},
        },
        analytics: response.analytics ? {
          ...response.analytics,
          lastUpdated: response.analytics.lastUpdated || new Date().toISOString()
        } : undefined,
        organizationId: response.organizationId,
        createdBy: response.createdBy
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

  const handleEventUpdate = async (event: ContentCalendarEvent) => {
    try {
      // Transform the event to match the API's expected format
      const apiEvent: ApiCalendarEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime || event.date,
        endTime: event.endTime || event.date,
        type: event.type,
        status: event.status === 'sent' ? 'published' : event.status,
        socialMediaContent: event.socialMediaContent.platforms.length > 0 ? {
          platform: event.socialMediaContent.platforms[0] as SocialPlatform,
          postType: 'post',
          content: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.text || '',
          mediaUrls: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.mediaUrls || [],
          scheduledTime: event.socialMediaContent.platformSpecificContent[event.socialMediaContent.platforms[0]]?.scheduledTime,
          status: event.status === 'sent' ? 'published' : 'draft'
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
      
      // Transform the response back to match ContentCalendarEvent type
      const isValidPlatform = (p: any): p is SocialPlatform => ['FACEBOOK','TWITTER','INSTAGRAM','LINKEDIN'].includes(p);
      const transformedEvent: ContentCalendarEvent = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description || '',
        type: updatedEvent.type,
        status: updatedEvent.status === 'published' ? 'sent' : updatedEvent.status,
        date: updatedEvent.startTime,
        time: new Date(updatedEvent.startTime).toLocaleTimeString(),
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime,
        socialMediaContent: {
          platforms: updatedEvent.socialMediaContent?.platform && isValidPlatform(updatedEvent.socialMediaContent.platform)
            ? [updatedEvent.socialMediaContent.platform]
            : [],
          mediaUrls: updatedEvent.socialMediaContent?.mediaUrls || [],
          crossPost: false,
          platformSpecificContent: updatedEvent.socialMediaContent && isValidPlatform(updatedEvent.socialMediaContent.platform) ? {
            [updatedEvent.socialMediaContent.platform]: {
              text: updatedEvent.socialMediaContent.content,
              mediaUrls: updatedEvent.socialMediaContent.mediaUrls || [],
              scheduledTime: updatedEvent.socialMediaContent.scheduledTime
            }
          } : {},
        },
        analytics: updatedEvent.analytics ? {
          ...updatedEvent.analytics,
          lastUpdated: updatedEvent.analytics.lastUpdated || new Date().toISOString()
        } : undefined,
        organizationId: updatedEvent.organizationId,
        createdBy: updatedEvent.createdBy
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
            <DropdownMenuContent align="end">
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
          <Button variant="outline" size="icon">
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
          <div className="rounded-lg border bg-card">
            {/* List view implementation */}
            <div className="p-4">
              <p className="text-muted-foreground">List view coming soon...</p>
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
    </div>
  );
} 