import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

describe('Tabs Components', () => {
  // Test 1: Basic rendering
  it('renders all tabs components correctly', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 1 content')).toBeInTheDocument();
    // Tab 2 content should be hidden initially
    expect(screen.queryByText('Tab 2 content')).not.toBeVisible();
  });

  // Test 2: Tab switching
  it('switches tabs correctly when clicking on tab triggers', async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );

    // Tab 1 should be visible initially
    expect(screen.getByText('Tab 1 content')).toBeVisible();
    
    // Click on Tab 2
    await userEvent.click(screen.getByText('Tab 2'));
    
    // Now Tab 2 content should be visible and Tab 1 content should be hidden
    expect(screen.getByText('Tab 2 content')).toBeVisible();
    expect(screen.queryByText('Tab 1 content')).not.toBeVisible();
  });

  // Test 3: Custom classNames
  it('applies custom classNames correctly', () => {
    render(
      <Tabs className="custom-tabs-class" defaultValue="tab1">
        <TabsList className="custom-list-class">
          <TabsTrigger className="custom-trigger-class" value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent className="custom-content-class" value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole('tablist')).toHaveClass('custom-list-class');
    expect(screen.getByRole('tab')).toHaveClass('custom-trigger-class');
    expect(screen.getByText('Content')).toHaveClass('custom-content-class');
  });

  // Test 4: Disabled tabs
  it('handles disabled tabs correctly', async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByText('Tab 2');
    expect(tab2).toHaveAttribute('aria-disabled', 'true');
    
    // Try clicking the disabled tab
    await userEvent.click(tab2);
    
    // Content should not change - Tab 1 content should still be visible
    expect(screen.getByText('Tab 1 content')).toBeVisible();
    expect(screen.queryByText('Tab 2 content')).not.toBeVisible();
  });

  // Test 5: Controlled tabs
  it('works in controlled mode with value and onValueChange', async () => {
    const onValueChange = jest.fn();
    const { rerender } = render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );

    // Tab 1 content should be visible initially
    expect(screen.getByText('Tab 1 content')).toBeVisible();
    
    // Click on Tab 2
    await userEvent.click(screen.getByText('Tab 2'));
    
    // onValueChange should be called with 'tab2'
    expect(onValueChange).toHaveBeenCalledWith('tab2');
    
    // Manually update the value prop to simulate controlled behavior
    rerender(
      <Tabs value="tab2" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );
    
    // Now Tab 2 content should be visible
    expect(screen.getByText('Tab 2 content')).toBeVisible();
  });
});