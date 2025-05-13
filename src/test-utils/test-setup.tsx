// Test setup utilities for rendering components in tests
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add any providers that components need to be wrapped with for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
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