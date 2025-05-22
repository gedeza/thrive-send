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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contentFormSchema, type ContentFormValues } from '@/lib/validations/content';
import { ContentType } from '@/lib/types/content';
import { MediaUploader, type MediaFile } from '@/components/content/MediaUploader';
import { TagInput } from '@/components/content/TagInput';
import type { SubmitHandler } from 'react-hook-form';

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
}

export function ContentForm({ initialData, mode = 'create' }: ContentFormProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');
  const [media, setMedia] = useState<MediaFile[]>([]);

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
  const onSubmit: SubmitHandler<ContentFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        media: media,
      };
      let response;
      if (mode === 'edit' && initialData && typeof initialData.id === 'string') {
        response = await updateContent(initialData.id, payload);
      } else {
        response = await saveContent(payload);
      }
      toast({
        title: 'Success',
        description: `Content ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      });
      router.push('/content');
    } catch (error) {
      console.error('Error saving content:', error);
      // Only show destructive toast for system errors, not validation errors
      if (error instanceof Error && !error.message.includes('validation')) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
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
            onValueChange={(value: ContentType) => setValue('type', value)}
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
            tags={watch('tags')}
            onChange={(tags) => setValue('tags', tags)}
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
            value={watch('content')}
            onChange={(value: string) => setValue('content', value)}
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
                onSelect={(date: Date | undefined) => setValue('scheduledAt', date ? date.toISOString() : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValue('content', '');
            setMedia([]);
          }}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Content'}
        </Button>
      </div>
    </form>
  );
}