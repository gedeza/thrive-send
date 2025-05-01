import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
  // Test 1: Basic rendering
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  // Test 2: Applies className correctly
  it('applies custom className correctly', () => {
    render(<Input className="custom-class" placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toHaveClass('custom-class');
  });

  // Test 3: Handles user input
  it('handles user input correctly', async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    await userEvent.type(input, 'Hello World');
    expect(input).toHaveValue('Hello World');
  });

  // Test 4: Handles disabled state
  it('applies disabled attribute correctly', () => {
    render(<Input disabled placeholder="Disabled input" />);
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
  });

  // Test 5: Passes through other HTML attributes
  it('passes through HTML attributes correctly', () => {
    render(
      <Input 
        placeholder="Test"
        id="test-id"
        name="test-name"
        aria-label="Test input"
        data-testid="test-input"
      />
    );
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('name', 'test-name');
    expect(input).toHaveAttribute('aria-label', 'Test input');
  });

  // Test 6: Handles form submission
  it('works in a form submission', async () => {
    const handleSubmit = jest.fn(e => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Input placeholder="Form input" name="test-field" />
        <button type="submit">Submit</button>
      </form>
    );

    await userEvent.type(screen.getByPlaceholderText('Form input'), 'test value');
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});