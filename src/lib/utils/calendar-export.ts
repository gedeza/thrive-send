/**
 * Calendar Export Utilities
 * Generates iCal (.ics) files for calendar events
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */

import { CalendarEvent } from '@/types/calendar';
import { formatInTimeZone } from 'date-fns-tz';

// iCal date format: YYYYMMDDTHHMMSSZ
const formatICalDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

// Format date for all-day events: YYYYMMDD
const formatICalDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  return formatInTimeZone(date, 'UTC', 'yyyyMMdd');
};

// Escape special characters for iCal format
const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
};

// Generate unique identifier for events
const generateUID = (event: CalendarEvent): string => {
  return `${event.id}@thrive-send.app`;
};

// Convert calendar event to iCal VEVENT format
const convertEventToICal = (event: CalendarEvent, userTimezone: string): string => {
  const uid = generateUID(event);
  const summary = escapeICalText(event.title);
  const description = escapeICalText(event.description || '');
  
  // Handle date/time formatting
  let dtstart: string;
  let dtend: string;
  
  if (event.time) {
    // Event with specific time
    const startDateTime = new Date(`${event.date}T${event.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000)); // Default 1 hour duration
    
    dtstart = `DTSTART;TZID=${userTimezone}:${formatInTimeZone(startDateTime, userTimezone, "yyyyMMdd'T'HHmmss")}`;
    dtend = `DTEND;TZID=${userTimezone}:${formatInTimeZone(endDateTime, userTimezone, "yyyyMMdd'T'HHmmss")}`;
  } else {
    // All-day event
    const dateOnly = formatICalDateOnly(event.date);
    const nextDay = new Date(event.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayFormatted = formatICalDateOnly(nextDay.toISOString().split('T')[0]);
    
    dtstart = `DTSTART;VALUE=DATE:${dateOnly}`;
    dtend = `DTEND;VALUE=DATE:${nextDayFormatted}`;
  }
  
  // Build location from social media platforms if available
  let location = '';
  if (event.type === 'social' && event.socialMediaContent?.platforms) {
    location = `Social Media: ${event.socialMediaContent.platforms.join(', ')}`;
  }
  
  // Build categories based on event type
  const categories = [event.type.toUpperCase(), event.status.toUpperCase()].join(',');
  
  // Current timestamp for created/modified
  const timestamp = formatICalDate(new Date());
  
  const vevent = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `CREATED:${timestamp}`,
    `LAST-MODIFIED:${timestamp}`,
    dtstart,
    dtend,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : '',
    location ? `LOCATION:${escapeICalText(location)}` : '',
    `CATEGORIES:${categories}`,
    `STATUS:${event.status === 'sent' ? 'CONFIRMED' : event.status === 'scheduled' ? 'TENTATIVE' : 'NEEDS-ACTION'}`,
    `TRANSP:${event.status === 'sent' ? 'OPAQUE' : 'TRANSPARENT'}`,
    event.type === 'social' ? 'CLASS:PUBLIC' : 'CLASS:PRIVATE',
    'END:VEVENT'
  ].filter(Boolean); // Remove empty lines
  
  return vevent.join('\r\n');
};

// Generate complete iCal file content
export const generateICalFile = (
  events: CalendarEvent[], 
  userTimezone: string = 'UTC',
  calendarName: string = 'Thrive Send Calendar'
): string => {
  const timestamp = formatICalDate(new Date());
  const calendarId = `thrive-send-${Date.now()}@thrive-send.app`;
  
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Thrive Send//Thrive Send Calendar//EN',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    `X-WR-CALDESC:Content calendar events from Thrive Send`,
    'X-WR-TIMEZONE:' + userTimezone,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  
  // Add timezone information
  const timezoneInfo = [
    'BEGIN:VTIMEZONE',
    `TZID:${userTimezone}`,
    // Note: In a production app, you'd want to include proper timezone definitions
    // For now, we'll rely on the importing calendar app to handle timezone conversion
    'END:VTIMEZONE'
  ];
  
  const eventStrings = events.map(event => convertEventToICal(event, userTimezone));
  
  const footer = ['END:VCALENDAR'];
  
  return [...header, ...timezoneInfo, ...eventStrings, ...footer].join('\r\n');
};

// Download iCal file
export const downloadICalFile = (
  events: CalendarEvent[], 
  userTimezone: string = 'UTC', 
  filename: string = 'thrive-send-calendar.ics'
): void => {
  const icalContent = generateICalFile(events, userTimezone);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Generate calendar export URLs for different services
export const generateCalendarServiceUrls = (event: CalendarEvent, userTimezone: string = 'UTC') => {
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description || '');
  
  // Format dates for URL parameters
  const startDateTime = event.time 
    ? new Date(`${event.date}T${event.time}:00`)
    : new Date(event.date);
  
  const endDateTime = new Date(startDateTime.getTime() + (event.time ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
  
  // Google Calendar format: YYYYMMDDTHHMMSSZ
  const googleStart = formatICalDate(startDateTime);
  const googleEnd = formatICalDate(endDateTime);
  
  // Outlook format: YYYY-MM-DDTHH:MM:SS.000Z
  const outlookStart = startDateTime.toISOString();
  const outlookEnd = endDateTime.toISOString();
  
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${googleStart}/${googleEnd}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${outlookStart}&enddt=${outlookEnd}`,
    office365: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${outlookStart}&enddt=${outlookEnd}`,
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${googleStart}&dur=0100&desc=${description}`
  };
};

// Export types for external use
export type ExportFormat = 'ical' | 'google' | 'outlook' | 'office365' | 'yahoo';

export interface ExportOptions {
  format: ExportFormat;
  events: CalendarEvent[];
  userTimezone?: string;
  filename?: string;
  calendarName?: string;
}

// Main export function
export const exportCalendar = (options: ExportOptions): void => {
  const { format, events, userTimezone = 'UTC', filename, calendarName } = options;
  
  switch (format) {
    case 'ical':
      downloadICalFile(events, userTimezone, filename);
      break;
    case 'google':
    case 'outlook':
    case 'office365':
    case 'yahoo':
      if (events.length === 1) {
        const urls = generateCalendarServiceUrls(events[0], userTimezone);
        window.open(urls[format], '_blank');
      } else {
        // For multiple events, fall back to iCal download
        downloadICalFile(events, userTimezone, filename);
      }
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};