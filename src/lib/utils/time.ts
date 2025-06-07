import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@/config/timezone';

export function formatContentTime(dateString: string | null, userTimezone?: string): string {
  if (!dateString) return 'Not scheduled';
  
  const timezone = userTimezone || DEFAULT_TIMEZONE;
  const date = parseISO(dateString);
  
  return formatInTimeZone(date, timezone, 'MMM d, yyyy HH:mm');
}

export function createScheduledDateTime(date: string, time: string, timezone?: string): string {
  const tz = timezone || DEFAULT_TIMEZONE;
  const dateTimeString = `${date}T${time}:00`;
  
  // Convert to UTC for storage
  const zonedDate = toZonedTime(new Date(dateTimeString), tz);
  return zonedDate.toISOString();
}

export function getDefaultTime(): string {
  // Return current time in user's timezone instead of fixed 12:00
  const now = new Date();
  return format(now, 'HH:mm');
}