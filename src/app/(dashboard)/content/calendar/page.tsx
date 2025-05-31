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
import { getMockCalendarEvents } from "@/lib/mock/calendar-mock";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Use the CalendarEvent type from the content calendar component
// type CalendarEvent = ContentCalendarEvent;

export default function CalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { showWelcomeFlow, closeWelcomeFlow } = useOnboarding();
  const [events, setEvents] = useState<ContentCalendarEvent[]>([]);
  const [showSync, setShowSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day" | "list">("month");
  const [useMockData, setUseMockData] = useState(false);
  const [isDbUnavailable, setIsDbUnavailable] = useState(false);

  // Fetch events
  const loadEvents = useCallback(async () => {
    if (useMockData) {
      const mockEvents = getMockCalendarEvents();
      setEvents(mockEvents);
      return mockEvents;
    }
    
    try {
      const fetchedEvents = await fetchCalendarEvents();
      setEvents(fetchedEvents);
      setIsDbUnavailable(false);
      return fetchedEvents;
    } catch (error) {
      console.error("Error loading events:", error);
      setIsDbUnavailable(true);
      
      // If database is unavailable, switch to mock data
      if (!useMockData) {
        setUseMockData(true);
        toast({
          title: "Using mock data",
          description: "Database is unavailable. Using mock data for development.",
          variant: "default",
        });
        
        const mockEvents = getMockCalendarEvents();
        setEvents(mockEvents);
        return mockEvents;
      }
      
      return [];
    }
  }, [toast, useMockData]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Event handlers
  const handleEventCreate = async (event: Omit<ContentCalendarEvent, "id">) => {
    if (useMockData) {
      // Generate a mock ID for the new event
      const mockId = `mock-${Date.now()}`;
      const created = {
        ...event,
        id: mockId,
      } as ContentCalendarEvent;
      
      setEvents(prev => [...prev, created]);
      return created;
    }
    
    try {
      const created = await createCalendarEvent(event);
      setEvents(prev => [...prev, created]);
      return created;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Using mock data instead.",
        variant: "destructive",
      });
      
      // Fall back to mock handling if API fails
      const mockId = `mock-${Date.now()}`;
      const created = {
        ...event,
        id: mockId,
      } as ContentCalendarEvent;
      
      setEvents(prev => [...prev, created]);
      return created;
    }
  };
  
  const handleEventUpdate = async (event: ContentCalendarEvent) => {
    if (useMockData) {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      return event;
    }
    
    try {
      const updated = await updateCalendarEvent(event);
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      return updated;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event. Using mock data instead.",
        variant: "destructive",
      });
      
      // Fall back to mock handling
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      return event;
    }
  };
  
  const handleEventDelete = async (eventId: string) => {
    if (useMockData) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    }
    
    try {
      await deleteCalendarEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Using mock data instead.",
        variant: "destructive",
      });
      
      // Fall back to mock handling
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <WelcomeFlow isOpen={showWelcomeFlow} onClose={closeWelcomeFlow} />
      
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-chart-blue)]">Content Calendar</h1>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSync(true)}
              className="flex items-center gap-2 hover:bg-muted/80 transition-colors"
              disabled={useMockData}
            >
              <RefreshCw className="h-4 w-4" />
              Sync Content
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 hover:bg-muted/80 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        {/* Mock data toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="mock-mode"
            checked={useMockData}
            onCheckedChange={(checked) => {
              setUseMockData(checked);
              if (checked) {
                const mockEvents = getMockCalendarEvents();
                setEvents(mockEvents);
              } else {
                loadEvents();
              }
            }}
          />
          <Label htmlFor="mock-mode" className="text-sm">
            {useMockData ? "Using mock data" : "Use real data"}
          </Label>
        </div>
      </div>

      {isDbUnavailable && !useMockData && (
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
                <p>The database is currently unavailable. To continue development, you can switch to mock data using the toggle above.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main calendar view */}
      <div className="space-y-4 border rounded-xl p-4 bg-card shadow-sm">
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
      </div>

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
            
            {/* Mock data settings */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Development Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Use Mock Data</p>
                  <p className="text-xs text-muted-foreground">Use sample data for development when database is unavailable</p>
                </div>
                <Switch
                  checked={useMockData}
                  onCheckedChange={(checked) => {
                    setUseMockData(checked);
                    if (checked) {
                      const mockEvents = getMockCalendarEvents();
                      setEvents(mockEvents);
                    } else {
                      loadEvents();
                    }
                  }}
                />
              </div>
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