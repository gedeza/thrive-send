'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { uploadMedia, saveContent } from '../../lib/api';
import RichTextEditor from './RichTextEditor';

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
const MediaPreviewItem = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));
const UploadButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

const contentTypes = [
  { value: 'html', label: 'HTML' },
  { value: 'text', label: 'Plain Text' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'amp', label: 'AMP' },
];

// For uploaded media file info
interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

interface ContentFormData {
  title: string;
  contentType: string;
  tags: string[];
  content: string;
  preheaderText: string;
  mediaFiles: UploadedFile[];
}
interface FormErrors {
  title?: string;
  content?: string;
  preheaderText?: string;
}
const initialFormData: ContentFormData = {
  title: '',
  contentType: 'html',
  tags: [],
  content: '',
  preheaderText: '',
  mediaFiles: [],
};

const ContentForm: React.FC = () => {
  const [formData, setFormData] = useState<ContentFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For all text/select fields (title, preheader, etc)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  // TipTap content update
  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
    if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
  };

  // Tags
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

  // File upload for MEDIA section (NOT editor-inserted images)
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadProgress(0);
      // Fake progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 12;
        });
      }, 120);

      const filesArray = Array.from(e.target.files);
      try {
        const uploaded = await Promise.all(
          filesArray.map(async (file) => {
            const res = await uploadMedia(file);
            return { url: res.url, name: file.name, size: file.size };
          })
        );
        setFormData(prev => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, ...uploaded]
        }));
      } catch (err) {
        setSubmitError('Media upload failed.');
      } finally {
        e.target.value = '';
        setTimeout(() => setUploadProgress(null), 400);
      }
    }
  };
  const handleFileDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Content title is required';
    if (!formData.content.trim()) newErrors.content = 'Content cannot be empty';
    if (formData.preheaderText.length > 100) newErrors.preheaderText = 'Preheader text must be less than 100 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await saveContent(formData);
      setSubmitSuccess(true);
      setFormData(initialFormData); // Optionally reset form
    } catch (error) {
      setSubmitError('An error occurred while saving content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit}>
      <StyledPaper>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          Create Content
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and edit content for your marketing campaigns.
        </Typography>
        <Divider sx={{ my: 3 }} />
        {submitSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSubmitSuccess(false)}
          >
            <AlertTitle>Success</AlertTitle>
            Content saved successfully!
          </Alert>
        )}
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
        {/* Content Details */}
        <FormSection>
          <SectionTitle variant="h6">Content Details</SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Summer Sale Announcement"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="content-type-label">Content Type</InputLabel>
                <Select
                  labelId="content-type-label"
                  id="contentType"
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleChange}
                  label="Content Type"
                >
                  {contentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preheader Text"
                name="preheaderText"
                value={formData.preheaderText}
                onChange={handleChange}
                placeholder="Brief preview text that recipients will see in their inbox"
                error={!!errors.preheaderText}
                helperText={errors.preheaderText || `${formData.preheaderText.length}/100 characters`}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
          </Grid>
        </FormSection>
        {/* Tags Section */}
        <FormSection>
          <SectionTitle variant="h6">Tags</SectionTitle>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  label="Add Tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter tag and click Add"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTagAdd}
                          edge="end"
                          disabled={!newTag.trim()}
                        >
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
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
            {formData.tags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No tags added yet
              </Typography>
            )}
          </Box>
        </FormSection>
        {/* Content Editor Section */}
        <FormSection>
          <SectionTitle variant="h6">Content</SectionTitle>
          <Box
            sx={{
              border: errors.content ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: 1,
              minHeight: 320,
              p: 2,
              mb: 1,
              backgroundColor: 'white'
            }}
          >
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
            />
          </Box>
          {errors.content && (
            <Typography color="error" variant="caption">
              {errors.content}
            </Typography>
          )}
        </FormSection>
        {/* Media Section */}
        <FormSection>
          <SectionTitle variant="h6">Media Assets</SectionTitle>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
          <UploadButton
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleFileUploadClick}
          >
            Upload Media
          </UploadButton>
          {uploadProgress !== null && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
              />
              <Typography variant="caption" color="text.secondary">
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}
          <Stack spacing={1}>
            {formData.mediaFiles.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No media files uploaded yet
              </Typography>
            ) : (
              formData.mediaFiles.map((file, index) => (
                <MediaPreviewItem key={index}>
                  <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleFileDelete(index)}
                    aria-label="delete file"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </MediaPreviewItem>
              ))
            )}
          </Stack>
        </FormSection>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSubmitting ? 'Saving...' : 'Save Content'}
          </Button>
        </Box>
      </StyledPaper>
    </form>
  );
};

export default ContentForm;