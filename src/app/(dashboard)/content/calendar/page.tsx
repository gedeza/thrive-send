"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ContentCalendar, ContentType, SocialPlatform, CalendarEvent as ContentCalendarEvent } from "@/components/content/content-calendar";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchCalendarEvents } from "@/lib/api/calendar-service";
import { ContentCalendarSync } from "@/components/content/ContentCalendarSync";
import { syncContentToCalendar } from "@/lib/api/content-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar as CalendarIcon, List, Grid, Settings, Edit, Trash2, X, RefreshCw, Plus } from "lucide-react";
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
import { useOnboarding } from "@/context/OnboardingContext";
import { Label } from "@/components/ui/label";
import { useCalendarCache } from '@/context/CalendarCacheContext';
import { Switch } from "@/components/ui/switch";

// Use the CalendarEvent type from the content calendar component
// type CalendarEvent = ContentCalendarEvent;

export default function CalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { showWelcomeFlow, closeWelcomeFlow } = useOnboarding();
  const { 
    lastCacheInvalidation, 
    invalidateCache, 
    isCachingEnabled, 
    setCachingEnabled,
    clearAllCaches 
  } = useCalendarCache();
  const [events, setEvents] = useState<ContentCalendarEvent[]>([]);
  const [showSync, setShowSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day" | "list">("month");
  const [isDbUnavailable, setIsDbUnavailable] = useState(false);

  // Fetch events
  const loadEvents = useCallback(async () => {
    try {
      const fetchedEvents = await fetchCalendarEvents({
        cacheEnabled: isCachingEnabled,
        lastCacheInvalidation: lastCacheInvalidation
      });
      setEvents(fetchedEvents);
      setIsDbUnavailable(false);
      return fetchedEvents;
    } catch (error) {
      console.error("Error loading events:", error);
      setIsDbUnavailable(true);
      toast({
        title: "Database Error",
        description: "Could not connect to the database. Please try again later.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast, isCachingEnabled, lastCacheInvalidation]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Event handlers
  const handleEventCreate = async (event: Omit<ContentCalendarEvent, "id">) => {
    try {
      const created = await createCalendarEvent(event);
      setEvents(prev => [...prev, created]);
      return created;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleEventUpdate = async (event: ContentCalendarEvent) => {
    try {
      const updated = await updateCalendarEvent(event);
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      return updated;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteCalendarEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle sync completion
  const handleSyncComplete = () => {
    setShowSync(false);
    loadEvents();
  };

  // Handle view change
  const handleViewChange = (view: "month" | "week" | "day" | "list") => {
    setCalendarView(view);
  };

  // Add a handler for refreshing with cache bypass
  const handleForceRefresh = useCallback(() => {
    clearAllCaches();
    loadEvents();
    toast({
      title: "Cache Cleared",
      description: "Calendar data has been refreshed from the server",
    });
  }, [clearAllCaches, loadEvents, toast]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <WelcomeFlow isOpen={showWelcomeFlow} onClose={closeWelcomeFlow} />
      
      {/* Page Header - Consistent with campaigns page */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSync(true)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Content
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Force Refresh
          </Button>
          <div className="flex items-center gap-2 ml-2 px-2">
            <Label htmlFor="cache-toggle" className="text-sm font-medium">
              Caching {isCachingEnabled ? 'On' : 'Off'}
            </Label>
            <Switch 
              id="cache-toggle" 
              checked={isCachingEnabled} 
              onCheckedChange={setCachingEnabled} 
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {isDbUnavailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Database unavailable</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>The database is currently unavailable. Please try again later or contact support if the problem persists.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main calendar view */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <ContentCalendar
            events={events}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            fetchEvents={loadEvents}
            defaultView={calendarView}
            onViewChange={handleViewChange}
            onSyncClick={() => setShowSync(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        </CardContent>
      </Card>

      {/* Sync Dialog */}
      <Dialog open={showSync} onOpenChange={setShowSync}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Content to Calendar</DialogTitle>
            <DialogDescription>
              Sync your existing content to the calendar to see all your created content on the calendar view.
            </DialogDescription>
          </DialogHeader>
          <ContentCalendarSync onSyncComplete={handleSyncComplete} />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
            <DialogDescription>
              Configure your calendar preferences and default settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Default View</h3>
              <Select
                value={calendarView}
                onValueChange={(value) => setCalendarView(value as typeof calendarView)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="email-notifications" />
                  <label htmlFor="email-notifications">Email notifications</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="browser-notifications" />
                  <label htmlFor="browser-notifications">Browser notifications</label>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Start Time</label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Time</label>
                  <Input type="time" defaultValue="17:00" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 