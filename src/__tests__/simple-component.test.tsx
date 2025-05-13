import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Define a simple component inline
const SimpleComponent = ({ title = 'Default Title' }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>This is a test component</p>
    </div>
  );
};

describe('Simple Component', () => {
  it('renders with default title', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Default Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<SimpleComponent title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
});
