/**
 * Calendar API Service
 * Handles all interactions with the backend for calendar-related operations
 */

// Define the CalendarEvent type directly in the service layer
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  location?: string;
  attendees?: string[];
}

// Default API endpoint - update with your actual API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Fetch all calendar events for the authenticated user
 */
export async function fetchEvents(): Promise<CalendarEvent[]> {
  const response = await fetch(`${API_URL}/calendar/events`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  
  return await response.json();
}

/**
 * Create a new calendar event
 */
export async function createEvent(
  event: Omit<CalendarEvent, "id" | "status">
): Promise<CalendarEvent> {
  const response = await fetch(`${API_URL}/calendar/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error("Failed to create event");
  }

  return await response.json();
}

/**
 * Update an existing calendar event
 */
export async function updateEvent(
  event: CalendarEvent
): Promise<CalendarEvent> {
  const response = await fetch(`${API_URL}/calendar/events/${event.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error("Failed to update event");
  }

  return await response.json();
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/calendar/events/${id}`, {
    method: "DELETE",
  });
  
  return response.ok;
}

/**
 * Reschedule a calendar event to a new date/time
 */
export async function rescheduleEvent(
  id: string, 
  newDate: string, 
  newTime?: string
): Promise<CalendarEvent> {
  const response = await fetch(`${API_URL}/calendar/events/${id}/reschedule`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date: newDate, time: newTime }),
  });

  if (!response.ok) {
    throw new Error("Failed to reschedule event");
  }

  return await response.json();
}

/**
 * Get analytics for calendar events
 */
export async function getEventAnalytics(
  startDate: string,
  endDate: string
): Promise<{ 
  totalEvents: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  const response = await fetch(
    `${API_URL}/calendar/analytics?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get calendar analytics");
  }

  return await response.json();
}
