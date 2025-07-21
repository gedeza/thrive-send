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
    // Fixed: Add null checks for articleContent
    articleContent: event.type === 'article' ? {
      content: event.articleContent?.content || event.description || '',
      metadata: event.articleContent?.metadata || {}
    } : undefined,
    analytics: event.analytics ? {
      ...event.analytics,
      lastUpdated: event.analytics.lastUpdated || new Date().toISOString()
    } : undefined,
  };
};

const API_URL = '/api/simple-calendar';

// Memory cache for events during the current session
let eventsCache: {
  data: ContentCalendarEvent[];
  timestamp: number;
} | null = null;

// Cache expiration time (5 minutes for development)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Try to detect if we're in a browser environment safely
const isBrowser = typeof window !== 'undefined';

/**
 * Safely check if localStorage is available
 * This handles cases where localStorage is not available or throws errors
 */
function isLocalStorageAvailable() {
  if (!isBrowser) return false;
  
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Fetch all calendar events for the authenticated user
 * Uses caching in development mode to reduce database calls
 */
export async function fetchCalendarEvents(params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  forceMockData?: boolean;
  bypassCache?: boolean;
  cacheEnabled?: boolean;
  lastCacheInvalidation?: number;
}): Promise<ContentCalendarEvent[]> {
  console.log('[fetchCalendarEvents] Called with params:', params);
  
  // Skip cache if explicitly requested, if not in development mode, or if not in browser
  const shouldUseCache = isBrowser && 
    isDevelopment && 
    !params?.bypassCache && 
    (params?.cacheEnabled ?? true);
  
  if (shouldUseCache) {
    // Try memory cache first (fastest)
    if (eventsCache && 
        Date.now() - eventsCache.timestamp < CACHE_EXPIRATION_MS &&
        (!params?.lastCacheInvalidation || eventsCache.timestamp > params.lastCacheInvalidation)) {
      console.log('[fetchCalendarEvents] Using in-memory cache');
      return eventsCache.data;
    }
    
    // Try localStorage cache next
    if (isLocalStorageAvailable()) {
      try {
        const cachedData = localStorage.getItem('calendarEventsCache');
        const cacheTimestamp = localStorage.getItem('calendarEventsCacheTimestamp');
        
        if (cachedData && cacheTimestamp) {
          const parsedTimestamp = parseInt(cacheTimestamp, 10);
          
          if (!isNaN(parsedTimestamp) && 
              Date.now() - parsedTimestamp < CACHE_EXPIRATION_MS &&
              (!params?.lastCacheInvalidation || parsedTimestamp > params.lastCacheInvalidation)) {
            console.log('[fetchCalendarEvents] Using localStorage cache');
            const events = JSON.parse(cachedData);
            
            // Update memory cache too
            eventsCache = {
              data: events,
              timestamp: parsedTimestamp
            };
            
            return events;
          }
        }
      } catch (error) {
        console.warn('[fetchCalendarEvents] Error reading from localStorage cache:', error);
        // Continue with API request if cache read fails
      }
    }
  }

  console.log(`[fetchCalendarEvents] Using simple calendar API`);

  try {
    const response = await fetch(API_URL, {
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
    
    console.log(`[fetchCalendarEvents] Received ${data.events ? data.events.length : 0} events from simple API`);
    
    if (!data.events || !Array.isArray(data.events)) {
      console.error(`[fetchCalendarEvents] Unexpected response format:`, data);
      return [];
    }
    
    // Convert simple calendar events to ContentCalendarEvent format
    const events = data.events.map((event: any) => {
      const startDate = new Date(event.startTime);
      const date = startDate.toISOString().split('T')[0];
      const time = startDate.toTimeString().split(' ')[0].substring(0, 5);

      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        type: event.type,
        status: event.status,
        date,
        time,
        startTime: event.startTime,
        endTime: event.endTime,
        socialMediaContent: {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        },
        analytics: undefined,
        organizationId: undefined,
        createdBy: undefined,
        contentId: event.contentId,
        content: event.content
      };
    });
    
    // Update caches if in development mode
    if (shouldUseCache) {
      // Update memory cache
      eventsCache = {
        data: events,
        timestamp: Date.now()
      };
      
      // Update localStorage cache
      if (isLocalStorageAvailable()) {
        try {
          localStorage.setItem('calendarEventsCache', JSON.stringify(events));
          localStorage.setItem('calendarEventsCacheTimestamp', Date.now().toString());
        } catch (error) {
          console.warn('[fetchCalendarEvents] Error writing to localStorage cache:', error);
        }
      }
    }
    
    return events;
  } catch (error) {
    console.error("[fetchCalendarEvents] Exception:", error);
    throw error;
  }
}

/**
 * Create a new calendar event
 * @deprecated - Calendar events are now created automatically by the simple-content API
 */
export async function createCalendarEvent(event: Omit<ContentCalendarEvent, "id">): Promise<ContentCalendarEvent> {
  console.warn("[createCalendarEvent] DEPRECATED - Calendar events are created automatically by simple-content API");
  
  // Return a mock event for backward compatibility
  return {
    id: `mock-${Date.now()}`,
    title: event.title,
    description: event.description || '',
    type: event.type,
    status: event.status,
    date: event.date,
    time: event.time,
    startTime: event.startTime,
    endTime: event.endTime,
    socialMediaContent: event.socialMediaContent,
    analytics: undefined,
    organizationId: undefined,
    createdBy: undefined
  };
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(event: ContentCalendarEvent): Promise<ContentCalendarEvent> {
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
      throw new Error(errorData.error || errorData.message || "Failed to update calendar event");
    }

    const updatedEvent = await response.json();
    return convertApiEventToCalendarEvent(updatedEvent);
  } catch (error) {
    console.error("[updateCalendarEvent] Exception:", error);
    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
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
      throw new Error(errorData.error || errorData.message || "Failed to delete calendar event");
    }
  } catch (error) {
    console.error("[deleteCalendarEvent] Exception:", error);
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
    console.error("[rescheduleEvent] Exception:", error);
    throw error;
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
      throw new Error(`Failed to get event analytics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getEventAnalytics] Exception:", error);
    throw error;
  }
}

/**
 * Get a specific calendar event by ID
 */
export async function getCalendarEvent(eventId: string): Promise<ContentCalendarEvent> {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to get calendar event: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return convertApiEventToCalendarEvent(data);
  } catch (error) {
    console.error("[getCalendarEvent] Exception:", error);
    throw error;
  }
}
