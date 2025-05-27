import { CalendarEvent } from "@/types/calendar";

export async function createCalendarEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create event');
  }

  return response.json();
}

export async function updateCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  const response = await fetch(`/api/calendar/events/${event.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event');
  }

  return response.json();
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete event');
  }
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const response = await fetch('/api/calendar/events');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch events');
  }

  const data = await response.json();
  return data.events;
}

export async function getCalendarEvent(eventId: string): Promise<CalendarEvent> {
  const response = await fetch(`/api/calendar/events/${eventId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch event');
  }

  return response.json();
} 