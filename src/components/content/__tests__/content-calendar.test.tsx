import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCalendar } from '../content-calendar';
import { format } from 'date-fns';

// Mock the API calls
jest.mock('@/lib/api/calendar-service', () => ({
  fetchCalendarEvents: jest.fn(),
  createCalendarEvent: jest.fn(),
  updateCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
}));

describe('ContentCalendar', () => {
  const fetchCalendarEvents = require('@/lib/api/calendar-service').fetchCalendarEvents;
  const createCalendarEvent = require('@/lib/api/calendar-service').createCalendarEvent;
  const updateEvent = require('@/lib/api/calendar-service').updateEvent;
  const deleteEvent = require('@/lib/api/calendar-service').deleteEvent;
  
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event 1',
      date: '2025-01-01',
      time: '10:00',
      description: 'Test Description 1',
      type: 'email',
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'Test Event 2',
      date: '2025-01-02',
      time: '14:00',
      description: 'Test Description 2',
      type: 'social',
      status: 'scheduled',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fetchEvents.mockResolvedValue(mockEvents);
  });

  it('renders calendar with events', async () => {
    render(<ContentCalendar fetchEvents={fetchEvents} />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });
  });

  it('handles event creation', async () => {
    createEvent.mockResolvedValueOnce({ id: '3', title: 'New Event', date: '2025-01-01', type: 'email', status: 'scheduled', description: '' });

    render(<ContentCalendar fetchEvents={fetchEvents} onEventCreate={createEvent} />);

    // Click on calendar to create new event
    const calendarDay = screen.getByTestId('calendar-day-2025-01-01');
    fireEvent.click(calendarDay);

    // Fill in event details
    await userEvent.type(screen.getByLabelText(/title/i), 'New Event');
    await userEvent.type(screen.getByLabelText(/description/i), 'New Description');

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Event',
        description: 'New Description',
      }));
    });
  });

  it('handles event updates', async () => {
    updateEvent.mockResolvedValueOnce({
      id: '1',
      title: 'Updated Event',
      date: '2025-01-01',
      time: '10:00',
      description: 'Test Description 1',
      type: 'email',
      status: 'scheduled',
    });

    render(<ContentCalendar fetchEvents={fetchEvents} onEventUpdate={updateEvent} />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    // Click event to edit
    fireEvent.click(screen.getByText('Test Event 1'));

    // Update title
    const titleInput = screen.getByDisplayValue('Test Event 1');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Event');

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Event',
      }));
    });
  });

  it('handles event deletion', async () => {
    deleteEvent.mockResolvedValueOnce(true);

    render(<ContentCalendar fetchEvents={fetchEvents} onEventDelete={deleteEvent} />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    // Click event to open modal
    fireEvent.click(screen.getByText('Test Event 1'));

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(deleteEvent).toHaveBeenCalledWith('1');
    });
  });

  it('handles loading state', () => {
    fetchEvents.mockImplementationOnce(() => new Promise(() => {}));

    render(<ContentCalendar fetchEvents={fetchEvents} />);
    expect(screen.getByTestId('content-calendar-loading')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    fetchEvents.mockRejectedValueOnce(new Error('Failed to fetch events'));

    render(<ContentCalendar fetchEvents={fetchEvents} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load calendar/i)).toBeInTheDocument();
    });
  });

  it('filters events by date range', async () => {
    render(<ContentCalendar fetchEvents={fetchEvents} />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    // Change date range
    const dateRangeSelect = screen.getByLabelText(/date range/i);
    await userEvent.selectOptions(dateRangeSelect, 'week');

    expect(fetchEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.any(Date),
        end: expect.any(Date),
      })
    );
  });
});
