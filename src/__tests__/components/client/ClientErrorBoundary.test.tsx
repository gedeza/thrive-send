import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ClientErrorBoundary from '@/components/error/ClientErrorBoundary';

// Mock components
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Home: () => <div data-testid="home-icon" />,
}));

jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Test component that throws an error
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ClientErrorBoundary', () => {
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    // Suppress console errors for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText('Something went wrong with the client component')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to clients/i })).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('hides error details in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
  });

  it('calls custom onError handler when provided', () => {
    const onError = jest.fn();
    
    render(
      <ClientErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error message' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('renders custom fallback component when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ClientErrorBoundary fallbackComponent={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong with the client component')).not.toBeInTheDocument();
  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText('Something went wrong with the client component')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // Rerender with no error
    rerender(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong with the client component')).not.toBeInTheDocument();
  });

  it('has correct link href for back to clients', () => {
    render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    const backLink = screen.getByRole('link', { name: /back to clients/i });
    expect(backLink).toHaveAttribute('href', '/clients');
  });

  it('displays help text', () => {
    render(
      <ClientErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ClientErrorBoundary>
    );

    expect(screen.getByText(/If this problem persists/)).toBeInTheDocument();
  });
});