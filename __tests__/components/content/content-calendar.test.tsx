import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentCalendar } from '../../../components/content/content-calendar';
import { ThemeProvider } from '../../../components/theme-provider';
import * as apiModule from '../../../lib/api'; // assuming you have an API module

// Mock any API calls
jest.mock('../../../lib/api', () => ({
  fetchScheduledContent: jest.fn(),
  updateContentSchedule: jest.fn(),
}));

const mockCalendarData = [
  {
    id: '1',
    title: 'Newsletter #1',
    scheduledDate: '2023-06-15T10:00:00Z',
    status: 'scheduled',
    type: 'newsletter',
  },
  {
    id: '2',
    title: 'Product Update',
    scheduledDate: '2023-06-20T14:30:00Z',
    status: 'draft',
    type: 'announcement',
  },
  {
    id: '3',
    title: 'Weekly Digest',
    scheduledDate: '2023-06-25T09:00:00Z',
    status: 'scheduled',
    type: 'newsletter',
  },
];

describe('ContentCalendar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    (apiModule.fetchScheduledContent as jest.Mock).mockResolvedValue(mockCalendarData);
    (apiModule.updateContentSchedule as jest.Mock).mockResolvedValue({ success: true });
  });

  it('renders the calendar with loading state initially', () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/loading calendar/i)).toBeInTheDocument();
  });

  it('displays scheduled content after loading', async () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Check if scheduled content items are displayed
    expect(screen.getByText('Newsletter #1')).toBeInTheDocument();
    expect(screen.getByText('Product Update')).toBeInTheDocument();
    expect(screen.getByText('Weekly Digest')).toBeInTheDocument();
  });

  it('handles view mode switching (month/week/day)', async () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Find and click view mode buttons
    const weekViewButton = screen.getByRole('button', { name: /week/i });
    fireEvent.click(weekViewButton);
    
    // Verify week view is active
    expect(weekViewButton).toHaveAttribute('aria-selected', 'true');
    
    // Switch to day view
    const dayViewButton = screen.getByRole('button', { name: /day/i });
    fireEvent.click(dayViewButton);
    
    // Verify day view is active
    expect(dayViewButton).toHaveAttribute('aria-selected', 'true');
  });

  it('allows navigation between different periods', async () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Find and click next/previous buttons
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Verify API was called with updated date range
    expect(apiModule.fetchScheduledContent).toHaveBeenCalledTimes(2);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);
    
    // Verify API was called again
    expect(apiModule.fetchScheduledContent).toHaveBeenCalledTimes(3);
  });

  it('allows filtering content by type', async () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Find and use the filter dropdown
    const filterSelect = screen.getByLabelText(/filter by type/i);
    fireEvent.change(filterSelect, { target: { value: 'newsletter' } });
    
    // Verify only newsletters are visible
    expect(screen.getByText('Newsletter #1')).toBeInTheDocument();
    expect(screen.getByText('Weekly Digest')).toBeInTheDocument();
    expect(screen.queryByText('Product Update')).not.toBeInTheDocument();
  });

  it('handles drag-and-drop rescheduling', async () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Mock drag and drop event
    // This is complex to test directly with React Testing Library
    // So we'll simulate the callback that would be called after drag and drop
    const itemElement = screen.getByText('Newsletter #1').closest('[data-content-id="1"]');
    
    // Find the calendar component's onDrop handler
    const calendarContainer = screen.getByTestId('content-calendar-container');
    
    // Create a custom event to simulate drop
    const dropEvent = {
      contentId: '1',
      newDate: '2023-06-17T10:00:00Z',
    };
    
    // Call the onScheduleChange prop (we can do this by accessing component props directly)
    // This is a simplification, you may need to adapt this based on your actual implementation
    fireEvent.drop(calendarContainer, { 
      dataTransfer: { getData: () => JSON.stringify(dropEvent) } 
    });
    
    // Verify API call to update schedule
    await waitFor(() => {
      expect(apiModule.updateContentSchedule).toHaveBeenCalledWith(
        '1', 
        expect.objectContaining({ scheduledDate: expect.any(String) })
      );
    });
  });

  it('handles API error states', async () => {
    // Mock API failure
    (apiModule.fetchScheduledContent as jest.Mock).mockRejectedValue(new Error('Failed to fetch calendar'));
    
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Check error message
    expect(screen.getByText(/failed to load calendar/i)).toBeInTheDocument();
  });

  it('allows creating new content from the calendar', async () => {
    render(
      <ThemeProvider>
        <ContentCalendar />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });
    
    // Find and click the "New Content" button
    const newContentButton = screen.getByRole('button', { name: /new content/i });
    fireEvent.click(newContentButton);
    
    // Verify that the content creation modal/form appears
    expect(screen.getByText(/create new content/i)).toBeInTheDocument();
    
    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Test Content' } });
    
    const typeSelect = screen.getByLabelText(/content type/i);
    fireEvent.change(typeSelect, { target: { value: 'newsletter' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /schedule/i });
    fireEvent.click(submitButton);
    
    // Verify API call to create content
    await waitFor(() => {
      expect(apiModule.updateContentSchedule).toHaveBeenCalled();
    });
  });
});