'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Users, Filter, Target, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const conditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.string().min(1, 'Operator is required'),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
  logic: z.enum(['AND', 'OR']).optional(),
});

const segmentSchema = z.object({
  name: z.string().min(1, 'Segment name is required'),
  description: z.string().optional(),
  type: z.enum(['DEMOGRAPHIC', 'BEHAVIORAL', 'CUSTOM', 'LOOKALIKE']),
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
  isDynamic: z.boolean().default(true),
});

type SegmentFormData = z.infer<typeof segmentSchema>;

interface SegmentBuilderProps {
  audienceId?: string;
  onSave?: (segment: SegmentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<SegmentFormData>;
}

const fieldOptions = [
  // Demographic fields
  { value: 'age', label: 'Age', category: 'Demographic', type: 'number' },
  { value: 'gender', label: 'Gender', category: 'Demographic', type: 'select', options: ['Male', 'Female', 'Other'] },
  { value: 'location', label: 'Location', category: 'Demographic', type: 'text' },
  { value: 'income', label: 'Income Range', category: 'Demographic', type: 'select', options: ['<30k', '30k-50k', '50k-100k', '100k+'] },
  
  // Behavioral fields
  { value: 'totalOrders', label: 'Total Orders', category: 'Behavioral', type: 'number' },
  { value: 'totalSpent', label: 'Total Spent', category: 'Behavioral', type: 'number' },
  { value: 'lastPurchase', label: 'Last Purchase', category: 'Behavioral', type: 'date' },
  { value: 'avgOrderValue', label: 'Average Order Value', category: 'Behavioral', type: 'number' },
  { value: 'engagementLevel', label: 'Engagement Level', category: 'Behavioral', type: 'select', options: ['Low', 'Medium', 'High', 'Very High'] },
  { value: 'emailOpens', label: 'Email Opens (30 days)', category: 'Behavioral', type: 'number' },
  { value: 'emailClicks', label: 'Email Clicks (30 days)', category: 'Behavioral', type: 'number' },
  
  // Custom fields
  { value: 'tags', label: 'Tags', category: 'Custom', type: 'multiselect' },
  { value: 'source', label: 'Acquisition Source', category: 'Custom', type: 'select', options: ['Website', 'Social Media', 'Email', 'Referral', 'Paid Ads'] },
  { value: 'subscriptionStatus', label: 'Subscription Status', category: 'Custom', type: 'select', options: ['Active', 'Inactive', 'Cancelled', 'Trial'] },
];

const operatorOptions = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'greater_equal', label: 'Greater than or equal' },
    { value: 'less_equal', label: 'Less than or equal' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
    { value: 'in', label: 'Is any of' },
    { value: 'not_in', label: 'Is none of' },
  ],
  multiselect: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'contains_all', label: 'Contains all' },
    { value: 'contains_any', label: 'Contains any' },
  ],
  date: [
    { value: 'after', label: 'After' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'within_days', label: 'Within last N days' },
    { value: 'more_than_days', label: 'More than N days ago' },
  ],
};

