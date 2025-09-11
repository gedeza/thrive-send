'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Repeat, X, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  RecurrencePattern,
  RecurrenceFrequency,
  COMMON_PATTERNS,
  CONTENT_TYPE_PATTERNS,
  getRecurrenceDescription,
  validateRecurrencePattern,
  generateRecurringEvents,
  generateSeriesId
} from '@/lib/utils/recurring-events';
import { ContentType } from './types';

interface RecurrenceSelectorProps {
  value?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern | null) => void;
  contentType?: ContentType;
  startDate: string; // ISO date string
  disabled?: boolean;
  showPreview?: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
] as const;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RecurrenceSelector({
  value,
  onChange,
  contentType,
  startDate,
  disabled = false,
  showPreview = true
}: RecurrenceSelectorProps) {
  const [isEnabled, setIsEnabled] = useState(!!value);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [pattern, setPattern] = useState<RecurrencePattern>(
    value || {
      frequency: 'weekly',
      interval: 1,
      endType: 'never'
    }
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Update pattern when value prop changes
  useEffect(() => {
    if (value) {
      setPattern(value);
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [value]);

  // Validate and update parent
  useEffect(() => {
    const validationErrors = validateRecurrencePattern(pattern);
    setErrors(validationErrors);
    
    if (isEnabled && validationErrors.length === 0) {
      onChange(pattern);
    } else if (!isEnabled) {
      onChange(null);
    }
  }, [pattern, isEnabled, onChange]);

  // Get suggested patterns for content type
  const getSuggestedPatterns = () => {
    if (!contentType) return [];
    const patterns = CONTENT_TYPE_PATTERNS[contentType] || [];
    return patterns.map(patternKey => ({
      key: patternKey,
      name: getPatternDisplayName(patternKey),
      pattern: { ...COMMON_PATTERNS[patternKey], endType: 'never' as const }
    }));
  };

  const getPatternDisplayName = (key: string): string => {
    const displayNames: Record<string, string> = {
      'daily': 'Every Day',
      'weekdays': 'Weekdays Only',
      'weekly': 'Weekly',
      'biweekly': 'Every 2 Weeks',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
      'social-daily': 'Daily (30 times)',
      'blog-weekly': 'Weekly Blog',
      'newsletter-monthly': 'Monthly Newsletter',
      'tip-tuesday': 'Tip Tuesday',
      'monthly-report': 'Monthly Report'
    };
    return displayNames[key] || key;
  };

  const handleToggleRecurrence = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onChange(null);
    }
  };

  const handleQuickPattern = (selectedPattern: Partial<RecurrencePattern>) => {
    setPattern(prev => ({ ...prev, ...selectedPattern }));
  };

  const updatePattern = (updates: Partial<RecurrencePattern>) => {
    setPattern(prev => ({ ...prev, ...updates }));
  };

  const handleDayOfWeekToggle = (day: number, checked: boolean) => {
    const currentDays = pattern.daysOfWeek || [];
    let newDays: number[];
    
    if (checked) {
      newDays = [...currentDays, day].sort();
    } else {
      newDays = currentDays.filter(d => d !== day);
    }
    
    updatePattern({ daysOfWeek: newDays });
  };

  // Generate preview dates
  const getPreviewDates = (): string[] => {
    if (!isEnabled || errors.length > 0) return [];
    
    try {
      const baseEvent = {
        title: 'Preview Event',
        description: '',
        type: contentType || 'custom',
        status: 'draft' as const,
        date: startDate
      };
      
      const result = generateRecurringEvents({
        baseEvent,
        pattern,
        seriesId: generateSeriesId(),
        maxOccurrences: 5
      });
      
      return result.events.map(event => event.date);
    } catch (_error) {
      return [];
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Recurring Event</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-recurrence"
              checked={isEnabled}
              onCheckedChange={handleToggleRecurrence}
            />
            <Label htmlFor="enable-recurrence" className="text-sm">
              Repeat this event
            </Label>
          </div>
        </div>
        {isEnabled && (
          <CardDescription className="text-xs">
            {getRecurrenceDescription(pattern)}
          </CardDescription>
        )}
      </CardHeader>

      {isEnabled && (
        <CardContent className="space-y-4">
          {/* Quick Patterns */}
          {getSuggestedPatterns().length > 0 && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Quick Templates for {contentType}
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {getSuggestedPatterns().map(({ key, name, pattern: quickPattern }) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPattern(quickPattern)}
                    className="text-xs h-7"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="frequency" className="text-xs">Repeat</Label>
              <Select 
                value={pattern.frequency} 
                onValueChange={(value: RecurrenceFrequency) => updatePattern({ frequency: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interval" className="text-xs">Every</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="99"
                value={pattern.interval}
                onChange={(e) => updatePattern({ interval: parseInt(e.target.value) || 1 })}
                className="h-8"
              />
            </div>
          </div>

          {/* Weekly - Days of Week */}
          {pattern.frequency === 'weekly' && (
            <div>
              <Label className="text-xs">Repeat on</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {DAY_NAMES_SHORT.map((day, index) => (
                  <Button
                    key={index}
                    variant={pattern.daysOfWeek?.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayOfWeekToggle(index, !pattern.daysOfWeek?.includes(index))}
                    className="h-8 w-10 text-xs p-0"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly - Day of Month */}
          {pattern.frequency === 'monthly' && (
            <div>
              <Label htmlFor="dayOfMonth" className="text-xs">Day of month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={pattern.dayOfMonth || ''}
                onChange={(e) => updatePattern({ dayOfMonth: parseInt(e.target.value) || undefined })}
                placeholder="Same day as start date"
                className="h-8"
              />
            </div>
          )}

          {/* Advanced Options */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 p-0 text-xs">
                <ChevronDown className={cn("h-3 w-3 mr-1 transition-transform", isAdvancedOpen && "rotate-180")} />
                Advanced Options
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Business Days Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="businessDays"
                  checked={pattern.businessDaysOnly || false}
                  onCheckedChange={(checked) => updatePattern({ businessDaysOnly: !!checked })}
                />
                <Label htmlFor="businessDays" className="text-xs">
                  Skip weekends
                </Label>
              </div>

              {/* End Condition */}
              <div>
                <Label className="text-xs">End</Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="never"
                      name="endType"
                      checked={pattern.endType === 'never'}
                      onChange={() => updatePattern({ endType: 'never' })}
                      className="h-3 w-3"
                    />
                    <Label htmlFor="never" className="text-xs">Never</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="after"
                      name="endType"
                      checked={pattern.endType === 'after'}
                      onChange={() => updatePattern({ endType: 'after' })}
                      className="h-3 w-3"
                    />
                    <Label htmlFor="after" className="text-xs">After</Label>
                    <Input
                      type="number"
                      min="1"
                      max="999"
                      value={pattern.endAfter || ''}
                      onChange={(e) => updatePattern({ endAfter: parseInt(e.target.value) || undefined })}
                      disabled={pattern.endType !== 'after'}
                      className="h-6 w-16 text-xs"
                      placeholder="10"
                    />
                    <span className="text-xs text-muted-foreground">occurrences</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="until"
                      name="endType"
                      checked={pattern.endType === 'until'}
                      onChange={() => updatePattern({ endType: 'until' })}
                      className="h-3 w-3"
                    />
                    <Label htmlFor="until" className="text-xs">Until</Label>
                    <Input
                      type="date"
                      value={pattern.endDate || ''}
                      onChange={(e) => updatePattern({ endDate: e.target.value })}
                      disabled={pattern.endType !== 'until'}
                      className="h-6 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {showPreview && errors.length === 0 && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Preview (next 5 occurrences)</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {getPreviewDates().map((date, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {format(parseISO(date), 'MMM d')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}