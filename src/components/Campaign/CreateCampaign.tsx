import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Chip,
  Divider,
  FormHelperText,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// Styled components
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

// Campaign types
const campaignTypes = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'event', label: 'Event Invitation' },
  { value: 'survey', label: 'Survey' },
];

// Audience segments
const audienceSegments = [
  { value: 'all-subscribers', label: 'All Subscribers' },
  { value: 'active-users', label: 'Active Users' },
  { value: 'new-customers', label: 'New Customers' },
  { value: 'inactive-users', label: 'Inactive Users' },
  { value: 'high-value', label: 'High Value Customers' },
];

interface CampaignFormData {
  name: string;
  description: string;
  type: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  audiences: string[];
  scheduledDate: Date | null;
}

interface FormErrors {
  name?: string;
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  audiences?: string;
}

const initialFormData: CampaignFormData = {
  name: '',
  description: '',
  type: '',
  subject: '',
  senderName: '',
  senderEmail: '',
  audiences: [],
  scheduledDate: null,
};

const CreateCampaign: React.FC = () => {
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Handle text/select input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when field is edited
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, scheduledDate: date }));
  };
  
  // Handle audience selection change
  const handleAudienceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[];
    setFormData(prev => ({ ...prev, audiences: value }));
    
    if (errors.audiences) {
      setErrors(prev => ({ ...prev, audiences: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject line is required';
    }
    
    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Sender name is required';
    }
    
    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Sender email is required';
    } else {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.senderEmail)) {
        newErrors.senderEmail = 'Please enter a valid email address';
      }
    }
    
    if (formData.audiences.length === 0) {
      newErrors.audiences = 'Please select at least one audience segment';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset submission states
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Campaign data submitted:', formData);
      
      // Show success message
      setSubmitSuccess(true);
      
      // Reset form after success (optional)
      // setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting campaign:', error);
      setSubmitError('An error occurred while creating the campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <StyledPaper>
        {/* Header */}
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          Create New Campaign
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Fill in the details below to create a new email campaign.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Success message */}
        {submitSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSubmitSuccess(false)}
          >
            <AlertTitle>Success</AlertTitle>
            Campaign created successfully! You can now proceed to the content editor.
          </Alert>
        )}
        
        {/* Error message */}
        {submitError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setSubmitError('')}
          >
            <AlertTitle>Error</AlertTitle>
            {submitError}
          </Alert>
        )}
        
        {/* Campaign Details Section */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Details</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="Summer Sale Announcement"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="campaign-type-label">Campaign Type</InputLabel>
                <Select
                  labelId="campaign-type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Campaign Type"
                >
                  {campaignTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Schedule Date"
                  value={formData.scheduledDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Describe the purpose of this campaign"
              />
            </Grid>
          </Grid>
        </FormSection>
        
        {/* Email Details Section */}
        <FormSection>
          <SectionTitle variant="h6">Email Details</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Line"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={!!errors.subject}
                helperText={errors.subject}
                placeholder="Don't Miss Our Summer Sale!"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Name"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                error={!!errors.senderName}
                helperText={errors.senderName}
                placeholder="Your Company Name"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Email"
                name="senderEmail"
                type="email"
                value={formData.senderEmail}
                onChange={handleChange}
                error={!!errors.senderEmail}
                helperText={errors.senderEmail}
                placeholder="marketing@yourcompany.com"
                required
              />
            </Grid>
          </Grid>
        </FormSection>
        
        {/* Audience Section */}
        <FormSection>
          <SectionTitle variant="h6">Target Audience</SectionTitle>
          
          <FormControl 
            fullWidth 
            error={!!errors.audiences}
          >
            <InputLabel id="audience-label">Select Audience Segments</InputLabel>
            <Select
              labelId="audience-label"
              id="audiences"
              name="audiences"
              multiple
              value={formData.audiences}
              onChange={handleAudienceChange}
              label="Select Audience Segments"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const segment = audienceSegments.find(seg => seg.value === value);
                    return (
                      <Chip key={value} label={segment?.label || value} />
                    );
                  })}
                </Box>
              )}
            >
              {audienceSegments.map((segment) => (
                <MenuItem key={segment.value} value={segment.value}>
                  {segment.label}
                </MenuItem>
              ))}
            </Select>
            {errors.audiences && (
              <FormHelperText>{errors.audiences}</FormHelperText>
            )}
          </FormControl>
        </FormSection>
        
        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </Box>
      </StyledPaper>
    </form>
  );
};

export default CreateCampaign;