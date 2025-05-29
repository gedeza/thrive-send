# Error Handling System

## Overview
The error handling system in ThriveSend consists of two main components:
1. ErrorBoundary - A React component for catching and handling component errors
2. useErrorHandler - A custom hook for managing error states in data fetching operations

## ErrorBoundary Component

### Features
- Catches JavaScript errors in child components
- Provides fallback UI when errors occur
- Supports custom error reporting
- Allows error recovery through retry mechanisms

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | React.ReactNode | Yes | The component tree to monitor for errors |
| fallback | React.ReactNode | No | Custom fallback UI to display on error |
| onError | (error: Error, errorInfo: React.ErrorInfo) => void | No | Callback for error reporting |

### Usage

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={<div>Custom error UI</div>}
  onError={(error, errorInfo) => {
    // Report error to monitoring service
    console.error(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## useErrorHandler Hook

### Features
- Manages error states for data fetching
- Provides error recovery mechanisms
- Supports custom error handling logic
- Includes error reporting capabilities

### Usage

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

function YourComponent() {
  const { error, handleError, resetError } = useErrorHandler({
    onError: (error) => {
      // Custom error handling
      console.error('Custom error:', error);
    },
    fallbackMessage: 'Failed to load data',
  });

  // Use in try-catch blocks
  try {
    // Data fetching logic
  } catch (error) {
    handleError(error);
  }

  if (error.hasError) {
    return (
      <div>
        <p>{error.message}</p>
        <button onClick={resetError}>Try Again</button>
      </div>
    );
  }

  return <div>Your component content</div>;
}
```

## Best Practices

### 1. Error Boundary Placement
- Place error boundaries at strategic points in the component tree
- Wrap individual components that might fail independently
- Consider the user experience when errors occur

### 2. Error Recovery
- Provide clear error messages
- Include retry mechanisms where appropriate
- Maintain application state during errors
- Log errors for debugging

### 3. Error Reporting
- Implement consistent error logging
- Include relevant context with errors
- Use appropriate error severity levels
- Consider user privacy when reporting errors

### 4. Performance Considerations
- Keep error boundaries lightweight
- Avoid unnecessary re-renders
- Implement proper cleanup in error states
- Consider error boundary impact on bundle size

## Implementation Examples

### Basic Component with Error Handling
```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';

function DataComponent() {
  const { error, handleError, resetError } = useErrorHandler();

  // Component implementation
}

export function SafeDataComponent() {
  return (
    <ErrorBoundary>
      <DataComponent />
    </ErrorBoundary>
  );
}
```

### Advanced Error Handling
```tsx
function AdvancedComponent() {
  const { error, handleError, resetError } = useErrorHandler({
    onError: (error) => {
      // Report to monitoring service
      reportError(error);
      // Show notification
      showErrorNotification(error.message);
    },
    fallbackMessage: 'Operation failed',
  });

  // Component implementation
}
```

## Troubleshooting

### Common Issues
1. Error boundaries not catching errors
2. Error state not resetting properly
3. Memory leaks in error states
4. Performance issues with error boundaries

### Solutions
1. Ensure error boundaries are properly placed
2. Implement proper cleanup in error states
3. Use React.memo for performance optimization
4. Monitor error boundary performance

## Contributing
When contributing to the error handling system:
1. Follow the established patterns
2. Add appropriate tests
3. Document new features
4. Consider edge cases
5. Test error recovery scenarios 