import * as React from 'react';
import { useMemo } from 'react';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, setHours } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { CalendarEvent, ContentType, SocialPlatform } from './types';

// Constants
const START_HOUR = 6;
const HOURS_TO_SHOW = 16;
const WEEK_VIEW_SLOT_HEIGHT = 80; // pixels per hour
const WEEK_VIEW_EVENT_MIN_HEIGHT = 20; // minimum height for events in pixels

// Color mappings for event types
const eventTypeColorMap: Record<ContentType, { bg: string; text: string; border: string }> = {
  email: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800"
  },
  social: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800"
  },
  blog: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800"
  },
  custom: {
    bg: "bg-gray-100 dark:bg-gray-700/30",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-600"
  },
  article: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800"
  }
};

const platformColorMap: Record<SocialPlatform, { bg: string; text: string; icon: React.ReactNode }> = {
  FACEBOOK: {
    bg: "bg-[#1877F2]/10",
    text: "text-[#1877F2]",
    icon: <span className="h-3 w-3">📘</span>
  },
  TWITTER: {
    bg: "bg-[#1DA1F2]/10",
    text: "text-[#1DA1F2]",
    icon: <span className="h-3 w-3">🐦</span>
  },
  INSTAGRAM: {
    bg: "bg-[#E4405F]/10",
    text: "text-[#E4405F]",
    icon: <span className="h-3 w-3">📷</span>
  },
  LINKEDIN: {
    bg: "bg-[#0A66C2]/10",
    text: "text-[#0A66C2]",
    icon: <span className="h-3 w-3">💼</span>
  }
};

interface DropData {
  date: string;
  time?: string;
}

// Helper function to group events by hour
const groupEventsByHour = (events: CalendarEvent[]) => {
  return events.reduce((acc, event) => {
    const hour = new Date(event.date + 'T' + (event.time || '09:00')).getHours();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(event);
    return acc;
  }, {} as Record<number, CalendarEvent[]>);
};

// TimeSlot component for droppable areas
const WeekViewTimeSlot: React.FC<{
  day: Date;
  hour: number;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  userTimezone: string;
}> = ({ day, hour, events, onEventClick, userTimezone }) => {
  const dropId = `week-${day.toISOString().split('T')[0]}-${hour}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      date: day.toISOString().split('T')[0],
      time: `${hour.toString().padStart(2, '0')}:00`
    } as DropData
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-16 sm:h-20 border-b border-r p-0.5 sm:p-1 relative transition-colors touch-manipulation",
        isOver && "bg-primary/10"
      )}
    >
      {events.map((event, index) => {
        const typeColors = eventTypeColorMap[event.type] || eventTypeColorMap.custom;
        const platformColors = event.platform ? platformColorMap[event.platform] : null;
        
        return (
          <div
            key={`${event.id}-${index}`}
            onClick={() => onEventClick(event)}
            className={cn(
              "absolute left-0.5 sm:left-1 right-0.5 sm:right-1 rounded px-1 py-0.5 text-xs cursor-pointer transition-all hover:shadow-sm border touch-manipulation",
              typeColors.bg,
              typeColors.text,
              typeColors.border,
              "min-h-[18px] sm:min-h-[20px] flex items-center justify-between"
            )}
            style={{
              top: `${index * 20}px`,
              zIndex: 10 + index
            }}
          >
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {platformColors && (
                <span className={cn("flex-shrink-0", platformColors.text)}>
                  {platformColors.icon}
                </span>
              )}
              <span className="truncate text-[10px] sm:text-xs font-medium">
                {event.title}
              </span>
            </div>
            {event.time && (
              <span className="hidden sm:inline text-xs opacity-75 ml-1 flex-shrink-0">
                {event.time}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Main WeekView component
export interface WeekViewProps {
  currentDate: Date;
  getEventsForDay: (day: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  userTimezone: string;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  getEventsForDay,
  onEventClick,
  userTimezone
}) => {
  const { weekDays, hours } = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hourArray = Array.from({ length: HOURS_TO_SHOW }, (_, i) => i + START_HOUR);
    
    return {
      weekDays: days,
      hours: hourArray
    };
  }, [currentDate]);

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="grid grid-cols-8 divide-x divide-border text-xs sm:text-sm">
        {/* Time column */}
        <div className="text-center">
          <div className="h-10 sm:h-12 border-b bg-muted/50 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Time</span>
          </div>
          {hours.map((hour) => (
            <div key={hour} className="h-16 sm:h-20 border-b p-0.5 sm:p-1 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                <span className="hidden sm:inline">{formatInTimeZone(setHours(currentDate, hour), userTimezone, "h:mm a")}</span>
                <span className="sm:hidden">{formatInTimeZone(setHours(currentDate, hour), userTimezone, "h a")}</span>
              </span>
            </div>
          ))}
        </div>
        
        {/* Days of the week */}
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const eventsByHour = groupEventsByHour(dayEvents);
          const isToday = isSameDay(day, toZonedTime(new Date(), userTimezone));
          
          return (
            <div key={day.toISOString()} className="relative">
              {/* Day header */}
              <div className={cn(
                "h-10 sm:h-12 border-b p-1 sm:p-2 text-center",
                isToday && "bg-primary/5"
              )}>
                <div className="font-medium text-xs sm:text-sm">
                  <span className="hidden sm:inline">{formatInTimeZone(day, userTimezone, "EEE")}</span>
                  <span className="sm:hidden">{formatInTimeZone(day, userTimezone, "E")}</span>
                </div>
                <div className={cn(
                  "text-xs sm:text-sm",
                  isToday ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  <span className="hidden sm:inline">{formatInTimeZone(day, userTimezone, "MMM d")}</span>
                  <span className="sm:hidden">{formatInTimeZone(day, userTimezone, "d")}</span>
                </div>
              </div>
              
              {/* Hour cells with droppable areas */}
              <div className="relative">
                {hours.map((hour) => (
                  <WeekViewTimeSlot
                    key={hour}
                    day={day}
                    hour={hour}
                    events={eventsByHour[hour] || []}
                    onEventClick={onEventClick}
                    userTimezone={userTimezone}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;