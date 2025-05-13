// This file is run before each test file
// Add any global setup here

// Suppress console output during tests to keep the output clean
// Comment these out if you need to debug tests
global.console = {
  ...console,
  // Uncomment to disable console.log during tests
  // log: jest.fn(),
  // Uncomment to disable console.error during tests
  // error: jest.fn(),
  // Uncomment to disable console.warn during tests
  // warn: jest.fn(),
};