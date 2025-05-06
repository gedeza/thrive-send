"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentCalendar } from "@/components/content/content-calendar";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

// Mock API functions - replace with real API calls
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Weekly Newsletter",
    description: "Send out weekly updates to subscribers",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "email",
    status: "scheduled"
  },
  {
    id: "2",
    title: "Product Launch Tweet",
    description: "Announce new feature on Twitter",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    type: "social",
    status: "draft"
  },
  {
    id: "3",
    title: "Blog Post: Marketing Tips",
    description: "Publish blog post about email marketing",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    time: "10:00",
    type: "blog",
    status: "scheduled"
  },
  {
    id: "4",
    title: "Monthly Report",
    description: "Send monthly performance report",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
    time: "14:00",
    type: "email",
    status: "sent"
  }
];

// Mock API functions
const fetchEvents = async (): Promise<CalendarEvent[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [...mockEvents];
};

const createEvent = async (event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ...event,
    id: Math.random().toString(36).substring(2, 9)
  };
};

const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { ...event };
};

const deleteEvent = async (id: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export default function CalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("calendar");
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load upcoming and completed events
  useEffect(() => {
    const loadTabData = async () => {
      setIsLoading(true);
      try {
        const allEvents = await fetchEvents();
        const today = new Date().toISOString().split('T')[0];
        
        // Filter upcoming events (scheduled for today or in the future)
        const upcoming = allEvents.filter(
          event => event.status === "scheduled" && event.date >= today
        );
        
        // Filter completed events (sent)
        const completed = allEvents.filter(
          event => event.status === "sent"
        );
        
        setUpcomingEvents(upcoming);
        setCompletedEvents(completed);
      } catch (error) {
        console.error("Failed to load tab data:", error);
        toast({
          title: "Error",
          description: "Failed to load calendar data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTabData();
  }, []);
  
  const handleCreateContent = useCallback(() => {
    router.push("/content/new");
  }, [router]);
  
  const handleEventCreate = async (event: Omit<CalendarEvent, "id">) => {
    try {
      const createdEvent = await createEvent(event);
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      
      return createdEvent;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      const updatedEvent = await updateEvent(event);
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      
      return updatedEvent;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const handleEventDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  
  return (
    <div className="space-y-6">
    
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your content across all channels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleCreateContent}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex">
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "calendar" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("calendar")}
          >
            Calendar
          </button>
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "upcoming" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "completed" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </nav>
      </div>
      
      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <ContentCalendar 
            fetchEvents={fetchEvents}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            onDateSelect={(date) => {
              console.log("Selected date:", date);
              // Optionally open create dialog pre-filled with this date
            }}
          />
        </div>
      )}
      
      {/* Upcoming Tab */}
      {activeTab === "upcoming" && (
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading upcoming events...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming events scheduled.</p>
              <button 
                onClick={handleCreateContent} 
                className="mt-4 px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                <Plus className="h-4 w-4 inline-block mr-2" />
                Schedule Content
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-4 hover:bg-accent/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">{formatDate(event.date)}</span>
                        {event.time && (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1 text-sm border rounded-md hover:bg-accent"
                        onClick={() => {
                          // Implement edit functionality
                          alert(`Edit event: ${event.id}`);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="px-3 py-1 text-sm border rounded-md text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          handleEventDelete(event.id);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Completed Tab */}
      {activeTab === "completed" && (
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading completed events...</p>
            </div>
          ) : completedEvents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No completed events to display.</p>
            </div>
          ) : (
            <div className="divide-y">
              {completedEvents.map(event => (
                <div key={event.id} className="p-4 hover:bg-accent/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline">{event.type}</Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Sent</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">{formatDate(event.date)}</span>
                        {event.time && (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1 text-sm border rounded-md hover:bg-accent"
                        onClick={() => {
                          // Implement view report functionality
                          alert(`View report for: ${event.id}`);
                        }}
                      >
                        View Report
                      </button>
                      <button 
                        className="px-3 py-1 text-sm border rounded-md hover:bg-accent"
                        onClick={() => {
                          // Implement duplicate functionality
                          alert(`Duplicate event: ${event.id}`);
                        }}
                      >
                        Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all channels
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingEvents.filter(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                const endOfWeek = new Date();
                endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                return eventDate <= endOfWeek;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Content scheduled for this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
