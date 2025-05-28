/**
 * Calendar API Service
 * Handles all interactions with the backend for calendar-related operations
 */

import { CalendarEvent } from '@/types/calendar';

const API_URL = '/api/calendar/events';

/**
 * Fetch all calendar events for the authenticated user
 */
export async function fetchCalendarEvents(params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
}): Promise<CalendarEvent[]> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);

  const response = await fetch(`${API_URL}?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch calendar events");
  }

  const data = await response.json();
  return data.events;
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): Promise<CalendarEvent> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error("Failed to create calendar event");
  }

  return response.json();
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  const response = await fetch(`${API_URL}/${event.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Update calendar event failed:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(errorData.error || errorData.message || "Failed to update calendar event");
  }

  return response.json();
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Delete calendar event failed:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(errorData.error || errorData.message || "Failed to delete calendar event");
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
    const response = await fetch(`${API_URL}/${id}/reschedule`, {
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
      `${API_URL}/analytics?startDate=${startDate}&endDate=${endDate}`,
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
