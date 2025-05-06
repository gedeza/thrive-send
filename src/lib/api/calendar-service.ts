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
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.thrivesend.com";

/**
 * Fetch all calendar events for the authenticated user
 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const response = await fetch(`${API_URL}/api/calendar/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers as needed
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    throw error;
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  event: Omit<CalendarEvent, "id">
): Promise<CalendarEvent> {
  try {
    const response = await fetch(`${API_URL}/api/calendar/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers as needed
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    throw error;
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  event: CalendarEvent
): Promise<CalendarEvent> {
  try {
    const response = await fetch(`${API_URL}/api/calendar/events/${event.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers as needed
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/calendar/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers as needed
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    throw error;
  }
}

/**
 * Reschedule a calendar event to a new date/time
 */
export async function rescheduleCalendarEvent(
  id: string, 
  newDate: string, 
  newTime?: string
): Promise<CalendarEvent> {
  try {
    const response = await fetch(`${API_URL}/api/calendar/events/${id}/reschedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers as needed
      },
      body: JSON.stringify({ date: newDate, time: newTime }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to reschedule calendar event:", error);
    throw error;
  }
}

/**
 * Get analytics for calendar events
 */
export async function getCalendarAnalytics(
  startDate: string,
  endDate: string
): Promise<{ 
  totalEvents: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  try {
    const response = await fetch(
      `${API_URL}/api/calendar/analytics?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers as needed
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get calendar analytics:", error);
    throw error;
  }
}
