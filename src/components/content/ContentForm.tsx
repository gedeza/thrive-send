'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ImageIcon, Loader2, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { RichTextEditor } from '@/components/rich-text-editor';
import { saveContent, updateContent } from '@/lib/api/content-service';

// Content types
const contentTypes = [
  { value: 'article', label: 'Article' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media Post' },
  { value: 'email', label: 'Email Campaign' },
] as const;

type ContentType = typeof contentTypes[number]['value'];

interface ContentFormData {
  title: string;
  contentType: ContentType;
  content: string;
  tags: string[];
  mediaFiles: Array<File | { url: string; name: string; size: number }>;
  preheaderText: string;
  publishDate?: Date;
  status: 'draft' | 'published';
}

interface FormErrors {
  title?: string;
  content?: string;
  preheaderText?: string;
}

const initialFormData: ContentFormData = {
  title: '',
  contentType: 'article',
  content: '',
  tags: [],
  mediaFiles: [],
  preheaderText: '',
  status: 'draft'
};

interface ContentFormProps {
  initialData?: any;
  mode?: 'create' | 'edit';
}

export default function ContentForm({ initialData, mode = 'create' }: ContentFormProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [formData, setFormData] = useState<ContentFormData>(initialData || initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle content type change
  const handleContentTypeChange = (value: ContentType) => {
    setFormData(prev => ({ ...prev, contentType: value }));
  };

  // Handle content change from rich text editor
  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  // Handle tag management
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

  // Handle file uploads
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadProgress(0);
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
        setFormData(prev => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, ...filesArray]
        }));
        toast({
          title: 'Success',
          description: 'Media files added successfully',
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to add media files',
          variant: 'destructive',
        });
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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Content title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content cannot be empty';
    }
    if (formData.preheaderText.length > 100) {
      newErrors.preheaderText = 'Preheader text must be less than 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'published') => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        status,
      };

      if (mode === 'edit' && initialData?.id) {
        await updateContent(initialData.id, data);
      } else {
        await saveContent(data);
      }

      toast({
        title: 'Success',
        description: `Content ${mode === 'edit' ? 'updated' : status === 'draft' ? 'saved as draft' : 'published'} successfully`,
      });
      router.push('/content');
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, 'published')} className="space-y-8">
      {/* Content Details */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Content Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter content title"
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <select
              id="contentType"
              name="contentType"
              className="block w-full border rounded-md px-3 py-2 text-sm"
              value={formData.contentType}
              onChange={e => handleContentTypeChange(e.target.value as ContentType)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preheaderText">Preheader Text</Label>
          <Textarea
            id="preheaderText"
            name="preheaderText"
            value={formData.preheaderText}
            onChange={handleChange}
            placeholder="Brief preview text that recipients will see in their inbox"
            className={cn(errors.preheaderText && "border-destructive")}
          />
          {errors.preheaderText && (
            <p className="text-sm text-destructive">{errors.preheaderText}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {formData.preheaderText.length}/100 characters
          </p>
        </div>
      </div>

      {/* Content Editor */}
      <div className="space-y-4">
        <Label>Content</Label>
        <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as 'editor' | 'preview')}>
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="border rounded-md p-4">
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-2">{errors.content}</p>
            )}
          </TabsContent>
          <TabsContent value="preview" className="border rounded-md p-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Media Upload */}
      <div className="space-y-4">
        <Label>Media Files</Label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,video/*"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleFileUploadClick}
          className="w-full"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Upload Media
        </Button>

        {uploadProgress !== null && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="space-y-2">
          {formData.mediaFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm truncate">
                  {'name' in file ? file.name : file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize('size' in file ? file.size : file.size)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFileDelete(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <Label>Tags</Label>
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTagAdd();
              }
            }}
          />
          <Button type="button" onClick={handleTagAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md"
            >
              <span className="text-sm">{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleTagDelete(tag)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Date */}
      <div className="space-y-4">
        <Label>Publish Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.publishDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.publishDate ? (
                format(formData.publishDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.publishDate}
              onSelect={(date) => setFormData(prev => ({ ...prev, publishDate: date }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, 'draft')}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'edit' ? 'Updating...' : 'Publishing...'}
            </>
          ) : (
            mode === 'edit' ? 'Update Content' : 'Publish Content'
          )}
        </Button>
      </div>
    </form>
  );
}