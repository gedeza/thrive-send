import { format, isSameDay, isSameMonth, parseISO } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import { Facebook, Twitter, Instagram, Linkedin, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEvent, SocialPlatform, eventTypeColorMap } from "./content-calendar";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useTimezone } from "@/hooks/use-timezone";

interface DayProps {
  day: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onClick: () => void;
}

const eventTypeIcons = {
  email: <Mail className="h-3 w-3" />,
  social: <Facebook className="h-3 w-3" />,
  blog: <FileText className="h-3 w-3" />,
  article: <FileText className="h-3 w-3" />
};

const platformIcons = {
  FACEBOOK: <Facebook className="h-3 w-3" />,
  TWITTER: <Twitter className="h-3 w-3" />,
  INSTAGRAM: <Instagram className="h-3 w-3" />,
  LINKEDIN: <Linkedin className="h-3 w-3" />
};

const platformColorMap = {
  FACEBOOK: {
    bg: "bg-[#1877F2]/10",
    text: "text-[#1877F2]",
    icon: <Facebook className="h-3 w-3" />
  },
  TWITTER: {
    bg: "bg-[#1DA1F2]/10",
    text: "text-[#1DA1F2]",
    icon: <Twitter className="h-3 w-3" />
  },
  INSTAGRAM: {
    bg: "bg-[#E4405F]/10",
    text: "text-[#E4405F]",
    icon: <Instagram className="h-3 w-3" />
  },
  LINKEDIN: {
    bg: "bg-[#0A66C2]/10",
    text: "text-[#0A66C2]",
    icon: <Linkedin className="h-3 w-3" />
  }
};

function DraggableEvent({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: {
      event,
      sourceDate: event.date
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 'auto'
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "text-xs p-1.5 px-2 rounded-md truncate cursor-move flex items-center gap-1.5 transition-colors duration-200",
        event.type === "social" && event.socialMediaContent?.platforms?.length === 1
          ? platformColorMap[event.socialMediaContent.platforms[0]].bg
          : eventTypeColorMap[event.type]?.bg || "bg-gray-100 dark:bg-gray-700/30",
        event.type === "social" && event.socialMediaContent?.platforms?.length === 1
          ? platformColorMap[event.socialMediaContent.platforms[0]].text
          : eventTypeColorMap[event.type]?.text || "text-foreground",
        "hover:opacity-80",
        isDragging && "opacity-50"
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
  const userTimezone = useTimezone();
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
    data: {
      date: format(day, 'yyyy-MM-dd')
    }
  });

  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = isSameMonth(day, new Date());

  const formatDate = (date: Date, format: string) => {
    try {
      return formatInTimeZone(date, userTimezone, format);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatEventTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      if (isNaN(dateTime.getTime())) {
        return time.substring(0, 5);
      }
      return formatInTimeZone(dateTime, userTimezone, "h:mm a");
    } catch (error) {
      console.error('Error formatting event time:', error);
      return time.substring(0, 5);
    }
  };

  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'email':
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case 'social':
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case 'blog':
        return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case 'article':
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[100px] p-2 border rounded-md",
        isToday && "bg-primary/5",
        !isCurrentMonth && "opacity-50",
        isOver && "drop-target"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={cn(
          "text-sm font-medium",
          isToday && "text-primary font-bold"
        )}>
          {formatDate(day, "d")}
        </span>
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            id={`event-${event.id}`}
            className={cn(
              "text-xs p-1.5 px-2 rounded-md truncate cursor-move",
              getEventTypeStyles(event.type),
              "hover:opacity-80"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            {event.time && (
              <span className="text-[10px] font-medium opacity-70">
                {event.time.substring(0, 5)}
              </span>
            )}
            <span className="truncate">{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 