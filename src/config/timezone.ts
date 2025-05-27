import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// List of common timezones
export const TIMEZONES = [
  { value: 'Africa/Johannesburg', label: 'South Africa Time (SAST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JT)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
] as const;

// Default timezone if none is set
export const DEFAULT_TIMEZONE = 'Africa/Johannesburg';

// Utility function to format date in user's timezone
export function formatDateInTimezone(date: Date, timezone: string, format: string): string {
  return formatInTimeZone(date, timezone, format);
}

// Utility function to convert date to user's timezone
export function convertToTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

// Utility function to get current date in user's timezone
export function getCurrentDateInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
} 