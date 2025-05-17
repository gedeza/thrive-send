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
        // -- These endpoints must return arrays of {id, name}
        const [orgsResponse, clisResponse, prosResponse] = await Promise.all([
          fetch('/api/organizations').then(async r => {
            if (!r.ok) {
              throw new Error(`Organizations API error: ${r.status}`);
            }
            return r.json();
          }),
          fetch('/api/clients').then(async r => {
            if (!r.ok) {
              throw new Error(`Clients API error: ${r.status}`);
            }
            return r.json();
          }),
          fetch('/api/projects').then(async r => {
            if (!r.ok) {
              throw new Error(`Projects API error: ${r.status}`);
            }
            return r.json();
          }),
        ]);

        console.log('API Responses:', {
          organizations: orgsResponse,
          clients: clisResponse,
          projects: prosResponse
        });

        // Ensure we have arrays and handle potential error responses
        const orgs = Array.isArray(orgsResponse) ? orgsResponse : [];
        const clis = Array.isArray(clisResponse) ? clisResponse : [];
        const pros = Array.isArray(prosResponse) ? prosResponse : [];

        console.log('Processed Arrays:', {
          organizations: orgs,
          clients: clis,
          projects: pros
        });

        setOrganizations(orgs);
        setClients(clis);
        setProjects(pros);

        if (!Array.isArray(orgsResponse) || !Array.isArray(clisResponse) || !Array.isArray(prosResponse)) {
          console.error('API responses were not arrays:', { orgsResponse, clisResponse, prosResponse });
          setSubmitError("Failed to load organization/client/project options. Please try again.");
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
          Create Campaign
        </Typography>
        <Divider sx={{ my: 3 }}/>

        {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>Campaign created!</Alert>}
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        {loading && <Box sx={{ display: "flex", justifyContent: "center", pb: 3 }}><CircularProgress size={24}/></Box>}

        {/* Campaign Details */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Details</SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth required label="Name" name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name} helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.status}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {CAMPAIGN_STATUSES.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={3} label="Description"
                name="description" value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Timing & Budget */}
        <FormSection>
          <SectionTitle variant="h6">Timing and Financial</SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date" value={formData.startDate}
                  onChange={date => handleDateChange("startDate", date)}
                  slotProps={{ textField: { fullWidth: true, error: !!errors.startDate, helperText: errors.startDate } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date" value={formData.endDate}
                  onChange={date => handleDateChange("endDate", date)}
                  slotProps={{ textField: { fullWidth: true, error: !!errors.endDate, helperText: errors.endDate } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth label="Budget ($)" name="budget" type="number"
                value={formData.budget} onChange={handleChange}
                error={!!errors.budget} helperText={errors.budget}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Associations */}
        <FormSection>
          <SectionTitle variant="h6">Associations</SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required error={!!errors.organizationId}>
                <InputLabel id="org-label">Organization</InputLabel>
                <Select
                  labelId="org-label"
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  label="Organization"
                >
                  {Array.isArray(organizations) && organizations.map(org =>
                    <MenuItem value={org.id} key={org.id}>{org.name}</MenuItem>
                  )}
                </Select>
                {errors.organizationId && <FormHelperText>{errors.organizationId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="client-label">Client (optional)</InputLabel>
                <Select
                  labelId="client-label"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  label="Client (optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {Array.isArray(clients) && clients.map(cli =>
                    <MenuItem value={cli.id} key={cli.id}>{cli.name}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="project-label">Project (optional)</InputLabel>
                <Select
                  labelId="project-label"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  label="Project (optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {Array.isArray(projects) && projects.map(proj =>
                    <MenuItem value={proj.id} key={proj.id}>{proj.name}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>

        {/* Objectives */}
        <FormSection>
          <SectionTitle variant="h6">Goals & Objectives</SectionTitle>
          <TextField
            fullWidth multiline minRows={4} name="goals"
            label="Goals / Objectives"
            value={formData.goals}
            onChange={handleChange}
            placeholder="Describe the campaign's main objectives, KPIs etc."
          />
        </FormSection>
        
        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting || loading}
            startIcon={isSubmitting ? <CircularProgress color="inherit" size={20}/> : undefined}
          >
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </Button>
        </Box>
      </StyledPaper>
    </form>
  );
};

export default CreateCampaign;
