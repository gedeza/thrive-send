// API Test Setup - Node Environment
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret';

// External service mocks will be handled by individual test files
// This avoids module resolution issues during global setup

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.clearAllMocks();
});