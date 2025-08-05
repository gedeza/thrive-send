'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Settings, 
  Plus,
  Trash2,
  Info,
  Save,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert-new';

// Form validation schema
const audienceSchema = z.object({
  name: z.string().min(1, 'Audience name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().optional(),
  type: z.enum(['CUSTOM', 'IMPORTED', 'DYNAMIC']),
  tags: z.array(z.string()).optional(),
});

type AudienceFormData = z.infer<typeof audienceSchema>;

interface AudienceCondition {
  id: string;
  type: 'demographic' | 'behavioral' | 'custom';
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: string | string[];
}

export default function CreateAudiencePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { state: { organizationId } } = useServiceProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conditions, setConditions] = useState<AudienceCondition[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AudienceFormData>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'CUSTOM',
      tags: [],
    },
  });

  const selectedType = watch('type');

  // Add condition for audience targeting
  const addCondition = () => {
    const newCondition: AudienceCondition = {
      id: Date.now().toString(),
      type: 'demographic',
      field: 'age',
      operator: 'equals',
      value: '',
    };
    setConditions([...conditions, newCondition]);
  };

  // Remove condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  // Update condition
  const updateCondition = (id: string, updates: Partial<AudienceCondition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setCurrentTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Handle form submission
  const onSubmit = async (data: AudienceFormData) => {
    try {
      setIsSubmitting(true);

      if (!organizationId) {
        toast({
          title: "Error",
          description: "No organization selected",
          variant: "destructive",
        });
        return;
      }

      const audienceData = {
        ...data,
        organizationId,
        conditions,
        tags,
      };

      console.log('Creating audience:', audienceData);

      // Create audience via API
      const response = await fetch('/api/service-provider/audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audienceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create audience');
      }

      const createdAudience = await response.json();
      console.log('✅ Audience created successfully:', createdAudience);

      toast({
        title: "Success!",
        description: `Audience "${data.name}" created successfully!`,
      });

      router.push('/audiences');

    } catch (error) {
      console.error('Failed to create audience:', error);
      toast({
        title: "Error",
        description: "Failed to create audience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Condition field options based on type
  const getFieldOptions = (type: string) => {
    switch (type) {
      case 'demographic':
        return ['age', 'gender', 'location', 'language', 'income'];
      case 'behavioral':
        return ['engagement_level', 'last_activity', 'content_preferences', 'purchase_history'];
      case 'custom':
        return ['custom_field_1', 'custom_field_2', 'tags'];
      default:
        return [];
    }
  };

  // Show error if no organization context
  if (!organizationId) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Organization Context Missing</strong>
            <br />
            Unable to load organization context. Please refresh the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/audiences">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Audiences
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold">Create New Audience</h1>
            <p className="text-muted-foreground">
              Define your target audience with custom segmentation criteria
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="targeting">Targeting Rules</TabsTrigger>
              <TabsTrigger value="review">Review & Create</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Audience Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Audience Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter audience name"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Audience Type *</Label>
                      <Select value={selectedType} onValueChange={(value) => setValue('type', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOM">Custom Audience</SelectItem>
                          <SelectItem value="IMPORTED">Imported List</SelectItem>
                          <SelectItem value="DYNAMIC">Dynamic/Auto-updating</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-destructive">{errors.type.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Describe your target audience..."
                      rows={3}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Type-specific information */}
                  {selectedType === 'DYNAMIC' && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Dynamic Audience</strong>
                        <br />
                        This audience will automatically update based on the targeting rules you define. 
                        New users matching your criteria will be added automatically.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-6">
              {/* Targeting Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Targeting Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Define who should be included in this audience
                    </p>
                    <Button type="button" onClick={addCondition} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>

                  {conditions.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No targeting conditions set</p>
                      <p className="text-sm text-muted-foreground">Add conditions to define your audience</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conditions.map((condition, index) => (
                        <div key={condition.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          {index > 0 && (
                            <div className="text-sm font-medium text-muted-foreground">AND</div>
                          )}
                          
                          <Select 
                            value={condition.type} 
                            onValueChange={(value) => updateCondition(condition.id, { type: value as any })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="demographic">Demographics</SelectItem>
                              <SelectItem value="behavioral">Behavior</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select 
                            value={condition.field} 
                            onValueChange={(value) => updateCondition(condition.id, { field: value })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getFieldOptions(condition.type).map((field) => (
                                <SelectItem key={field} value={field}>
                                  {field.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select 
                            value={condition.operator} 
                            onValueChange={(value) => updateCondition(condition.id, { operator: value as any })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greater_than">Greater than</SelectItem>
                              <SelectItem value="less_than">Less than</SelectItem>
                              <SelectItem value="in_range">In range</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={condition.value as string}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                            placeholder="Value"
                            className="flex-1"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCondition(condition.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-6">
              {/* Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review Audience Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Basic Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {watch('name') || 'Not set'}</div>
                        <div><strong>Type:</strong> {watch('type')}</div>
                        <div><strong>Description:</strong> {watch('description') || 'None'}</div>
                        {tags.length > 0 && (
                          <div>
                            <strong>Tags:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Targeting Conditions</h3>
                      {conditions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No conditions set</p>
                      ) : (
                        <div className="space-y-1 text-sm">
                          {conditions.map((condition, index) => (
                            <div key={condition.id}>
                              {index > 0 && <span className="text-muted-foreground">AND </span>}
                              <span>
                                {condition.type} → {condition.field} {condition.operator} {condition.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Review your audience configuration above. Once created, you can modify these settings later from the audience management page.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Link href="/audiences">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            
            <div className="flex gap-2">
              {activeTab === 'basic' && (
                <Button type="button" onClick={() => setActiveTab('targeting')}>
                  Next: Targeting
                </Button>
              )}
              {activeTab === 'targeting' && (
                <Button type="button" onClick={() => setActiveTab('review')}>
                  Next: Review
                </Button>
              )}
              {activeTab === 'review' && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Audience
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}