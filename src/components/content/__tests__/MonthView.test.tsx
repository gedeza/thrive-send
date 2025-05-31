import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthView } from '../MonthView';
import { CalendarEvent } from '../content-calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

// Mock the dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any) => inputs.filter(Boolean).join(' '),
}));

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

// Mock date-fns-tz functions
jest.mock('date-fns-tz', () => ({
  formatInTimeZone: (date: Date, timezone: string, formatStr: string) => format(date, formatStr),
  toZonedTime: (date: Date) => date,
}));

describe('MonthView Component', () => {
  // Test data
  const currentDate = new Date(2023, 8, 15); // September 15, 2023
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Test Event 1',
      description: 'Test Description 1',
      type: 'email',
      status: 'draft',
      date: '2023-09-15',
      time: '10:00',
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {},
      },
      organizationId: 'org1',
      createdBy: 'user1',
    },
    {
      id: '2',
      title: 'Test Event 2',
      description: 'Test Description 2',
      type: 'social',
      status: 'scheduled',
      date: '2023-09-20',
      time: '14:30',
      socialMediaContent: {
        platforms: ['TWITTER'],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {
          TWITTER: {
            text: 'Twitter content',
            mediaUrls: [],
          },
        },
      },
      organizationId: 'org1',
      createdBy: 'user1',
    },
  ];

  // Mock handlers
  const handleEventClick = jest.fn();
  const handleDateClick = jest.fn();
  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return mockEvents.filter(event => event.date === dayStr);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the month view correctly', () => {
    render(
      <MonthView
        currentDate={currentDate}
        daysInMonth={daysInMonth}
        getEventsForDay={getEventsForDay}
        handleEventClick={handleEventClick}
        handleDateClick={handleDateClick}
        userTimezone="UTC"
      />
    );

    // Check if day headers are rendered
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();

    // Check if the days of the month are rendered
    expect(screen.getByText('15')).toBeInTheDocument(); // September 15
    expect(screen.getByText('20')).toBeInTheDocument(); // September 20
  });

  it('shows events on the correct days', () => {
    render(
      <MonthView
        currentDate={currentDate}
        daysInMonth={daysInMonth}
        getEventsForDay={getEventsForDay}
        handleEventClick={handleEventClick}
        handleDateClick={handleDateClick}
        userTimezone="UTC"
      />
    );

    // Check if events are rendered
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  it('calls handleEventClick when an event is clicked', () => {
    render(
      <MonthView
        currentDate={currentDate}
        daysInMonth={daysInMonth}
        getEventsForDay={getEventsForDay}
        handleEventClick={handleEventClick}
        handleDateClick={handleDateClick}
        userTimezone="UTC"
      />
    );

    // Find and click on an event
    const event = screen.getByText('Test Event 1');
    fireEvent.click(event);

    // Check if the handler was called with the correct event
    expect(handleEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('calls handleDateClick when a day is clicked', () => {
    render(
      <MonthView
        currentDate={currentDate}
        daysInMonth={daysInMonth}
        getEventsForDay={getEventsForDay}
        handleEventClick={handleEventClick}
        handleDateClick={handleDateClick}
        userTimezone="UTC"
      />
    );

    // Find and click on a day cell (we're looking for the number 15)
    const dayCell = screen.getByText('15').closest('[role="button"]');
    if (dayCell) {
      fireEvent.click(dayCell);
    }

    // The handler should have been called with a date object
    expect(handleDateClick).toHaveBeenCalled();
  });

  it('supports keyboard navigation', () => {
    render(
      <MonthView
        currentDate={currentDate}
        daysInMonth={daysInMonth}
        getEventsForDay={getEventsForDay}
        handleEventClick={handleEventClick}
        handleDateClick={handleDateClick}
        userTimezone="UTC"
      />
    );

    // Find a day cell and trigger keyboard events
    const dayCell = screen.getByText('15').closest('[role="button"]');
    if (dayCell) {
      // Test Enter key
      fireEvent.keyDown(dayCell, { key: 'Enter' });
      expect(handleDateClick).toHaveBeenCalled();
      
      // Reset mock
      handleDateClick.mockClear();
      
      // Test Space key
      fireEvent.keyDown(dayCell, { key: ' ' });
      expect(handleDateClick).toHaveBeenCalled();
    }

    // Find an event and trigger keyboard events
    const event = screen.getByText('Test Event 1');
    
    // Test Enter key on event
    fireEvent.keyDown(event, { key: 'Enter' });
    expect(handleEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });
}); 