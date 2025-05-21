'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { CalendarIcon, ImageIcon, Loader2, Plus, X, Facebook, Twitter, Instagram, Linkedin, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ContentType, SocialPlatform, CalendarEvent, SocialMediaContent } from './content-calendar';
import { Checkbox } from '@/components/ui/checkbox';

interface EventFormProps {
  initialData?: Partial<CalendarEvent>;
  mode?: 'create' | 'edit' | 'platform-select' | 'content-edit' | 'schedule' | 'type-select';
  onPlatformsChange?: (platforms: SocialPlatform[]) => void;
  onContentChange?: (content: string, mediaUrls: string[]) => void;
  onTitleChange?: (title: string) => void;
  onSchedule?: (date: Date) => void;
  onSubmit?: (event: CalendarEvent) => void;
  onCancel?: () => void;
  onContentTypeChange?: (type: string) => void;
}

const contentTypes = [
  { value: 'article', label: 'Article' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media Post' },
  { value: 'email', label: 'Email Campaign' },
] as const;

const socialPlatforms = [
  { value: 'FACEBOOK', label: 'Facebook', icon: Facebook, color: 'text-[#1877F2]' },
  { value: 'TWITTER', label: 'Twitter', icon: Twitter, color: 'text-[#1DA1F2]' },
  { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-[#E4405F]' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]' },
] as const;

const platformContentLimits = {
  FACEBOOK: {
    maxTextLength: 63206,
    maxMediaCount: 10,
    supportedMediaTypes: ['image', 'video', 'link']
  },
  TWITTER: {
    maxTextLength: 280,
    maxMediaCount: 4,
    supportedMediaTypes: ['image', 'video', 'gif']
  },
  INSTAGRAM: {
    maxTextLength: 2200,
    maxMediaCount: 10,
    supportedMediaTypes: ['image', 'video', 'carousel']
  },
  LINKEDIN: {
    maxTextLength: 3000,
    maxMediaCount: 9,
    supportedMediaTypes: ['image', 'video', 'document']
  }
};

function MediaPreview({ url, onRemove }: { url: string; onRemove: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative group aspect-square w-full rounded-lg overflow-hidden bg-muted">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
          <X className="h-6 w-6 text-destructive" />
        </div>
      ) : (
        <img
          src={url}
          alt="Media preview"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function MediaUploader({ 
  platform, 
  maxCount, 
  supportedTypes,
  onUpload,
  onRemove,
  currentMedia
}: { 
  platform: SocialPlatform;
  maxCount: number;
  supportedTypes: string[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  currentMedia: string[];
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length + currentMedia.length > maxCount) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxCount} files allowed for ${platform}`,
        variant: "destructive",
      });
      return;
    }
    
    onUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + currentMedia.length > maxCount) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxCount} files allowed for ${platform}`,
        variant: "destructive",
      });
      return;
    }
    
    onUpload(files);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted",
          "transition-colors duration-200"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={supportedTypes.map(type => `.${type}`).join(",")}
          onChange={handleFileInput}
          className="hidden"
          id={`media-upload-${platform}`}
        />
        <label
          htmlFor={`media-upload-${platform}`}
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drag and drop or click to upload media
            </p>
            <p className="text-xs text-muted-foreground">
              Supported types: {supportedTypes.join(", ")}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum {maxCount} files
            </p>
          </div>
        </label>
      </div>

      {currentMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentMedia.map((url, index) => (
            <MediaPreview
              key={index}
              url={url}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PlatformSpecificContent {
  text: string;
  mediaUrls: string[];
  scheduledTime?: string;
}

interface FormSocialMediaContent {
  platforms: SocialPlatform[];
  mediaUrls: string[];
  crossPost: boolean;
  platformSpecificContent: {
    [key in SocialPlatform]?: PlatformSpecificContent;
  };
}

type AllowedContentType = 'social' | 'email' | 'blog' | 'other';
type AllowedStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

interface FormData {
  id: string;
  title: string;
  description: string;
  type: "email" | "social" | "blog" | "other";
  status: "draft" | "scheduled" | "sent" | "failed";
  date: string;
  time: string;
  content?: string;
  mediaUrls?: string[];
  socialMediaContent?: {
    platforms: SocialPlatform[];
    crossPost: boolean;
    mediaUrls: string[];
    platformSpecificContent: {
      [key in SocialPlatform]?: {
        text?: string;
        mediaUrls?: string[];
        scheduledTime?: string;
      };
    };
  };
  analytics?: {
    views?: number;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    clicks?: number;
    lastUpdated?: string;
  };
  preview?: {
    thumbnail?: string;
    platformPreviews?: {
      [key in SocialPlatform]?: {
        previewUrl?: string;
        status?: 'pending' | 'approved' | 'rejected';
        rejectionReason?: string;
      };
    };
  };
}

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  socialMediaContent?: {
    [key in SocialPlatform]?: {
      text?: string;
      mediaUrls?: string;
    };
  };
}

export function EventForm({
  initialData,
  mode = 'create',
  onPlatformsChange,
  onContentChange,
  onTitleChange,
  onSchedule,
  onSubmit,
  onCancel,
  onContentTypeChange,
}: EventFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialData) {
      const { socialMediaContent, ...rest } = initialData;
      return {
        id: rest.id || crypto.randomUUID(),
        title: rest.title || '',
        description: rest.description || '',
        type: (rest.type as AllowedContentType) || 'social',
        status: (rest.status as AllowedStatus) || 'draft',
        date: rest.date || new Date().toISOString(),
        time: rest.time || '',
        socialMediaContent: socialMediaContent ? {
          platforms: socialMediaContent.platforms,
          mediaUrls: socialMediaContent.mediaUrls,
          crossPost: socialMediaContent.crossPost,
          platformSpecificContent: Object.entries(socialMediaContent.platformSpecificContent || {}).reduce((acc, [platform, content]) => ({
            ...acc,
            [platform]: {
              text: content?.text || '',
              mediaUrls: content?.mediaUrls || [],
              scheduledTime: content?.scheduledTime
            }
          }), {}) as { [key in SocialPlatform]?: PlatformSpecificContent }
        } : {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        }
      };
    }
    return {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      type: 'social',
      status: 'draft',
      date: new Date().toISOString(),
      time: '',
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      }
    };
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(
    initialData?.socialMediaContent?.platforms || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString()
      }));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      time: e.target.value
    }));
  };

  const handleContentTypeChange = (value: AllowedContentType) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      setFormData(prev => {
        const currentSocialContent = prev.socialMediaContent;
        const newPlatformSpecificContent = { ...currentSocialContent.platformSpecificContent };

        if (newPlatforms.includes(platform)) {
          newPlatformSpecificContent[platform] = {
            text: '',
            mediaUrls: [],
            scheduledTime: prev.time
          };
        } else {
          delete newPlatformSpecificContent[platform];
        }

        return {
          ...prev,
          socialMediaContent: {
            ...currentSocialContent,
            platforms: newPlatforms,
            platformSpecificContent: newPlatformSpecificContent
          }
        };
      });

      onPlatformsChange?.(newPlatforms);
      return newPlatforms;
    });
  };

  const handlePlatformContentChange = (platform: SocialPlatform, content: string) => {
    setFormData(prev => {
      let allowedType: AllowedContentType = 'social';
      if (prev.type === 'social' || prev.type === 'email' || prev.type === 'blog') {
        allowedType = prev.type;
      }
      const currentSocialContent = prev.socialMediaContent;
      const newPlatformSpecificContent = { ...currentSocialContent.platformSpecificContent };
      newPlatformSpecificContent[platform] = {
        text: content,
        mediaUrls: newPlatformSpecificContent[platform]?.mediaUrls || []
      };
      return {
        ...prev,
        type: allowedType,
        socialMediaContent: {
          ...currentSocialContent,
          platformSpecificContent: newPlatformSpecificContent
        }
      } satisfies FormData;
    });
    const platformContent = formData.socialMediaContent.platformSpecificContent[platform];
    onContentChange?.(content, platformContent?.mediaUrls || []);
  };

  const handleMediaUpload = async (platform: SocialPlatform, files: File[]) => {
    setIsUploading(true);
    try {
      const newUrls = files.map(file => URL.createObjectURL(file));
      
      setFormData(prev => {
        const currentSocialContent = prev.socialMediaContent;
        const currentPlatformContent = currentSocialContent.platformSpecificContent[platform] || {
          text: '',
          mediaUrls: []
        };

        const newPlatformSpecificContent = { ...currentSocialContent.platformSpecificContent };
        newPlatformSpecificContent[platform] = {
          ...currentPlatformContent,
          mediaUrls: [
            ...currentPlatformContent.mediaUrls,
            ...newUrls
          ]
        };

        return {
          ...prev,
          socialMediaContent: {
            ...currentSocialContent,
            platformSpecificContent: newPlatformSpecificContent
          }
        };
      });

      onContentChange?.(
        formData.socialMediaContent.platformSpecificContent[platform]?.text || '',
        newUrls
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload media files',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaRemove = (platform: SocialPlatform, index: number) => {
    setFormData(prev => {
      const currentSocialContent = prev.socialMediaContent;
      const currentPlatformContent = currentSocialContent.platformSpecificContent[platform] || {
        text: '',
        mediaUrls: []
      };

      const newPlatformSpecificContent = { ...currentSocialContent.platformSpecificContent };
      newPlatformSpecificContent[platform] = {
        ...currentPlatformContent,
        mediaUrls: currentPlatformContent.mediaUrls.filter((_: string, i: number) => i !== index)
      };

      return {
        ...prev,
        socialMediaContent: {
          ...currentSocialContent,
          platformSpecificContent: newPlatformSpecificContent
        }
      };
    });

    const platformContent = formData.socialMediaContent.platformSpecificContent[platform];
    onContentChange?.(
      platformContent?.text || '',
      platformContent?.mediaUrls || []
    );
  };

  const handleSchedule = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString(),
      }));
      onSchedule?.(date);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (formData.type === 'social') {
      const socialErrors: FormErrors['socialMediaContent'] = {};
      
      selectedPlatforms.forEach(platform => {
        const content = formData.socialMediaContent.platformSpecificContent?.[platform];
        if (!content?.text?.trim()) {
          socialErrors[platform] = {
            text: `${platform} content is required`
          };
        }
        
        const mediaCount = content?.mediaUrls?.length || 0;
        if (mediaCount > platformContentLimits[platform].maxMediaCount) {
          socialErrors[platform] = {
            ...socialErrors[platform],
            mediaUrls: `Maximum ${platformContentLimits[platform].maxMediaCount} media files allowed`
          };
        }
      });
      
      if (Object.keys(socialErrors).length > 0) {
        newErrors.socialMediaContent = socialErrors;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Preparing event data:", formData);
      const eventData: CalendarEvent = {
        ...formData,
        type: formData.type as CalendarEvent['type'],
        status: (formData.status === 'published' ? 'scheduled' : formData.status) as CalendarEvent['status'],
        socialMediaContent: formData.socialMediaContent ? {
          platforms: formData.socialMediaContent.platforms,
          mediaUrls: formData.socialMediaContent.mediaUrls,
          crossPost: formData.socialMediaContent.crossPost,
          platformSpecificContent: formData.socialMediaContent.platformSpecificContent
        } : undefined
      };
      console.log("Calling onSubmit with event data:", eventData);
      if (!onSubmit) {
        throw new Error("onSubmit handler is not provided");
      }
      await onSubmit(eventData);
      console.log("onSubmit completed successfully");
      toast({
        title: 'Success',
        description: `Event ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error; // Re-throw to let parent component handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'type-select') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {contentTypes.map((type) => (
            <Card
              key={type.value}
              className={cn(
                'p-4 cursor-pointer transition-colors hover:bg-accent',
                initialData?.type === type.value && 'border-primary'
              )}
              onClick={() => onContentTypeChange?.(type.value)}
            >
              <h4 className="font-medium">{type.label}</h4>
              <p className="text-sm text-muted-foreground">
                {type.value === 'article' && 'Create a detailed article with rich formatting'}
                {type.value === 'blog' && 'Write a blog post for your website'}
                {type.value === 'social' && 'Create content for social media platforms'}
                {type.value === 'email' && 'Design an email campaign'}
              </p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'content-edit') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              onTitleChange?.(e.target.value);
            }}
            placeholder="Enter content title"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <div className="border rounded-md">
            <RichTextEditor
              value={formData.content || formData.description}
              onChange={(content) => {
                setFormData(prev => ({
                  ...prev,
                  content: content,
                  description: content
                }));
                onContentChange?.(content, formData.mediaUrls || []);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Media</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(formData.mediaUrls || []).map((url, index) => (
              <MediaPreview
                key={index}
                url={url}
                onRemove={() => {
                  const newUrls = (formData.mediaUrls || []).filter((_, i) => i !== index);
                  setFormData(prev => ({
                    ...prev,
                    mediaUrls: newUrls
                  }));
                  onContentChange?.(formData.content || formData.description, newUrls);
                }}
              />
            ))}
            <div className="relative aspect-square">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="media-upload"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    const newUrls = files.map(file => URL.createObjectURL(file));
                    const currentUrls = formData.mediaUrls || [];
                    const updatedUrls = [...currentUrls, ...newUrls];
                    
                    setFormData(prev => ({
                      ...prev,
                      mediaUrls: updatedUrls
                    }));
                    onContentChange?.(formData.content || formData.description, updatedUrls);
                  }
                }}
              />
              <label
                htmlFor="media-upload"
                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="p-3 rounded-full bg-primary/10 mb-2">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Add media</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'schedule') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Publish Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? (
                  format(new Date(formData.date), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date ? new Date(formData.date) : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'create' || mode === 'edit' ? (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(new Date(formData.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleTimeChange}
                  required
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={formData.type}
                onValueChange={handleContentTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'social' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Social Media Platforms</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.value}
                          checked={formData.socialMediaContent?.platforms.includes(platform.value as SocialPlatform)}
                          onCheckedChange={() => handlePlatformToggle(platform.value as SocialPlatform)}
                        />
                        <Label htmlFor={platform.value} className="flex-1 flex items-center gap-2">
                          <platform.icon className={cn("h-4 w-4", platform.color)} />
                          {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.socialMediaContent.platforms.map((platform) => (
                  <div key={platform} className="space-y-2">
                    <Label>{platform} Content</Label>
                    <RichTextEditor
                      value={formData.socialMediaContent.platformSpecificContent[platform]?.text || ''}
                      onChange={(content) => handlePlatformContentChange(platform, content)}
                    />
                    <MediaUploader
                      platform={platform}
                      maxCount={platformContentLimits[platform].maxMediaCount}
                      supportedTypes={platformContentLimits[platform].supportedMediaTypes}
                      currentMedia={formData.socialMediaContent.platformSpecificContent[platform]?.mediaUrls || []}
                      onUpload={(files) => handleMediaUpload(platform, files)}
                      onRemove={(index) => handleMediaRemove(platform, index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSubmit?.({ ...formData, status: 'draft' } as CalendarEvent)}
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
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                mode === 'edit' ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </div>
        </>
      ) : null}
    </form>
  );
} 