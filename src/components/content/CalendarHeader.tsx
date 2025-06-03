'use client';

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { addMonths, subMonths } from "date-fns";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { CalendarView } from './types';

interface CalendarHeaderProps {
  // View management
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  
  // Date navigation
  currentDate: Date;
  onDatePrev: () => void;
  onDateNext: () => void;
  onDateToday: () => void;
  userTimezone: string;
  
  // Search and filters
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  
  // Actions
  onAddEvent: () => void;
  onDebugFetch?: () => void;
  
  // Loading state
  loading?: boolean;
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onDatePrev,
  onDateNext,
  onDateToday,
  userTimezone,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  onAddEvent,
  onDebugFetch,
  loading = false
}: CalendarHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Calendar Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-chart-blue)]">
            Content Calendar
          </h1>
          <div className="h-6 w-px bg-border" />
          <Tabs 
            defaultValue={view}
            value={view} 
            onValueChange={(value) => {
              const newView = value as CalendarView;
              onViewChange(newView);
            }}
            className="w-[280px]"
          >
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
              {['month', 'week', 'day', 'list'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all duration-200"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onAddEvent}
            className="h-9"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
          {onDebugFetch && (
            <Button
              variant="outline"
              onClick={onDebugFetch}
              className="h-9"
              disabled={loading}
            >
              <Bug className="h-4 w-4 mr-2" /> Debug
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Navigation */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-background transition-colors"
              aria-label="Search events"
              disabled={loading}
            />
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" aria-hidden="true" />
          </div>

          <Select value={selectedType} onValueChange={onTypeChange} disabled={loading}>
            <SelectTrigger className="w-[120px] h-9 bg-background transition-colors" aria-label="Filter by content type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange} disabled={loading}>
            <SelectTrigger className="w-[130px] h-9 bg-background transition-colors" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onDatePrev}
            className="h-9 w-9 hover:bg-muted/80 transition-colors"
            aria-label="Previous month"
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onDateNext}
            className="h-9 w-9 hover:bg-muted/80 transition-colors"
            aria-label="Next month"
            disabled={loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={onDateToday}
            className="h-9 hover:bg-muted/80 transition-colors"
            aria-label="Go to today"
            disabled={loading}
          >
            Today
          </Button>
          <div className="text-sm font-medium text-muted-foreground" aria-live="polite" role="status">
            {formatInTimeZone(currentDate, userTimezone, "MMMM yyyy")}
          </div>
        </div>
      </div>
    </div>
  );
}