import * as React from 'react';
import { CalendarView } from './types';

interface CalendarHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  currentDate: Date;
  onDatePrev: () => void;
  onDateNext: () => void;
  onDateToday: () => void;
  userTimezone: string;
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onDatePrev,
  onDateNext,
  onDateToday,
  userTimezone
}: CalendarHeaderProps) {
  // This is a stub component to fix import errors
  // The actual implementation is in content-calendar.tsx
  return (
    <div>Calendar Header Placeholder</div>
  );
} 