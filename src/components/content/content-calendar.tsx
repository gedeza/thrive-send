"use client";

import * as React from "react";
import { useState, useEffect } from "react";

export interface ContentCalendarProps {
  days?: string[];  // ISO date strings
  onDateSelect?: (day: string) => void;
  fetchCalendarData?: () => Promise<string[]>;
}

const defaultDays = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d.toISOString().slice(0, 10);
});

export function ContentCalendar({
  days: initialDays = defaultDays,
  onDateSelect,
  fetchCalendarData
}: ContentCalendarProps) {
  const [days, setDays] = useState<string[]>(initialDays);
  const [loading, setLoading] = useState<boolean>(!!fetchCalendarData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchCalendarData) {
      setLoading(true);
      setError(null);
      
      fetchCalendarData()
        .then(data => {
          setDays(data);
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to load calendar data");
          setLoading(false);
          console.error("Calendar fetch error:", err);
        });
    }
  }, [fetchCalendarData]);

  if (loading) {
    return <div data-testid="content-calendar-loading" className="p-4 text-center">Loading calendar...</div>;
  }

  if (error) {
    return <div data-testid="content-calendar-error" className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div 
      data-testid="content-calendar" 
      className="grid grid-cols-7 gap-2"
    >
      {days.map((day) => (
        <button
          key={day}
          data-testid={`calendar-day-${day}`}
          onClick={() => onDateSelect?.(day)}
          className="p-2 border rounded-md hover:bg-muted/50 text-center"
        >
          {new Date(day).getDate()}
        </button>
      ))}
    </div>
  );
}
