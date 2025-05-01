import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './textarea';

describe('Textarea Component', () => {
  // Test 1: Basic rendering
  it('renders correctly', () => {
    render(<Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  // Test 2: Applies className correctly
  it('applies custom className correctly', () => {
    render(<Textarea className="custom-class" placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toHaveClass('custom-class');
  });

  // Test 3: Handles user input
  it('handles user input correctly', async () => {
    render(<Textarea placeholder="Type here" />);
    const textarea = screen.getByPlaceholderText('Type here');
    await userEvent.type(textarea, 'Hello\nWorld');
    expect(textarea).toHaveValue('Hello\nWorld');
  });

  // Test 4: Handles disabled state
  it('applies disabled attribute correctly', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    expect(screen.getByPlaceholderText('Disabled textarea')).toBeDisabled();
  });

  // Test 5: Passes through other HTML attributes
  it('passes through HTML attributes correctly', () => {
    render(
      <Textarea 
        placeholder="Test"
        id="test-id"
        name="test-name"
        rows={5}
        aria-label="Test textarea"
        data-testid="test-textarea"
      />
    );
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveAttribute('id', 'test-id');
    expect(textarea).toHaveAttribute('name', 'test-name');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('aria-label', 'Test textarea');
  });

  // Test 6: Handles form submission with textarea
  it('works in a form submission', async () => {
    const handleSubmit = jest.fn(e => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Textarea placeholder="Form textarea" name="test-field" />
        <button type="submit">Submit</button>
      </form>
    );

    await userEvent.type(screen.getByPlaceholderText('Form textarea'), 'test value');
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});