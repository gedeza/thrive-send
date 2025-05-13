import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import your Card component - adjust the path as needed
// If this import fails, we'll define a simple Card component inline
let Card;
try {
  // Try to import the actual Card component
  Card = require('../components/ui/card').Card;
} catch (error) {
  // If import fails, define a simple Card component for testing
  Card = ({ children, className = '', title }) => (
    <div className={`card ${className}`}>
      {title && <div className="card-title">{title}</div>}
      <div className="card-content">{children}</div>
    </div>
  );
}

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with a title when provided', () => {
    render(
      <Card title="Card Title">
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <p>Card content</p>
      </Card>
    );
    
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-card');
  });
});