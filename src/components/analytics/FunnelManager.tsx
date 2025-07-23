'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  ArrowUp,
  ArrowDown,
  Target,
  Filter,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const funnelStageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Stage name is required'),
  description: z.string().optional(),
  eventType: z.enum(['PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'PURCHASE', 'CUSTOM']),
  eventValue: z.string().min(1, 'Event value is required'),
  goalValue: z.number().optional(),
  timeLimit: z.number().optional(), // in minutes
});

const funnelSchema = z.object({
  name: z.string().min(1, 'Funnel name is required'),
  description: z.string().optional(),
  campaignId: z.string().min(1, 'Campaign is required'),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT']),
  stages: z.array(funnelStageSchema).min(2, 'At least 2 stages are required'),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
});

type FunnelFormData = z.infer<typeof funnelSchema>;

interface FunnelManagerProps {
  funnelId?: string;
  campaignId?: string;
  onSave?: (funnel: FunnelFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<FunnelFormData>;
}

export function FunnelManager({ 
  funnelId, 
  campaignId, 
  onSave, 
  onCancel, 
  initialData 
}: FunnelManagerProps) {
  const [activeTab, setActiveTab] = useState('setup');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<FunnelFormData>({
    resolver: zodResolver(funnelSchema),
    defaultValues: {
      name: '',
      description: '',
      campaignId: campaignId || '',
      status: 'DRAFT',
      timeframe: '30d',
      stages: [
        {
          id: '1',
          name: 'Landing Page',
          description: 'Users land on the page',
          eventType: 'PAGE_VIEW',
          eventValue: '/landing',
        },
        {
          id: '2',
          name: 'Conversion',
          description: 'Users complete the goal',
          eventType: 'PURCHASE',
          eventValue: 'purchase_complete',
        }
      ],
      ...initialData,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stages',
  });

  const watchedStages = watch('stages');

  const addStage = () => {
    const newStage = {
      id: Date.now().toString(),
      name: `Stage ${fields.length + 1}`,
      description: '',
      eventType: 'CLICK' as const,
      eventValue: '',
    };
    append(newStage);
  };

  const moveStage = (fromIndex: number, toIndex: number) => {
    if (toIndex >= 0 && toIndex < fields.length) {
      move(fromIndex, toIndex);
    }
  };

  const removeStage = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    } else {
      toast({
        title: 'Cannot Remove Stage',
        description: 'A funnel must have at least 2 stages',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: FunnelFormData) => {
    try {
      console.log('Saving funnel:', data);
      await onSave?.(data);
      
      toast({
        title: 'Success',
        description: `Funnel ${funnelId ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast({
        title: 'Error',
        description: 'Failed to save funnel',
        variant: 'destructive',
      });
    }
  };

  const getEventTypeConfig = (eventType: string) => {
    const configs = {
      PAGE_VIEW: { icon: '👁️', label: 'Page View', color: 'bg-blue-100 text-blue-800' },
      CLICK: { icon: '👆', label: 'Click', color: 'bg-green-100 text-green-800' },
      FORM_SUBMIT: { icon: '📝', label: 'Form Submit', color: 'bg-yellow-100 text-yellow-800' },
      PURCHASE: { icon: '💰', label: 'Purchase', color: 'bg-purple-100 text-purple-800' },
      CUSTOM: { icon: '⚡', label: 'Custom Event', color: 'bg-gray-100 text-gray-800' },
    };
    return configs[eventType as keyof typeof configs] || configs.CUSTOM;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {funnelId ? 'Edit Funnel' : 'Create Conversion Funnel'}
          </h2>
          <p className="text-muted-foreground">
            Set up conversion tracking and analyze user journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <Save className="h-4 w-4 mr-2" />
            Save Funnel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Funnel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Funnel Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Product Purchase Funnel"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value: any) => setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PAUSED">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe the purpose of this funnel..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignId">Associated Campaign</Label>
                  <Select
                    value={watch('campaignId')}
                    onValueChange={(value) => setValue('campaignId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Summer Sale Campaign</SelectItem>
                      <SelectItem value="2">Product Launch Campaign</SelectItem>
                      <SelectItem value="3">Holiday Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.campaignId && (
                    <p className="text-sm text-red-500 mt-1">{errors.campaignId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="timeframe">Analysis Timeframe</Label>
                  <Select
                    value={watch('timeframe')}
                    onValueChange={(value: any) => setValue('timeframe', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          {/* Funnel Stages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Funnel Stages
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define the steps users take in your conversion journey
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addStage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => {
                const stage = watchedStages[index];
                const eventConfig = getEventTypeConfig(stage?.eventType || 'CUSTOM');

                return (
                  <Card key={field.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">Stage {index + 1}</h4>
                            <Badge className={eventConfig.color}>
                              {eventConfig.icon} {eventConfig.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStage(index, index - 1)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStage(index, index + 1)}
                            disabled={index === fields.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStage(index)}
                            disabled={fields.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Stage Name</Label>
                          <Input
                            {...register(`stages.${index}.name`)}
                            placeholder="e.g., Landing Page Visit"
                            className={errors.stages?.[index]?.name ? 'border-red-500' : ''}
                          />
                          {errors.stages?.[index]?.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.stages[index]?.name?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Event Type</Label>
                          <Select
                            value={stage?.eventType || 'CUSTOM'}
                            onValueChange={(value: any) => setValue(`stages.${index}.eventType`, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PAGE_VIEW">👁️ Page View</SelectItem>
                              <SelectItem value="CLICK">👆 Click</SelectItem>
                              <SelectItem value="FORM_SUBMIT">📝 Form Submit</SelectItem>
                              <SelectItem value="PURCHASE">💰 Purchase</SelectItem>
                              <SelectItem value="CUSTOM">⚡ Custom Event</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Event Value</Label>
                          <Input
                            {...register(`stages.${index}.eventValue`)}
                            placeholder="e.g., /checkout, #buy-button"
                            className={errors.stages?.[index]?.eventValue ? 'border-red-500' : ''}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            CSS selector, URL path, or event name
                          </p>
                          {errors.stages?.[index]?.eventValue && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.stages[index]?.eventValue?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Goal Value (Optional)</Label>
                          <Input
                            type="number"
                            {...register(`stages.${index}.goalValue`, { valueAsNumber: true })}
                            placeholder="e.g., 100 (for revenue)"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Monetary value for this conversion
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          {...register(`stages.${index}.description`)}
                          placeholder="Describe what happens at this stage..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {errors.stages && (
                <p className="text-sm text-red-500">{errors.stages.message}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          {/* Tracking Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tracking Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Tracking Code</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add this code to your website to start tracking funnel events:
                </p>
                <pre className="bg-black text-green-400 p-4 rounded text-xs overflow-x-auto">
{`<!-- ThriveSend Funnel Tracking -->
<script>
  (function() {
    var ts = document.createElement('script');
    ts.type = 'text/javascript';
    ts.async = true;
    ts.src = 'https://cdn.thrivesend.com/funnel-tracker.js';
    ts.setAttribute('data-funnel-id', '${funnelId || 'FUNNEL_ID'}');
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ts, s);
  })();
</script>`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Event Tracking Examples</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 border rounded">
                      <div className="font-medium">Page View</div>
                      <code className="text-xs text-muted-foreground">/landing-page</code>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Button Click</div>
                      <code className="text-xs text-muted-foreground">#signup-button</code>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Form Submit</div>
                      <code className="text-xs text-muted-foreground">form[name="checkout"]</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Manual Event Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Use JavaScript to manually track events:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Track custom event
thriveSend.track('purchase_complete', {
  value: 99.99,
  currency: 'USD',
  product_id: 'abc123'
});`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Funnel Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Preview of your funnel flow:
                </div>
                
                {watchedStages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 p-3 border rounded-lg">
                      <div className="font-medium">{stage.name || `Stage ${index + 1}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {stage.description || 'No description'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getEventTypeConfig(stage.eventType).label}
                        </Badge>
                        <span className="ml-2">{stage.eventValue}</span>
                      </div>
                    </div>
                    {index < watchedStages.length - 1 && (
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}