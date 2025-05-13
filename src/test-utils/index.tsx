import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add any providers your components need here
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* Add providers here if needed */}
      {children}
    </>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

export const generateMockEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  date: '2023-05-01',
  time: '10:00',
  type: 'email',
  status: 'scheduled',
  ...overrides,
});

// Helper for testing async functions
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));