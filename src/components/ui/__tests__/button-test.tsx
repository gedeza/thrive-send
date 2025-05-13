import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple button component for testing
const Button = ({ children, ...props }) => {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
};

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('passes additional props to the button element', () => {
    render(<Button data-testid="test-button">Click me</Button>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });
});