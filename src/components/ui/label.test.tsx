import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from './label';

describe('Label Component', () => {
  // Test 1: Basic rendering
  it('renders correctly', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  // Test 2: Applies className correctly
  it('applies custom className correctly', () => {
    render(<Label className="custom-class">Username</Label>);
    expect(screen.getByText('Username')).toHaveClass('custom-class');
  });

  // Test 3: Associates with form elements correctly
  it('associates with form elements via htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </>
    );
    expect(screen.getByText('Test Label')).toHaveAttribute('for', 'test-input');
  });

  // Test 4: Works with click events
  it('responds to click events', async () => {
    const handleClick = jest.fn();
    render(<Label onClick={handleClick}>Click me</Label>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test 5: Works with nested elements
  it('renders with nested elements correctly', () => {
    render(
      <Label>
        <span>Required</span> Field
      </Label>
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Field')).toBeInTheDocument();
  });

  // Test 6: Forwards ref correctly
  it('forwards ref to the underlying element', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref Test</Label>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('LABEL');
    expect(ref.current?.textContent).toBe('Ref Test');
  });
});