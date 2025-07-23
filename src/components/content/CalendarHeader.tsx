'use client';

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Bug, CheckSquare, Square, Users, Trash2, Download, Calendar as CalendarIconLucide } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { addMonths, subMonths } from "date-fns";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { CalendarView, CalendarEvent } from './types';
import { exportCalendar, ExportFormat } from '@/lib/utils/calendar-export';

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
  
  // Bulk selection
  isSelectionMode?: boolean;
  selectedCount?: number;
  onToggleSelection?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  
  // Export functionality
  events?: CalendarEvent[];
  selectedEvents?: CalendarEvent[];
  
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
  isSelectionMode = false,
  selectedCount = 0,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  events = [],
  selectedEvents = [],
  loading = false
}: CalendarHeaderProps) {
  
  // Export handlers
  const handleExport = (format: ExportFormat) => {
    const eventsToExport = isSelectionMode && selectedEvents.length > 0 ? selectedEvents : events;
    
    if (eventsToExport.length === 0) {
      return;
    }
    
    try {
      exportCalendar({
        format,
        events: eventsToExport,
        userTimezone,
        filename: `thrive-send-calendar-${formatInTimeZone(new Date(), userTimezone, 'yyyy-MM-dd')}.ics`,
        calendarName: `Thrive Send Calendar - ${formatInTimeZone(currentDate, userTimezone, 'MMMM yyyy')}`
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  return (
    <div className="space-y-4">
      {/* Calendar Navigation and Controls - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={view}
            value={view} 
            onValueChange={(value) => {
              const newView = value as CalendarView;
              onViewChange(newView);
            }}
            className="w-full sm:w-[280px]"
          >
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 h-10 sm:h-9">
              {['month', 'week', 'day', 'list'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all duration-200 touch-manipulation text-sm"
                >
                  <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <span className="sm:hidden">{tab.charAt(0).toUpperCase()}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button 
            onClick={onAddEvent}
            size="sm"
            disabled={loading}
            className="touch-manipulation"
          >
            <Plus className="h-4 w-4 mr-2" /> 
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </Button>
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                disabled={loading || events.length === 0}
                className="touch-manipulation"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExport('ical')}>
                <CalendarIconLucide className="h-4 w-4 mr-2" />
                Download .ics file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('google')}>
                <span className="text-[#4285F4] mr-2">📅</span>
                Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('outlook')}>
                <span className="text-[#0078D4] mr-2">📧</span>
                Outlook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('office365')}>
                <span className="text-[#0078D4] mr-2">🏢</span>
                Office 365
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('yahoo')}>
                <span className="text-[#7B0099] mr-2">📮</span>
                Yahoo Calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {onToggleSelection && (
            <Button 
              onClick={onToggleSelection}
              size="sm"
              variant={isSelectionMode ? "default" : "outline"}
              disabled={loading}
              className="touch-manipulation"
            >
              {isSelectionMode ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
              <span className="hidden sm:inline">Select</span>
              <span className="sm:hidden">Select</span>
            </Button>
          )}
          {onDebugFetch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDebugFetch}
              disabled={loading}
              className="touch-manipulation"
            >
              <Bug className="h-4 w-4 mr-2" /> 
              <span className="hidden sm:inline">Debug</span>
              <span className="sm:hidden">Debug</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Navigation - Responsive */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
        {/* Mobile: Stacked filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 sm:h-9 bg-background/60 border-0 focus:bg-background transition-colors touch-manipulation"
              aria-label="Search events"
              disabled={loading}
            />
            <Search className="h-4 w-4 absolute left-3 top-3 sm:top-2.5 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Select value={selectedType} onValueChange={onTypeChange} disabled={loading}>
              <SelectTrigger className="flex-1 sm:w-[120px] h-10 sm:h-9 bg-background/60 border-0 focus:bg-background transition-colors touch-manipulation" aria-label="Filter by content type">
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
              <SelectTrigger className="flex-1 sm:w-[130px] h-10 sm:h-9 bg-background/60 border-0 focus:bg-background transition-colors touch-manipulation" aria-label="Filter by status">
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
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onDatePrev}
              className="h-10 w-10 sm:h-9 sm:w-9 border-0 bg-background/60 hover:bg-background transition-colors touch-manipulation"
              aria-label="Previous month"
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onDateNext}
              className="h-10 w-10 sm:h-9 sm:w-9 border-0 bg-background/60 hover:bg-background transition-colors touch-manipulation"
              aria-label="Next month"
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onDateToday}
              className="h-10 sm:h-9 border-0 bg-background/60 hover:bg-background transition-colors touch-manipulation"
              aria-label="Go to today"
              disabled={loading}
            >
              Today
            </Button>
          </div>
          <div className="text-sm font-medium text-foreground/70 ml-2 hidden sm:block" aria-live="polite" role="status">
            {formatInTimeZone(currentDate, userTimezone, "MMMM yyyy")}
          </div>
          <div className="text-xs font-medium text-foreground/70 sm:hidden" aria-live="polite" role="status">
            {formatInTimeZone(currentDate, userTimezone, "MMM yyyy")}
          </div>
        </div>
      </div>
      
      {/* Bulk Actions Bar - Only shown when in selection mode */}
      {isSelectionMode && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {selectedCount} event{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCount > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Selected
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleExport('ical')}>
                    <CalendarIconLucide className="h-3 w-3 mr-2" />
                    .ics file
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('google')}>
                    📅 Google
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('outlook')}>
                    📧 Outlook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {onSelectAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="h-8 text-xs"
              >
                Select All
              </Button>
            )}
            {onClearSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}