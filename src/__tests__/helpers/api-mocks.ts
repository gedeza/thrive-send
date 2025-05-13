// Mock implementations for API functions

// Calendar API mocks
export const mockCalendarApi = {
  getEvents: jest.fn().mockResolvedValue([
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
  ]),
  createEvent: jest.fn().mockResolvedValue({
    id: '3',
    title: 'New Event',
    description: 'New Description',
    date: '2023-05-03',
    time: '12:00',
    type: 'social',
    status: 'scheduled'
  }),
  updateEvent: jest.fn().mockResolvedValue({
    id: '1',
    title: 'Updated Event',
    description: 'Updated Description',
    date: '2023-05-01',
    time: '10:00',
    type: 'email',
    status: 'scheduled'
  }),
  deleteEvent: jest.fn().mockResolvedValue({ success: true }),
};

// Analytics API mocks
export const mockAnalyticsApi = {
  getAnalytics: jest.fn().mockResolvedValue({
    emailsSent: 1000,
    openRate: 45.2,
    clickRate: 22.1,
    conversionRate: 5.7,
    revenue: 12500
  }),
};

// Setup function to configure mocks in tests
export const setupApiMocks = () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  return {
    calendarApi: mockCalendarApi,
    analyticsApi: mockAnalyticsApi,
  };
};