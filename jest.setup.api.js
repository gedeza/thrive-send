// Add any global test setup here
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock Date.now() to return a consistent timestamp
const mockDate = new Date('2024-03-20T12:00:00Z');
global.Date.now = jest.fn(() => mockDate.getTime()); 