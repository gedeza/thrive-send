'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Grid, MenuItem,
  FormControl, InputLabel, Select, Divider, CircularProgress, Alert, FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// --- ENUMS ---
const CAMPAIGN_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
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

// --- Types ---
type Organization = { id: string; name: string };
type Client = { id: string; name: string };
type Project = { id: string; name: string };

interface CampaignFormData {
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | '';
  goals: string;
  status: string;
  organizationId: string;
  clientId: string;
  projectId: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const initialFormData: CampaignFormData = {
  name: '',
  description: '',
  startDate: null,
  endDate: null,
  budget: '',
  goals: '',
  status: 'DRAFT',
  organizationId: '',
  clientId: '',
  projectId: '',
};

const CreateCampaign: React.FC = () => {
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch dropdown options ---
  useEffect(() => {
    (async function fetchDropdowns() {
      setLoading(true);
      try {
        // First fetch organizations
        const orgsResponse = await fetch('/api/organizations').then(async r => {
          if (!r.ok) {
            throw new Error(`Organizations API error: ${r.status}`);
          }
          return r.json();
        });

        const orgs = Array.isArray(orgsResponse) ? orgsResponse : [];
        setOrganizations(orgs);

        // If we have organizations, use the first one's ID to fetch clients and projects
        if (orgs.length > 0) {
          const organizationId = orgs[0].id;
          setFormData(prev => ({ ...prev, organizationId }));

          const [clisResponse, prosResponse] = await Promise.all([
            fetch(`/api/clients?organizationId=${organizationId}`).then(async r => {
              if (!r.ok) {
                throw new Error(`Clients API error: ${r.status}`);
              }
              return r.json();
            }),
            fetch(`/api/projects?organizationId=${organizationId}`).then(async r => {
              if (!r.ok) {
                throw new Error(`Projects API error: ${r.status}`);
              }
              return r.json();
            }),
          ]);

          const clis = Array.isArray(clisResponse) ? clisResponse : [];
          const pros = Array.isArray(prosResponse) ? prosResponse : [];

          setClients(clis);
          setProjects(pros);

          if (!Array.isArray(clisResponse) || !Array.isArray(prosResponse)) {
            console.error('API responses were not arrays:', { clisResponse, prosResponse });
            setSubmitError("Failed to load client/project options. Please try again.");
          }
        }
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
        setSubmitError("Failed to load organization/client/project options. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate)
      newErrors.endDate = "End date must be after start date";
    if (!formData.status) newErrors.status = "Select a status";
    if (!formData.organizationId) newErrors.organizationId = "Organization required";
    if (formData.budget !== '' && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0))
      newErrors.budget = "Budget must be a positive number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Change Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
    setErrors((prev) => ({ ...prev, [name as string]: undefined }));
  };
  const handleDateChange = (name: "startDate" | "endDate", date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // --- Submit Handler ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        budget: formData.budget === '' ? null : Number(formData.budget),
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined,
      };
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create campaign");
      setSubmitSuccess(true);
      setFormData(initialFormData);
    } catch (err: any) {
      setSubmitError(err.message || "Server error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- JSX ---
  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <StyledPaper>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Create New Campaign
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fill out the details below to create a new marketing campaign. Required fields are marked with an asterisk (*).
        </Typography>
        <Divider sx={{ my: 3 }}/>

        {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>Campaign created successfully!</Alert>}
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        {loading && <Box sx={{ display: "flex", justifyContent: "center", pb: 3 }}><CircularProgress size={24}/></Box>}

        {/* Basic Information */}
        <FormSection>
          <SectionTitle variant="h6">Basic Information</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start with the essential details about your campaign.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth required label="Campaign Name" name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name} helperText={errors.name || "Enter a descriptive name for your campaign"}
                placeholder="e.g., Summer Product Launch 2024"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.status}>
                <InputLabel id="status-label">Campaign Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Campaign Status"
                >
                  {CAMPAIGN_STATUSES.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
                <FormHelperText>
                  {errors.status || "Set the current state of your campaign"}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={3} label="Campaign Description"
                name="description" value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this campaign aims to achieve and its key focus areas"
                helperText="Provide a clear overview of your campaign's purpose and scope"
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Campaign Timeline */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Timeline</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set when your campaign will start and end.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Campaign Start Date" value={formData.startDate}
                  onChange={date => handleDateChange("startDate", date)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      error: !!errors.startDate, 
                      helperText: errors.startDate || "When should the campaign begin?" 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Campaign End Date" value={formData.endDate}
                  onChange={date => handleDateChange("endDate", date)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      error: !!errors.endDate, 
                      helperText: errors.endDate || "When should the campaign conclude?" 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </FormSection>

        {/* Campaign Budget */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Budget</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set your campaign's budget (optional).
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Total Budget ($)" name="budget" type="number"
                value={formData.budget} onChange={handleChange}
                error={!!errors.budget} 
                helperText={errors.budget || "Enter the total budget allocated for this campaign"}
                placeholder="e.g., 5000"
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Campaign Connections */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Connections</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Link this campaign to your organization and optionally to a specific client or project.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required error={!!errors.organizationId}>
                <InputLabel id="org-label">Your Organization</InputLabel>
                <Select
                  labelId="org-label"
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  label="Your Organization"
                >
                  {Array.isArray(organizations) && organizations.map(org =>
                    <MenuItem value={org.id} key={org.id}>{org.name}</MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {errors.organizationId || "Select the organization this campaign belongs to"}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="client-label">Related Client</InputLabel>
                <Select
                  labelId="client-label"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  label="Related Client"
                >
                  <MenuItem value="">No Client Selected</MenuItem>
                  {Array.isArray(clients) && clients.map(cli =>
                    <MenuItem value={cli.id} key={cli.id}>{cli.name}</MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  Optional: Select if this campaign is for a specific client
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="project-label">Related Project</InputLabel>
                <Select
                  labelId="project-label"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  label="Related Project"
                >
                  <MenuItem value="">No Project Selected</MenuItem>
                  {Array.isArray(projects) && projects.map(proj =>
                    <MenuItem value={proj.id} key={proj.id}>{proj.name}</MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  Optional: Select if this campaign is part of a larger project
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>

        {/* Campaign Goals */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Goals & Success Metrics</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define what success looks like for this campaign.
          </Typography>
          <TextField
            fullWidth multiline minRows={4} name="goals"
            label="Campaign Goals & Success Metrics"
            value={formData.goals}
            onChange={handleChange}
            placeholder="List your campaign's main objectives, target metrics, and KPIs. For example:
• Increase brand awareness by 25%
• Generate 1000 new leads
• Achieve 5% conversion rate"
            helperText="Be specific about what you want to achieve and how you'll measure success"
          />
        </FormSection>
        
        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting || loading}
            startIcon={isSubmitting ? <CircularProgress color="inherit" size={20}/> : undefined}
          >
            {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
          </Button>
        </Box>
      </StyledPaper>
    </form>
  );
};

export default CreateCampaign;
