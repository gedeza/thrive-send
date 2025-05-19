"use client";

import React from "react";
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { ContentCalendar } from "@/components/content/content-calendar";
import { createCalendarEvent, fetchCalendarEvents, updateCalendarEvent, deleteCalendarEvent } from "@/lib/api/calendar-service";
import { useToast } from "@/components/ui/use-toast";

export default function CustomCalendarPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleEventCreate = async (eventData: any) => {
    try {
      const response = await createCalendarEvent(eventData);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      return response;
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

  const handleEventUpdate = async (event: any) => {
    try {
      const response = await updateCalendarEvent(event);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      return response;
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
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
          <Button
            className="bg-primary text-primary-foreground font-semibold"
            onClick={() => router.push("/content/new")}
          >
            + Create Content
          </Button>
        </div>
      </div>

      <ContentCalendar
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        fetchEvents={fetchCalendarEvents}
      />
    </div>
  );
} 