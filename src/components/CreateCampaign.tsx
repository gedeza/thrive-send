import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  target: string;
}

const initialFormState: CampaignFormData = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '',
  target: ''
};

const CreateCampaign: React.FC = () => {
  const [formData, setFormData] = useState<CampaignFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Submitting campaign data:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful submission
      setFormData(initialFormState);
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for responsive columns
  const halfWidthSx = { gridColumn: { xs: 'span 12', sm: 'span 6' } };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Campaign
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container columns={12} spacing={3}>
          <Grid span={12}>
            <TextField
              required
              fullWidth
              id="name"
              label="Campaign Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid span={12}>
            <TextField
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              variant="outlined"
            />
          </Grid>
          
          <Grid span={12} sx={halfWidthSx}>
            <TextField
              required
              fullWidth
              id="startDate"
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          
          <Grid span={12} sx={halfWidthSx}>
            <TextField
              required
              fullWidth
              id="endDate"
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          
          <Grid span={12} sx={halfWidthSx}>
            <TextField
              required
              fullWidth
              id="budget"
              label="Budget ($)"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid span={12} sx={halfWidthSx}>
            <TextField
              fullWidth
              id="target"
              label="Target Audience"
              name="target"
              value={formData.target}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid span={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateCampaign;
