import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentForm } from '../../../components/content/content-form';
import { ThemeProvider } from '../../../components/theme-provider';
import * as apiModule from '../../../lib/api'; // assuming you have an API module

// Mock any API calls
jest.mock('../../../lib/api', () => ({
  saveContent: jest.fn(),
  fetchContentById: jest.fn(),
}));

// Mock rich text editor if used
jest.mock('some-rich-text-editor', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <div data-testid="mock-editor">
      <textarea 
        data-testid="mock-editor-input" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  ),
}));

describe('ContentForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  
  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };
  
  const existingContent = {
    id: '123',
    title: 'Existing Newsletter',
    content: '<p>This is some existing content</p>',
    type: 'newsletter',
    scheduledDate: '2023-07-15T10:00:00Z',
    status: 'draft',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    (apiModule.saveContent as jest.Mock).mockResolvedValue({ success: true, id: '123' });
    (apiModule.fetchContentById as jest.Mock).mockResolvedValue(existingContent);
  });

  it('renders an empty form for new content', () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/create content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/content type/i)).toBeInTheDocument();
  });

  it('renders form with existing content when contentId is provided', async () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} contentId="123" />
      </ThemeProvider>
    );
    
    // Should show loading initially
    expect(screen.getByText(/loading content/i)).toBeInTheDocument();
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByText(/loading content/i)).not.toBeInTheDocument();
    });
    
    // Verify form is populated with existing content
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Newsletter');
    expect(screen.getByLabelText(/content type/i)).toHaveValue('newsletter');
    
    // Check that the scheduled date is properly formatted in the date picker
    const datePicker = screen.getByLabelText(/scheduled date/i);
    expect(datePicker).toHaveValue('2023-07-15');
  });

  it('validates required fields on submission', async () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);
    
    // Check validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('updates form state when fields change', () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Test Content' } });
    
    const typeSelect = screen.getByLabelText(/content type/i);
    fireEvent.change(typeSelect, { target: { value: 'announcement' } });
    
    const datePicker = screen.getByLabelText(/scheduled date/i);
    fireEvent.change(datePicker, { target: { value: '2023-08-01' } });
    
    // Verify values were updated
    expect(titleInput).toHaveValue('New Test Content');
    expect(typeSelect).toHaveValue('announcement');
    expect(datePicker).toHaveValue('2023-08-01');
  });

  it('submits the form with the correct data', async () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'New Test Content' } 
    });
    
    fireEvent.change(screen.getByLabelText(/content type/i), { 
      target: { value: 'newsletter' } 
    });
    
    fireEvent.change(screen.getByLabelText(/scheduled date/i), { 
      target: { value: '2023-08-01' } 
    });
    
    // Mock rich text editor content change
    const mockEditor = screen.getByTestId('mock-editor-input');
    fireEvent.change(mockEditor, { 
      target: { value: '<p>This is the content body</p>' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);
    
    // Verify that onSubmit was called with the right data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Content',
          type: 'newsletter',
          scheduledDate: expect.any(String),
          content: '<p>This is the content body</p>',
        })
      );
    });
  });

  it('shows saving state during form submission', async () => {
    // Mock a slow API response
    (apiModule.saveContent as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true, id: '123' }), 500);
      });
    });
    
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'New Test Content' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);
    
    // Verify loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
  });

  it('handles cancellation correctly', () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Fill out some data
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'Content that will be cancelled' } 
    });
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Verify onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows confirmation dialog when cancelling with unsaved changes', () => {
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Fill out some data to create "unsaved changes"
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'Unsaved changes' } 
    });
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false); // User clicks "Cancel" in the confirm dialog
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Verify confirm was called and onCancel was not called
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
    
    // Change mock to return true (user confirms)
    window.confirm = jest.fn(() => true);
    
    // Click cancel again
    fireEvent.click(cancelButton);
    
    // Now onCancel should be called
    expect(mockOnCancel).toHaveBeenCalled();
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('handles API errors during submission', async () => {
    // Mock API failure
    (apiModule.saveContent as jest.Mock).mockRejectedValue(new Error('Failed to save content'));
    
    render(
      <ThemeProvider>
        <ContentForm {...defaultProps} />
      </ThemeProvider>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'New Test Content' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to save content/i)).toBeInTheDocument();
    });
    
    // Button should be enabled again
    expect(submitButton).not.toBeDisabled();
  });
});