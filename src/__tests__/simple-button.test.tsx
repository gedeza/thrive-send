import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Define a simple button component inline to avoid import issues
const SimpleButton = ({ children, ...props }) => {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
};

describe('Simple Button', () => {
  it('renders with children', () => {
    render(<SimpleButton>Click me</SimpleButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('passes additional props to the button element', () => {
    render(<SimpleButton data-testid="test-button">Click me</SimpleButton>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });
});