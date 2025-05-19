/**
 * Calendar API Service
 * Handles all interactions with the backend for calendar-related operations
 */

import { CalendarEvent } from "@/components/content/content-calendar";

// Use the current window location for the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

/**
 * Fetch all calendar events for the authenticated user
 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    console.log("Fetching calendar events...");
    const response = await fetch(`${API_URL}/calendar-events`, {
      credentials: 'include',
    });
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      if (response.status === 404 && error.error === 'User not found') {
        // Return empty array if user not found (they'll be created on next request)
        return [];
      }
      throw new Error(error.message || "Failed to fetch calendar events");
    }

    const data = await response.json();
    console.log("Fetched events:", data);
    
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(eventData: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  try {
    const response = await fetch(`${API_URL}/calendar-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create calendar event");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  try {
    const response = await fetch(`${API_URL}/calendar-events`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update calendar event");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/calendar-events`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ id: eventId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete calendar event");
    }

    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
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
    credentials: 'include',
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
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get calendar analytics");
  }

  return await response.json();
}
