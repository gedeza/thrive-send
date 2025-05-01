import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '../../../components/layout/sidebar';
import { ThemeProvider } from '../../../components/theme-provider';

// Mock router if you're using one
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

describe('Sidebar Component', () => {
  it('renders the sidebar with all navigation items', () => {
    render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    
    // Check for key navigation items
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('highlights the current active route', () => {
    render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    
    // Since we mocked the current path to be '/dashboard'
    const dashboardLink = screen.getByText(/dashboard/i).closest('a');
    expect(dashboardLink).toHaveClass('active'); // Adjust class name as needed
    
    // Other links should not be active
    const analyticsLink = screen.getByText(/analytics/i).closest('a');
    expect(analyticsLink).not.toHaveClass('active');
  });

  it('toggles between expanded and collapsed states', () => {
    render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    
    // Find collapse button
    const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
    
    // Initially sidebar should be expanded
    expect(screen.getByTestId('sidebar')).toHaveClass('expanded');
    
    // Click to collapse
    fireEvent.click(collapseButton);
    
    // Should now be collapsed
    expect(screen.getByTestId('sidebar')).toHaveClass('collapsed');
    
    // Button text/icon should have changed
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    
    // Click again to expand
    fireEvent.click(screen.getByRole('button', { name: /expand sidebar/i }));
    
    // Should be expanded again
    expect(screen.getByTestId('sidebar')).toHaveClass('expanded');
  });

  it('displays user info in the sidebar', () => {
    // Assuming some user info is displayed in the sidebar
    render(
      <ThemeProvider>
        <Sidebar userDisplayName="John Doe" userAvatar="/path/to/avatar.jpg" />
      </ThemeProvider>
    );
    
    // Check user info is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', '/path/to/avatar.jpg');
  });

  it('renders dropdown submenus correctly', () => {
    render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    
    // Find a menu item with submenu (e.g., Content menu)
    const contentMenuItem = screen.getByText(/content/i);
    fireEvent.click(contentMenuItem);
    
    // Submenu should be visible
    expect(screen.getByText(/create content/i)).toBeInTheDocument();
    expect(screen.getByText(/content calendar/i)).toBeInTheDocument();
    
    // Click again to collapse submenu
    fireEvent.click(contentMenuItem);
    
    // Submenu should be hidden
    expect(screen.queryByText(/create content/i)).not.toBeInTheDocument();
  });

  it('correctly navigates when menu items are clicked', () => {
    const mockPush = jest.fn();
    (require('next/router') as any).useRouter.mockImplementation(() => ({
      pathname: '/dashboard',
      push: mockPush,
    }));
    
    render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    
    // Find and click on Analytics link
    const analyticsLink = screen.getByText(/analytics/i).closest('a');
    fireEvent.click(analyticsLink);
    
    // Verify router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/analytics');
  });

  it('persists sidebar state in localStorage', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'collapsed'),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    
    render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    
    // Should start collapsed as per localStorage
    expect(screen.getByTestId('sidebar')).toHaveClass('collapsed');
    
    // Expand sidebar
    const expandButton = screen.getByRole('button', { name: /expand sidebar/i });
    fireEvent.click(expandButton);
    
    // Should have saved new state to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-state', 'expanded');
  });

  it('handles theme toggle interaction', () => {
    // Mock theme context
    const mockSetTheme = jest.fn();
    jest.mock('../../../components/theme-provider', () => ({
      ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
      useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
    }));
    
    render(<Sidebar />);
    
    // Find and click theme toggle
    const themeToggleButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeToggleButton);
    
    // Verify theme was toggled
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});