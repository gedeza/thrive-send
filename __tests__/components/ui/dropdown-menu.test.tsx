import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DropdownMenu } from '../../../components/ui/dropdown-menu';

describe('DropdownMenu Components', () => {
  it('renders all dropdown menu components without errors', () => {
    const { getByTestId, getAllByTestId } = render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Actions</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem checked>Option 1</DropdownMenu.CheckboxItem>
          <DropdownMenu.RadioGroup>
            <DropdownMenu.RadioItem value="radio1">Radio 1</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="radio2">Radio 2</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    
    expect(getByTestId('dropdown-root')).toBeTruthy();
    expect(getByTestId('dropdown-trigger')).toBeTruthy();
    expect(getByTestId('dropdown-content')).toBeTruthy();
    expect(getByTestId('dropdown-label')).toBeTruthy();
    
    // Use getAllByTestId for elements that might appear multiple times
    expect(getAllByTestId('dropdown-separator').length).toBeGreaterThan(0);
    
    expect(getByTestId('dropdown-item')).toBeTruthy();
    expect(getByTestId('dropdown-checkbox')).toBeTruthy();
    expect(getByTestId('dropdown-radio-group')).toBeTruthy();
    expect(getAllByTestId('dropdown-radio').length).toBe(2);
  });

  it('applies custom class names correctly', () => {
    render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="custom-trigger">Menu</DropdownMenu.Trigger>
        <DropdownMenu.Content className="custom-content">
          <DropdownMenu.Item className="custom-item">Item 1</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    
    // Open the dropdown
    fireEvent.click(screen.getByTestId('dropdown-trigger'));
    
    expect(screen.getByTestId('dropdown-trigger')).toHaveClass('custom-trigger');
    expect(screen.getByTestId('dropdown-content')).toHaveClass('custom-content');
    expect(screen.getByTestId('dropdown-item')).toHaveClass('custom-item');
  });

  it('opens and closes the dropdown menu', () => {
    render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>Toggle</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    
    // Content should not be in the document initially
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(screen.getByTestId('dropdown-trigger'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(screen.getByTestId('dropdown-trigger'));
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
  });

  it('handles item selection', () => {
    const onSelectMock = jest.fn();
    
    render(
      <DropdownMenu.Root onSelect={onSelectMock}>
        <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item value="item1">Item 1</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('dropdown-trigger'));
    
    // Click an item
    fireEvent.click(screen.getByTestId('dropdown-item'));
    
    // Check if onSelect was called and dropdown was closed
    expect(onSelectMock).toHaveBeenCalled();
    expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
  });

  it('handles checkbox items correctly', () => {
    const onCheckedChangeMock = jest.fn();
    
    render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem 
            checked={false} 
            onCheckedChange={onCheckedChangeMock}
          >
            Option
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('dropdown-trigger'));
    
    // Click checkbox item
    fireEvent.click(screen.getByTestId('dropdown-checkbox'));
    
    // Check if onCheckedChange was called with true
    expect(onCheckedChangeMock).toHaveBeenCalledWith(true);
  });

  it('handles radio group selection', () => {
    const onValueChangeMock = jest.fn();
    
    render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value="radio1" onValueChange={onValueChangeMock}>
            <DropdownMenu.RadioItem value="radio1">Radio 1</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="radio2">Radio 2</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('dropdown-trigger'));
    
    // Click the second radio item
    fireEvent.click(screen.getAllByTestId('dropdown-radio')[1]);
    
    // Check if onValueChange was called with the correct value
    expect(onValueChangeMock).toHaveBeenCalledWith('radio2');
  });
});