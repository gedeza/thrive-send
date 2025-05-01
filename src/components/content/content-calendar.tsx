"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  date: Date;
  status: "draft" | "scheduled" | "published";
  platform: string;
}

interface ContentCalendarProps {
  contentItems?: ContentItem[];
}

export function ContentCalendar({ contentItems = [] }: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() - 1);
      return date;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() + 1);
      return date;
    });
  };
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  // Get day names
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const getContentForDay = (date: Date) => {
    return contentItems.filter((item) => 
      new Date(item.date).toDateString() === date.toDateString()
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center font-medium text-sm p-2 border-b"
          >
            {day}
          </div>
        ))}
        
        {/* Fill in empty cells before the first day of the month */}
        {Array.from({ length: days[0].getDay() }).map((_, index) => (
          <div 
            key={`empty-start-${index}`} 
            className="aspect-square p-1 bg-muted/30 border border-border/50"
          />
        ))}
        
        {days.map((day) => {
          const dayContent = getContentForDay(day);
          return (
            <div
              key={day.toString()}
              className={cn(
                "aspect-square p-1 border border-border/50 overflow-hidden",
                !isSameMonth(day, currentMonth) && "bg-muted/30",
                isToday(day) && "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex flex-col h-full">
                <div className={cn(
                  "text-right text-xs p-1",
                  isToday(day) && "font-bold text-primary"
                )}>
                  {format(day, "d")}
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto text-xs">
                  {dayContent.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "px-1 py-0.5 rounded text-xs truncate",
                        item.status === "draft" && "bg-yellow-100 text-yellow-800",
                        item.status === "scheduled" && "bg-blue-100 text-blue-800",
                        item.status === "published" && "bg-green-100 text-green-800",
                      )}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Fill in empty cells after the last day of the month */}
        {Array.from({ length: 6 - days[days.length - 1].getDay() }).map((_, index) => (
          <div 
            key={`empty-end-${index}`} 
            className="aspect-square p-1 bg-muted/30 border border-border/50"
          />
        ))}
      </div>
    </div>
  );
}