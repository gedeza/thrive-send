"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ContentCalendar } from "@/components/content/content-calendar";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { CalendarEvent } from "@/types/calendar";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/api/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar as CalendarIcon, List, Grid, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CalendarPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [filterType, setFilterType] = useState<string>("all");

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
      const response = await fetch('/api/calendar/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      return data.events;
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const handleEventCreate = async (event: Omit<CalendarEvent, "id">) => {
    try {
      const newEvent = await createCalendarEvent(event);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      return newEvent;
    } catch (error) {
      console.error("Failed to create event:", error);
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
      const updatedEvent = await updateCalendarEvent(event);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      return updatedEvent;
    } catch (error) {
      console.error("Failed to update event:", error);
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
            className="bg-primary text-primary-foreground font-semibold"
            onClick={() => router.push("/content/new")}
          >
            + Create Content
          </Button>
        </div>
      </div>

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