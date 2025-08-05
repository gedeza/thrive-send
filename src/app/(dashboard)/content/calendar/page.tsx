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
import { Search, Filter, Calendar as CalendarIcon, List, Grid, Settings, Edit, Trash2, X, RefreshCw, Plus, Sparkles, FileText, Bot } from "lucide-react";
import { TemplateQuickPicker, useTemplateSelection } from '@/components/templates/TemplateQuickPicker';
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
import { PerformanceProvider, usePerformance } from '@/context/PerformanceContext';
import { DynamicProgressiveCalendar } from '@/lib/utils/bundle-optimization';
import { Switch } from "@/components/ui/switch";

// Use the CalendarEvent type from the content calendar component
// type CalendarEvent = ContentCalendarEvent;

function CalendarPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { showWelcomeFlow, closeWelcomeFlow } = useOnboarding();
  const { selectedTemplate, selectTemplate, clearSelection } = useTemplateSelection('calendar');
  const { 
    lastCacheInvalidation, 
    invalidateCache, 
    isCachingEnabled, 
    setCachingEnabled,
    clearAllCaches 
  } = useCalendarCache();
  const { isOptimizedMode, setOptimizedMode, metrics } = usePerformance();
  const [events, setEvents] = useState<ContentCalendarEvent[]>([]);
  const [showSync, setShowSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day" | "list">("month");
  const [isDbUnavailable, setIsDbUnavailable] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);

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
      const eventData = {
        ...event,
        templateId: selectedTemplate?.id, // Track template usage
      };
      
      const created = await createCalendarEvent(eventData);
      setEvents(prev => [...prev, created]);
      
      // Track template usage for AI learning
      if (selectedTemplate) {
        fetch(`/api/templates/${selectedTemplate.id}/track-usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: 'calendar',
            action: 'schedule',
            source: 'calendar-page',
            metadata: {
              event_type: event.type,
              scheduled_date: event.date
            }
          })
        }).catch(() => {}); // Non-blocking
        
        clearSelection(); // Clear after use
      }
      
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
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Content Calendar
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Schedule and manage your content across all platforms with powerful calendar features.
        </p>
      </div>
      
      {/* AI Template Assistant for Calendar Events */}
      <Card className="mb-6 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">Calendar Template Assistant</h3>
                <p className="text-sm text-indigo-700">Quick templates for events, reminders, and scheduled content</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TemplateQuickPicker
                context="calendar"
                onSelect={(template) => {
                  selectTemplate(template);
                  toast({
                    title: "Template Ready for Calendar! 📅",
                    description: `"${template.name}" selected for your next event`,
                  });
                }}
                filters={{
                  type: 'email', // Calendar events are typically email-based
                }}
                compact={true}
                showAIRecommendations={true}
                trigger={
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Event Templates
                  </Button>
                }
              />
              {selectedTemplate && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-lg border border-indigo-200">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-indigo-800">{selectedTemplate.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-5 w-5 p-0 hover:bg-indigo-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-end gap-2 mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSync(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Content
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
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
          >
            <Settings className="mr-2 h-4 w-4" />
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
            onEventClick={(event) => {
              // Handle event click - could open edit dialog
              console.log('Event clicked:', event);
            }}
            onDateClick={(date) => {
              // Handle date click - could open create event dialog
              console.log('Date clicked:', date);
            }}
            onEventCreate={(date, time) => {
              // Handle event creation from calendar
              const newEvent = {
                title: 'New Event',
                description: '',
                type: 'custom' as ContentType,
                status: 'draft' as const,
                date: date.toISOString().split('T')[0],
                time: time,
                templateMetadata: selectedTemplate ? {
                  templateId: selectedTemplate.id,
                  originalTitle: selectedTemplate.name
                } : undefined
              };
              handleEventCreate(newEvent);
            }}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            defaultView={calendarView}
            onViewChange={handleViewChange}
            enableSync={true}
            onSync={async () => {
              await loadEvents();
            }}
            enableAnalytics={true}
            onAnalyticsEvent={(eventName, data) => {
              // Track analytics events
              console.log('Analytics:', eventName, data);
            }}
            enableCache={isCachingEnabled}
            cacheTimeout={300000}
            enablePreview={true}
            previewDelay={500}
            enableDragDrop={true}
            onEventDrop={async (event, newDate, newTime) => {
              const updatedEvent = {
                ...event,
                date: newDate.toISOString().split('T')[0],
                time: newTime
              };
              await handleEventUpdate(updatedEvent);
            }}
            enableBulkSelection={true}
            onBulkAction={async (action, selectedEvents) => {
              if (action === 'delete') {
                for (const event of selectedEvents) {
                  await handleEventDelete(event.id);
                }
              }
            }}
            enableExport={true}
            exportFormats={['ical', 'csv', 'json']}
            onError={(error) => {
              console.error('Calendar error:', error);
              toast({
                title: "Calendar Error",
                description: error.message,
                variant: "destructive",
              });
            }}
            className="w-full"
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
              <h3 className="font-medium mb-2">Performance</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cache-stats">Cache Hit Rate</Label>
                  <span className="text-sm text-muted-foreground">
                    {metrics.cacheHitRate.toFixed(1)}%
                  </span>
                </div>
                {metrics.memoryUsage && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="memory-usage">Memory Usage</Label>
                    <span className="text-sm text-muted-foreground">
                      {metrics.memoryUsage.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="lcp">LCP</Label>
                  <span className="text-sm text-muted-foreground">
                    {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                  className="w-full"
                >
                  {showPerformanceMetrics ? 'Hide' : 'Show'} Performance Details
                </Button>
              </div>
            </div>
            
            {showPerformanceMetrics && (
              <div>
                <h3 className="font-medium mb-2">Component Render Times</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(metrics.componentRenderTimes).map(([name, time]) => (
                    <div key={name} className="flex justify-between">
                      <span>{name}</span>
                      <span className={time > 100 ? 'text-red-500' : 'text-green-500'}>
                        {time.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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

export default function CalendarPage() {
  return (
    <PerformanceProvider enableOptimizations={true}>
      <CalendarPageContent />
    </PerformanceProvider>
  );
} 