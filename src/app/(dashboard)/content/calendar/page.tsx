"use client";

import { ContentCalendar } from "@/components/content/content-calendar";
import { CalendarEvent } from "@/components/content/content-calendar";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { listContent } from "@/lib/api/content-service";

export default function CalendarPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    try {
      setIsLoading(true);
      console.log('Fetching content...');
      const response = await listContent({});
      console.log('Content response:', response);

      if (!response.content || !Array.isArray(response.content)) {
        console.error('Invalid content response:', response);
        throw new Error('Invalid content response format');
      }

      const calendarEvents: CalendarEvent[] = response.content.map(content => {
        console.log('Processing content:', content);
        
        // Map content type to calendar event type
        let eventType: CalendarEvent['type'];
        switch (content.type) {
          case 'article':
          case 'blog':
            eventType = 'blog';
            break;
          case 'social':
            eventType = 'social';
            break;
          case 'email':
            eventType = 'email';
            break;
          default:
            eventType = 'other';
        }

        // Map content status to calendar event status
        let eventStatus: CalendarEvent['status'];
        switch (content.status) {
          case 'published':
            eventStatus = 'sent';
            break;
          case 'archived':
            eventStatus = 'failed';
            break;
          case 'scheduled':
            eventStatus = 'scheduled';
            break;
          default:
            eventStatus = 'draft';
        }

        // Parse media content if it exists
        let socialMediaContent;
        try {
          socialMediaContent = content.media ? JSON.parse(content.media as string) : {
            platforms: [],
            mediaUrls: [],
            crossPost: false,
            platformSpecificContent: {}
          };
        } catch (error) {
          console.error('Error parsing media content:', error);
          socialMediaContent = {
            platforms: [],
            mediaUrls: [],
            crossPost: false,
            platformSpecificContent: {}
          };
        }

        const event: CalendarEvent = {
          id: content.id,
          title: content.title,
          description: content.content,
          type: eventType,
          status: eventStatus,
          date: content.scheduledAt || content.createdAt,
          time: content.scheduledAt ? new Date(content.scheduledAt).toLocaleTimeString() : undefined,
          socialMediaContent,
          analytics: {
            lastUpdated: new Date().toISOString()
          }
        };

        console.log('Created calendar event:', event);
        return event;
      });

      console.log('Setting events:', calendarEvents);
      setEvents(calendarEvents);
      return calendarEvents;
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventCreate = async (event: Omit<CalendarEvent, "id">) => {
    try {
      // Here you would typically make an API call to save the event
      const newEvent: CalendarEvent = {
        ...event,
        id: crypto.randomUUID(),
      };
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      // Here you would typically make an API call to update the event
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      return event;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      // Here you would typically make an API call to delete the event
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <ContentCalendar
        events={events}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        fetchEvents={fetchEvents}
      />
    </div>
  );
} 