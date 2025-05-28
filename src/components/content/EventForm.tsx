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
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon, ImageIcon, Loader2, Plus, X, Facebook, Twitter, Instagram, Linkedin, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ContentType, SocialPlatform, CalendarEvent, SocialMediaContent } from './content-calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useTimezone } from "@/hooks/use-timezone";

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

type AllowedContentType = 'article' | 'blog' | 'social' | 'email';
type AllowedStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

interface FormData {
  id: string;
  title: string;
  description: string;
  type: AllowedContentType;
  status: AllowedStatus;
  date: string;
  time?: string;
  content?: string;
  mediaUrls?: string[];
  socialMediaContent: {
    platforms: SocialPlatform[];
    crossPost: boolean;
    mediaUrls: string[];
    platformSpecificContent: {
      [key in SocialPlatform]?: PlatformSpecificContent;
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
  type?: string;
  status?: string;
  submit?: string;
  socialMediaContent?: {
    platforms?: {
      text: string;
    };
    FACEBOOK?: {
      text?: string;
      mediaUrls?: string;
    };
    TWITTER?: {
      text?: string;
      mediaUrls?: string;
    };
    INSTAGRAM?: {
      text?: string;
      mediaUrls?: string;
    };
    LINKEDIN?: {
      text?: string;
      mediaUrls?: string;
    };
  };
}

// Add type guards
const isSocialPlatform = (platform: string): platform is SocialPlatform => {
  return ['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN'].includes(platform);
};

const isAllowedContentType = (type: string): type is AllowedContentType => {
  return ['article', 'blog', 'social', 'email'].includes(type);
};

const isAllowedStatus = (status: string): status is AllowedStatus => {
  return ['draft', 'scheduled', 'sent', 'failed'].includes(status);
};

// Add error types
type FormError = {
  code: string;
  message: string;
  field?: string;
};

type ValidationError = FormError & {
  validationType: 'required' | 'format' | 'length' | 'count';
};

// Add validation functions
const validateTitle = (title: string): ValidationError | null => {
  if (!title.trim()) {
    return {
      code: 'TITLE_REQUIRED',
      message: 'Title is required',
      field: 'title',
      validationType: 'required'
    };
  }
  if (title.length > 100) {
    return {
      code: 'TITLE_TOO_LONG',
      message: 'Title must be less than 100 characters',
      field: 'title',
      validationType: 'length'
    };
  }
  return null;
};

const validateDate = (date: string): ValidationError | null => {
  if (!date) {
    return {
      code: 'DATE_REQUIRED',
      message: 'Date is required',
      field: 'date',
      validationType: 'required'
    };
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return {
      code: 'INVALID_DATE',
      message: 'Invalid date format',
      field: 'date',
      validationType: 'format'
    };
  }
  return null;
};

const validateTime = (time: string | undefined): ValidationError | null => {
  if (!time) {
    return {
      code: 'TIME_REQUIRED',
      message: 'Time is required',
      field: 'time',
      validationType: 'required'
    };
  }
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return {
      code: 'INVALID_TIME',
      message: 'Invalid time format (HH:MM)',
      field: 'time',
      validationType: 'format'
    };
  }
  return null;
};

const validateSocialContent = (content: string, platform: SocialPlatform): ValidationError | null => {
  if (!content.trim()) {
    return {
      code: 'CONTENT_REQUIRED',
      message: `${platform} content is required`,
      field: 'content',
      validationType: 'required'
    };
  }
  if (content.length > platformContentLimits[platform].maxTextLength) {
    return {
      code: 'CONTENT_TOO_LONG',
      message: `${platform} content exceeds maximum length of ${platformContentLimits[platform].maxTextLength} characters`,
      field: 'content',
      validationType: 'length'
    };
  }
  return null;
};

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
  const userTimezone = useTimezone();
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

