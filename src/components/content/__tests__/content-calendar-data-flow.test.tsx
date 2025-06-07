import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCalendar } from '../content-calendar';

// Use the same mock structure as the working test
jest.mock('@/lib/api/calendar-service', () => ({
  fetchEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
}));

// Mock toast notifications
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Content Calendar Data Flow Integration', () => {
  const fetchEvents = require('@/lib/api/calendar-service').fetchEvents;
  const createEvent = require('@/lib/api/calendar-service').createEvent;
  const updateEvent = require('@/lib/api/calendar-service').updateEvent;
  const deleteEvent = require('@/lib/api/calendar-service').deleteEvent;

  const mockInitialEvents = [
    {
      id: '1',
      title: 'Existing Event',
      date: '2025-01-15',
      time: '10:00',
      description: 'Pre-existing content',
      type: 'blog',
      status: 'scheduled',
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fetchEvents.mockResolvedValue(mockInitialEvents);
  });

  it('should track complete data flow from content creation to calendar display', async () => {
    // Mock successful event creation
    const newEvent = {
      id: '2',
      title: 'New Test Event',
      date: '2025-01-16',
      time: '14:00',
      description: 'Test event description',
      type: 'social',
      status: 'scheduled',
      socialMediaContent: {
        platforms: ['twitter'],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {
          twitter: {
            text: 'Test social media content',
            mediaUrls: [],
            scheduledTime: '2025-01-16T14:00:00Z'
          }
        }
      }
    };
    
    createEvent.mockResolvedValue(newEvent);
    fetchEvents.mockResolvedValue([...mockInitialEvents, newEvent]);

    // Render component with required props
    render(
      <ContentCalendar 
        fetchEvents={fetchEvents}
        onEventCreate={createEvent}
        onEventUpdate={updateEvent}
        onEventDelete={deleteEvent}
      />
    );

    // Wait for initial events to load
    await waitFor(() => {
      expect(screen.getByText('Existing Event')).toBeInTheDocument();
    });

    // Verify fetchEvents was called
    expect(fetchEvents).toHaveBeenCalledTimes(1);

    // Test event creation flow
    const addButton = screen.getByRole('button', { name: /add|create|new/i });
    fireEvent.click(addButton);

    // Fill in event details (adjust selectors based on actual form)
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    await userEvent.type(titleInput, newEvent.title);
    await userEvent.type(descriptionInput, newEvent.description);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
    fireEvent.click(submitButton);

    // Verify API calls and state updates
    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: newEvent.title,
          description: newEvent.description
        })
      );
    });

    // Verify UI updates with new event
    await waitFor(() => {
      expect(screen.getByText('New Test Event')).toBeInTheDocument();
    });

    // Verify events are refetched after creation
    expect(fetchEvents).toHaveBeenCalledTimes(2);
  });
});