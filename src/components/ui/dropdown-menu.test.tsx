import React from 'react';
import { render } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut
} from './dropdown-menu';

// Complete mock for Radix UI dropdown menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-root">{children}</div>,
  Trigger: ({ children }: React.PropsWithChildren) => <button data-testid="dropdown-trigger">{children}</button>,
  Portal: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-portal">{children}</div>,
  Content: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-content">{children}</div>,
  Item: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-item">{children}</div>,
  Label: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-label">{children}</div>,
  Separator: () => <hr data-testid="dropdown-separator" />,
  CheckboxItem: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-checkbox">{children}</div>,
  ItemIndicator: ({ children }: React.PropsWithChildren) => <span data-testid="dropdown-indicator">{children}</span>,
  RadioGroup: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-radio-group">{children}</div>,
  RadioItem: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-radio">{children}</div>,
  Group: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-group">{children}</div>,
  Sub: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-sub">{children}</div>,
  SubContent: ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-subcontent">{children}</div>,
  // Add SubTrigger with displayName property
  SubTrigger: Object.assign(
    ({ children }: React.PropsWithChildren) => <div data-testid="dropdown-subtrigger">{children}</div>,
    { displayName: 'RadixDropdownMenuSubTrigger' }
  )
}));

describe('DropdownMenu Components', () => {
  // Test basic rendering
  it('renders all dropdown menu components without errors', () => {
    const { getByTestId, getByText } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Option 1</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="item1">
            <DropdownMenuRadioItem value="item1">Radio 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="item2">Radio 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Check trigger
    expect(getByText('Menu')).toBeTruthy();
    
    // Check content elements
    expect(getByText('Actions')).toBeTruthy();
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Radio 1')).toBeTruthy();
    expect(getByText('Radio 2')).toBeTruthy();
    
    // Check structure with test ids
    expect(getByTestId('dropdown-root')).toBeTruthy();
    expect(getByTestId('dropdown-trigger')).toBeTruthy();
    expect(getByTestId('dropdown-content')).toBeTruthy();
    expect(getByTestId('dropdown-label')).toBeTruthy();
    expect(getByTestId('dropdown-separator')).toBeTruthy();
    expect(getByTestId('dropdown-item')).toBeTruthy();
    expect(getByTestId('dropdown-checkbox')).toBeTruthy();
    expect(getByTestId('dropdown-radio-group')).toBeTruthy();
    expect(getByTestId('dropdown-radio')).toBeTruthy();
  });

  it('applies custom class names correctly', () => {
    const { getByTestId } = render(
      <DropdownMenu>
        <DropdownMenuTrigger className="custom-trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuItem className="custom-item">Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(getByTestId('dropdown-trigger')).toHaveClass('custom-trigger');
    expect(getByTestId('dropdown-content')).toHaveClass('custom-content');
    expect(getByTestId('dropdown-item')).toHaveClass('custom-item');
  });

  // Test submenu components
  it('renders submenu components', () => {
    const { getByTestId, getByText } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Check that the submenu components render
    expect(getByTestId('dropdown-sub')).toBeTruthy();
    expect(getByTestId('dropdown-subtrigger')).toBeTruthy();
    expect(getByText('More Options')).toBeTruthy();
    expect(getByText('Sub Item')).toBeTruthy();
  });

  // Test shortcuts
  it('renders shortcuts', () => {
    const { getByText } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            New Tab
            <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(getByText('New Tab')).toBeTruthy();
    expect(getByText('⌘T')).toBeTruthy();
  });
});
