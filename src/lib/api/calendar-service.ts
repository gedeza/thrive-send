/**
 * Calendar API Service
 * Handles all interactions with the backend for calendar-related operations
 */

import { CalendarEvent as ApiCalendarEvent } from '@/types/calendar';
import { CalendarEvent as ContentCalendarEvent, SocialMediaContent, SocialPlatform } from '@/components/content/content-calendar';

// Helper function to convert API event to content calendar event
const convertApiEventToCalendarEvent = (event: ApiCalendarEvent): ContentCalendarEvent => {
  const socialMediaContent: SocialMediaContent = event.socialMediaContent ? {
    platforms: [event.socialMediaContent.platform as SocialPlatform],
    mediaUrls: event.socialMediaContent.mediaUrls || [],
    crossPost: false,
    platformSpecificContent: {
      [event.socialMediaContent.platform as SocialPlatform]: {
        text: event.socialMediaContent.content,
        mediaUrls: event.socialMediaContent.mediaUrls || [],
        scheduledTime: event.socialMediaContent.scheduledTime
      }
    }
  } : {
    platforms: [],
    mediaUrls: [],
    crossPost: false,
    platformSpecificContent: {}
  };

  // Convert ISO strings to date and time strings
  const startDate = new Date(event.startTime);
  const date = startDate.toISOString().split('T')[0];
  const time = startDate.toTimeString().split(' ')[0].substring(0, 5);

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    type: event.type,
    status: event.status === 'published' ? 'sent' : event.status,
    date,
    time,
    startTime: event.startTime,
    endTime: event.endTime,
    socialMediaContent,
    analytics: event.analytics ? {
      ...event.analytics,
      lastUpdated: event.analytics.lastUpdated || new Date().toISOString()
    } : undefined,
    organizationId: event.organizationId,
    createdBy: event.createdBy
  };
};

// Helper function to convert content calendar event to API event
const convertCalendarEventToApiEvent = (event: ContentCalendarEvent): Omit<ApiCalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'organizationId'> => {
  const firstPlatform = event.socialMediaContent?.platforms[0];
  const platformContent = firstPlatform ? event.socialMediaContent?.platformSpecificContent[firstPlatform] : undefined;

  // Ensure we have valid startTime and endTime
  let startTime = event.startTime || '';
  let endTime = event.endTime || '';

  if (!startTime && event.date) {
    const dateTime = new Date(event.date);
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
    }
    startTime = dateTime.toISOString();
  }

  if (!endTime && startTime) {
    const endDateTime = new Date(startTime);
    endDateTime.setHours(endDateTime.getHours() + 1); // Default 1-hour duration
    endTime = endDateTime.toISOString();
  }

  return {
    title: event.title,
    description: event.description || '',
    startTime,
    endTime,
    type: event.type,
    status: event.status === 'sent' ? 'published' : event.status,
    socialMediaContent: firstPlatform && platformContent ? {
      platform: firstPlatform,
      postType: 'post',
      content: platformContent.text || '',
      mediaUrls: platformContent.mediaUrls || [],
      scheduledTime: platformContent.scheduledTime,
      status: event.status === 'sent' ? 'published' : event.status
    } : undefined,
    articleContent: event.type === 'article' ? {
      content: event.description || '',
      metadata: {}
    } : undefined,
    analytics: event.analytics ? {
      ...event.analytics,
      lastUpdated: event.analytics.lastUpdated || new Date().toISOString()
    } : undefined,
  };
};

const API_URL = '/api/calendar/events';

/**
 * Fetch all calendar events for the authenticated user
 */
export async function fetchCalendarEvents(params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
}): Promise<ContentCalendarEvent[]> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_URL}?${queryParams.toString()}`;
  console.log(`[fetchCalendarEvents] Fetching events from: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[fetchCalendarEvents] Error response: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[fetchCalendarEvents] Error details: ${errorText}`);
      throw new Error(`Failed to fetch calendar events: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[fetchCalendarEvents] Received ${data.events ? data.events.length : 0} events`);
    
    if (!data.events || !Array.isArray(data.events)) {
      console.error(`[fetchCalendarEvents] Unexpected response format:`, data);
      return [];
    }
    
    return data.events.map(convertApiEventToCalendarEvent);
  } catch (error) {
    console.error("[fetchCalendarEvents] Exception:", error);
    throw error;
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(event: Omit<ContentCalendarEvent, "id">): Promise<ContentCalendarEvent> {
  const apiEvent = convertCalendarEventToApiEvent(event as ContentCalendarEvent);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiEvent),
  });

  if (!response.ok) {
    throw new Error("Failed to create calendar event");
  }

  const createdEvent = await response.json();
  return convertApiEventToCalendarEvent(createdEvent);
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(event: ContentCalendarEvent): Promise<ContentCalendarEvent> {
  const apiEvent = convertCalendarEventToApiEvent(event);
  const response = await fetch(`${API_URL}/${event.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(apiEvent),
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

  const updatedEvent = await response.json();
  return convertApiEventToCalendarEvent(updatedEvent);
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
): Promise<ContentCalendarEvent> {
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

    return convertApiEventToCalendarEvent(data);
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

/**
 * Get a single calendar event by ID
 */
export async function getCalendarEvent(eventId: string): Promise<ContentCalendarEvent> {
  const response = await fetch(`${API_URL}/${eventId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Get calendar event failed:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(errorData.error || errorData.message || "Failed to fetch calendar event");
  }

  const event = await response.json();
  return convertApiEventToCalendarEvent(event);
}