export function SegmentBuilder({ audienceId, onSave, onCancel, initialData }: SegmentBuilderProps) {
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<SegmentFormData>({
    resolver: zodResolver(segmentSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'CUSTOM',
      conditions: [
        {
          field: '',
          operator: '',
          value: '',
          logic: 'AND',
        },
      ],
      isDynamic: true,
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conditions',
  });

  const watchedConditions = watch('conditions');

  const addCondition = () => {
    append({
      field: '',
      operator: '',
      value: '',
      logic: 'AND',
    });
  };

  const removeCondition = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getFieldConfig = (fieldValue: string) => {
    return fieldOptions.find(option => option.value === fieldValue);
  };

  const getOperators = (fieldType: string) => {
    return operatorOptions[fieldType as keyof typeof operatorOptions] || operatorOptions.text;
  };

  const calculateEstimatedSize = async () => {
    const conditions = getValues('conditions');
    const validConditions = conditions.filter(c => c.field && c.operator && c.value);
    
    if (validConditions.length === 0) {
      setEstimatedSize(null);
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate API call to calculate segment size
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock calculation based on conditions
      let baseSize = 10000; // Total audience size
      
      validConditions.forEach(condition => {
        switch (condition.field) {
          case 'totalOrders':
            if (condition.operator === 'greater_than') {
              baseSize *= 0.3; // 30% have more than X orders
            }
            break;
          case 'totalSpent':
            if (condition.operator === 'greater_than') {
              baseSize *= 0.2; // 20% are high-value customers
            }
            break;
          case 'engagementLevel':
            if (condition.value === 'High') {
              baseSize *= 0.25; // 25% have high engagement
            }
            break;
          case 'age':
            baseSize *= 0.4; // Age filtering reduces by 60%
            break;
          default:
            baseSize *= 0.5; // General filtering reduces by 50%
        }
      });
      
      setEstimatedSize(Math.max(Math.floor(baseSize), 10));
    } catch (error) {
      // Error calculating segment size
      setEstimatedSize(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: SegmentFormData) => {
    try {
      // Validate that all conditions are complete
      const incompleteConditions = data.conditions.filter(c => !c.field || !c.operator || !c.value);
      if (incompleteConditions.length > 0) {
        toast({
          title: 'Incomplete Conditions',
          description: 'Please complete all condition fields',
          variant: 'destructive',
        });
        return;
      }

      await onSave?.(data);
      
      toast({
        title: 'Success',
        description: 'Audience segment created successfully',
      });
    } catch (error) {
      // Error saving segment
      toast({
        title: 'Error',
        description: 'Failed to save segment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Audience Segment</h2>
          <p className="text-muted-foreground">
            Define conditions to automatically group your audience
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>
            Save Segment
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Segment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Segment Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., High-Value Customers"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe this segment..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Segment Type</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(value: any) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEMOGRAPHIC">
                      <div>
                        <div className="font-medium">Demographic</div>
                        <div className="text-sm text-muted-foreground">Age, location, gender</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="BEHAVIORAL">
                      <div>
                        <div className="font-medium">Behavioral</div>
                        <div className="text-sm text-muted-foreground">Purchase history, engagement</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="CUSTOM">
                      <div>
                        <div className="font-medium">Custom</div>
                        <div className="text-sm text-muted-foreground">Tags, custom fields</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="LOOKALIKE">
                      <div>
                        <div className="font-medium">Lookalike</div>
                        <div className="text-sm text-muted-foreground">Similar to existing segment</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDynamic"
                  checked={watch('isDynamic')}
                  onCheckedChange={(checked) => setValue('isDynamic', checked as boolean)}
                />
                <Label htmlFor="isDynamic" className="text-sm">
                  Dynamic segment (automatically updates)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Segment Conditions
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const condition = watchedConditions[index];
              const fieldConfig = getFieldConfig(condition?.field || '');
              const operators = getOperators(fieldConfig?.type || 'text');

              return (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={condition?.logic || 'AND'}
                        onValueChange={(value: any) => setValue(`conditions.${index}.logic`, value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="h-px bg-border flex-1" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Field</Label>
                      <Select
                        value={condition?.field || ''}
                        onValueChange={(value) => {
                          setValue(`conditions.${index}.field`, value);
                          setValue(`conditions.${index}.operator`, '');
                          setValue(`conditions.${index}.value`, '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Demographic', 'Behavioral', 'Custom'].map(category => (
                            <div key={category}>
                              <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                                {category}
                              </div>
                              {fieldOptions
                                .filter(option => option.category === category)
                                .map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={condition?.operator || ''}
                        onValueChange={(value) => setValue(`conditions.${index}.operator`, value)}
                        disabled={!condition?.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Value</Label>
                      {fieldConfig?.type === 'select' ? (
                        <Select
                          value={condition?.value as string || ''}
                          onValueChange={(value) => setValue(`conditions.${index}.value`, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldConfig.options?.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : fieldConfig?.type === 'number' ? (
                        <Input
                          type="number"
                          placeholder="Enter number"
                          value={condition?.value as string || ''}
                          onChange={(e) => setValue(`conditions.${index}.value`, e.target.value)}
                        />
                      ) : fieldConfig?.type === 'date' ? (
                        <Input
                          type="date"
                          value={condition?.value as string || ''}
                          onChange={(e) => setValue(`conditions.${index}.value`, e.target.value)}
                        />
                      ) : (
                        <Input
                          placeholder="Enter value"
                          value={condition?.value as string || ''}
                          onChange={(e) => setValue(`conditions.${index}.value`, e.target.value)}
                        />
                      )}
                    </div>

                    <div className="flex items-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {errors.conditions && (
              <p className="text-sm text-red-500">{errors.conditions.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Segment Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Estimated Segment Size</h4>
                <p className="text-sm text-muted-foreground">
                  Based on current conditions
                </p>
              </div>
              <div className="text-right">
                {estimatedSize !== null ? (
                  <div className="text-2xl font-bold text-primary">
                    {estimatedSize.toLocaleString()}
                  </div>
                ) : (
                  <div className="text-muted-foreground">-</div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={calculateEstimatedSize}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Size'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Create Segment
          </Button>
        </div>
      </form>
    </div>
  );
}