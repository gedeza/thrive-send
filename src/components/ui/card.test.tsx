import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from './card';

describe('Card Components', () => {
  // Test 1: Basic Card rendering
  it('renders Card correctly', () => {
    render(<Card data-testid="card">Card Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Content');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-card');
  });

  // Test 2: CardHeader rendering
  it('renders CardHeader correctly', () => {
    render(<CardHeader data-testid="card-header">Header Content</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Header Content');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('p-6');
  });

  // Test 3: CardTitle rendering
  it('renders CardTitle correctly', () => {
    render(<CardTitle data-testid="card-title">Title Content</CardTitle>);
    const title = screen.getByTestId('card-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Title Content');
    expect(title.tagName).toBe('H3'); // Should be h3 element
    expect(title).toHaveClass('text-lg'); // Updated from text-2xl to text-lg
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  // Test 4: CardDescription rendering
  it('renders CardDescription correctly', () => {
    render(<CardDescription data-testid="card-desc">Description Content</CardDescription>);
    const desc = screen.getByTestId('card-desc');
    expect(desc).toBeInTheDocument();
    expect(desc).toHaveTextContent('Description Content');
    expect(desc.tagName).toBe('P'); // Should be p element
    expect(desc).toHaveClass('text-sm');
    expect(desc).toHaveClass('text-muted-foreground');
  });

  // Test 5: CardContent rendering
  it('renders CardContent correctly', () => {
    render(<CardContent data-testid="card-content">Main Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Main Content');
    expect(content).toHaveClass('p-6');
    expect(content).toHaveClass('pt-0');
  });

  // Test 6: CardFooter rendering
  it('renders CardFooter correctly', () => {
    render(<CardFooter data-testid="card-footer">Footer Content</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Footer Content');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('p-6');
    expect(footer).toHaveClass('pt-0');
  });

  // Test 7: Integration - Complete card with all subcomponents
  it('renders complete card with all components', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Example Card</CardTitle>
          <CardDescription>This is a sample card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content area of the card</p>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>
    );
    
    const card = screen.getByTestId('full-card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Example Card')).toBeInTheDocument();
    expect(screen.getByText('This is a sample card')).toBeInTheDocument();
    expect(screen.getByText('This is the main content area of the card')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Test 8: Custom className prop
  it('applies custom className properly', () => {
    render(<Card className="custom-class" data-testid="custom-card">Content</Card>);
    expect(screen.getByTestId('custom-card')).toHaveClass('custom-class');
    
    render(<CardHeader className="custom-header" data-testid="custom-header">Content</CardHeader>);
    expect(screen.getByTestId('custom-header')).toHaveClass('custom-header');
  });
  
});
