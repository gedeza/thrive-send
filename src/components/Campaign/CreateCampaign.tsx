'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Calendar as CalendarIconSolid,
  DollarSign,
  Settings,
  Check,
  Info,
  Lightbulb
} from 'lucide-react';
import { createCampaign } from '@/lib/api';
import { CampaignStatus, CampaignGoalType, ScheduleFrequency } from '@prisma/client';
import { useOrganization } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// --- Types ---
const campaignFormSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().nullable(),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  budget: z.string().optional(),
  goalType: z.nativeEnum(CampaignGoalType),
  customGoal: z.string().nullable(),
  status: z.nativeEnum(CampaignStatus),
  organizationId: z.string(),
  clientId: z.string().default('none'),
  projectId: z.string().optional(),
  scheduleFrequency: z.nativeEnum(ScheduleFrequency),
  timezone: z.string()
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

// --- Multi-Step Wizard Configuration ---
const WIZARD_STEPS = [
  {
    id: 'basics',
    title: 'Campaign Basics',
    description: 'Give your campaign a name and description',
    icon: Target,
    fields: ['name', 'description']
  },
  {
    id: 'goals',
    title: 'Goals & Objectives',
    description: 'Define what you want to achieve',
    icon: Target,
    fields: ['goalType', 'customGoal']
  },
  {
    id: 'schedule',
    title: 'Timeline & Schedule',
    description: 'Set when your campaign will run',
    icon: CalendarIconSolid,
    fields: ['startDate', 'endDate', 'scheduleFrequency', 'timezone']
  },
  {
    id: 'budget',
    title: 'Budget & Settings',
    description: 'Configure budget and final settings',
    icon: DollarSign,
    fields: ['budget', 'status']
  }
];

