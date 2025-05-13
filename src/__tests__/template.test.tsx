import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component for testing
const TestComponent = ({ title = 'Default Title' }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>This is a test component</p>
    </div>
  );
};

describe('Template Test', () => {
  it('renders with default props', () => {
    render(<TestComponent />);
    expect(screen.getByText('Default Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<TestComponent title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
});