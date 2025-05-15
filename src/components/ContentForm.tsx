import React, { useState, useRef } from 'react';
import { theme } from '@/lib/theme';
import { hexToRgba } from '@/lib/colorUtils';
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
  Chip,
  Divider,
  InputAdornment,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';

// Tiptap Imports
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/common';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

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

// Tiptap Toolbar Component
const TiptapToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  // Set up prompt for link/image/table insertion
  const addImage = () => {
    const url = window.prompt('Enter image URL or leave blank to upload:');
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const items = [
    {
      tooltip: 'Undo',
      icon: <UndoIcon fontSize="small" />,
      action: () => editor.chain().focus().undo().run(),
      active: false
    },
    {
      tooltip: 'Redo',
      icon: <RedoIcon fontSize="small" />,
      action: () => editor.chain().focus().redo().run(),
      active: false
    },
    'divider',
    {
      tooltip: 'Bold',
      icon: <FormatBoldIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold')
    },
    {
      tooltip: 'Italic',
      icon: <FormatItalicIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic')
    },
    {
      tooltip: 'Underline',
      icon: <FormatUnderlinedIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive('underline')
    },
    {
      tooltip: 'Strike-through',
      icon: <StrikethroughSIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive('strike')
    },
    'divider',
    {
      tooltip: 'Heading',
      icon: <TitleIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 })
    },
    {
      tooltip: 'Bullet List',
      icon: <FormatListBulletedIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList')
    },
    {
      tooltip: 'Numbered List',
      icon: <FormatListNumberedIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList')
    },
    'divider',
    {
      tooltip: 'Block Quote',
      icon: <FormatQuoteIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive('blockquote')
    },
    {
      tooltip: 'Code',
      icon: <CodeIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive('code')
    },
    {
      tooltip: 'Code Block',
      icon: <CodeIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive('codeBlock')
    },
    'divider',
    {
      tooltip: 'Table',
      icon: <TableChartIcon fontSize="small" />,
      action: insertTable,
      active: editor.isActive('table')
    },
    {
      tooltip: 'Image',
      icon: <AddPhotoAlternateIcon fontSize="small" />,
      action: addImage,
      active: false
    },
    {
      tooltip: 'Link',
      icon: <LinkIcon fontSize="small" />,
      action: setLink,
      active: editor.isActive('link')
    }
  ];

  return (
    <Box sx={{
      borderBottom: `1px solid ${theme.colors.border}`,
      background: "#f9faff",
      px: 1,
      py: 1,
      mb: 1,
      borderRadius: '4px 4px 0 0',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 0.5
    }}>
      {items.map((item, idx) => {
        if (item === 'divider') {
          return <Box key={idx} component="span" sx={{ mx: 1, borderLeft: "1px solid #e5e7eb", height: 24 }} />;
        }
        return (
          <Tooltip title={item.tooltip} key={item.tooltip}>
            <span>
              <IconButton
                size="small"
                onClick={item.action}
                aria-label={item.tooltip}
                color={item.active ? "primary" : "default"}
              >
                {item.icon}
              </IconButton>
            </span>
          </Tooltip>
        );
      })}
    </Box>
  );
};

// Content types
const contentTypes = [
  { value: 'article', label: 'Article' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media Post' },
  { value: 'email', label: 'Email Campaign' },
];

interface ContentFormData {
  title: string;
  contentType: string;
  body: string;
  tags: string[];
  mediaFiles: File[];
  preheaderText: string;
}

interface FormErrors {
  title?: string;
  body?: string;
  preheaderText?: string;
}

const initialFormState: ContentFormData = {
  title: '',
  contentType: 'article',
  body: '',
  tags: [],
  mediaFiles: [],
  preheaderText: ''
};

const ContentForm: React.FC = () => {
  const [formData, setFormData] = useState<ContentFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [editorTab, setEditorTab] = useState<'editor' | 'html' | 'preview'>('editor');
  
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: formData.body,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        body: editor.getHTML()
      }));
      
      // Clear error when field is edited
      if (errors.body) {
        setErrors(prev => ({ ...prev, body: undefined }));
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when field is edited
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
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

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      // Add files to state
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...filesArray]
      }));
      
      // Clear input value to allow selecting the same file again
      e.target.value = '';
      
      // Reset progress after "upload" completes
      setTimeout(() => {
        setUploadProgress(null);
      }, 2500);
    }
  };

  const handleFileDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Content title is required';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Content cannot be empty';
    }
    
    if (formData.preheaderText.length > 100) {
      newErrors.preheaderText = 'Preheader text must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
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
      // TODO: Replace with actual API call
      console.log('Submitting content data:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSubmitSuccess(true);
      // Reset form after successful submission
      setFormData(initialFormState);
      if (editor) editor.commands.setContent(''); // Clear editor
    } catch (error) {
      console.error('Error saving content:', error);
      setSubmitError('Failed to save content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle tab change for editor modes
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setEditorTab(newValue as 'editor' | 'html' | 'preview');
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Preview rendering for the HTML body
  const renderPreview = () => (
    <Box sx={{
      backgroundColor: theme.colors.card.DEFAULT,
      color: theme.colors.card.foreground,
      border: `1px solid ${hexToRgba(theme.colors.foreground, 0.13)}`,
      borderRadius: 1,
      minHeight: 300,
      p: 2,
      mb: 1
    }}>
      <div dangerouslySetInnerHTML={{ __html: formData.body }} />
    </Box>
  );

  return (
    <form onSubmit={handleSubmit}>
      <StyledPaper>
        {/* Header */}
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          Create Content
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and edit content for your marketing campaigns.
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
            Content saved successfully!
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
        
        {/* Content Details Section */}
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
                  label="Content Type"
                  onChange={handleChange}
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
          
          <Tabs value={editorTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab value="editor" label="Visual Editor" />
            <Tab value="html" label="HTML Source" />
            <Tab value="preview" label="Preview" />
          </Tabs>
          
          {editorTab === 'editor' && (
            <Box 
              sx={{ 
                border: errors.body 
                  ? `1px solid ${theme.colors.error}` 
                  : `1px solid ${hexToRgba(theme.colors.foreground, 0.23)}`,
                borderRadius: 1,
                minHeight: 350,
                p: 0,
                mb: 1,
                background: "#fff",
              }}
            >
              <TiptapToolbar editor={editor} />
              <Box sx={{ px: 2, pt: 1 }}>
                <EditorContent editor={editor} />
              </Box>
            </Box>
          )}
          
          {editorTab === 'html' && (
            <TextField
              fullWidth
              multiline
              minRows={10}
              variant="standard"
              placeholder="Raw HTML"
              InputProps={{ disableUnderline: true, style: { fontFamily: "monospace" } }}
              name="body"
              value={formData.body || ""}
              onChange={handleChange}
              sx={{
                border: errors.body 
                  ? `1px solid ${theme.colors.error}` 
                  : `1px solid ${hexToRgba(theme.colors.foreground, 0.23)}`,
                borderRadius: 1,
                p: 2,
                mb: 1
              }}
            />
          )}
          
          {editorTab === 'preview' && renderPreview()}
          
          {errors.body && (
            <Typography color="error" variant="caption">
              {errors.body}
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
            accept="image/*,video/*"
          />
          
          <UploadButton
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleFileUploadClick}
          >
            Upload Media
          </UploadButton>
          
          {/* Upload progress */}
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
          
          {/* Media files list */}
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
            {isSubmitting ? 'Saving...' : 'Save Content'}
          </Button>
        </Box>
      </StyledPaper>
    </form>
  );
};

export default ContentForm;
