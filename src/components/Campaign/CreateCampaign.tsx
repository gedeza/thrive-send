'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
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
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  scheduleFrequency: z.nativeEnum(ScheduleFrequency),
  timezone: z.string()
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

// --- Component Styles ---
// Using Tailwind CSS classes instead of styled-components

const CreateCampaign: React.FC = () => {
  const { organization } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

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
      goalType: CampaignGoalType.ENGAGEMENT,
      customGoal: null,
      status: CampaignStatus.draft,
      organizationId: organization?.id || '',
      clientId: '',
      projectId: '',
      scheduleFrequency: ScheduleFrequency.ONCE,
      timezone: 'UTC'
    }
  });

  useEffect(() => {
    if (organization?.id) {
      form.setValue('organizationId', organization.id);
    }
  }, [organization?.id, form]);

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
        clientId: data.clientId || null,
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
      
    } catch (error) {
      console.error('Campaign creation error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="p-6 md:p-8 shadow-lg rounded-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">
                Create New Campaign
              </CardTitle>
              <p className="text-muted-foreground">
                Fill out the details below to create a new marketing campaign. Required fields are marked with an asterisk (*).
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with the essential details about your campaign.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter campaign name" {...field} />
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
                            placeholder="Enter campaign description" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CampaignStatus).map(status => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
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
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
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
                                  <span>Pick a date</span>
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
                        <FormLabel>End Date</FormLabel>
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
                                  <span>Pick a date</span>
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
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter budget" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goalType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CampaignGoalType).map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
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
                        <FormLabel>Custom Goal</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter custom goal" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduleFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
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
                          <Input placeholder="Enter timezone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Campaign'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default CreateCampaign;
