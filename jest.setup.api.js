// Set default timeout for all tests
jest.setTimeout(30000);

// Mock email service
jest.mock('@/lib/email', () => ({
  sendInvitationEmail: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock storage service
jest.mock('@/lib/api', () => ({
  uploadMedia: jest.fn().mockImplementation(() => Promise.resolve({
    url: 'https://test.com/file.png',
    filename: 'test-file.png',
  })),
  deleteContent: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock Date.now() to return a consistent timestamp
const mockDate = new Date('2024-03-20T12:00:00Z');
global.Date.now = jest.fn(() => mockDate.getTime()); 