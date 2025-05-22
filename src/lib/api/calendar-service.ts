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
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      
      // Handle specific error cases
      if (response.status === 404 && error.error === 'User not found') {
        console.log("User not found, returning empty array");
        return [];
      }
      
      if (response.status === 500 && error.message?.includes('PostgreSQL')) {
        console.error("Database connection error:", error);
        throw new Error("Database connection error. Please try again in a few moments.");
      }
      
      throw new Error(error.message || "Failed to fetch calendar events");
    }

    const data = await response.json();
    console.log("Fetched events:", data);
    
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    
    // If it's a network error or database connection error, throw it
    if (error instanceof TypeError || error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Database connection')) {
        throw error;
      }
    }
    
    // For other errors, return empty array to prevent infinite loading
    return [];
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(eventData: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  try {
    console.log("Creating calendar event:", eventData);
    const response = await fetch(`${API_URL}/calendar-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    console.log("Create response:", data);

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to create calendar event");
    }

    return data;
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
    console.log("Updating calendar event:", event);
    const response = await fetch(`${API_URL}/calendar-events`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(event),
    });

    const data = await response.json();
    console.log("Update response:", data);

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to update calendar event");
    }

    return data;
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
    console.log("Deleting calendar event:", eventId);
    const response = await fetch(`${API_URL}/calendar-events`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ id: eventId }),
    });

    const data = await response.json();
    console.log("Delete response:", data);

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to delete calendar event");
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
  try {
    console.log("Rescheduling event:", { id, newDate, newTime });
    const response = await fetch(`${API_URL}/calendar/events/${id}/reschedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ date: newDate, time: newTime }),
    });

    const data = await response.json();
    console.log("Reschedule response:", data);

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to reschedule event");
    }

    return data;
  } catch (error) {
    console.error("Error rescheduling event:", error);
    throw error;
  }
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
  try {
    console.log("Fetching analytics:", { startDate, endDate });
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

    const data = await response.json();
    console.log("Analytics response:", data);

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to get calendar analytics");
    }

    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
}
