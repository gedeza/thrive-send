"use client";

import * as React from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const quickFilters = [
  { label: "Last 24 hours", value: "1d" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Custom range", value: "custom" },
];

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<string>("7d");

  const handleQuickFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    if (filter === "custom") {
      return; // Keep the current date range
    }

    const today = new Date();
    const days = parseInt(filter);
    
    onChange({
      from: startOfDay(subDays(today, days)),
      to: endOfDay(today),
    });
  };

  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      <div className="flex gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickFilterChange(filter.value)}
            className="flex-1 md:flex-none"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full md:w-[240px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={(range) => {
              onChange(range as DateRange);
              setSelectedFilter("custom");
            }}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 