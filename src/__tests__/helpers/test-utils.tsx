import React from 'react';
import { render as rtlRender } from '@testing-library/react';

// Custom render function that includes providers if needed
function render(ui, options = {}) {
  return rtlRender(ui, options);
}

// Helper to generate mock data
const generateMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

const generateMockEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  date: '2023-05-01',
  time: '10:00',
  type: 'email',
  status: 'scheduled',
  ...overrides,
});

// Re-export everything from testing-library
export * from '@testing-library/react';
export { render, generateMockUser, generateMockEvent };