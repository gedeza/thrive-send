import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';

describe('Tabs Components', () => {
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
    
    // Root elements should be in the document
    expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    expect(screen.getByTestId('tab-tab1')).toBeInTheDocument();
    expect(screen.getByTestId('tab-tab2')).toBeInTheDocument();
    
    // Tab 1 content should be visible, Tab 2 content should not be rendered
    expect(screen.getByTestId('tabpanel-tab1')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-tab2')).not.toBeInTheDocument();
    
    // Check actual content
    expect(screen.getByText('Tab 1 content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 2 content')).not.toBeInTheDocument();
  });

  it('switches tabs correctly when clicking on tab triggers', () => {
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
    
    // Initially, Tab 1 content should be visible
    expect(screen.getByTestId('tabpanel-tab1')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-tab2')).not.toBeInTheDocument();
    
    // Click Tab 2
    fireEvent.click(screen.getByTestId('tab-tab2'));
    
    // Now Tab 2 content should be visible and Tab 1 content should be hidden
    expect(screen.getByTestId('tabpanel-tab2')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-tab1')).not.toBeInTheDocument();
    
    expect(screen.getByText('Tab 2 content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 1 content')).not.toBeInTheDocument();
  });

  it('applies custom class names correctly', () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByTestId('tabs-root')).toHaveClass('custom-tabs');
    expect(screen.getByTestId('tabs-list')).toHaveClass('custom-list');
    expect(screen.getByTestId('tab-tab1')).toHaveClass('custom-trigger');
    expect(screen.getByTestId('tabpanel-tab1')).toHaveClass('custom-content');
  });

  it('handles controlled tabs correctly', () => {
    const handleValueChange = jest.fn();
    
    const { rerender } = render(
      <Tabs value="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );
    
    // Click Tab 2
    fireEvent.click(screen.getByTestId('tab-tab2'));
    
    // Check if onValueChange was called
    expect(handleValueChange).toHaveBeenCalledWith('tab2');
    
    // Tab 1 content should still be visible until parent updates the value prop
    expect(screen.getByTestId('tabpanel-tab1')).toBeInTheDocument();
    
    // Simulate parent updating the value prop
    rerender(
      <Tabs value="tab2" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );
    
    // Now Tab 2 content should be visible
    expect(screen.getByTestId('tabpanel-tab2')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-tab1')).not.toBeInTheDocument();
  });

  it('handles disabled tabs correctly', () => {
    const handleValueChange = jest.fn();
    
    render(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
      </Tabs>
    );
    
    const tab2 = screen.getByTestId('tab-tab2');
    expect(tab2).toHaveAttribute('aria-disabled', 'true');
    expect(tab2).toBeDisabled();
    
    // Try clicking the disabled tab
    fireEvent.click(tab2);
    
    // Tab 1 should still be active, onValueChange should not be called
    expect(handleValueChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('tabpanel-tab1')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-tab2')).not.toBeInTheDocument();
  });
});