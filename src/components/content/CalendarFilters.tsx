import * as React from 'react';

interface CalendarFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export function CalendarFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange
}: CalendarFiltersProps) {
  // This is a stub component to fix import errors
  // The actual implementation is in content-calendar.tsx
  return (
    <div>Calendar Filters Placeholder</div>
  );
} 