// --- Smart Defaults ---
const SMART_DEFAULTS = {
  status: CampaignStatus.draft,
  goalType: CampaignGoalType.ENGAGEMENT,
  scheduleFrequency: ScheduleFrequency.ONCE,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

// --- Goal Type Descriptions ---
const GOAL_TYPE_DESCRIPTIONS = {
  [CampaignGoalType.AWARENESS]: 'Increase brand visibility and reach new audiences',
  [CampaignGoalType.ENGAGEMENT]: 'Drive interactions, likes, shares, and comments',
  [CampaignGoalType.CONVERSION]: 'Generate leads, sales, or specific actions',
  [CampaignGoalType.RETENTION]: 'Keep existing customers engaged and loyal'
};

// --- Client Type ---
interface Client {
  id: string;
  name: string;
  status: string;
}

const CreateCampaign: React.FC = () => {
  const { organization, isLoaded } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add debug logging for organization
  useEffect(() => {
    console.log('Current organization context:', organization);
  }, [organization]);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: '',
      description: null,
      startDate: '',
      endDate: '',
      budget: '',
      goalType: SMART_DEFAULTS.goalType,
      customGoal: null,
      status: SMART_DEFAULTS.status,
      organizationId: organization?.id || '',
      clientId: 'none',
      projectId: '',
      scheduleFrequency: SMART_DEFAULTS.scheduleFrequency,
      timezone: SMART_DEFAULTS.timezone
    }
  });

  useEffect(() => {
    if (organization?.id) {
      form.setValue('organizationId', organization.id);
      fetchClients();
    }
  }, [organization?.id, form]);

  // Load template data if template ID is provided in search params
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [searchParams]);

  const loadTemplate = async (templateId: string) => {
    setIsLoadingTemplate(true);
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        setTemplateData(template);
        
        // Pre-fill form with template data
        if (template.name) {
          form.setValue('name', `${template.name} - Copy`);
        }
        if (template.description) {
          form.setValue('description', template.description);
        }
        
        toast({
          title: "Template Loaded",
          description: `Campaign pre-filled with "${template.name}" template data.`,
        });
      } else {
        toast({
          title: "Template Not Found",
          description: "The selected template could not be loaded.",
          variant: "destructive",
        });
      }
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error Loading Template",
        description: "Failed to load template data.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  // Fetch clients for the organization
  const fetchClients = async () => {
    if (!organization?.id) return;
    
    setIsLoadingClients(true);
    try {
      const response = await fetch(`/api/clients?organizationId=${organization.id}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      } else {
        console.error('Failed to fetch clients');
      }
    } catch (_error) {
      console.error("", _error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Calculate progress
  const totalSteps = WIZARD_STEPS.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Check if current step is valid
  const isCurrentStepValid = () => {
    const currentStepConfig = WIZARD_STEPS[currentStep];
    const fieldValues = form.getValues();
    
    return currentStepConfig.fields.every(field => {
      const value = fieldValues[field as keyof CampaignFormData];
      // Handle optional fields like clientId (can be 'none')
      if (field === 'clientId' || field === 'budget' || field === 'customGoal' || field === 'description') {
        return true; // These fields are optional
      }
      return value !== '' && value !== null && value !== undefined;
    });
  };

  // Move to next step
  const nextStep = () => {
    if (isCurrentStepValid()) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  // Move to previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Generate smart suggestions based on context
  const generateSuggestions = () => {
    const orgName = organization?.name || 'Your Organization';
    const currentDate = new Date();
    const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      name: `${orgName} Marketing Campaign ${format(currentDate, 'MMM yyyy')}`,
      startDate: format(nextWeek, 'yyyy-MM-dd'),
      endDate: format(new Date(nextWeek.getTime() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      budget: '5000'
    };
  };

  const suggestions = generateSuggestions();

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      console.log('Organization ID from form:', data.organizationId);
      console.log('Current organization context:', organization);

      if (!organization?.id) {
        setSubmitError('No organization selected. Please join or create an organization first.');
        setIsSubmitting(false);
        return;
      }

      const campaignData = {
        name: data.name,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget ? Number(data.budget) : null,
        goalType: data.goalType || CampaignGoalType.ENGAGEMENT,
        customGoal: data.customGoal || null,
        status: data.status || CampaignStatus.draft,
        organizationId: organization.id,
        clientId: data.clientId && data.clientId !== '' && data.clientId !== 'none' ? data.clientId : null,
        projectId: data.projectId || null,
        scheduleFrequency: data.scheduleFrequency || ScheduleFrequency.ONCE,
        timezone: data.timezone || 'UTC'
      };

      console.log('Sending campaign data:', campaignData);

      const response = await createCampaign(campaignData);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Campaign creation error details:', errorData);
        
        // Handle different error formats
        if (Array.isArray(errorData.details)) {
          // Handle validation errors as an array
          const errorMessages = errorData.details.map((err: any) => 
            `${err.path}: ${err.message}`
          ).join('\n');
          setSubmitError(errorMessages);
        } else {
          // Handle string details or generic error
          setSubmitError(errorData.error + (errorData.details ? `: ${errorData.details}` : ''));
        }
        return;
      }

      // Campaign created successfully
      const campaign = await response.json();
      
      // Show success toast
      toast({
        title: "Campaign Created",
        description: `${campaign.name} has been created successfully.`,
        variant: "success",
      });
      
      // Reset form
      form.reset();
      
      // Redirect to campaigns list
      setTimeout(() => {
        router.push('/campaigns');
      }, 1500);
      
    } catch (_error) {
      console.error("", _error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to apply smart suggestions
  const applySuggestion = (field: keyof CampaignFormData, value: string) => {
    form.setValue(field, value);
  };

  // Render step content
  const renderStepContent = () => {
    const currentStepConfig = WIZARD_STEPS[currentStep];
    
    switch (currentStepConfig.id) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Smart Suggestion</span>
              </div>
              <p className="text-sm text-primary/80 mb-3">
                Based on your organization, we suggest: "{suggestions.name}"
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applySuggestion('name', suggestions.name)}
                className="text-primary border-primary/30"
              >
                Use Suggestion
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a descriptive name for your campaign" 
                      {...field} 
                      className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this campaign is about, who it targets, and what you hope to achieve..."
                      {...field} 
                      value={field.value || ''}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="goalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Goal Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CampaignGoalType).map(type => (
                        <SelectItem key={type} value={type}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {GOAL_TYPE_DESCRIPTIONS[type]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Goal Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your specific goals and success metrics..."
                      {...field} 
                      value={field.value || ''}
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Recommended Timeline</span>
              </div>
              <p className="text-sm text-success/80 mb-3">
                Start next week and run for 30 days for optimal results
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestion('startDate', suggestions.startDate)}
                  className="text-success border-success/30"
                >
                  Use Start Date
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestion('endDate', suggestions.endDate)}
                  className="text-success border-success/30"
                >
                  Use End Date
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString() || '')}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString() || '')}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduleFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How often to run" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ScheduleFrequency).map(freq => (
                          <SelectItem key={freq} value={freq}>
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., America/New_York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning">Budget Recommendation</span>
              </div>
              <p className="text-sm text-warning/80 mb-3">
                Based on similar campaigns, we recommend a budget of ${suggestions.budget}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applySuggestion('budget', suggestions.budget)}
                className="text-warning border-warning/30"
              >
                Use Suggested Budget
              </Button>
            </div>

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="Enter your budget (e.g., 5000)"
                        className="pl-10 text-lg"
                        min="0"
                        step="100"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Leave blank if budget is not yet determined
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a client (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No client selected</SelectItem>
                      {isLoadingClients ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading clients...
                          </div>
                        </SelectItem>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id} className="h-12 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                client.status === 'ACTIVE' ? 'bg-success' : 
                                client.status === 'INACTIVE' ? 'bg-muted' : 
                                'bg-warning'
                              }`}></div>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                  {client.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Status: {client.status}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Link this campaign to a specific client for better organization and reporting
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select initial status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CampaignStatus).map(status => (
                        <SelectItem key={status} value={status} className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'active' ? 'bg-success' : 
                              status === 'draft' ? 'bg-muted' : 
                              status === 'completed' ? 'bg-primary' :
                              status === 'paused' ? 'bg-warning' :
                              'bg-destructive'
                            }`}></div>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {status === 'draft' && 'Campaign is being prepared'}
                                {status === 'active' && 'Campaign is currently running'}
                                {status === 'completed' && 'Campaign has finished'}
                                {status === 'paused' && 'Campaign is temporarily stopped'}
                                {status === 'cancelled' && 'Campaign has been cancelled'}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading while organization is loading
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading organization...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Create New Campaign</h1>
              <Badge variant="outline" className="text-sm">
                Step {currentStep + 1} of {totalSteps}
              </Badge>
            </div>
            
            <Progress value={progressPercentage} className="mb-6" />
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                      index === currentStep
                        ? "bg-primary text-primary-foreground border-primary"
                        : completedSteps.includes(index)
                        ? "bg-success text-success-foreground border-success"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {completedSteps.includes(index) ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      React.createElement(step.icon, { className: "h-5 w-5" })
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={cn(
                      "text-sm font-medium",
                      index === currentStep ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "h-5 w-5" })}
                {WIZARD_STEPS[currentStep].title}
              </CardTitle>
              <p className="text-muted-foreground">
                {WIZARD_STEPS[currentStep].description}
              </p>
            </CardHeader>
            <CardContent>
              {submitError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
                  {submitError}
                </div>
              )}
              
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              
              {currentStep < totalSteps - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isCurrentStepValid()}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateCampaign;
