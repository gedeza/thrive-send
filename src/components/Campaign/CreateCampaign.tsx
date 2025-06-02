'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem,
  FormControl as MuiFormControl,
  InputLabel, Select, Divider, CircularProgress, Alert,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';
import { createCampaign } from '@/lib/api';
import type { SelectChangeEvent } from '@mui/material/Select';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

// --- Styled Components ---
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>
              Create New Campaign
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Fill out the details below to create a new marketing campaign. Required fields are marked with an asterisk (*).
            </Typography>
            <Divider sx={{ my: 2 }} />

            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}

            <FormSection>
              <SectionTitle variant="h6">Basic Information</SectionTitle>
              <Typography variant="body2" color="text.secondary" paragraph>
                Start with the essential details about your campaign.
              </Typography>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
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
                      <MuiFormControl fullWidth error={!!form.formState.errors.status} required>
                        <InputLabel>Status</InputLabel>
                        <Select
                          {...field}
                          label="Status"
                        >
                          {Object.values(CampaignStatus).map(status => (
                            <MenuItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                        {form.formState.errors.status && <FormHelperText>{form.formState.errors.status.message}</FormHelperText>}
                      </MuiFormControl>
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
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date?.toISOString() || '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!form.formState.errors.startDate,
                            helperText: form.formState.errors.startDate?.message
                          }
                        }}
                      />
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
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date?.toISOString() || '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!form.formState.errors.endDate,
                            helperText: form.formState.errors.endDate?.message
                          }
                        }}
                      />
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
                      <Select
                        {...field}
                        label="Goal Type"
                      >
                        {Object.values(CampaignGoalType).map(type => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
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
                      <Select
                        {...field}
                        label="Schedule Frequency"
                      >
                        {Object.values(ScheduleFrequency).map(freq => (
                          <MenuItem key={freq} value={freq}>
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </MenuItem>
                        ))}
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
              </Box>
            </FormSection>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
              </Button>
            </Box>
          </StyledPaper>
        </form>
      </Form>
    </LocalizationProvider>
  );
};

export default CreateCampaign;
