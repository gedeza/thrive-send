import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { Button } from '@/components/ui/button'; // Use custom DS button
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ContentFormProps {
  initialDate?: string | null;
}

const ContentForm: React.FC<ContentFormProps> = ({ initialDate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Submitting content:', {
        title,
        content,
        publishDate: selectedDate,
        tags,
        category
      });
      
      setSuccess(true);
      // Reset form after successful submission
      // setTitle('');
      // setContent('');
      // setTags([]);
      // setCategory('');
    } catch (err) {
      console.error('Error submitting content:', err);
      setError('An error occurred while saving content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        e.currentTarget.value = '';
      }
    }
  };

  const categories = [
    'Blog Post',
    'Social Media',
    'Email Newsletter',
    'Press Release',
    'Product Update',
    'Announcement'
  ];
  
  // Responsive "span" logic using sx prop for flexibility
  const halfWidthSx = { gridColumn: { xs: 'span 12', md: 'span 6' } };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {success && (
        <Box mb={3} p={2} bgcolor="success.light" color="success.contrastText" borderRadius={1}>
          <Typography>Content saved successfully!</Typography>
        </Box>
      )}
      
      {error && (
        <Box mb={3} p={2} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
          <Typography>{error}</Typography>
        </Box>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} columns={12}>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              variant="outlined"
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={(e) => setCategory(e.target.value as string)}
                label="Category"
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Publish Date"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Tags"
              placeholder="Type and press Enter to add tags"
              onKeyDown={handleTagAdd}
              disabled={isSubmitting}
              helperText="Add tags to categorize your content"
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              disabled={isSubmitting}
              placeholder="Write your content here..."
            />
          </Grid>
          
          <Grid xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outline"
                size="md"
                disabled={isSubmitting}
                type="button"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {isSubmitting ? 'Saving...' : 'Publish Content'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ContentForm;


const onSubmit = async (data: ContentFormData) => {
  try {
    setIsSubmitting(true);
    
    let result;
    if (isEditing && content?.id) {
      result = await updateContent(content.id, data);
    } else {
      result = await createContent(data);
    }

    if (result.success) {
      // Wait for calendar event creation to complete
      if (result.data?.id && (data.status === 'PUBLISHED' || data.status === 'APPROVED')) {
        await createCalendarEventFromContent(result.data);
      }
      
      // Now invalidate caches after calendar sync
      await queryClient.invalidateQueries({ queryKey: ['content'] });
      await queryClient.invalidateQueries({ queryKey: ['content-lists'] });
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      
      toast.success(isEditing ? 'Content updated successfully!' : 'Content created successfully!');
      
      if (onSuccess) {
        onSuccess(result.data);
      } else {
        router.push(isEditing ? '/content' : '/content');
      }
    }
  } catch (error) {
    // ... existing code ...
  }
};

const createContentMutation = useMutation({
  mutationFn: createContent,
  onMutate: async (newContent) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['content'] });
    
    // Snapshot previous value
    const previousContent = queryClient.getQueryData(['content']);
    
    // Optimistically update
    queryClient.setQueryData(['content'], (old: any) => {
      return {
        ...old,
        data: [newContent, ...(old?.data || [])]
      };
    });
    
    return { previousContent };
  },
  onError: (err, newContent, context) => {
    // Rollback on error
    queryClient.setQueryData(['content'], context?.previousContent);
  },
  onSettled: () => {
    // Always refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['content'] });
  },
});
