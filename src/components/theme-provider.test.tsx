import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

// Mock next-themes module
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-theme-provider">{children}</div>
  ),
}));

describe('ThemeProvider Component', () => {
  it('renders correctly with children', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Child</div>
      </ThemeProvider>
    );

    // Verify the mocked ThemeProvider renders
    expect(screen.getByTestId('mock-theme-provider')).toBeInTheDocument();
    
    // Verify children are rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('passes attributes to the next-themes ThemeProvider', () => {
    // This test is more limited because we're using a mock,
    // but it helps ensure our component renders
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div>Content</div>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});