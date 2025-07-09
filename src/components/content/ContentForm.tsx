'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
// Add this import:
import { useQueryClient } from '@tanstack/react-query';
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
// Add this import if the function exists, otherwise remove the calendar event creation
// import { createCalendarEventFromContent } from '@/lib/api/calendar-service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contentFormSchema, type ContentFormValues } from '@/lib/validations/content';
import { ContentType } from '@/lib/types/content';
import { MediaUploader, type MediaFile } from '@/components/content/MediaUploader';
import { TagInput } from '@/components/content/TagInput';
// ADD THIS MISSING IMPORT:
import { FormActions } from '@/components/content/shared/FormActions';
import type { SubmitHandler } from 'react-hook-form';
import { useEffect } from 'react';
import { getListsForContent } from '@/lib/api/content-list-service';
import { Badge } from '@/components/ui/badge';

// Content types
const contentTypes: ContentType[] = ['blog', 'email', 'social'];
const tagSuggestions = [
  'marketing',
  'social',
  'email',
  'blog',
  'newsletter',
  'campaign',
  'promotion',
  'announcement',
  'update',
  'feature',
];

interface ContentFormData {
  title: string;
  contentType: ContentType;
  content: string;
  tags: string[];
  mediaFiles: MediaFile[];
  preheaderText: string;
  publishDate?: string;
  status: 'draft' | 'published';
}

interface FormErrors {
  title?: string;
  content?: string;
  preheaderText?: string;
}

const initialFormData: ContentFormData = {
  title: '',
  contentType: 'blog',
  content: '',
  tags: [],
  mediaFiles: [],
  preheaderText: '',
  status: 'draft'
};

interface ContentFormProps {
  initialData?: Partial<ContentFormValues> & { id?: string };
  mode?: 'create' | 'edit';
  contentListId?: string;
}

export function ContentForm({ initialData, mode = 'create', contentListId }: ContentFormProps) {
  const router = useRouter();
  const { userId } = useAuth();
  // Add this line:
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [contentLists, setContentLists] = useState<any[]>([]);
  
  // Fetch content lists when editing existing content
  useEffect(() => {
    if (mode === 'edit' && initialData && initialData.id) {
      const fetchContentLists = async () => {
        try {
          const { lists } = await getListsForContent(initialData.id as string);
          setContentLists(lists);
        } catch (error) {
          console.error('Error fetching content lists:', error);
        }
      };
      
      fetchContentLists();
    }
  }, [initialData, mode]);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    watch,
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: '',
      type: 'blog',
      status: 'draft',
      content: '',
      tags: [],
      excerpt: '',
      media: [],
      scheduledAt: undefined,
      slug: '',
      ...initialData,
    },
  });

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
        const newMedia = [...watch('media') || [], ...filesArray];
        setValue('media', newMedia);
        setMedia(newMedia);
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
    const newMedia = (watch('media') || []).filter((_: MediaFile, i: number) => i !== index);
    setValue('media', newMedia);
    setMedia(newMedia);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle form submission
  const onSubmit = async (data: ContentFormData) => {
    try {
      setIsSubmitting(true);
      
      let savedContent;
      if (mode === 'edit' && initialData?.id) {
        savedContent = await updateContent(initialData.id, data);
      } else {
        savedContent = await saveContent(data); // Changed from createContent to saveContent
      }
      
      // Comment out calendar event creation until the function is properly imported
      // if (savedContent.scheduledAt || savedContent.status === 'PUBLISHED' || savedContent.status === 'APPROVED') {
      //   try {
      //     await createCalendarEventFromContent(savedContent);
      //   } catch (calendarError) {
      //     console.error('Calendar event creation failed:', calendarError);
      //   }
      // }
      
      // Now invalidate all related caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content'] }),
        queryClient.invalidateQueries({ queryKey: ['content-lists'] }),
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      ]);
      
      // Dispatch custom event for additional components
      window.dispatchEvent(new CustomEvent('content-created', { 
        detail: { content: savedContent } 
      }));
      
      // Navigate after everything is complete
      if (contentListId) {
        router.push(`/content-lists/${contentListId}`);
      } else {
        router.push('/content');
      }
      
    } catch (error) {
      // ... error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input
            id="title"
            {...register('title')}
            className={cn(formErrors.title && 'border-yellow-500')}
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-yellow-600">{formErrors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Content Type
          </label>
          <Select
            onValueChange={(value: ContentType) => {
              // Use setTimeout to defer the state update
              setTimeout(() => setValue('type', value), 0);
            }}
            defaultValue={watch('type')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.type && (
            <p className="mt-1 text-sm text-yellow-600">{formErrors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
            Excerpt
          </label>
          <Textarea
            id="excerpt"
            {...register('excerpt')}
            className={cn(formErrors.excerpt && 'border-yellow-500')}
          />
          {formErrors.excerpt && (
            <p className="mt-1 text-sm text-yellow-600">{formErrors.excerpt.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <TagInput
            tags={watch('tags') || []}
            onChange={(tags) => {
              // Use setTimeout to defer the state update
              setTimeout(() => setValue('tags', tags), 0);
            }}
            suggestions={tagSuggestions}
          />
          {formErrors.tags && (
            <p className="mt-1 text-sm text-yellow-600">{formErrors.tags.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Media</label>
          <MediaUploader
            onUpload={(newFiles) => {
              setMedia(newFiles);
              setValue('media', newFiles);
            }}
            onRemove={(fileId) => {
              const newMedia = media.filter(f => f.id !== fileId);
              setMedia(newMedia);
              setValue('media', newMedia);
            }}
            maxFiles={5}
            maxSize={5 * 1024 * 1024}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <RichTextEditor
            value={watch('content') || ''}
            onChange={(value: string) => {
              // Use setTimeout to defer the state update
              setTimeout(() => setValue('content', value), 0);
            }}
            placeholder="Write your content here..."
          />
          {formErrors.content && (
            <p className="mt-1 text-sm text-yellow-600">{formErrors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Schedule</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !watch('scheduledAt') && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch('scheduledAt') ? (
                  format(watch('scheduledAt')!, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch('scheduledAt') ? new Date(watch('scheduledAt') as string) : undefined}
                onSelect={(date: Date | undefined) => {
                  // Use setTimeout to defer the state update
                  setTimeout(() => setValue('scheduledAt', date ? date.toISOString() : undefined), 0);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Display associated content lists */}
        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium mb-1">Content Lists</label>
            <div className="border rounded-md p-4">
              {contentLists.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contentLists.map((list) => (
                    <Badge key={list.id} variant="secondary">
                      {list.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This content is not part of any content lists.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <FormActions
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={() => router.back()}
          onReset={() => {
            setValue('content', '');
            setMedia([]);
          }}
          submitText={mode === 'edit' ? 'Update Content' : 'Create Content'}
        />
      </div>
    </form>
  );
}

