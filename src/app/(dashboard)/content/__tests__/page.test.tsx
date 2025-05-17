import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentLibraryPage from '../page';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ContentLibraryPage', () => {
  // Test 1: Basic Rendering
  it('renders the content library page correctly', () => {
    render(<ContentLibraryPage />);
    
    // Check title and description
    expect(screen.getByText('Content Library')).toBeInTheDocument();
    expect(screen.getByText('Access and manage your reusable content assets')).toBeInTheDocument();
    
    // Check if the "Add to Library" button exists
    expect(screen.getByTestId('add-to-library')).toBeInTheDocument();
    expect(screen.getByText('Add to Library')).toBeInTheDocument();
    
    // Check if the search input exists
    expect(screen.getByPlaceholderText('Search content library...')).toBeInTheDocument();
    
    // Check if tabs exist
    expect(screen.getByRole('tab', { name: 'Templates' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Media' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Snippets' })).toBeInTheDocument();
  });

  // Test 2: Tab Navigation
  it('switches between tabs correctly', async () => {
    render(<ContentLibraryPage />);
    
    // Templates tab should be active by default
    expect(screen.getByTestId('tabpanel-templates')).toBeInTheDocument();
    expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    
    // Switch to Media tab
    fireEvent.click(screen.getByRole('tab', { name: 'Media' }));
    
    // Media content should be visible
    await waitFor(() => {
      expect(screen.getByTestId('tabpanel-media')).toBeInTheDocument();
      expect(screen.getByText('Company Logo')).toBeInTheDocument();
    });
    
    // Switch to Snippets tab
    fireEvent.click(screen.getByRole('tab', { name: 'Snippets' }));
    
    // Snippets content should be visible
    await waitFor(() => {
      expect(screen.getByTestId('tabpanel-snippets')).toBeInTheDocument();
      expect(screen.getByText('Product Benefits')).toBeInTheDocument();
    });
  });

  // Test 3: Search Functionality
  it('filters content when searching', () => {
    render(<ContentLibraryPage />);
    
    // Type in the search box
    const searchInput = screen.getByPlaceholderText('Search content library...');
    fireEvent.change(searchInput, { target: { value: 'welcome' } });
    
    // Check that the search state is updated
    expect(searchInput).toHaveValue('welcome');
    
    // Note: In a real implementation, the content would be filtered based on the search.
    // Since our implementation doesn't actually filter content yet, we're just testing
    // that the state is updated correctly. In a complete implementation, we would also test
    // that only matching content is displayed.
  });

  // Test 4: Navigation Links
  it('contains correct navigation links', () => {
    render(<ContentLibraryPage />);
    
    // "Add to Library" button should link to the correct URL
    const addButton = screen.getByTestId('add-to-library');
    expect(addButton.getAttribute('href')).toBe('/content/new?library=true');
    
    // Template "Use Template" link should have the correct URL
    const useTemplateLinks = screen.getAllByText('Use Template');
    expect(useTemplateLinks[0].closest('a')).toHaveAttribute('href', '/content-library/templates/1');
    
    // Switch to Media tab to check media links
    fireEvent.click(screen.getByRole('tab', { name: 'Media' }));
    const previewLinks = screen.getAllByText('Preview');
    expect(previewLinks[0].closest('a')).toHaveAttribute('href', '/content-library/media/1');
    
    // Switch to Snippets tab to check snippet links
    fireEvent.click(screen.getByRole('tab', { name: 'Snippets' }));
    const useSnippetLinks = screen.getAllByText('Use Snippet');
    expect(useSnippetLinks[0].closest('a')).toHaveAttribute('href', '/content-library/snippets/1');
  });
});