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


// API Test Setup - Node Environment
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret';

// Mock external services
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendInvitationEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());