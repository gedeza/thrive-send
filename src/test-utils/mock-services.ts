// Mock implementations of your service functions

// Calendar service mocks
export const mockCalendarService = {
  fetchCalendarEvents: jest.fn().mockResolvedValue([
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
  createCalendarEvent: jest.fn().mockResolvedValue({
    id: '3',
    title: 'New Event',
    description: 'New Description',
    date: '2023-05-03',
    time: '12:00',
    type: 'social',
    status: 'scheduled'
  }),
  updateCalendarEvent: jest.fn().mockResolvedValue({
    id: '1',
    title: 'Updated Event',
    description: 'Updated Description',
    date: '2023-05-01',
    time: '10:00',
    type: 'email',
    status: 'scheduled'
  }),
  deleteCalendarEvent: jest.fn().mockResolvedValue({ success: true }),
};

// Analytics service mocks
export const mockAnalyticsService = {
  fetchAnalyticsData: jest.fn().mockResolvedValue({
    emailsSent: 1000,
    openRate: 45.2,
    clickRate: 22.1,
    conversionRate: 5.7,
    revenue: 12500,
    subscribers: 5000,
    unsubscribes: 120,
    growthRate: 2.5
  }),
};

// User service mocks
export const mockUserService = {
  fetchUserProfile: jest.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'editor',
    createdAt: '2023-01-01'
  }),
  updateUserProfile: jest.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Updated User',
    email: 'updated@example.com',
    role: 'editor',
    createdAt: '2023-01-01'
  }),
};

// Setup function to configure mocks in tests
export const setupMocks = () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Reset all mocks after each test
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  // Return the mocks for use in tests
  return {
    calendarService: mockCalendarService,
    analyticsService: mockAnalyticsService,
    userService: mockUserService,
  };
};