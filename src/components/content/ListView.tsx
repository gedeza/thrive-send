'use client';

import React, { useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { useTimezone } from '@/hooks/use-timezone';
import { CalendarEvent, ContentType, SocialPlatform } from '@/types/calendar';
import { Checkbox } from '@/components/ui/checkbox';

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

// Utility function
function isValidContentType(type: any): type is ContentType {
  return ['social', 'blog', 'email', 'custom', 'article'].includes(type);
}

// Main ListView component
export interface ListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  isSelectionMode?: boolean;
  selectedEvents?: Set<string>;
  onToggleSelection?: (eventId: string) => void;
  onEventHover?: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventHoverEnd?: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  events,
  onEventClick,
  isSelectionMode = false,
  selectedEvents = new Set(),
  onToggleSelection,
  onEventHover,
  onEventHoverEnd
}) => {
  const userTimezone = useTimezone();
  
  // Sort events by date and time
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Header row - responsive */}
      <div className={cn(
        "hidden md:grid gap-4 p-4 bg-muted/50 rounded-md font-medium text-sm",
        isSelectionMode ? "md:grid-cols-13" : "md:grid-cols-12"
      )}>
        {isSelectionMode && <div className="col-span-1"></div>}
        <div className="col-span-3">Title</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Date & Time</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Platforms</div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden flex justify-between p-4 bg-muted/50 rounded-md font-medium text-sm">
        <div>Content</div>
        <div>Details</div>
      </div>
      
      {/* Event list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto touch-pan-y">
        {sortedEvents.map((event) => (
          <div 
            key={event.id} 
            className={cn(
              "grid gap-4 p-3 sm:p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation",
              isSelectionMode ? "grid-cols-1 md:grid-cols-13" : "grid-cols-1 md:grid-cols-12"
            )}
            onClick={() => {
              if (isSelectionMode && onToggleSelection) {
                onToggleSelection(event.id);
              } else {
                onEventClick(event);
              }
            }}
            onMouseEnter={(e) => onEventHover?.(event, e)}
            onMouseLeave={onEventHoverEnd}
            onFocus={(e) => onEventHover?.(event, e as any)}
            onBlur={onEventHoverEnd}
          >
            {/* Checkbox column (desktop only) */}
            {isSelectionMode && (
              <div className="hidden md:block md:col-span-1 flex items-center justify-center">
                <Checkbox
                  checked={selectedEvents.has(event.id)}
                  onCheckedChange={() => onToggleSelection?.(event.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {/* Mobile view */}
            <div className="md:hidden space-y-2">
              <div className="flex items-start justify-between gap-2">
                {isSelectionMode && (
                  <Checkbox
                    checked={selectedEvents.has(event.id)}
                    onCheckedChange={() => onToggleSelection?.(event.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                )}
                <div className="font-medium flex-1">{event.title}</div>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {formatInTimeZone(new Date(`${event.date}T${event.time || '00:00'}`), userTimezone, "MMM d")}
                  {event.time && (
                    <div className="text-xs">
                      {formatInTimeZone(new Date(`${event.date}T${event.time}`), userTimezone, "h:mm a")}
                    </div>
                  )}
                </div>
              </div>
              {event.description && (
                <div className="text-sm text-muted-foreground line-clamp-2">{event.description}</div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100",
                  isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-gray-700"
                )}>
                  {event.type}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  event.status === 'draft' && "bg-yellow-100 text-yellow-800",
                  event.status === 'scheduled' && "bg-blue-100 text-blue-800",
                  event.status === 'sent' && "bg-green-100 text-green-800",
                  event.status === 'failed' && "bg-red-100 text-red-800"
                )}>
                  {event.status}
                </span>
                {/* Social platforms on mobile */}
                {event.type === 'social' && event.socialMediaContent?.platforms?.length > 0 && (
                  <div className="flex gap-1">
                    {event.socialMediaContent.platforms.map((platform: SocialPlatform) => (
                      <span key={platform} className="text-sm">
                        {platformColorMap[platform]?.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Desktop view */}
            <div className="hidden md:block md:col-span-3">
              <div className="font-medium truncate">{event.title}</div>
              {event.description && (
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {event.description}
                </div>
              )}
            </div>
            
            <div className="hidden md:block md:col-span-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100",
                isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-gray-700"
              )}>
                {event.type}
              </span>
            </div>
            
            {/* Date & Time column */}
            <div className="hidden md:block md:col-span-2">
              <div className="text-sm">
                {formatInTimeZone(new Date(`${event.date}T${event.time || '00:00'}`), userTimezone, "MMM d, yyyy")}
              </div>
              {event.time && (
                <div className="text-sm text-muted-foreground">
                  {formatInTimeZone(new Date(`${event.date}T${event.time}`), userTimezone, "h:mm a")}
                </div>
              )}
            </div>

            {/* Status column */}
            <div className="hidden md:block md:col-span-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                event.status === 'draft' && "bg-yellow-100 text-yellow-800",
                event.status === 'scheduled' && "bg-blue-100 text-blue-800",
                event.status === 'sent' && "bg-green-100 text-green-800",
                event.status === 'failed' && "bg-red-100 text-red-800"
              )}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            {/* Platforms column */}
            <div className="hidden md:block md:col-span-3">
              {event.type === 'social' && event.socialMediaContent?.platforms?.length > 0 ? (
                <div className="flex gap-2">
                  {event.socialMediaContent.platforms.map((platform: SocialPlatform) => (
                    <span key={platform} className="text-sm">
                      {platformColorMap[platform]?.icon}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg mb-2">📅</div>
            <div>No events found</div>
            <div className="text-sm mt-1">Create your first event to get started</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;