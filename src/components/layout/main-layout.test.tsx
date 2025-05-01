import React from 'react';
import { render } from '@testing-library/react';
import MainLayout from './main-layout';

// Mock the Header and Sidebar components if needed
jest.mock('./header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

jest.mock('./sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="mock-sidebar">Sidebar</div>;
  };
});

describe('MainLayout', () => {
  it('renders layout with children', () => {
    const { getByTestId, getByText } = render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );
    
    // Check that the layout renders
    expect(getByTestId('mock-header')).toBeInTheDocument();
    expect(getByTestId('mock-sidebar')).toBeInTheDocument();
    
    // Check that it renders children
    expect(getByTestId('test-content')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct layout structure', () => {
    const { container } = render(
      <MainLayout>
        <p>Content</p>
      </MainLayout>
    );
    
    // Check for layout wrapper elements
    // Adjust these selectors based on your actual layout structure
    const layoutWrapper = container.querySelector('div');
    expect(layoutWrapper).toBeInTheDocument();
  });
});