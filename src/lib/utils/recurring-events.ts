/**
 * Recurring Events System
 * Handles creation and management of repeating calendar events
 */

import { addDays, addWeeks, addMonths, addYears, format, isSameDay, parseISO, startOfDay, endOfMonth, lastDayOfMonth, getDay, setDay, addBusinessDays } from 'date-fns';
import { CalendarEvent } from '@/components/content/types';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type RecurrencePattern = {
  frequency: RecurrenceFrequency;
  interval: number; // Every X days/weeks/months/years
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc. (for weekly/monthly)
  dayOfMonth?: number; // Day of month (for monthly)
  monthOfYear?: number; // Month of year (for yearly)
  weekOfMonth?: number; // Week of month (1-4, -1 for last week)
  endType: 'never' | 'after' | 'until';
  endAfter?: number; // Number of occurrences
  endDate?: string; // End date (ISO string)
  businessDaysOnly?: boolean; // Skip weekends
  excludeDates?: string[]; // Specific dates to exclude
};

export interface RecurringEventData {
  baseEvent: Omit<CalendarEvent, 'id' | 'date'>;
  pattern: RecurrencePattern;
  seriesId: string; // Groups all events in the series
  maxOccurrences?: number; // Safety limit (default 100)
}

export interface GeneratedRecurrence {
  events: CalendarEvent[];
  seriesId: string;
  pattern: RecurrencePattern;
  nextOccurrence?: Date;
  hasMore: boolean;
}

// Predefined recurrence patterns for common use cases
export const COMMON_PATTERNS: Record<string, Partial<RecurrencePattern>> = {
  'daily': {
    frequency: 'daily',
    interval: 1,
    endType: 'never'
  },
  'weekdays': {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    businessDaysOnly: true,
    endType: 'never'
  },
  'weekly': {
    frequency: 'weekly',
    interval: 1,
    endType: 'never'
  },
  'biweekly': {
    frequency: 'weekly',
    interval: 2,
    endType: 'never'
  },
  'monthly': {
    frequency: 'monthly',
    interval: 1,
    endType: 'never'
  },
  'quarterly': {
    frequency: 'monthly',
    interval: 3,
    endType: 'never'
  },
  'yearly': {
    frequency: 'yearly',
    interval: 1,
    endType: 'never'
  },
  // Content-specific patterns
  'social-daily': {
    frequency: 'daily',
    interval: 1,
    endType: 'after',
    endAfter: 30
  },
  'blog-weekly': {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [2], // Tuesdays
    endType: 'after',
    endAfter: 12
  },
  'newsletter-monthly': {
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: 1, // First of month
    endType: 'never'
  },
  'tip-tuesday': {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [2], // Tuesdays
    endType: 'never'
  },
  'monthly-report': {
    frequency: 'monthly',
    interval: 1,
    weekOfMonth: -1, // Last week
    daysOfWeek: [5], // Friday
    endType: 'never'
  }
};

// Content type suggestions for recurrence patterns
export const CONTENT_TYPE_PATTERNS: Record<string, string[]> = {
  'social': ['daily', 'social-daily', 'weekdays', 'tip-tuesday'],
  'blog': ['weekly', 'biweekly', 'blog-weekly'],
  'email': ['weekly', 'monthly', 'newsletter-monthly'],
  'article': ['monthly', 'quarterly'],
  'custom': ['weekly', 'monthly', 'quarterly']
};

