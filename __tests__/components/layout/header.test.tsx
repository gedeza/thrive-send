import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../../../components/layout/header';
import { ThemeProvider } from '../../../components/theme-provider';

// Mock any hooks or components used in the Header
jest.mock('../../../components/ui/dropdown-menu', () => ({
  DropdownMenu: {
    Root: ({ children }) => <div data-testid="dropdown-root">{children}</div>,
    Trigger: ({ children }) => <div data-testid="dropdown-trigger">{children}</div>,
    Content: ({ children }) => <div data-testid="dropdown-content">{children}</div>,
    Item: ({ children, onSelect }) => (
      <div data-testid="dropdown-item" onClick={onSelect}>{children}</div>
    ),
  }
}));

// Mock theme hooks
jest.mock('../../../components/theme-provider', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

// Mock auth functions if needed
jest.mock('../../../lib/auth', () => ({
  signOut: jest.fn(),
}));

describe('Header Component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/path/to/avatar.jpg',
  };

  it('renders the header with app title', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/thrive send/i)).toBeInTheDocument();
  });

  it('renders user information when user is provided', () => {
    render(
      <ThemeProvider>
        <Header user={mockUser} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', '/path/to/avatar.jpg');
  });

  it('does not render user info when user is not provided', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('renders notifications bell icon', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );
    
    const notificationBell = screen.getByTestId('notification-bell');
    expect(notificationBell).toBeInTheDocument();
  });

  it('shows notification count when there are unread notifications', () => {
    render(
      <ThemeProvider>
        <Header unreadNotifications={3} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles user dropdown menu interactions', () => {
    const mockSignOut = require('../../../lib/auth').signOut;
    
    render(
      <ThemeProvider>
        <Header user={mockUser} />
      </ThemeProvider>
    );
    
    // Click on user avatar to open dropdown
    const userAvatar = screen.getByAltText('User avatar');
    fireEvent.click(userAvatar);
    
    // Click on sign out option
    const signOutOption = screen.getByText(/sign out/i);
    fireEvent.click(signOutOption);
    
    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('handles theme toggle in the user menu', () => {
    const mockSetTheme = jest.fn();
    (require('../../../components/theme-provider')).useTheme.mockImplementation(() => ({
      theme: 'light',
      setTheme: mockSetTheme,
    }));
    
    render(
      <ThemeProvider>
        <Header user={mockUser} />
      </ThemeProvider>
    );
    
    // Click on user avatar to open dropdown
    const userAvatar = screen.getByAltText('User avatar');
    fireEvent.click(userAvatar);
    
    // Click on dark mode option
    const darkModeOption = screen.getByText(/dark mode/i);
    fireEvent.click(darkModeOption);
    
    // Verify setTheme was called
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('handles notification dropdown interactions', () => {
    render(
      <ThemeProvider>
        <Header unreadNotifications={3} />
      </ThemeProvider>
    );
    
    // Click on notification bell
    const notificationBell = screen.getByTestId('notification-bell');
    fireEvent.click(notificationBell);
    
    // Check if notification dropdown content is displayed
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    
    // Check for notification items
    expect(screen.getByText(/recent notifications/i)).toBeInTheDocument();
  });

  it('toggles mobile menu on small screens', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );
    
    // Find mobile menu button (hamburger icon)
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    expect(mobileMenuButton).toBeInTheDocument();
    
    // Click to open menu
    fireEvent.click(mobileMenuButton);
    
    // Mobile menu should be visible
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toHaveClass('visible');
    
    // Click again to close
    fireEvent.click(mobileMenuButton);
    
    // Mobile menu should be hidden
    expect(mobileMenu).toHaveClass('hidden');
  });

  it('handles search input in the header', () => {
    const mockSearch = jest.fn();
    
    render(
      <ThemeProvider>
        <Header onSearch={mockSearch} />
      </ThemeProvider>
    );
    
    // Find search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Type in search box
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Submit the search
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    // Verify search callback was called
    expect(mockSearch).toHaveBeenCalledWith('test query');
  });
});