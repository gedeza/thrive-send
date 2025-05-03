import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface ContentFormData {
  title: string;
  contentType: string;
  body: string;
  tags: string[];
  mediaFiles: File[];
}

const initialFormState: ContentFormData = {
  title: '',
  contentType: 'article',
  body: '',
  tags: [],
  mediaFiles: []
};

const ContentForm: React.FC = () => {
  const [formData, setFormData] = useState<ContentFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...filesArray]
      }));
    }
  };

  const handleFileDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Submitting content data:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful submission
      setFormData(initialFormState);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create Content
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="title"
              label="Content Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="content-type-label">Content Type</InputLabel>
              <Select
                labelId="content-type-label"
                id="contentType"
                name="contentType"
                value={formData.contentType}
                label="Content Type"
                onChange={handleChange}
              >
                <MenuItem value="article">Article</MenuItem>
                <MenuItem value="blog">Blog Post</MenuItem>
                <MenuItem value="social">Social Media Post</MenuItem>
                <MenuItem value="email">Email Campaign</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="body"
              label="Content Body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              multiline
              rows={6}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                id="newTag"
                label="Add Tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
                variant="outlined"
              />
              <Button 
                onClick={handleTagAdd} 
                variant="contained" 
                sx={{ ml: 1, height: 56 }}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload Media
              <input
                type="file"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            <Stack spacing={1}>
              {formData.mediaFiles.map((file, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Typography>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleFileDelete(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Content'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ContentForm;