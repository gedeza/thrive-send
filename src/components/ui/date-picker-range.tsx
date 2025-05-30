"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange, Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange) => void;
  disabled?: Matcher | Matcher[];
}

/**
 * Date picker component with range selection
 * 
 * Used for selecting a date range (from/to)
 */
export function DatePickerWithRange({
  className,
  date,
  setDate,
  disabled,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("inline-flex", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "min-w-[240px] justify-start text-left font-normal",
              "truncate whitespace-nowrap overflow-hidden",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          sideOffset={4}
          side="bottom"
          alignOffset={0}
          avoidCollisions={true}
          collisionPadding={10}
        >
          <div className="max-w-[90vw] overflow-x-auto">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(date) => setDate(date as DateRange)}
              numberOfMonths={window.innerWidth < 768 ? 1 : 2}
              disabled={disabled}
              className="rounded-md border"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}