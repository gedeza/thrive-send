import * as React from 'react';
import { CalendarEvent } from './types';

interface ListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function ListView({
  events,
  onEventClick
}: ListViewProps) {
  // This is a stub component to fix import errors
  // The actual implementation is in content-calendar.tsx
  return (
    <div>List View Placeholder</div>
  );
} 