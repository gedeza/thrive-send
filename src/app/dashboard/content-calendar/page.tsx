"use client";

import React from "react";
import { ContentCalendar, CalendarEvent } from "@/components/content/content-calendar";

// Helper to call API endpoints
async function fetchEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/content-calendar", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  // Backend returns in DB shape, adapt if needed
  const data = await res.json();
  return data.map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.body || e.description || "",
    date: e.scheduledFor ? new Date(e.scheduledFor).toISOString().split("T")[0] : "",
    time: e.scheduledFor ? new Date(e.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
    type: "email", // You can enhance the mapping for 'type'
    status: (e.status ?? "scheduled").toLowerCase(),
    campaignId: e.projectId || undefined,
  })) as CalendarEvent[];
}

async function createEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const res = await fetch("/api/content-calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: event.title,
      body: event.description,
      status: event.status?.toUpperCase(),
      scheduledFor: `${event.date}T${event.time}`,
      // Add org/project ID if desired
    }),
  });
  if (!res.ok) throw new Error("Failed to create event");
  const data = await res.json();
  return {
    id: data.id,
    title: data.title,
    description: data.body || "",
    date: data.scheduledFor ? new Date(data.scheduledFor).toISOString().split("T")[0] : "",
    time: data.scheduledFor ? new Date(data.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
    type: "email", // You can parse or infer
    status: (data.status ?? "scheduled").toLowerCase(),
    campaignId: data.projectId || undefined,
  };
}

async function updateEvent(event: CalendarEvent): Promise<CalendarEvent> {
  const res = await fetch("/api/content-calendar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: event.id,
      title: event.title,
      body: event.description,
      status: event.status?.toUpperCase(),
      scheduledFor: `${event.date}T${event.time}`,
      // Add org/project ID if desired
    }),
  });
  if (!res.ok) throw new Error("Failed to update event");
  const data = await res.json();
  return {
    id: data.id || event.id,
    title: data.title,
    description: data.body || "",
    date: data.scheduledFor ? new Date(data.scheduledFor).toISOString().split("T")[0] : "",
    time: data.scheduledFor ? new Date(data.scheduledFor).toISOString().split("T")[1]?.slice(0, 5) : "",
    type: "email",
    status: (data.status ?? "scheduled").toLowerCase(),
    campaignId: data.projectId || undefined,
  };
}

async function deleteEvent(id: string): Promise<boolean> {
  const res = await fetch(`/api/content-calendar/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export default function ContentCalendarPage() {
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