  const formatDate = (date: Date, format: string) => {
    return formatInTimeZone(date, userTimezone, format);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: formatDate(date, "yyyy-MM-dd")
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
    setFormData(prev => ({ 
      ...prev, 
      type: value,
      // Reset social media content when changing type
      socialMediaContent: value === 'social' ? {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      } : prev.socialMediaContent
    }));
    onContentTypeChange?.(value);
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      // Update formData immediately to ensure consistency
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

        const updatedFormData = {
          ...prev,
          socialMediaContent: {
            ...currentSocialContent,
            platforms: newPlatforms,
            platformSpecificContent: newPlatformSpecificContent
          }
        };

        // Debug log to track state changes
        console.log('Platform selection updated:', {
          platform,
          newPlatforms,
          formDataPlatforms: updatedFormData.socialMediaContent.platforms
        });

        return updatedFormData;
      });

      onPlatformsChange?.(newPlatforms);
      return newPlatforms;
    });
  };

  const handlePlatformContentChange = (platform: SocialPlatform, content: string) => {
    setFormData(prev => {
      const currentSocialContent = prev.socialMediaContent;
      const newPlatformSpecificContent = { ...currentSocialContent.platformSpecificContent };
      newPlatformSpecificContent[platform] = {
        ...newPlatformSpecificContent[platform],
        text: content,
        mediaUrls: newPlatformSpecificContent[platform]?.mediaUrls || []
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
            ...(currentPlatformContent.mediaUrls || []),
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

      const platformContent = formData.socialMediaContent.platformSpecificContent[platform];
      onContentChange?.(
        platformContent?.text || '',
        platformContent?.mediaUrls || []
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
    const validationErrors: ValidationError[] = [];
    
    // Validate title
    const titleError = validateTitle(formData.title);
    if (titleError) {
      newErrors.title = titleError.message;
      validationErrors.push(titleError);
    }
    
    // Validate date
    const dateError = validateDate(formData.date);
    if (dateError) {
      newErrors.date = dateError.message;
      validationErrors.push(dateError);
    }
    
    // Validate time
    const timeError = validateTime(formData.time);
    if (timeError) {
      newErrors.time = timeError.message;
      validationErrors.push(timeError);
    }
    
    // Validate social content only if we're in content-edit mode and type is social
    if (mode === 'content-edit' && formData.type === 'social') {
      const socialErrors: FormErrors['socialMediaContent'] = {};
      
      // Check if any platforms are selected
      if (formData.socialMediaContent.platforms.length === 0) {
        const platformError: ValidationError = {
          code: 'NO_PLATFORMS_SELECTED',
          message: 'Please select at least one social media platform',
          field: 'platforms',
          validationType: 'required'
        };
        socialErrors['platforms'] = {
          text: platformError.message
        };
        validationErrors.push(platformError);
      }
      
      formData.socialMediaContent.platforms.forEach(platform => {
        const content = formData.socialMediaContent.platformSpecificContent[platform];
        const contentError = validateSocialContent(content?.text || '', platform);
        
        if (contentError) {
          socialErrors[platform] = {
            text: contentError.message
          };
          validationErrors.push(contentError);
        }
        
        const mediaCount = content?.mediaUrls?.length || 0;
        if (mediaCount > platformContentLimits[platform].maxMediaCount) {
          const mediaError: ValidationError = {
            code: 'TOO_MANY_MEDIA',
            message: `You can add up to ${platformContentLimits[platform].maxMediaCount} media files for ${platform}`,
            field: 'mediaUrls',
            validationType: 'count'
          };
          socialErrors[platform] = {
            ...socialErrors[platform],
            mediaUrls: mediaError.message
          };
          validationErrors.push(mediaError);
        }
      });
      
      if (Object.keys(socialErrors).length > 0) {
        newErrors.socialMediaContent = socialErrors;
      }
    }
    
    setErrors(newErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) {
        return;
      }
      
      setIsSubmitting(true);
      
      // Validate content type
      if (!isAllowedContentType(formData.type)) {
        setErrors(prev => ({
          ...prev,
          type: 'Please select a valid content type'
        }));
        return;
      }
      
      // Validate status
      if (!isAllowedStatus(formData.status)) {
        setErrors(prev => ({
          ...prev,
          status: 'Please select a valid status'
        }));
        return;
      }
      
      const eventData: CalendarEvent = {
        ...formData,
        type: formData.type,
        status: formData.status,
        socialMediaContent: {
          platforms: formData.socialMediaContent.platforms,
          mediaUrls: formData.socialMediaContent.mediaUrls,
          crossPost: formData.socialMediaContent.crossPost,
          platformSpecificContent: formData.socialMediaContent.platformSpecificContent
        },
        analytics: {
          lastUpdated: new Date().toISOString()
        }
      };
      
      if (!onSubmit) {
        setErrors(prev => ({
          ...prev,
          submit: 'Unable to submit form. Please try again.'
        }));
        return;
      }
      
      await onSubmit(eventData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred while saving. Please try again.'
      }));
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
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title}</p>
          )}
        </div>

        {formData.type === 'social' && (
          <div className="space-y-4">
            <Label>Select Platforms</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Card
                    key={platform.value}
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:bg-accent',
                      formData.socialMediaContent.platforms.includes(platform.value as SocialPlatform) && 'border-primary'
                    )}
                    onClick={() => handlePlatformToggle(platform.value as SocialPlatform)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-5 w-5', platform.color)} />
                      <span className="font-medium">{platform.label}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
            {errors.socialMediaContent?.platforms && (
              <p className="text-sm text-destructive mt-1">
                {errors.socialMediaContent.platforms.text}
              </p>
            )}
          </div>
        )}

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
                  formatDate(new Date(formData.date), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date ? new Date(formData.date) : undefined}
                onSelect={(date) => {
                  console.log('Date selected in schedule mode:', date);
                  handleSchedule(date);
                }}
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
                        formatDate(new Date(formData.date), "PPP")
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
                  {errors.socialMediaContent?.platforms && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.socialMediaContent.platforms.text}
                    </p>
                  )}
                </div>

                {formData.socialMediaContent.platforms.map((platform) => (
                  <div key={platform} className="space-y-2">
                    <Label>{platform} Content</Label>
                    <RichTextEditor
                      value={formData.socialMediaContent.platformSpecificContent[platform]?.text || ''}
                      onChange={(content) => handlePlatformContentChange(platform, content)}
                    />
                    {errors.socialMediaContent?.[platform]?.text && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.socialMediaContent[platform].text}
                      </p>
                    )}
                    <MediaUploader
                      platform={platform}
                      maxCount={platformContentLimits[platform].maxMediaCount}
                      supportedTypes={platformContentLimits[platform].supportedMediaTypes}
                      currentMedia={formData.socialMediaContent.platformSpecificContent[platform]?.mediaUrls || []}
                      onUpload={(files) => handleMediaUpload(platform, files)}
                      onRemove={(index) => handleMediaRemove(platform, index)}
                    />
                    {errors.socialMediaContent?.[platform]?.mediaUrls && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.socialMediaContent[platform].mediaUrls}
                      </p>
                    )}
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