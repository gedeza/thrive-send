import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CalendarPage from './page';
import { ContentCalendar } from '@/components/content/content-calendar';
import { useToast } from '@/components/ui/use-toast';

// Mock the components and hooks
jest.mock('@/components/content/content-calendar');
jest.mock('@/components/ui/use-toast');

describe('CalendarPage', () => {
  const mockToast = {
    toast: jest.fn(),
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (ContentCalendar as jest.Mock).mockImplementation(() => <div>Mock Calendar</div>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the calendar component', () => {
    render(<CalendarPage />);
    expect(screen.getByText('Mock Calendar')).toBeInTheDocument();
  });

  it('handles event creation successfully', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      type: 'blog' as const,
      status: 'draft' as const,
      date: '2024-03-20',
      time: '12:00',
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      }
    };

    render(<CalendarPage />);
    
    // Simulate event creation
    const calendar = screen.getByText('Mock Calendar');
    fireEvent.click(calendar);

    // Verify toast notification
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Event created successfully',
      });
    });
  });

  it('handles event creation error', async () => {
    const mockError = new Error('Failed to create event');
    (ContentCalendar as jest.Mock).mockImplementation(({ onEventCreate }) => (
      <button onClick={() => onEventCreate({}).catch(() => {})}>Create Event</button>
    ));

    render(<CalendarPage />);
    
    // Simulate event creation error
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);

    // Verify error toast
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    });
  });

  it('handles event update successfully', async () => {
    const mockEvent = {
      id: '1',
      title: 'Updated Event',
      description: 'Updated Description',
      type: 'blog' as const,
      status: 'scheduled' as const,
      date: '2024-03-21',
      time: '14:00',
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      }
    };

    render(<CalendarPage />);
    
    // Simulate event update
    const calendar = screen.getByText('Mock Calendar');
    fireEvent.click(calendar);

    // Verify toast notification
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Event updated successfully',
      });
    });
  });

  it('handles event deletion successfully', async () => {
    render(<CalendarPage />);
    
    // Simulate event deletion
    const calendar = screen.getByText('Mock Calendar');
    fireEvent.click(calendar);

    // Verify toast notification
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    });
  });

  it('fetches events successfully', async () => {
    render(<CalendarPage />);
    
    // Simulate event fetching
    const calendar = screen.getByText('Mock Calendar');
    fireEvent.click(calendar);

    // Verify no error toast
    await waitFor(() => {
      expect(mockToast.toast).not.toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    });
  });
}); 