'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem,
  FormControl, InputLabel, Select, Divider, CircularProgress, Alert, FormHelperText,
  Tabs, Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';
import { RichTextEditor } from '@/components/rich-text-editor';
import type { SelectChangeEvent } from '@mui/material/Select';

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
type Template = { id: string; name: string; description?: string; content?: string };

interface CampaignFormData {
  name: string;
  description: string;
  content: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | '';
  goals: string;
  status: string;
  organizationId: string;
  clientId: string;
  projectId: string;
  templateId: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const initialFormData: CampaignFormData = {
  name: '',
  description: '',
  content: '',
  startDate: null,
  endDate: null,
  budget: '',
  goals: '',
  status: 'DRAFT',
  organizationId: '',
  clientId: '',
  projectId: '',
  templateId: '',
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
  const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');
  const [templates, setTemplates] = useState<Template[]>([]);

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

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch(`/api/campaign-templates?organizationId=${formData.organizationId}`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } catch (err: any) {
        console.error('Error fetching templates:', err);
      }
    }
    if (formData.organizationId) {
      fetchTemplates();
    }
  }, [formData.organizationId]);

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
    if (!formData.content.trim()) newErrors.content = "Campaign content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Change Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
    setErrors((prev) => ({ ...prev, [name as string]: undefined }));
  };
  const handleDateChange = (name: "startDate" | "endDate", date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
    setErrors((prev) => ({ ...prev, content: undefined }));
  };

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        templateId,
        name: selectedTemplate.name,
        description: selectedTemplate.description || '',
        content: selectedTemplate.content || '',
      }));
    }
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
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gap: 3,
            p: 3
          }}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={formData.templateId || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  label="Template"
                >
                  <MenuItem value="">Create from scratch</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Box>

            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>

            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <span>$</span>
                }}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Typography variant="subtitle1" gutterBottom>
                Campaign Content
              </Typography>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
              />
            </Box>
          </Box>
        </FormSection>

        {/* Campaign Timeline */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Timeline</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set when your campaign will start and end.
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gap: 3,
            p: 3
          }}>
            <Box>
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
            </Box>
            <Box>
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
            </Box>
          </Box>
        </FormSection>

        {/* Campaign Budget */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Budget</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set your campaign's budget (optional).
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gap: 3,
            p: 3
          }}>
            <Box>
              <TextField
                fullWidth label="Total Budget ($)" name="budget" type="number"
                value={formData.budget} onChange={handleChange}
                error={!!errors.budget} 
                helperText={errors.budget || "Enter the total budget allocated for this campaign"}
                placeholder="e.g., 5000"
              />
            </Box>
          </Box>
        </FormSection>

        {/* Campaign Connections */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Connections</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Link this campaign to your organization and optionally to a specific client or project.
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)'
            },
            gap: 3,
            p: 3
          }}>
            <Box>
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
            </Box>
            <Box>
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
            </Box>
            <Box>
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
            </Box>
          </Box>
        </FormSection>

        {/* Template Selection */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Template</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a template to start with or create from scratch.
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gap: 3,
            p: 3
          }}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={formData.templateId || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  label="Template"
                >
                  <MenuItem value="">Create from scratch</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </FormSection>

        {/* Campaign Goals */}
        <FormSection>
          <SectionTitle variant="h6">Campaign Goals & Success Metrics</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define what success looks like for this campaign.
          </Typography>
          <Box sx={{ p: 3 }}>
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
          </Box>
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
