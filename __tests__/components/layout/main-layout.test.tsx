import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainLayout } from '../../../components/layout/main-layout';
import { ThemeProvider } from '../../../components/theme-provider';

// Mock the Header and Sidebar components
jest.mock('../../../components/layout/header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>
}));

jest.mock('../../../components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>
}));

// Mock router if needed
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
  }),
}));

describe('MainLayout Component', () => {
  it('renders the layout with header, sidebar, and children', () => {
    render(
      <ThemeProvider>
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Check if header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    
    // Check if sidebar is rendered
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    
    // Check if children are rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with the correct layout structure', () => {
    render(
      <ThemeProvider>
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Get main container
    const mainContainer = screen.getByTestId('main-layout-container');
    
    // Check if it has the right classes or structure
    // Adjust these assertions based on your actual implementation
    expect(mainContainer).toHaveClass('flex');
    
    // Check content area
    const contentArea = screen.getByTestId('content-area');
    expect(contentArea).toContainElement(screen.getByTestId('test-content'));
  });

  it('passes correct props to Header component', () => {
    // Unmock Header for this test to verify props
    jest.unmock('../../../components/layout/header');
    jest.mock('../../../components/layout/header', () => ({
      Header: (props) => <div data-testid="mock-header" data-props={JSON.stringify(props)}>Header</div>
    }));
    
    render(
      <ThemeProvider>
        <MainLayout user={{ name: 'Test User' }}>
          <div>Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Check if user prop was passed to Header
    const header = screen.getByTestId('mock-header');
    const headerProps = JSON.parse(header.getAttribute('data-props') || '{}');
    expect(headerProps.user).toEqual({ name: 'Test User' });
  });

  it('passes correct props to Sidebar component', () => {
    // Unmock Sidebar for this test to verify props
    jest.unmock('../../../components/layout/sidebar');
    jest.mock('../../../components/layout/sidebar', () => ({
      Sidebar: (props) => <div data-testid="mock-sidebar" data-props={JSON.stringify(props)}>Sidebar</div>
    }));
    
    render(
      <ThemeProvider>
        <MainLayout user={{ name: 'Test User' }}>
          <div>Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Check if user prop was passed to Sidebar
    const sidebar = screen.getByTestId('mock-sidebar');
    const sidebarProps = JSON.parse(sidebar.getAttribute('data-props') || '{}');
    expect(sidebarProps.user).toEqual({ name: 'Test User' });
  });

  it('applies correct class when sidebar is collapsed', () => {
    // Mock the sidebar state
    jest.mock('../../../hooks/use-sidebar', () => ({
      useSidebar: () => ({ isCollapsed: true })
    }));
    
    render(
      <ThemeProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Content area should have a class indicating sidebar is collapsed
    const contentArea = screen.getByTestId('content-area');
    expect(contentArea).toHaveClass('sidebar-collapsed');
  });

  it('applies custom page-specific classes when provided', () => {
    render(
      <ThemeProvider>
        <MainLayout pageClassName="dashboard-page">
          <div>Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Content area should have the custom class
    const contentArea = screen.getByTestId('content-area');
    expect(contentArea).toHaveClass('dashboard-page');
  });

  it('renders breadcrumbs when provided', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Analytics', href: null }
    ];
    
    render(
      <ThemeProvider>
        <MainLayout breadcrumbs={breadcrumbs}>
          <div>Test Content</div>
        </MainLayout>
      </ThemeProvider>
    );
    
    // Breadcrumbs should be rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    
    // Current breadcrumb (last one) should not be a link
    const analyticsElement = screen.getByText('Analytics');
    expect(analyticsElement.tagName).not.toBe('A');
    
    // Other breadcrumbs should be links
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});