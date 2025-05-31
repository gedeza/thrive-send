# Content Calendar Component Documentation

## Overview

The Content Calendar is a complex, feature-rich component that allows users to schedule, manage, and track various types of content including social media posts, emails, blog posts, and articles. It provides an interactive calendar interface with multiple views (month, week, day, list) and supports drag-and-drop rescheduling of content.

## Architecture

The Content Calendar is built using a modular architecture with several key components:

1. **Content Calendar (`content-calendar.tsx`)**: The main container component that handles state management, data fetching, and event handling.
2. **Event Form (`EventForm.tsx`)**: Form component for creating and editing calendar events.
3. **Event Details (`EventDetails.tsx`)**: Component for displaying detailed information about a calendar event.
4. **View Components**:
   - **Month View (`MonthView.tsx`)**: Displays events in a traditional calendar grid.
   - Week View: Shows events in a weekly timeline.
   - Day View: Shows events for a specific day with time slots.
   - List View: Displays events in a chronological list.

## Data Models

### `CalendarEvent` Interface

The primary data model representing a content event:

```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  date: string;
  time?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  socialMediaContent: SocialMediaContent;
  analytics?: {
    views?: number;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    clicks?: number;
    lastUpdated?: string;
  };
  preview?: {
    thumbnail?: string;
    platformPreviews?: {
      [key in SocialPlatform]?: {
        previewUrl?: string;
        status?: 'pending' | 'approved' | 'rejected';
        rejectionReason?: string;
      };
    };
  };
  organizationId: string;
  createdBy: string;
  tags?: string[];
}
```

### Content Types

Events can be of different content types:

```typescript
export type ContentType = 'social' | 'blog' | 'email' | 'custom' | 'article';
```

### Social Media Content

For social media content, additional data is stored:

```typescript
export interface SocialMediaContent {
  platforms: SocialPlatform[];
  mediaUrls: string[];
  crossPost: boolean;
  platformSpecificContent: {
    [key in SocialPlatform]?: {
      text: string;
      mediaUrls: string[];
      scheduledTime?: string;
    };
  };
}

export type SocialPlatform = 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN';
```

## Features

### Core Features

1. **Multiple Views**: Month, week, day, and list views
2. **Content Management**: Create, edit, delete, and view detailed information about content
3. **Filtering**: Filter content by type, status, or search terms
4. **Drag and Drop**: Reschedule content by dragging it to a new date/time
5. **Social Media Preview**: Preview how content will appear on different social platforms
6. **Analytics**: View engagement metrics for published content
7. **Responsive Design**: Works across desktop and mobile devices

### Accessibility Features

The calendar includes several accessibility enhancements:

- ARIA attributes for interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly text alternatives
- High contrast visual indicators

## Performance Optimizations

Several techniques are used to optimize performance:

1. **Memoization**: Computationally expensive operations are memoized using `useMemo` and `useCallback`
2. **Lazy Loading**: Views are loaded only when needed using `React.lazy` and `Suspense`
3. **Virtualization**: For large datasets, only visible elements are rendered
4. **Debouncing**: Search input is debounced to prevent excessive filtering
5. **Component Memoization**: Pure components are wrapped with `React.memo` to prevent unnecessary re-renders

## Usage Example

```tsx
import { ContentCalendar } from "@/components/content/content-calendar";

// Example event data
const events = [
  {
    id: "1",
    title: "Welcome Email",
    description: "Send welcome email to new subscribers",
    type: "email",
    status: "scheduled",
    date: "2023-09-15",
    time: "09:00",
    socialMediaContent: {
      platforms: [],
      mediaUrls: [],
      crossPost: false,
      platformSpecificContent: {}
    },
    organizationId: "org-123",
    createdBy: "user-456"
  },
  // More events...
];

// Event handlers
const handleEventCreate = async (event) => {
  // API call to create event
  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    body: JSON.stringify(event)
  });
  return await response.json();
};

const handleEventUpdate = async (event) => {
  // API call to update event
  const response = await fetch(`/api/calendar/events/${event.id}`, {
    method: 'PUT',
    body: JSON.stringify(event)
  });
  return await response.json();
};

const handleEventDelete = async (eventId) => {
  // API call to delete event
  await fetch(`/api/calendar/events/${eventId}`, {
    method: 'DELETE'
  });
  return true;
};

// Fetch events from API
const fetchEvents = async () => {
  const response = await fetch('/api/calendar/events');
  const data = await response.json();
  return data.events;
};

// Component implementation
function CalendarPage() {
  return (
    <ContentCalendar
      events={events}
      onEventCreate={handleEventCreate}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      fetchEvents={fetchEvents}
      defaultView="month"
    />
  );
}
```

## Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `events` | `CalendarEvent[]` | Array of calendar events to display |
| `onEventCreate` | `(event: Omit<CalendarEvent, "id">) => Promise<CalendarEvent>` | Handler for creating new events |
| `onEventUpdate` | `(event: CalendarEvent) => Promise<CalendarEvent>` | Handler for updating existing events |
| `onEventDelete` | `(eventId: string) => Promise<boolean>` | Handler for deleting events |
| `onDateSelect` | `(day: string) => void` | Handler for date selection |
| `fetchEvents` | `() => Promise<CalendarEvent[]>` | Function to fetch events from API |
| `defaultView` | `CalendarView` | Initial view mode (month, week, day, list) |
| `onViewChange` | `(view: CalendarView) => void` | Handler for view mode changes |
| `onSyncClick` | `() => void` | Handler for sync button click |
| `onSettingsClick` | `() => void` | Handler for settings button click |

## Troubleshooting

### Common Issues

1. **Event not showing on calendar**: Ensure the event has a valid `date` property in the format "YYYY-MM-DD".
2. **Drag and drop not working**: Check if the `onEventUpdate` prop is provided and correctly implemented.
3. **Time display issues**: The calendar uses the user's timezone, make sure `userTimezone` is correctly set.

### Error Handling

The calendar component includes comprehensive error handling:

- API failures are caught and displayed with toast notifications
- Network errors trigger a fallback direct fetch mechanism
- Validation errors in forms provide detailed feedback
- Failed operations can be retried

## Future Improvements

1. **Recurring Events**: Support for recurring content schedules
2. **Calendar Integration**: Integration with external calendars (Google, Outlook)
3. **Team Collaboration**: Features for team members to collaborate on content
4. **Advanced Analytics**: More detailed performance metrics and insights
5. **Content Categories**: Better organization with categories and tags
6. **Bulk Operations**: Actions on multiple events simultaneously

## Contributing

When contributing to the Content Calendar component:

1. Follow the established code patterns and organization
2. Update documentation for any new features or changes
3. Add appropriate accessibility attributes
4. Ensure all components are properly memoized
5. Write tests for new functionality
6. Consider performance implications of any changes 