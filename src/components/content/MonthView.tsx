import * as React from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { isSameMonth, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarEvent, ContentType, SocialPlatform } from './types';

// Constants from content-calendar.tsx
const MAX_VISIBLE_EVENTS = 3;

const eventTypeColorMap: Record<ContentType, { bg: string; text: string }> = {
  email: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300"
  },
  social: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300"
  },
  blog: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300"
  },
  custom: {
    bg: "bg-gray-100 dark:bg-gray-700/30",
    text: "text-gray-700 dark:text-gray-300"
  },
  article: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300"
  }
};

const platformColorMap: Record<SocialPlatform, { bg: string; text: string; icon: React.ReactNode }> = {
  FACEBOOK: {
    bg: "bg-[#1877F2]/10",
    text: "text-[#1877F2]",
    icon: <span className="h-4 w-4">📘</span>
  },
  TWITTER: {
    bg: "bg-[#1DA1F2]/10",
    text: "text-[#1DA1F2]",
    icon: <span className="h-4 w-4">🐦</span>
  },
  INSTAGRAM: {
    bg: "bg-[#E4405F]/10",
    text: "text-[#E4405F]",
    icon: <span className="h-4 w-4">📷</span>
  },
  LINKEDIN: {
    bg: "bg-[#0A66C2]/10",
    text: "text-[#0A66C2]",
    icon: <span className="h-4 w-4">💼</span>
  }
};

interface DropData {
  date: string;
  time?: string;
}

interface MonthViewProps {
  currentDate: Date;
  daysInMonth: Date[];
  getEventsForDay: (day: Date) => CalendarEvent[];
  handleEventClick: (event: CalendarEvent) => void;
  handleDateClick: (day: Date) => void;
  userTimezone: string;
}

// Helper functions
const isValidContentType = (type: string): type is ContentType => {
  return ['email', 'social', 'blog', 'custom', 'article'].includes(type);
};

const groupEventsByType = (events: CalendarEvent[]) => {
  return events.reduce((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = [];
    }
    acc[event.type].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
};

// MonthViewDay component
const MonthViewDay = ({ 
  day, 
  events, 
  isCurrentMonth, 
  onEventClick, 
  onClick,
  userTimezone 
}: { 
  day: Date; 
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onClick: () => void;
  userTimezone: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'),
    data: {
      date: formatInTimeZone(day, userTimezone, 'yyyy-MM-dd')
    } as DropData
  });

  const isToday = isSameDay(day, toZonedTime(new Date(), userTimezone));
  const eventsByType = groupEventsByType(events);
  const hasMoreEvents = events.length > MAX_VISIBLE_EVENTS;
  const dateString = formatInTimeZone(day, userTimezone, 'EEEE, MMMM d, yyyy');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[120px] p-2 border rounded-md hover:bg-muted/50 transition-colors",
        isToday && "bg-primary/5",
        !isCurrentMonth && "opacity-50",
        isOver && "bg-muted/80",
        "flex flex-col h-full"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${dateString}${events.length > 0 ? `, ${events.length} ${events.length === 1 ? 'event' : 'events'}` : ', no events'}`}
    >
      {/* Day number */}
      <div className="flex justify-between items-center mb-1">
        <span className={cn(
          "text-sm font-medium",
          isToday && "text-primary font-bold"
        )}>
          {formatInTimeZone(day, userTimezone, "d")}
        </span>
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>

      {/* Events list */}
      <div className="space-y-1 flex-1 overflow-y-auto">
        {Object.entries(eventsByType).map(([type, typeEvents]) => (
          <div key={type} className="space-y-1">
            {(typeEvents as CalendarEvent[]).slice(0, MAX_VISIBLE_EVENTS).map((event: CalendarEvent) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={cn(
                  "text-xs p-1.5 px-2 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100 dark:bg-gray-700/30",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-foreground",
                  "flex items-center gap-1.5"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onEventClick(event);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${event.title}, ${event.type} event${event.time ? ` at ${event.time}` : ''}`}
              >
                {event.time && (
                  <span className="text-[10px] font-medium opacity-70 whitespace-nowrap">
                    {event.time.substring(0, 5)}
                  </span>
                )}
                {event.type === 'social' && event.socialMediaContent?.platforms?.length === 1 && (
                  <span className="text-[10px] flex-shrink-0" aria-hidden="true">
                    {platformColorMap[event.socialMediaContent.platforms[0] as SocialPlatform]?.icon}
                  </span>
                )}
                <span className="truncate flex-1">{event.title}</span>
              </div>
            ))}
          </div>
        ))}

        {/* More events button */}
        {hasMoreEvents && (
          <button
            className="text-xs text-primary hover:underline w-full text-left mt-1"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Show all events for', formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'), events);
            }}
            aria-label={`Show all ${events.length} events for ${dateString}`}
          >
            +{events.length - MAX_VISIBLE_EVENTS} more
          </button>
        )}
      </div>

      {/* Quick add button */}
      <button
        className="absolute bottom-1 right-1 p-1 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={`Add event on ${dateString}`}
      >
        <Plus className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

// Main MonthView component
export function MonthView({
  currentDate,
  daysInMonth,
  getEventsForDay,
  handleEventClick,
  handleDateClick,
  userTimezone
}: MonthViewProps) {
  return (
    <div className="p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium py-1 text-muted-foreground">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 auto-rows-fr" style={{ minHeight: "calc(50vh)" }}>
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={formatInTimeZone(day, userTimezone, "yyyy-MM-dd")}
              className={cn(
                "relative group h-full",
                !isCurrentMonth && "opacity-50"
              )}
            >
              <MonthViewDay
                day={day}
                events={dayEvents}
                isCurrentMonth={isCurrentMonth}
                onEventClick={handleEventClick}
                onClick={() => handleDateClick(day)}
                userTimezone={userTimezone}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}