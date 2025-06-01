/**
 * Calendar API Service
 * Handles all interactions with the backend for calendar-related operations
 */

import { CalendarEvent as ApiCalendarEvent } from '@/types/calendar';
import { CalendarEvent as ContentCalendarEvent, SocialMediaContent, SocialPlatform } from '@/components/content/content-calendar';
import { getMockCalendarEvents, createMockCalendarEvent, updateMockCalendarEvent, deleteMockCalendarEvent, getMockCalendarAnalytics } from '../mock/calendar-service';

// Flag to track if we should use mock data due to database issues
let useMockData = false;

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
  forceMockData?: boolean;
}): Promise<ContentCalendarEvent[]> {
  // If forceMockData is true or we previously had database issues, use mock data
  if (params?.forceMockData || useMockData) {
    console.log(`[fetchCalendarEvents] Using mock data (forced: ${params?.forceMockData}, previous DB issues: ${useMockData})`);
    return getMockCalendarEvents();
  }

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
      
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[fetchCalendarEvents] Server error, switching to mock data");
        useMockData = true;
        return getMockCalendarEvents();
      }
      
      throw new Error(`Failed to fetch calendar events: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the API is telling us to use mock data
    if (data.databaseAvailable === false) {
      console.log("[fetchCalendarEvents] API reported database unavailable, using mock data");
      useMockData = true;
      return data.events || getMockCalendarEvents();
    }
    
    console.log(`[fetchCalendarEvents] Received ${data.events ? data.events.length : 0} events`);
    
    if (!data.events || !Array.isArray(data.events)) {
      console.error(`[fetchCalendarEvents] Unexpected response format:`, data);
      return [];
    }
    
    return data.events.map(convertApiEventToCalendarEvent);
  } catch (error) {
    console.error("[fetchCalendarEvents] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[fetchCalendarEvents] Exception occurred, switching to mock data");
    useMockData = true;
    return getMockCalendarEvents();
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(event: Omit<ContentCalendarEvent, "id">): Promise<ContentCalendarEvent> {
  // If we're in mock mode, use mock data
  if (useMockData) {
    console.log("[createCalendarEvent] Using mock data");
    return createMockCalendarEvent(event);
  }

  try {
    const apiEvent = convertCalendarEventToApiEvent(event as ContentCalendarEvent);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiEvent),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Create calendar event failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[createCalendarEvent] Server error, switching to mock data");
        useMockData = true;
        return createMockCalendarEvent(event);
      }
      
      throw new Error(errorData.error || errorData.message || "Failed to create calendar event");
    }

    const createdEvent = await response.json();
    return convertApiEventToCalendarEvent(createdEvent);
  } catch (error) {
    console.error("[createCalendarEvent] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[createCalendarEvent] Exception occurred, switching to mock data");
    useMockData = true;
    return createMockCalendarEvent(event);
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(event: ContentCalendarEvent): Promise<ContentCalendarEvent> {
  // If we're in mock mode, use mock data
  if (useMockData) {
    console.log("[updateCalendarEvent] Using mock data");
    return Promise.resolve({...event});
  }

  try {
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
      
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[updateCalendarEvent] Server error, switching to mock data");
        useMockData = true;
        return Promise.resolve({...event});
      }
      
      throw new Error(errorData.error || errorData.message || "Failed to update calendar event");
    }

    const updatedEvent = await response.json();
    return convertApiEventToCalendarEvent(updatedEvent);
  } catch (error) {
    console.error("[updateCalendarEvent] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[updateCalendarEvent] Exception occurred, switching to mock data");
    useMockData = true;
    return Promise.resolve({...event});
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  // If we're in mock mode, use mock data
  if (useMockData) {
    console.log("[deleteCalendarEvent] Using mock data");
    deleteMockCalendarEvent(id);
    return Promise.resolve();
  }

  try {
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
      
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[deleteCalendarEvent] Server error, switching to mock data");
        useMockData = true;
        return Promise.resolve();
      }
      
      throw new Error(errorData.error || errorData.message || "Failed to delete calendar event");
    }
  } catch (error) {
    console.error("[deleteCalendarEvent] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[deleteCalendarEvent] Exception occurred, switching to mock data");
    useMockData = true;
    return Promise.resolve();
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
  // If we're in mock mode, use mock data
  if (useMockData) {
    console.log("[rescheduleEvent] Using mock data");
    const mockEvents = getMockCalendarEvents();
    const event = mockEvents.find(e => e.id === id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const updatedEvent = {
      ...event,
      date: newDate,
      time: newTime || event.time,
      startTime: newTime 
        ? new Date(`${newDate}T${newTime}:00`).toISOString()
        : new Date(`${newDate}T${event.time || '00:00'}:00`).toISOString()
    };
    
    return Promise.resolve(updatedEvent);
  }

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
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[rescheduleEvent] Server error, switching to mock data");
        useMockData = true;
        return rescheduleEvent(id, newDate, newTime);
      }
      
      throw new Error(data.error || data.message || "Failed to reschedule event");
    }

    return convertApiEventToCalendarEvent(data);
  } catch (error) {
    console.error("[rescheduleEvent] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[rescheduleEvent] Exception occurred, switching to mock data");
    useMockData = true;
    return rescheduleEvent(id, newDate, newTime);
  }
}

/**
 * Get analytics for events in a date range
 */
export async function getEventAnalytics(
  startDate: string,
  endDate: string
): Promise<{ 
  totalEvents: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  topTags?: Array<{tag: string, count: number}>;
}> {
  // If we're in mock mode, use mock data
  if (useMockData) {
    console.log("[getEventAnalytics] Using mock data");
    return getMockCalendarAnalytics();
  }

  try {
    const url = `${API_URL}/analytics?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[getEventAnalytics] Server error, switching to mock data");
        useMockData = true;
        return getMockCalendarAnalytics();
      }
      
      throw new Error(`Failed to get event analytics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getEventAnalytics] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[getEventAnalytics] Exception occurred, switching to mock data");
    useMockData = true;
    return getMockCalendarAnalytics();
  }
}

/**
 * Get a specific calendar event by ID
 */
export async function getCalendarEvent(eventId: string): Promise<ContentCalendarEvent> {
  // If we're in mock mode, use mock data
  if (useMockData) {
    console.log("[getCalendarEvent] Using mock data");
    const mockEvents = getMockCalendarEvents();
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  }

  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // If we get a server error, switch to mock data
      if (response.status >= 500) {
        console.log("[getCalendarEvent] Server error, switching to mock data");
        useMockData = true;
        return getCalendarEvent(eventId);
      }
      
      throw new Error(`Failed to get calendar event: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return convertApiEventToCalendarEvent(data);
  } catch (error) {
    console.error("[getCalendarEvent] Exception:", error);
    
    // On any network or parsing error, switch to mock data
    console.log("[getCalendarEvent] Exception occurred, switching to mock data");
    useMockData = true;
    return getCalendarEvent(eventId);
  }
}

/**
 * Reset the mock data flag - for testing or after database issues are resolved
 */
export function resetMockDataFlag(value: boolean = false): void {
  useMockData = value;
  console.log(`[resetMockDataFlag] Set useMockData to ${value}`);
}
