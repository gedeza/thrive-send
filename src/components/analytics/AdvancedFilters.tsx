'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Filter, 
  X, 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  Target,
  Users,
  Globe,
  Smartphone,
  TrendingUp,
  MapPin,
  Clock,
  Tag,
  BarChart3,
  Zap,
  Save,
  Download,
  Share,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: unknown;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
}

export interface FilterGroup {
  id: string;
  name: string;
  conditions: FilterCondition[];
  logic: 'AND' | 'OR';
}

export interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterGroup[]) => void;
  savedFilters?: FilterGroup[];
  className?: string;
}

const FILTER_FIELDS = {
  // Basic Analytics Fields
  views: { label: 'Views', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  engagement_rate: { label: 'Engagement Rate', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  conversions: { label: 'Conversions', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  revenue: { label: 'Revenue', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  
  // Content Fields
  content_type: { 
    label: 'Content Type', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['Blog', 'Social', 'Email', 'Video', 'Infographic']
  },
  campaign_id: { 
    label: 'Campaign', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['Campaign 1', 'Campaign 2', 'Holiday Sale', 'Product Launch']
  },
  
  // Time Fields
  created_date: { label: 'Created Date', type: 'date', operators: ['=', '>', '<', 'between'] },
  published_date: { label: 'Published Date', type: 'date', operators: ['=', '>', '<', 'between'] },
  
  // Platform Fields
  platform: { 
    label: 'Platform', 
    type: 'multiselect', 
    operators: ['in', 'not_in'],
    options: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube']
  },
  
  // Audience Segmentation
  age_group: { 
    label: 'Age Group', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
  },
  gender: { 
    label: 'Gender', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
  },
  location: { 
    label: 'Location', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'JP', 'Other']
  },
  device_type: { 
    label: 'Device Type', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['Desktop', 'Mobile', 'Tablet']
  },
  
  // Advanced Fields
  bounce_rate: { label: 'Bounce Rate', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  session_duration: { label: 'Session Duration (min)', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  page_views: { label: 'Page Views', type: 'number', operators: ['>', '<', '=', '>=', '<=', 'between'] },
  referrer_type: { 
    label: 'Referrer Type', 
    type: 'select', 
    operators: ['=', '!=', 'in', 'not_in'],
    options: ['Direct', 'Search', 'Social', 'Email', 'Paid', 'Other']
  }
} as const;

const OPERATORS = {
  '=': 'Equals',
  '!=': 'Not Equals',
  '>': 'Greater Than',
  '<': 'Less Than',
  '>=': 'Greater Than or Equal',
  '<=': 'Less Than or Equal',
  'between': 'Between',
  'in': 'In',
  'not_in': 'Not In',
  'contains': 'Contains',
  'not_contains': 'Does Not Contain',
  'starts_with': 'Starts With',
  'ends_with': 'Ends With'
} as const;

export function AdvancedFilters({ onFiltersChange, savedFilters = [], className }: AdvancedFiltersProps) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      id: 'default',
      name: 'Default Filter',
      conditions: [],
      logic: 'AND'
    }
  ]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  // Preset filters for common use cases
  const presetFilters = [
    {
      id: 'high-engagement',
      name: 'High Engagement Content',
      description: 'Content with engagement rate > 5%',
      filters: [{
        id: 'preset-1',
        name: 'High Engagement',
        conditions: [{
          id: 'c1',
          field: 'engagement_rate',
          operator: '>',
          value: 5,
          type: 'number' as const
        }],
        logic: 'AND' as const
      }]
    },
    {
      id: 'mobile-users',
      name: 'Mobile Users',
      description: 'Analytics from mobile device users',
      filters: [{
        id: 'preset-2',
        name: 'Mobile Users',
        conditions: [{
          id: 'c2',
          field: 'device_type',
          operator: '=',
          value: 'Mobile',
          type: 'select' as const
        }],
        logic: 'AND' as const
      }]
    },
    {
      id: 'recent-campaigns',
      name: 'Recent High-Performance',
      description: 'Recent campaigns with high conversion rates',
      filters: [{
        id: 'preset-3',
        name: 'Recent High-Performance',
        conditions: [
          {
            id: 'c3',
            field: 'conversions',
            operator: '>',
            value: 100,
            type: 'number' as const
          },
          {
            id: 'c4',
            field: 'created_date',
            operator: '>',
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            type: 'date' as const
          }
        ],
        logic: 'AND' as const
      }]
    }
  ];

  useEffect(() => {
    onFiltersChange(filterGroups);
  }, [filterGroups, onFiltersChange]);

  const addFilterGroup = () => {
    const newGroup: FilterGroup = {
      id: `group-${Date.now()}`,
      name: `Filter Group ${filterGroups.length + 1}`,
      conditions: [],
      logic: 'AND'
    };
    setFilterGroups([...filterGroups, newGroup]);
  };

  const removeFilterGroup = (groupId: string) => {
    setFilterGroups(filterGroups.filter(group => group.id !== groupId));
  };

  const addCondition = (groupId: string) => {
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: 'views',
      operator: '>',
      value: '',
      type: 'number'
    };

    setFilterGroups(filterGroups.map(group =>
      group.id === groupId
        ? { ...group, conditions: [...group.conditions, newCondition] }
        : group
    ));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setFilterGroups(filterGroups.map(group =>
      group.id === groupId
        ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
        : group
    ));
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
    setFilterGroups(filterGroups.map(group =>
      group.id === groupId
        ? {
            ...group,
            conditions: group.conditions.map(condition =>
              condition.id === conditionId
                ? { ...condition, ...updates }
                : condition
            )
          }
        : group
    ));
  };

  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    setFilterGroups(filterGroups.map(group =>
      group.id === groupId ? { ...group, logic } : group
    ));
  };

  const applyPreset = (presetId: string) => {
    const preset = presetFilters.find(p => p.id === presetId);
    if (preset) {
      setFilterGroups(preset.filters);
      setSelectedPreset(presetId);
    }
  };

  const clearAllFilters = () => {
    setFilterGroups([{
      id: 'default',
      name: 'Default Filter',
      conditions: [],
      logic: 'AND'
    }]);
    setSelectedPreset('');
  };

  const saveCurrentFilters = () => {
    if (saveFilterName.trim()) {
      // Here you would typically save to a backend service
      console.log('Saving filters:', { name: saveFilterName, filters: filterGroups });
      setShowSaveDialog(false);
      setSaveFilterName('');
    }
  };

  const renderConditionValue = (condition: FilterCondition, groupId: string) => {
    const fieldConfig = FILTER_FIELDS[condition.field as keyof typeof FILTER_FIELDS];
    
    switch (fieldConfig?.type) {
      case 'number':
        if (condition.operator === 'between') {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={condition.value?.[0] || ''}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value: [e.target.value, condition.value?.[1] || '']
                })}
                placeholder="Min"
                className="w-20"
              />
              <span className="text-muted-foreground">and</span>
              <Input
                type="number"
                value={condition.value?.[1] || ''}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value: [condition.value?.[0] || '', e.target.value]
                })}
                placeholder="Max"
                className="w-20"
              />
            </div>
          );
        }
        return (
          <Input
            type="number"
            value={condition.value || ''}
            onChange={(e) => updateCondition(groupId, condition.id, { value: e.target.value })}
            placeholder="Enter value"
            className="w-32"
          />
        );

      case 'select':
        return (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(groupId, condition.id, { value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="w-60">
            <div className="flex flex-wrap gap-1 mb-2">
              {(condition.value as string[] || []).map((val) => (
                <Badge key={val} variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20">
                  {val}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => {
                      const newValue = (condition.value as string[]).filter(v => v !== val);
                      updateCondition(groupId, condition.id, { value: newValue });
                    }}
                  />
                </Badge>
              ))}
            </div>
            <Select
              onValueChange={(value) => {
                const currentValues = condition.value as string[] || [];
                if (!currentValues.includes(value)) {
                  updateCondition(groupId, condition.id, { value: [...currentValues, value] });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add option" />
              </SelectTrigger>
              <SelectContent>
                {fieldConfig.options?.filter(option => 
                  !(condition.value as string[] || []).includes(option)
                ).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {condition.value ? format(condition.value, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={condition.value}
                onSelect={(date) => updateCondition(groupId, condition.id, { value: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            value={condition.value || ''}
            onChange={(e) => updateCondition(groupId, condition.id, { value: e.target.value })}
            placeholder="Enter value"
            className="w-32"
          />
        );
    }
  };

  const getTotalActiveFilters = () => {
    return filterGroups.reduce((total, group) => total + group.conditions.length, 0);
  };

  return (
    <Card className={cn('card-enhanced border-l-2 border-primary/20 bg-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">Advanced Filters</CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                Create sophisticated filters to segment your analytics data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getTotalActiveFilters() > 0 && (
              <Badge variant="secondary" className="text-xs bg-success/10 text-success border border-success/20">
                {getTotalActiveFilters()} active filter{getTotalActiveFilters() !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Filters</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Builder</TabsTrigger>
              <TabsTrigger value="saved">Saved Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presetFilters.map((preset) => (
                  <Card 
                    key={preset.id} 
                    className={cn(
                      "card-enhanced bg-card cursor-pointer hover:shadow-professional transition-shadow duration-200",
                      selectedPreset === preset.id && "border-l-2 border-primary/20 shadow-professional"
                    )}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              {filterGroups.map((group, groupIndex) => (
                <Card key={group.id} className="card-enhanced border-l-2 border-success/20 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Input
                          value={group.name}
                          onChange={(e) => {
                            setFilterGroups(filterGroups.map(g =>
                              g.id === group.id ? { ...g, name: e.target.value } : g
                            ));
                          }}
                          className="font-medium h-8 w-48"
                        />
                        <Select
                          value={group.logic}
                          onValueChange={(value: 'AND' | 'OR') => updateGroupLogic(group.id, value)}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {filterGroups.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFilterGroup(group.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {group.conditions.map((condition, conditionIndex) => (
                        <div key={condition.id} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg border border-muted/20">
                          {conditionIndex > 0 && (
                            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                              {group.logic}
                            </Badge>
                          )}
                          
                          <Select
                            value={condition.field}
                            onValueChange={(value) => {
                              const fieldConfig = FILTER_FIELDS[value as keyof typeof FILTER_FIELDS];
                              updateCondition(group.id, condition.id, {
                                field: value,
                                type: fieldConfig.type,
                                operator: fieldConfig.operators[0],
                                value: ''
                              });
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(FILTER_FIELDS).map(([key, field]) => (
                                <SelectItem key={key} value={key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateCondition(group.id, condition.id, { operator: value, value: '' })}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FILTER_FIELDS[condition.field as keyof typeof FILTER_FIELDS]?.operators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {OPERATORS[op as keyof typeof OPERATORS]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {renderConditionValue(condition, group.id)}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCondition(group.id, condition.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCondition(group.id)}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Condition
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={addFilterGroup}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Filter Group
                </Button>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Filters
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div className="text-center py-8">
                <div className="p-4 bg-muted/10 rounded-lg border border-muted/20 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-2">No saved filters yet</p>
                <p className="text-sm text-muted-foreground">Create and save custom filters for quick access</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="card-enhanced bg-card w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-medium">Save Filter</span>
                  <p className="text-sm text-muted-foreground font-normal">Save current filter configuration</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Filter Name</Label>
                <Input
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  placeholder="Enter filter name"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveCurrentFilters} disabled={!saveFilterName.trim()}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}