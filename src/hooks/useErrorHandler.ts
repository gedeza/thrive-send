import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  message: string | null;
  code?: string;
}

interface ErrorHandlerOptions {
  onError?: (error: Error) => void;
  fallbackMessage?: string;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: null,
  });

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : options.fallbackMessage || 'An unexpected error occurred';

    setError({
      hasError: true,
      message: errorMessage,
      code: error instanceof Error ? error.name : undefined,
    });

    if (options.onError && error instanceof Error) {
      options.onError(error);
    }

    // Log error to error reporting service
    console.error('Error caught by handler:', error);
  }, [options]);

  const resetError = useCallback(() => {
    setError({
      hasError: false,
      message: null,
    });
  }, []);

  return {
    error,
    handleError,
    resetError,
  };
}

// Example usage:
/*
const { error, handleError, resetError } = useErrorHandler({
  onError: (error) => {
    // Custom error handling logic
    console.error('Custom error handling:', error);
  },
  fallbackMessage: 'Failed to load data',
});

try {
  // Data fetching logic
} catch (error) {
  handleError(error);
}
*/ 