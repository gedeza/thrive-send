/**
 * This file exists only to prevent import errors.
 * Mock data functionality has been removed as requested.
 */

export const getMockCalendarEvents = () => {
  console.warn('getMockCalendarEvents was called but mock data is disabled');
  return [];
};

export const createMockCalendarEvent = (event: any) => {
  console.warn('createMockCalendarEvent was called but mock data is disabled');
  return event;
};

export const updateMockCalendarEvent = (event: any) => {
  console.warn('updateMockCalendarEvent was called but mock data is disabled');
  return event;
};

export const deleteMockCalendarEvent = (id: string) => {
  console.warn('deleteMockCalendarEvent was called but mock data is disabled');
  return true;
};

export const getMockCalendarAnalytics = () => {
  console.warn('getMockCalendarAnalytics was called but mock data is disabled');
  return {
    totalEvents: 0,
    byType: {},
    byStatus: {},
    topTags: []
  };
}; 