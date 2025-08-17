'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Calendar,
  Users,
  BarChart3,
  Tag,
  Settings
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import type { Audience } from '@/hooks/use-audience-data';

export interface AdvancedFilterState {
  search: string;
  types: string[];
  statuses: string[];
  tags: string[];
  sizeRange: [number, number];
  dateRange?: DateRange;
  engagementRange: [number, number];
  segmentCountRange: [number, number];
  hasAnalytics: boolean | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  audiences: Audience[];
  filters: AdvancedFilterState;
  onFiltersChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
}

const DEFAULT_FILTERS: AdvancedFilterState = {
  search: '',
  types: [],
  statuses: [],
  tags: [],
  sizeRange: [0, 100000],
  engagementRange: [0, 100],
  segmentCountRange: [0, 50],
  hasAnalytics: null,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export default function AdvancedFilters({
  audiences,
  filters,
  onFiltersChange,
  onReset
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate available filter options from audiences
  const filterOptions = useMemo(() => {
    const types = Array.from(new Set(audiences.map(a => a.type)));
    const statuses = Array.from(new Set(audiences.map(a => a.status)));
    const allTags = Array.from(new Set(audiences.flatMap(a => a.tags)));
    
    const sizes = audiences.map(a => a.size);
    const maxSize = Math.max(...sizes, 100000);
    const minSize = Math.min(...sizes, 0);
    
    const engagements = audiences
      .map(a => a.analytics?.avgEngagementRate || 0)
      .filter(e => e > 0);
    const maxEngagement = Math.max(...engagements, 100);
    
    const segmentCounts = audiences.map(a => a.segments.length);
    const maxSegments = Math.max(...segmentCounts, 50);

    return {
      types,
      statuses,
      tags: allTags.slice(0, 20), // Limit to most common tags
      sizeRange: [minSize, maxSize],
      engagementRange: [0, maxEngagement],
      segmentRange: [0, maxSegments]
    };
  }, [audiences]);

  // Count active filters
  React.useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.types.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.sizeRange[0] > filterOptions.sizeRange[0] || filters.sizeRange[1] < filterOptions.sizeRange[1]) count++;
    if (filters.dateRange) count++;
    if (filters.engagementRange[0] > 0 || filters.engagementRange[1] < 100) count++;
    if (filters.segmentCountRange[0] > 0 || filters.segmentCountRange[1] < filterOptions.segmentRange[1]) count++;
    if (filters.hasAnalytics !== null) count++;
    setActiveFiltersCount(count);
  }, [filters, filterOptions]);

  const updateFilter = useCallback((key: keyof AdvancedFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback((key: 'types' | 'statuses' | 'tags', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  }, [filters, updateFilter]);

  const resetFilters = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
    onReset();
  }, [onFiltersChange, onReset]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Search - Always visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audiences by name, description, or tags..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.types.map(type => (
            <Badge
              key={type}
              variant={filters.types.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleArrayFilter('types', type)}
            >
              {type}
            </Badge>
          ))}
          {filterOptions.statuses.map(status => (
            <Badge
              key={status}
              variant={filters.statuses.includes(status) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleArrayFilter('statuses', status)}
            >
              {status}
            </Badge>
          ))}
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Size Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Audience Size
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={filters.sizeRange}
                    onValueChange={(value) => updateFilter('sizeRange', value as [number, number])}
                    max={filterOptions.sizeRange[1]}
                    min={filterOptions.sizeRange[0]}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.sizeRange[0].toLocaleString()}</span>
                    <span>{filters.sizeRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created Date
                </Label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(range) => updateFilter('dateRange', range)}
                />
              </div>

              {/* Engagement Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Engagement Rate (%)
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={filters.engagementRange}
                    onValueChange={(value) => updateFilter('engagementRange', value as [number, number])}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.engagementRange[0]}%</span>
                    <span>{filters.engagementRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Segment Count */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Segment Count</Label>
                <div className="space-y-2">
                  <Slider
                    value={filters.segmentCountRange}
                    onValueChange={(value) => updateFilter('segmentCountRange', value as [number, number])}
                    max={filterOptions.segmentRange[1]}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.segmentCountRange[0]}</span>
                    <span>{filters.segmentCountRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Has Analytics */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Analytics Data</Label>
                <Select 
                  value={filters.hasAnalytics === null ? 'all' : filters.hasAnalytics.toString()}
                  onValueChange={(value) => updateFilter('hasAnalytics', 
                    value === 'all' ? null : value === 'true'
                  )}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    <SelectItem value="true">With Analytics</SelectItem>
                    <SelectItem value="false">Without Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Sort By
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilter('sortBy', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="lastUpdated">Last Updated</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="engagementRate">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={filters.sortOrder}
                    onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">↑</SelectItem>
                      <SelectItem value="desc">↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tags */}
            {filterOptions.tags.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter('tags', tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset All Filters
                  </Button>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export { DEFAULT_FILTERS };