// Generate a unique series ID for recurring events
export const generateSeriesId = (): string => {
  return `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate next occurrence based on pattern
export const getNextOccurrence = (
  baseDate: Date,
  pattern: RecurrencePattern,
  currentOccurrence: number = 0
): Date | null => {
  let nextDate = new Date(baseDate);

  switch (pattern.frequency) {
    case 'daily':
      nextDate = addDays(baseDate, pattern.interval * currentOccurrence);
      break;

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find next occurrence on specified days of week
        const currentWeek = Math.floor(currentOccurrence / pattern.daysOfWeek.length);
        const dayIndex = currentOccurrence % pattern.daysOfWeek.length;
        const targetDay = pattern.daysOfWeek[dayIndex];
        
        nextDate = addWeeks(baseDate, pattern.interval * currentWeek);
        nextDate = setDay(nextDate, targetDay);
      } else {
        nextDate = addWeeks(baseDate, pattern.interval * currentOccurrence);
      }
      break;

    case 'monthly':
      if (pattern.weekOfMonth && pattern.daysOfWeek) {
        // Nth day of month (e.g., 2nd Tuesday)
        const targetDay = pattern.daysOfWeek[0];
        nextDate = addMonths(baseDate, pattern.interval * currentOccurrence);
        nextDate = getNthWeekdayOfMonth(nextDate, targetDay, pattern.weekOfMonth);
      } else if (pattern.dayOfMonth) {
        // Specific day of month
        nextDate = addMonths(baseDate, pattern.interval * currentOccurrence);
        const lastDay = lastDayOfMonth(nextDate).getDate();
        const targetDay = Math.min(pattern.dayOfMonth, lastDay);
        nextDate.setDate(targetDay);
      } else {
        nextDate = addMonths(baseDate, pattern.interval * currentOccurrence);
      }
      break;

    case 'yearly':
      nextDate = addYears(baseDate, pattern.interval * currentOccurrence);
      if (pattern.monthOfYear) {
        nextDate.setMonth(pattern.monthOfYear - 1);
      }
      break;

    default:
      return null;
  }

  // Skip weekends if business days only
  if (pattern.businessDaysOnly) {
    nextDate = skipWeekends(nextDate);
  }

  // Skip excluded dates
  if (pattern.excludeDates) {
    const dateStr = format(nextDate, 'yyyy-MM-dd');
    if (pattern.excludeDates.includes(dateStr)) {
      return getNextOccurrence(baseDate, pattern, currentOccurrence + 1);
    }
  }

  return nextDate;
};

// Helper function to get nth weekday of month
const getNthWeekdayOfMonth = (date: Date, weekday: number, week: number): Date => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  
  if (week === -1) {
    // Last occurrence of weekday in month
    const lastDay = lastDayOfMonth(date);
    let targetDate = new Date(lastDay);
    
    while (getDay(targetDate) !== weekday) {
      targetDate = addDays(targetDate, -1);
    }
    return targetDate;
  } else {
    // Nth occurrence of weekday in month
    let targetDate = new Date(firstDay);
    let count = 0;
    
    while (count < week) {
      if (getDay(targetDate) === weekday) {
        count++;
        if (count === week) break;
      }
      targetDate = addDays(targetDate, 1);
    }
    
    return targetDate;
  }
};

// Skip weekends for business days only patterns
const skipWeekends = (date: Date): Date => {
  const dayOfWeek = getDay(date);
  if (dayOfWeek === 0) { // Sunday
    return addDays(date, 1);
  } else if (dayOfWeek === 6) { // Saturday
    return addDays(date, 2);
  }
  return date;
};

// Generate recurring events based on pattern
export const generateRecurringEvents = (data: RecurringEventData): GeneratedRecurrence => {
  const { baseEvent, pattern, seriesId, maxOccurrences = 100 } = data;
  const events: CalendarEvent[] = [];
  const startDate = parseISO(baseEvent.date);
  
  let currentOccurrence = 0;
  let hasMore = false;
  let nextOccurrence: Date | null = null;

  // Determine how many events to generate
  let targetOccurrences = maxOccurrences;
  if (pattern.endType === 'after' && pattern.endAfter) {
    targetOccurrences = Math.min(pattern.endAfter, maxOccurrences);
  }

  // Generate events
  for (let i = 0; i < targetOccurrences; i++) {
    const occurrenceDate = getNextOccurrence(startDate, pattern, i);
    
    if (!occurrenceDate) break;

    // Check end conditions
    if (pattern.endType === 'until' && pattern.endDate) {
      const endDate = parseISO(pattern.endDate);
      if (occurrenceDate > endDate) {
        break;
      }
    }

    // Create event for this occurrence
    const eventId = `${seriesId}-${i}`;
    const event: CalendarEvent = {
      ...baseEvent,
      id: eventId,
      date: format(occurrenceDate, 'yyyy-MM-dd'),
      // Add recurrence metadata
      recurringData: {
        seriesId,
        pattern,
        occurrenceNumber: i,
        isRecurring: true
      }
    };

    events.push(event);
    currentOccurrence = i + 1;
  }

  // Check if there are more potential occurrences
  if (pattern.endType === 'never' || 
      (pattern.endType === 'after' && pattern.endAfter && currentOccurrence < pattern.endAfter)) {
    const potentialNext = getNextOccurrence(startDate, pattern, currentOccurrence);
    if (potentialNext) {
      if (pattern.endType === 'until' && pattern.endDate) {
        const endDate = parseISO(pattern.endDate);
        hasMore = potentialNext <= endDate;
      } else {
        hasMore = true;
      }
      nextOccurrence = potentialNext;
    }
  }

  return {
    events,
    seriesId,
    pattern,
    nextOccurrence: nextOccurrence || undefined,
    hasMore
  };
};

// Update a single occurrence in a recurring series
export const updateRecurringOccurrence = (
  originalEvent: CalendarEvent,
  updates: Partial<CalendarEvent>,
  updateType: 'this' | 'future' | 'all' = 'this'
): {
  updatedEvents: CalendarEvent[];
  newSeriesId?: string;
} => {
  const recurringData = originalEvent.recurringData;
  if (!recurringData) {
    throw new Error('Event is not part of a recurring series');
  }

  switch (updateType) {
    case 'this':
      // Update only this occurrence - break it from the series
      const updatedEvent = {
        ...originalEvent,
        ...updates,
        recurringData: {
          ...recurringData,
          isException: true,
          originalSeriesId: recurringData.seriesId,
          modifiedAt: new Date().toISOString()
        }
      };
      return { updatedEvents: [updatedEvent] };

    case 'future':
      // Create new series for this and future occurrences
      const newSeriesId = generateSeriesId();
      const baseEvent = { ...originalEvent, ...updates };
      delete baseEvent.id;
      delete baseEvent.recurringData;

      const newSeries = generateRecurringEvents({
        baseEvent,
        pattern: recurringData.pattern,
        seriesId: newSeriesId
      });

      return {
        updatedEvents: newSeries.events,
        newSeriesId
      };

    case 'all':
      // This would require regenerating the entire series
      // Implementation depends on how the parent handles series updates
      throw new Error('Update all occurrences should be handled at the series level');

    default:
      throw new Error('Invalid update type');
  }
};

// Get human-readable description of recurrence pattern
export const getRecurrenceDescription = (pattern: RecurrencePattern): string => {
  const { frequency, interval, daysOfWeek, dayOfMonth, endType, endAfter, endDate } = pattern;

  let description = '';

  // Base frequency
  switch (frequency) {
    case 'daily':
      description = interval === 1 ? 'Daily' : `Every ${interval} days`;
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = daysOfWeek.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]);
        description = interval === 1 
          ? `Weekly on ${dayNames.join(', ')}`
          : `Every ${interval} weeks on ${dayNames.join(', ')}`;
      } else {
        description = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      }
      break;
    case 'monthly':
      if (dayOfMonth) {
        description = interval === 1 
          ? `Monthly on day ${dayOfMonth}`
          : `Every ${interval} months on day ${dayOfMonth}`;
      } else {
        description = interval === 1 ? 'Monthly' : `Every ${interval} months`;
      }
      break;
    case 'yearly':
      description = interval === 1 ? 'Yearly' : `Every ${interval} years`;
      break;
  }

  // Business days modifier
  if (pattern.businessDaysOnly) {
    description += ' (weekdays only)';
  }

  // End condition
  switch (endType) {
    case 'after':
      description += `, ${endAfter} times`;
      break;
    case 'until':
      description += `, until ${endDate}`;
      break;
    case 'never':
      description += ', no end date';
      break;
  }

  return description;
};

// Validate recurrence pattern
export const validateRecurrencePattern = (pattern: RecurrencePattern): string[] => {
  const errors: string[] = [];

  if (pattern.interval < 1) {
    errors.push('Interval must be at least 1');
  }

  if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
    if (pattern.daysOfWeek.length === 0) {
      errors.push('At least one day of week must be selected');
    }
    if (pattern.daysOfWeek.some(day => day < 0 || day > 6)) {
      errors.push('Invalid day of week');
    }
  }

  if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
    if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
      errors.push('Day of month must be between 1 and 31');
    }
  }

  if (pattern.endType === 'after' && (!pattern.endAfter || pattern.endAfter < 1)) {
    errors.push('End after must be at least 1 occurrence');
  }

  if (pattern.endType === 'until' && !pattern.endDate) {
    errors.push('End date is required when ending until a specific date');
  }

  return errors;
};

// Export types for external use
export type RecurringEventMetadata = {
  seriesId: string;
  pattern: RecurrencePattern;
  occurrenceNumber: number;
  isRecurring: boolean;
  isException?: boolean;
  originalSeriesId?: string;
  modifiedAt?: string;
};

// Extend CalendarEvent type to include recurring data
declare module '@/components/content/types' {
  interface CalendarEvent {
    recurringData?: RecurringEventMetadata;
  }
}