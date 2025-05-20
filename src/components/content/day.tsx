import { format, isSameDay, isSameMonth } from "date-fns";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEvent, SocialPlatform } from "./content-calendar";
import { useDraggable } from "@dnd-kit/core";

interface DayProps {
  day: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onClick: () => void;
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

// Color mapping for event types
const eventTypeColorMap = {
  email: {
    bg: "bg-[var(--color-chart-blue)]/10",
    text: "text-[var(--color-chart-blue)]"
  },
  social: {
    bg: "bg-[var(--color-chart-green)]/10",
    text: "text-[var(--color-chart-green)]"
  },
  blog: {
    bg: "bg-[var(--color-chart-purple)]/10",
    text: "text-[var(--color-chart-purple)]"
  },
  other: {
    bg: "bg-[var(--color-chart-orange)]/10",
    text: "text-[var(--color-chart-orange)]"
  }
};

function DraggableEvent({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: event.id,
    data: {
      event,
      sourceDate: event.date
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "text-xs p-1.5 px-2 rounded-md truncate cursor-pointer flex items-center gap-1.5 transition-colors duration-200",
        event.type === "social" && event.socialMediaContent?.platforms?.length === 1
          ? platformColorMap[event.socialMediaContent.platforms[0]].bg
          : eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
        event.type === "social" && event.socialMediaContent?.platforms?.length === 1
          ? platformColorMap[event.socialMediaContent.platforms[0]].text
          : eventTypeColorMap[event.type]?.text || "text-foreground",
        "hover:opacity-80"
      )}
      title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {event.time && (
        <span className="text-[10px] font-medium opacity-70">
          {event.time.substring(0, 5)}
        </span>
      )}
      {event.type === "social" && event.socialMediaContent?.platforms?.length === 1 && (
        platformColorMap[event.socialMediaContent.platforms[0]].icon
      )}
      <span className="truncate">{event.title}</span>
      {event.type === "social" && event.socialMediaContent?.platforms?.length > 1 && (
        <div className="flex gap-1 mt-1">
          {event.socialMediaContent.platforms.map(platform => (
            <span
              key={platform}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                platformColorMap[platform].bg,
                platformColorMap[platform].text
              )}
            >
              {platform}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Day({ day, events, onEventClick, onClick }: DayProps) {
  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = isSameMonth(day, new Date());
  const dayStr = format(day, "yyyy-MM-dd");

  return (
    <div
      className={cn(
        "p-1 min-h-[100px] border border-muted rounded-sm transition-colors duration-200",
        isToday && "bg-[var(--color-chart-blue)]/5 border-[var(--color-chart-blue)]/30",
        !isCurrentMonth && "opacity-50",
        "hover:bg-muted/50 cursor-pointer"
      )}
      onClick={onClick}
      data-date={dayStr}
    >
      <div className="p-1 flex items-center justify-between">
        <span className={cn(
          "inline-flex items-center justify-center h-6 w-6 rounded-full text-sm transition-colors duration-200",
          isToday 
            ? "bg-[var(--color-chart-blue)] text-white font-medium" 
            : "text-muted-foreground hover:bg-muted"
        )}>
          {format(day, "d")}
        </span>
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>
      <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {events.map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
} 