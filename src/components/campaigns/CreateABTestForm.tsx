'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Target, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  description: z.string().optional(),
  content: z.object({
    subject: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    cta: z.string().optional(),
  }),
  trafficAllocation: z.number().min(1).max(100),
  isControl: z.boolean().default(false),
});

const abTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  description: z.string().optional(),
  variants: z.array(variantSchema).min(2, 'At least 2 variants are required'),
  configuration: z.object({
    testDuration: z.number().min(1, 'Test duration must be at least 1 day'),
    minimumSampleSize: z.number().min(100, 'Minimum sample size must be at least 100'),
    confidenceLevel: z.number().min(80).max(99),
    primaryMetric: z.enum(['clicks', 'conversions', 'revenue', 'ctr']),
    autoSelectWinner: z.boolean().default(false),
  }),
});

type ABTestFormData = z.infer<typeof abTestSchema>;

interface CreateABTestFormProps {
  campaignId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateABTestForm({ campaignId, onSuccess, onCancel }: CreateABTestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<ABTestFormData>({
    resolver: zodResolver(abTestSchema),
    defaultValues: {
      name: '',
      description: '',
      variants: [
        {
          name: 'Control (A)',
          description: 'Original version',
          content: { subject: '', title: '', body: '', cta: '' },
          trafficAllocation: 50,
          isControl: true,
        },
        {
          name: 'Variant B',
          description: 'Test version',
          content: { subject: '', title: '', body: '', cta: '' },
          trafficAllocation: 50,
          isControl: false,
        },
      ],
      configuration: {
        testDuration: 14,
        minimumSampleSize: 1000,
        confidenceLevel: 95,
        primaryMetric: 'conversions',
        autoSelectWinner: false,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const variants = watch('variants');
  const totalAllocation = variants?.reduce((sum, variant) => sum + (variant.trafficAllocation || 0), 0) || 0;

  const addVariant = () => {
    const currentVariants = getValues('variants');
    const nextLetter = String.fromCharCode(65 + currentVariants.length); // A, B, C, etc.
    
    append({
      name: `Variant ${nextLetter}`,
      description: '',
      content: { subject: '', title: '', body: '', cta: '' },
      trafficAllocation: Math.floor(100 / (currentVariants.length + 1)),
      isControl: false,
    });

    // Redistribute traffic evenly
    redistributeTraffic();
  };

  const redistributeTraffic = () => {
    const currentVariants = getValues('variants');
    const evenSplit = Math.floor(100 / currentVariants.length);
    const remainder = 100 - (evenSplit * currentVariants.length);

    currentVariants.forEach((variant, index) => {
      const allocation = index === 0 ? evenSplit + remainder : evenSplit;
      setValue(`variants.${index}.trafficAllocation`, allocation);
    });
  };

  const removeVariant = (index: number) => {
    if (fields.length <= 2) {
      toast({
        title: 'Cannot Remove',
        description: 'You must have at least 2 variants for an A/B test',
        variant: 'destructive',
      });
      return;
    }

    remove(index);
    redistributeTraffic();
  };

  const setAsControl = (index: number) => {
    variants?.forEach((variant, i) => {
      setValue(`variants.${i}.isControl`, i === index);
    });
  };

  const onSubmit = async (data: ABTestFormData) => {
    if (totalAllocation !== 100) {
      toast({
        title: 'Invalid Traffic Allocation',
        description: 'Traffic allocation must total exactly 100%',
        variant: 'destructive',
      });
      return;
    }

    if (!data.variants.some(v => v.isControl)) {
      toast({
        title: 'No Control Variant',
        description: 'Please select one variant as the control',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create A/B test');
      }

      toast({
        title: 'Success',
        description: 'A/B test created successfully',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast({
        title: 'Error',
        description: 'Failed to create A/B test',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create A/B Test</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Test'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Email Subject Line Test"
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
                    placeholder="Describe what you're testing and why..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Test Variants</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={totalAllocation === 100 ? 'default' : 'destructive'}>
                      Traffic: {totalAllocation}%
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                      disabled={fields.length >= 5}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => {
                  const variant = variants?.[index];
                  const isControl = variant?.isControl;

                  return (
                    <div key={field.id} className={`border rounded-lg p-4 ${isControl ? 'bg-blue-50 dark:bg-blue-950' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {variant?.name || `Variant ${String.fromCharCode(65 + index)}`}
                          </h4>
                          {isControl && (
                            <Badge variant="default">Control</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isControl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAsControl(index)}
                            >
                              Set as Control
                            </Button>
                          )}
                          {fields.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`variants.${index}.name`}>Variant Name</Label>
                          <Input
                            {...register(`variants.${index}.name`)}
                            placeholder="e.g., Control, Variant B"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`variants.${index}.trafficAllocation`}>
                            Traffic Allocation (%)
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...register(`variants.${index}.trafficAllocation`, { valueAsNumber: true })}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor={`variants.${index}.description`}>Description</Label>
                          <Input
                            {...register(`variants.${index}.description`)}
                            placeholder="Describe this variant..."
                          />
                        </div>

                        <div>
                          <Label htmlFor={`variants.${index}.content.subject`}>Email Subject</Label>
                          <Input
                            {...register(`variants.${index}.content.subject`)}
                            placeholder="Subject line..."
                          />
                        </div>

                        <div>
                          <Label htmlFor={`variants.${index}.content.title`}>Title/Headline</Label>
                          <Input
                            {...register(`variants.${index}.content.title`)}
                            placeholder="Main title..."
                          />
                        </div>

                        <div>
                          <Label htmlFor={`variants.${index}.content.cta`}>Call to Action</Label>
                          <Input
                            {...register(`variants.${index}.content.cta`)}
                            placeholder="Button text..."
                          />
                        </div>

                        <div>
                          <Label htmlFor={`variants.${index}.content.body`}>Body Content</Label>
                          <Textarea
                            {...register(`variants.${index}.content.body`)}
                            placeholder="Main content..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testDuration">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Test Duration (Days)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="90"
                      {...register('configuration.testDuration', { valueAsNumber: true })}
                      className={errors.configuration?.testDuration ? 'border-red-500' : ''}
                    />
                    {errors.configuration?.testDuration && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.configuration.testDuration.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="minimumSampleSize">
                      <Users className="h-4 w-4 inline mr-1" />
                      Minimum Sample Size
                    </Label>
                    <Input
                      type="number"
                      min="100"
                      {...register('configuration.minimumSampleSize', { valueAsNumber: true })}
                      className={errors.configuration?.minimumSampleSize ? 'border-red-500' : ''}
                    />
                    {errors.configuration?.minimumSampleSize && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.configuration.minimumSampleSize.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confidenceLevel">Confidence Level (%)</Label>
                    <Select
                      value={watch('configuration.confidenceLevel')?.toString()}
                      onValueChange={(value) => 
                        setValue('configuration.confidenceLevel', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                        <SelectItem value="95">95%</SelectItem>
                        <SelectItem value="99">99%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="primaryMetric">
                      <Target className="h-4 w-4 inline mr-1" />
                      Primary Metric
                    </Label>
                    <Select
                      value={watch('configuration.primaryMetric')}
                      onValueChange={(value: any) => 
                        setValue('configuration.primaryMetric', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clicks">Clicks</SelectItem>
                        <SelectItem value="ctr">Click-Through Rate</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoSelectWinner"
                    checked={watch('configuration.autoSelectWinner')}
                    onCheckedChange={(checked) => 
                      setValue('configuration.autoSelectWinner', checked as boolean)
                    }
                  />
                  <Label htmlFor="autoSelectWinner">
                    Automatically select winner when statistical significance is reached
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || totalAllocation !== 100}>
            {isSubmitting ? 'Creating...' : 'Create A/B Test'}
          </Button>
        </div>
      </form>
    </div>
  );
}