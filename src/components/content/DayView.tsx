'use client';

import React, { useMemo } from 'react';
import { format, setHours, addMinutes, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useTimezone } from '@/hooks/use-timezone';
import { CalendarEvent, ContentType, SocialPlatform } from '@/types/calendar';
import { DEFAULT_DURATIONS } from './content-calendar';

// Constants
const DAY_VIEW_SLOT_HEIGHT = 60; // pixels per hour
const DAY_VIEW_EVENT_MIN_HEIGHT = 40; // minimum height for events in pixels

// Remove the duplicate DEFAULT_DURATIONS definition (lines 16-22)
// The constant is already imported from './content-calendar'

// Color mappings for event types
const eventTypeColorMap: Record<ContentType, { bg: string; text: string; border: string }> = {
  social: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-900 dark:text-blue-100",
    border: "border-blue-200 dark:border-blue-800"
  },
  blog: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-900 dark:text-green-100",
    border: "border-green-200 dark:border-green-800"
  },
  email: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-900 dark:text-purple-100",
    border: "border-purple-200 dark:border-purple-800"
  },
  custom: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-900 dark:text-orange-100",
    border: "border-orange-200 dark:border-orange-800"
  },
  article: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-900 dark:text-indigo-100",
    border: "border-indigo-200 dark:border-indigo-800"
  }
};

// Platform color mappings
const platformColorMap: Record<SocialPlatform, { icon: string; color: string }> = {
  facebook: { icon: "📘", color: "text-blue-600" },
  twitter: { icon: "🐦", color: "text-sky-500" },
  instagram: { icon: "📷", color: "text-pink-600" },
  linkedin: { icon: "💼", color: "text-blue-700" },
  youtube: { icon: "📺", color: "text-red-600" },
  tiktok: { icon: "🎵", color: "text-black" },
  pinterest: { icon: "📌", color: "text-red-500" }
};

// Drop data interface
interface DropData {
  date: string;
  time?: string;
}

// Utility functions
function groupEventsByHour(events: CalendarEvent[]): { [key: number]: CalendarEvent[] } {
  const grouped: { [key: number]: CalendarEvent[] } = {};
  events.forEach(event => {
    if (!event.time) return;
    const [hours] = event.time.split(':').map(Number);
    if (!grouped[hours]) {
      grouped[hours] = [];
    }
    grouped[hours].push(event);
  });
  return grouped;
}

function isValidContentType(type: any): type is ContentType {
  return ['social', 'blog', 'email', 'custom', 'article'].includes(type);
}

// DayViewTimeSlot component
const DayViewTimeSlot = ({ 
  hour, 
  date, 
  events, 
  onEventClick,
  userTimezone 
}: { 
  hour: number; 
  date: Date; 
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  userTimezone: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-time-${formatInTimeZone(date, userTimezone, 'yyyy-MM-dd')}-${hour}`,
    data: {
      date: formatInTimeZone(date, userTimezone, 'yyyy-MM-dd'),
      time: `${hour.toString().padStart(2, '0')}:00`
    } as DropData
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 min-h-[50px] sm:min-h-[60px] touch-manipulation",
        isOver && "bg-muted/80"
      )}
    >
      {/* Time column */}
      <div className="hidden sm:block p-2 text-sm text-muted-foreground border-r">
        {formatInTimeZone(setHours(date, hour), userTimezone, "h:mm a")}
      </div>

      {/* Events column - mobile takes full width */}
      <div className="relative p-1 sm:p-2">
        {events.map((event: CalendarEvent) => {
          const [hours, minutes] = event.time?.split(':').map(Number) || [0, 0];
          const duration = event.duration || DEFAULT_DURATIONS[event.type] || 60;
          const height = Math.max(
            (duration / 60) * DAY_VIEW_SLOT_HEIGHT,
            DAY_VIEW_EVENT_MIN_HEIGHT
          );

          return (
            <div
              key={event.id}
              className={cn(
                "absolute left-1 sm:left-2 right-1 sm:right-2 p-1.5 sm:p-2 rounded-md text-sm cursor-pointer hover:opacity-80 transition-opacity touch-manipulation",
                isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100 dark:bg-gray-700/30",
                isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-foreground",
                "shadow-sm min-h-[36px] sm:min-h-[40px]"
              )}
              style={{
                top: `${(minutes / 60) * DAY_VIEW_SLOT_HEIGHT}px`,
                height: `${height}px`,
                zIndex: 1
              }}
              onClick={() => onEventClick(event)}
              onMouseEnter={(e) => onEventHover?.(event, e)}
              onMouseLeave={onEventHoverEnd}
              onFocus={(e) => onEventHover?.(event, e as any)}
              onBlur={onEventHoverEnd}
            >
              <div className="flex items-start justify-between h-full">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">{event.title}</div>
                  {/* Show time on mobile since time column is hidden */}
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="sm:hidden">{event.time?.substring(0, 5)}</span>
                    <span className="hidden sm:inline">
                      {event.time?.substring(0, 5)} - {formatInTimeZone(
                        addMinutes(
                          parseISO(`${event.date}T${event.time}`),
                          duration
                        ),
                        userTimezone,
                        "h:mm a"
                      )}
                    </span>
                  </div>
                </div>
                {event.type === 'social' && event.socialMediaContent?.platforms?.length > 0 && (
                  <div className="flex gap-1 ml-2">
                    {event.socialMediaContent.platforms.map((platform: SocialPlatform) => (
                      <span key={platform} className="text-[10px]">
                        {platformColorMap[platform]?.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main DayView component
export interface DayViewProps {
  date: Date;
  getEventsForDay: (day: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  userTimezone: string;
  onEventHover?: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventHoverEnd?: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  date,
  getEventsForDay,
  onEventClick,
  userTimezone,
  onEventHover,
  onEventHoverEnd
}) => {
  const eventsByHour = useMemo(() => {
    return groupEventsByHour(getEventsForDay(date));
  }, [date, getEventsForDay]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-0 border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-2 sm:p-4 border-b">
        <h3 className="font-semibold text-base sm:text-lg">
          <span className="hidden sm:inline">{formatInTimeZone(date, userTimezone, "EEEE, MMMM d, yyyy")}</span>
          <span className="sm:hidden">{formatInTimeZone(date, userTimezone, "EEE, MMM d")}</span>
        </h3>
      </div>
      
      <div className="max-h-[500px] sm:max-h-[600px] overflow-y-auto touch-pan-y">
        {hours.filter(hour => {
          // Show hours with events or business hours (9-17)
          return eventsByHour[hour]?.length > 0 || (hour >= 9 && hour <= 17);
        }).map(hour => (
          <div key={hour} className="border-b last:border-b-0">
            <DayViewTimeSlot
              hour={hour}
              date={date}
              events={eventsByHour[hour] || []}
              onEventClick={onEventClick}
              userTimezone={userTimezone}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;