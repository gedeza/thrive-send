'use client';

import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem,
  FormControl, InputLabel, Select, Divider, CircularProgress, Alert,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';
import { createCampaign, type CampaignData } from '@/lib/api';
import type { SelectChangeEvent } from '@mui/material/Select';

// --- Types ---
interface FormErrors {
  [key: string]: string;
}

const initialFormData: CampaignData = {
  name: '',
  type: '',
  scheduleDate: null,
  description: '',
  subject: '',
  senderName: '',
  senderEmail: '',
  audiences: []
};

const CAMPAIGN_TYPES = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'announcement', label: 'Announcement' }
];

const AUDIENCE_SEGMENTS = [
  { value: 'all-subscribers', label: 'All Subscribers' },
  { value: 'active-users', label: 'Active Users' },
  { value: 'inactive-users', label: 'Inactive Users' }
];

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
  const [formData, setFormData] = useState<CampaignData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.type) newErrors.type = 'Campaign type is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject line is required';
    if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required';
    if (!formData.senderEmail.trim()) newErrors.senderEmail = 'Sender email is required';
    if (formData.audiences.length === 0) newErrors.audiences = 'Please select at least one audience segment';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, scheduleDate: date }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.scheduleDate;
      return newErrors;
    });
  };

  const handleAudienceChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setFormData(prev => ({ ...prev, audiences: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.audiences;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await createCampaign(formData);
      // Reset form on success
      setFormData(initialFormData);
      // Show success message (you might want to add a success state)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit} autoComplete="off">
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
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />

              <FormControl fullWidth error={!!errors.type} required>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Campaign Type"
                >
                  {CAMPAIGN_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>

              <DatePicker
                label="Schedule Date"
                value={formData.scheduleDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.scheduleDate,
                    helperText: errors.scheduleDate
                  }
                }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Box>
          </FormSection>

          <FormSection>
            <SectionTitle variant="h6">Email Details</SectionTitle>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure the email content and sender information.
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="Subject Line"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={!!errors.subject}
                helperText={errors.subject}
                required
              />

              <TextField
                fullWidth
                label="Sender Name"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                error={!!errors.senderName}
                helperText={errors.senderName}
                required
              />

              <TextField
                fullWidth
                label="Sender Email"
                name="senderEmail"
                type="email"
                value={formData.senderEmail}
                onChange={handleChange}
                error={!!errors.senderEmail}
                helperText={errors.senderEmail}
                required
              />
            </Box>
          </FormSection>

          <FormSection>
            <SectionTitle variant="h6">Audience</SectionTitle>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select the audience segments for this campaign.
            </Typography>

            <FormControl fullWidth error={!!errors.audiences} required>
              <InputLabel>Select Audience Segments</InputLabel>
              <Select
                multiple
                value={formData.audiences}
                onChange={handleAudienceChange}
                label="Select Audience Segments"
              >
                {AUDIENCE_SEGMENTS.map(segment => (
                  <MenuItem key={segment.value} value={segment.value}>
                    {segment.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.audiences && <FormHelperText>{errors.audiences}</FormHelperText>}
            </FormControl>
          </FormSection>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </Box>
        </StyledPaper>
      </form>
    </LocalizationProvider>
  );
};

export default CreateCampaign;
