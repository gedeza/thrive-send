"use client";

import React from "react";
import { ContentCalendar, CalendarEvent } from "@/components/content/content-calendar";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Helper to call API endpoints
async function fetchEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/content-calendar", {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }
  
  const data = await res.json();
  return data.map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.content || e.description || "",
    date: e.scheduledFor ? new Date(e.scheduledFor).toISOString().split("T")[0] : "",
    time: e.scheduledFor ? new Date(e.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
    type: e.contentType || "email",
    status: (e.status ?? "scheduled").toLowerCase(),
    campaignId: e.campaignId || undefined,
  })) as CalendarEvent[];
}

async function createEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const res = await fetch("/api/content-calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  
  if (!res.ok) {
    throw new Error("Failed to create event");
  }
  
  return res.json();
}

async function updateEvent(event: CalendarEvent): Promise<CalendarEvent> {
  const res = await fetch(`/api/content-calendar/${event.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  
  if (!res.ok) {
    throw new Error("Failed to update event");
  }
  
  return res.json();
}

async function deleteEvent(id: string): Promise<boolean> {
  const res = await fetch(`/api/content-calendar/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export default function ContentCalendarPage() {
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();

  // Show loading state while auth is loading
  if (!isLoaded || !isOrgLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Show message if no organization is selected
  if (!organization) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="mb-4">Please select an organization to view the calendar</p>
          <a href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>Content Calendar</h2>
      <ContentCalendar
        fetchEvents={fetchEvents}
        onEventCreate={createEvent}
        onEventUpdate={updateEvent}
        onEventDelete={deleteEvent}
      />
    </div>
  );
}
