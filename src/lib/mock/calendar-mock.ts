/**
 * This file has been deprecated and is only kept to prevent import errors.
 * Mock data is no longer used in the ThriveSend application.
 */

import { CalendarEvent } from '@/components/content/content-calendar';

export const getMockCalendarEvents = (): CalendarEvent[] => {
  console.warn('getMockCalendarEvents was called but mock data is disabled');
  return [];
}; 