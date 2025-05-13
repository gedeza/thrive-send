import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../button';

// Mock the theme
jest.mock('@/lib/theme', () => ({
  theme: {
    button: {
      primary: {
        background: '#0055FF',
        color: '#FFFFFF',
        border: 'transparent',
        hoverBackground: '#0044CC',
        hoverColor: '#FFFFFF',
        hoverBorder: 'transparent',
        disabledBackground: '#E2E8F0',
        disabledColor: '#94A3B8',
        disabledBorder: 'transparent',
      },
      secondary: {
        background: 'transparent',
        color: '#0055FF',
        border: '#0055FF',
        hoverBackground: '#F0F4FF',
        hoverColor: '#0044CC',
        hoverBorder: '#0044CC',
        disabledBackground: 'transparent',
        disabledColor: '#94A3B8',
        disabledBorder: '#E2E8F0',
      },
      text: {
        background: 'transparent',
        color: '#0055FF',
        border: 'transparent',
        hoverBackground: '#F0F4FF',
        hoverColor: '#0044CC',
        hoverBorder: 'transparent',
        disabledBackground: 'transparent',
        disabledColor: '#94A3B8',
        disabledBorder: 'transparent',
      },
      accent: {
        background: '#FF3366',
        color: '#FFFFFF',
        border: 'transparent',
        hoverBackground: '#E61653',
        hoverColor: '#FFFFFF',
        hoverBorder: 'transparent',
        disabledBackground: '#E2E8F0',
        disabledColor: '#94A3B8',
        disabledBorder: 'transparent',
      }
    },
    border: {
      radius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      }
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    transition: {
      DEFAULT: 'all 0.2s ease-in-out',
    }
  }
}));

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary Button</Button>);
    let button = screen.getByRole('button', { name: /primary button/i });
    // Check for style properties instead of classes since our button uses inline styles
    expect(button).toHaveStyle('background: rgb(0, 85, 255)'); // Primary color
    expect(button).toHaveStyle('color: rgb(255, 255, 255)'); // White text
    
    rerender(<Button variant="secondary">Secondary Button</Button>);
    button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toHaveStyle('background: transparent');
    expect(button).toHaveStyle('color: rgb(0, 85, 255)');
    
    rerender(<Button variant="text">Text Button</Button>);
    button = screen.getByRole('button', { name: /text button/i });
    expect(button).toHaveStyle('background: transparent');
    
    rerender(<Button variant="accent">Accent Button</Button>);
    button = screen.getByRole('button', { name: /accent button/i });
    expect(button).toHaveStyle('background: rgb(255, 51, 102)');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    // Check for disabled styling
    expect(button).toHaveStyle('opacity: 0.7');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small Button</Button>);
    expect(screen.getByRole('button', { name: /small button/i })).toHaveStyle('font-size: 0.875rem');
    
    rerender(<Button size="md">Medium Button</Button>);
    expect(screen.getByRole('button', { name: /medium button/i })).toHaveStyle('font-size: 1rem');
    
    rerender(<Button size="lg">Large Button</Button>);
    expect(screen.getByRole('button', { name: /large button/i })).toHaveStyle('font-size: 1.125rem');
  });

  it('passes additional props to the button element', () => {
    render(<Button aria-label="Test Button">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveAttribute('aria-label', 'Test Button');
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button', { name: /custom/i })).toHaveAttribute('class', expect.stringContaining('custom-class'));
  });

  it('renders with loading state', () => {
    render(<Button isLoading>Loading</Button>);
    
    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toHaveStyle('cursor: not-allowed');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders with icons', () => {
    const { rerender } = render(
      <Button startIcon={<span data-testid="start-icon" />}>
        With Start Icon
      </Button>
    );
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    
    rerender(
      <Button endIcon={<span data-testid="end-icon" />}>
        With End Icon
      </Button>
    );
    
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    
    rerender(
      <Button 
        startIcon={<span data-testid="start-icon-2" />}
        endIcon={<span data-testid="end-icon-2" />}
      >
        With Both Icons
      </Button>
    );
    
    expect(screen.getByTestId('start-icon-2')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon-2')).toBeInTheDocument();
  });
});
