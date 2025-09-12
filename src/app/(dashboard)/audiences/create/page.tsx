'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@clerk/nextjs';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Settings, 
  Plus,
  Trash2,
  Info,
  Save,
  Eye,
  FileText
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
} from '@/components/ui/alert';

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
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { state: { organizationId: spOrganizationId } } = useServiceProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use ServiceProvider organizationId first, fallback to Clerk organization
  const organizationId = spOrganizationId || organization?.id;
  const isLoading = !isOrgLoaded;
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

      // Creating audience

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
      // Audience created successfully

      toast({
        title: "Success!",
        description: `Audience "${data.name}" created successfully!`,
      });

      router.push('/audiences');

    } catch (_error) {
      // Failed to create audience
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

  // Show loading state while organization is loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-4 max-w-4xl">
        <Card className="card-enhanced border-l-2 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mx-auto">
                <Users className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Loading Organization...</h3>
                <p className="text-sm text-muted-foreground">Please wait while we set up your workspace</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no organization context after loading
  if (!organizationId) {
    return (
      <div className="container mx-auto py-4 max-w-4xl">
        <Alert className="card-enhanced border-l-2 border-destructive/20">
          <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
            <Info className="h-4 w-4 text-destructive" />
          </div>
          <AlertDescription>
            <strong className="text-destructive">Organization Context Missing</strong>
            <br />
            Unable to load organization context. Please refresh the page or contact support if the issue persists.
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="border-destructive/20 hover:bg-destructive/10">
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/audiences">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Audiences
              </Button>
            </Link>
          </div>
          
          <Card className="card-enhanced border-l-2 border-primary/20 hover:shadow-professional transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Create New Audience</h1>
                  <p className="text-muted-foreground mt-1">
                    Define your target audience with custom segmentation criteria
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 rounded-lg border border-muted/20">
                <TabsTrigger value="basic" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-professional transition-all duration-200">
                  Basic Information
                </TabsTrigger>
                <TabsTrigger value="targeting" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-professional transition-all duration-200">
                  Targeting Rules
                </TabsTrigger>
                <TabsTrigger value="review" className="data-[state=active]:bg-success/10 data-[state=active]:text-success data-[state=active]:border data-[state=active]:border-success/20 data-[state=active]:shadow-professional transition-all duration-200">
                  Review & Create
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <Card className="card-enhanced border-l-2 border-primary/20 hover:shadow-professional transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    Audience Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 card-enhanced border-l-2 border-primary/20 hover:shadow-professional transition-shadow duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <Label htmlFor="name" className="font-medium">Audience Name *</Label>
                        </div>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Enter audience name"
                          className="border-primary/20 focus:border-primary focus:ring-primary/20"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <div className="w-1 h-1 bg-destructive rounded-full"></div>
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4 card-enhanced border-l-2 border-primary/20 hover:shadow-professional transition-shadow duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <Label htmlFor="type" className="font-medium">Audience Type *</Label>
                        </div>
                        <Select value={selectedType} onValueChange={(value) => setValue('type', value as any)}>
                          <SelectTrigger className="border-primary/20 focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Select audience type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOM" className="hover:bg-primary/10">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full border border-primary/20"></div>
                                Custom Audience
                              </div>
                            </SelectItem>
                            <SelectItem value="IMPORTED" className="hover:bg-muted/10">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full border border-muted/20"></div>
                                Imported List
                              </div>
                            </SelectItem>
                            <SelectItem value="DYNAMIC" className="hover:bg-success/10">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-success rounded-full border border-success/20"></div>
                                Dynamic/Auto-updating
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <div className="w-1 h-1 bg-destructive rounded-full"></div>
                            {errors.type.message}
                          </p>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4 card-enhanced border-l-2 border-muted/20 hover:shadow-professional transition-shadow duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-muted/10 rounded border border-muted/20">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Label htmlFor="description" className="font-medium">Description</Label>
                      </div>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe your target audience, their characteristics, and what makes them unique..."
                        rows={3}
                        className="border-muted/20 focus:border-primary focus:ring-primary/20 resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Optional: This helps team members understand the audience purpose</p>
                    </div>
                  </Card>

                  {/* Tags */}
                  <Card className="p-4 card-enhanced border-l-2 border-success/20 hover:shadow-professional transition-shadow duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-success/10 rounded border border-success/20">
                          <Plus className="h-4 w-4 text-success" />
                        </div>
                        <Label className="font-medium">Tags</Label>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="Add a tag (e.g., enterprise, B2B, high-value)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="border-success/20 focus:border-success focus:ring-success/20"
                        />
                        <Button type="button" onClick={addTag} variant="outline" className="border-success/30 hover:bg-success/10 hover:border-success">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag) => (
                            <Badge key={tag} className="gap-1 bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-destructive hover:bg-destructive/10 rounded p-0.5 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Tags help organize and categorize your audiences</p>
                    </div>
                  </Card>

                  {/* Type-specific information */}
                  {selectedType === 'DYNAMIC' && (
                    <Alert className="card-enhanced border-l-2 border-success/20">
                      <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                        <Info className="h-4 w-4 text-success" />
                      </div>
                      <AlertDescription>
                        <strong className="text-success">Dynamic Audience</strong>
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
              <Card className="card-enhanced border-l-2 border-primary/20 hover:shadow-professional transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    Targeting Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card className="p-4 card-enhanced border-l-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded border border-primary/20">
                          <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Targeting Rules</h3>
                          <p className="text-sm text-muted-foreground">
                            Define who should be included in this audience
                          </p>
                        </div>
                      </div>
                      <Button type="button" onClick={addCondition}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                  </Card>

                  {conditions.length === 0 ? (
                    <Card className="p-8 card-enhanced border-l-2 border-muted/20 border-dashed text-center">
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/10 rounded-lg border border-muted/20 w-fit mx-auto">
                          <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">No targeting conditions set</h3>
                          <p className="text-sm text-muted-foreground">Add conditions to define your audience criteria</p>
                        </div>
                        <Button type="button" onClick={addCondition} variant="outline" className="mt-4 border-primary/20 hover:bg-primary/10">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Condition
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {conditions.map((condition, index) => (
                        <div key={condition.id} className="flex items-center gap-4 p-4 border border-muted/20 rounded-lg hover:shadow-professional hover:bg-muted/5 transition-all duration-200">
                          {index > 0 && (
                            <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">AND</div>
                          )}
                          
                          <Select 
                            value={condition.type} 
                            onValueChange={(value) => updateCondition(condition.id, { type: value as any })}
                          >
                            <SelectTrigger className="w-40 border-muted/20 focus:border-primary focus:ring-primary/20">
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
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
              <Card className="card-enhanced border-l-2 border-success/20 hover:shadow-professional transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                      <Eye className="h-5 w-5 text-success" />
                    </div>
                    Review Audience Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 card-enhanced border-l-2 border-primary/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-semibold text-primary">Basic Information</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center p-2 bg-background/50 rounded border">
                            <span className="font-medium">Name:</span>
                            <span className={watch('name') ? 'text-foreground' : 'text-muted-foreground'}>
                              {watch('name') || 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background/50 rounded border">
                            <span className="font-medium">Type:</span>
                            <Badge variant="outline" className="text-xs">{watch('type')}</Badge>
                          </div>
                          <div className="space-y-1">
                            <span className="font-medium">Description:</span>
                            <p className="text-muted-foreground p-2 bg-background/50 rounded border text-xs">
                              {watch('description') || 'No description provided'}
                            </p>
                          </div>
                          {tags.length > 0 && (
                            <div className="space-y-2">
                              <span className="font-medium">Tags:</span>
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs border border-success/20">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 card-enhanced border-l-2 border-primary/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-semibold text-primary">Targeting Conditions</h3>
                        </div>
                        {conditions.length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed border-muted rounded bg-muted/10">
                            <Target className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No conditions set</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {conditions.map((condition, index) => (
                              <div key={condition.id} className="p-2 bg-background/50 rounded border text-xs">
                                {index > 0 && (
                                  <Badge variant="outline" className="text-xs mb-1 bg-primary/10 text-primary border-primary/20">
                                    AND
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-xs">
                                  <Badge variant="secondary" className="text-xs">{condition.type}</Badge>
                                  <span>→</span>
                                  <span className="font-medium">{condition.field}</span>
                                  <Badge variant="outline" className="text-xs">{condition.operator}</Badge>
                                  <span className="font-medium text-primary">{condition.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Alert className="border-primary/20 bg-primary/5">
                    <div className="p-1 bg-primary/10 rounded">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <AlertDescription>
                      <strong className="text-primary">Ready to Create</strong>
                      <br />
                      Review your audience configuration above. Once created, you can modify these settings later from the audience management page.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border bg-muted/5 rounded-lg p-4 mt-6">
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-custom-white mr-2"></div>
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