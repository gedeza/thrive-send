// Mock implementation of the calendar service
export const fetchCalendarEvents = jest.fn().mockResolvedValue([
  {
    id: '1',
    title: 'Test Event 1',
    description: 'Test Description 1',
    date: '2023-05-01',
    time: '10:00',
    type: 'email',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Test Event 2',
    description: 'Test Description 2',
    date: '2023-05-02',
    time: '11:00',
    type: 'blog',
    status: 'draft'
  }
]);

export const createCalendarEvent = jest.fn().mockResolvedValue({
  id: '3',
  title: 'New Event',
  description: 'New Description',
  date: '2023-05-03',
  time: '12:00',
  type: 'social',
  status: 'scheduled'
});

export const updateCalendarEvent = jest.fn().mockResolvedValue({
  id: '1',
  title: 'Updated Event',
  description: 'Updated Description',
  date: '2023-05-01',
  time: '10:00',
  type: 'email',
  status: 'scheduled'
});

export const deleteCalendarEvent = jest.fn().mockResolvedValue({ success: true });

// Add this to your jest.setup.js:
// jest.mock('@/lib/api/calendar-service', () => require('../__mocks__/calendar-service'));