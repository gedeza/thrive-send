import { useState } from "react";
import { CalendarEvent, ContentType, SocialPlatform, eventTypeColorMap } from "./content-calendar";
import { isSameDay, isSameMonth } from "date-fns";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { Plus, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

// Helper types
interface DropData {
  date: string;
  time?: string;
}

// Constants
const MAX_VISIBLE_EVENTS = 3; // Maximum number of events to show before "more" button

// Utility functions
function isValidContentType(type: any): type is ContentType {
  return ['social', 'blog', 'email', 'custom', 'article'].includes(type);
}

function groupEventsByType(events: CalendarEvent[]): { [key: string]: CalendarEvent[] } {
  const grouped: { [key: string]: CalendarEvent[] } = {};
  events.forEach(event => {
    if (!grouped[event.type]) {
      grouped[event.type] = [];
    }
    grouped[event.type].push(event);
  });
  return grouped;
}

// Platform-specific color mapping
const platformColorMap = {
  FACEBOOK: {
    bg: "bg-[#1877F2]/10",
    text: "text-[#1877F2]",
    icon: <Facebook className="h-4 w-4" />
  },
  TWITTER: {
    bg: "bg-[#1DA1F2]/10",
    text: "text-[#1DA1F2]",
    icon: <Twitter className="h-4 w-4" />
  },
  INSTAGRAM: {
    bg: "bg-[#E4405F]/10",
    text: "text-[#E4405F]",
    icon: <Instagram className="h-4 w-4" />
  },
  LINKEDIN: {
    bg: "bg-[#0A66C2]/10",
    text: "text-[#0A66C2]",
    icon: <Linkedin className="h-4 w-4" />
  }
};

// Day component for the month view
export function MonthViewDay({ 
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
}) {
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
                    {platformColorMap[event.socialMediaContent.platforms[0] as SocialPlatform].icon}
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
              // Show all events for this day
              const dayEvents = events;
              // You can implement a modal or expand the cell to show all events
              console.log('Show all events for', formatInTimeZone(day, userTimezone, 'yyyy-MM-dd'), dayEvents);
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
}

// Month view component
export function MonthView({
  currentDate,
  daysInMonth,
  getEventsForDay,
  handleEventClick,
  handleDateClick,
  userTimezone
}: {
  currentDate: Date;
  daysInMonth: Date[];
  getEventsForDay: (day: Date) => CalendarEvent[];
  handleEventClick: (event: CalendarEvent) => void;
  handleDateClick: (day: Date) => void;
  userTimezone: string;
}) {
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

      {/* Calendar grid - use min-height with aspect ratio */}
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