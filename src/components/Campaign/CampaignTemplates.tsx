import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RichTextEditor } from '@/components/rich-text-editor';

interface Template {
  id: string;
  name: string;
  description: string | null;
  content: string | null;
  category: string;
  status: string;
  previewImage: string | null;
  organizationId: string;
  authorId: string;
  createdAt: string;
  lastUpdated: string;
}

interface CampaignTemplatesProps {
  organizationId: string;
}

export function CampaignTemplates({ organizationId }: CampaignTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: '',
    previewImage: '',
  });

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch(`/api/campaign-templates?organizationId=${organizationId}`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, [organizationId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/campaign-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create template');
      
      const newTemplate = await response.json();
      setTemplates([...templates, newTemplate]);
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle dialog open/close
  const handleOpenDialog = (template?: Template) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        content: template.content || '',
        category: template.category,
        previewImage: template.previewImage || '',
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: '',
        description: '',
        content: '',
        category: '',
        previewImage: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      description: '',
      content: '',
      category: '',
      previewImage: '',
    });
  };

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Campaign Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Template
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3,
        p: 3
      }}>
        {templates.map((template) => (
          <Card key={template.id}>
            {template.previewImage && (
              <CardMedia
                component="img"
                height="140"
                image={template.previewImage}
                alt={template.name}
              />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {template.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {template.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Category: {template.category}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => handleOpenDialog(template)}>
                  <EditIcon />
                </IconButton>
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
                required
              >
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="SOCIAL">Social Media</MenuItem>
                <MenuItem value="PUSH">Push Notification</MenuItem>
                <MenuItem value="SMS">SMS</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Preview Image URL"
              value={formData.previewImage}
              onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Template Content
              </Typography>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 