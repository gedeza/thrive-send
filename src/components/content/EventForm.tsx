'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { CalendarIcon, ImageIcon, Loader2, Plus, X, Facebook, Twitter, Instagram, Linkedin, Upload, FolderOpen, Save, Trash2, Clock, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ContentType, SocialPlatform, CalendarEvent, SocialMediaContent, DEFAULT_DURATIONS } from './content-calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useTimezone } from "@/hooks/use-timezone";
import { DialogFooter } from '@/components/ui/dialog';
// import * as React from 'react'; //
import type {
  SocialPlatform,
  ContentType,
  CalendarView,
  SocialMediaContent,
  CalendarEvent
} from '@/types/content';


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


interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // For monthly: 1-31
  endDate?: string;
  occurrences?: number;
}

interface RecurrenceState {
  enabled: boolean;
  pattern: RecurrencePattern;
  previewDates: string[];
}

interface BulkCreationState {
  enabled: boolean;
  baseContent: Partial<FormData>;
  variations: BulkVariation[];
  previewMode: boolean;
}

interface BulkVariation {
  id: string;
  title: string;
  date: string;
  time?: string;
  platformOverrides?: {
    [key in SocialPlatform]?: {
      text?: string;
      mediaUrls?: string[];
    };
  };
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

interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  type: AllowedContentType;
  data: Partial<FormData>;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface TemplateState {
  templates: ContentTemplate[];
  selectedTemplate?: string;
  showTemplateDialog: boolean;
  saveAsTemplate: boolean;
}

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
  recurrence?: RecurrencePattern;
  isTemplate?: boolean;
  templateName?: string;
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
  blogPost: {
    title: string;
    content: string;
    slug: string;
    author: string;
    status: string;
    tags: string[];
  };
  emailCampaign: {
    subject: string;
    content: string;
    recipientList: string;
    status: string;
  };
  articleContent: {
    content: string;
    metadata: Record<string, unknown>;
  };
  customContent: {
    type: string;
    content: Record<string, unknown>;
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
  // Required check
  if (!content.trim()) {
    return {
      code: 'EMPTY_CONTENT',
      message: 'Content is required',
      field: `socialMediaContent.${platform}.text`,
      validationType: 'required'
    };
  }
  
  // Length check
  const maxLength = platformContentLimits[platform].maxTextLength;
  if (content.length > maxLength) {
    return {
      code: 'CONTENT_TOO_LONG',
      message: `Content exceeds the maximum length of ${maxLength} characters for ${platform}`,
      field: `socialMediaContent.${platform}.text`,
      validationType: 'length'
    };
  }

  // Platform-specific validation
  if (platform === 'TWITTER' && content.includes('#') && content.split('#').length > 11) {
    return {
      code: 'TOO_MANY_HASHTAGS',
      message: 'Twitter allows a maximum of 10 hashtags per tweet',
      field: `socialMediaContent.${platform}.text`,
      validationType: 'count'
    };
  }

  // URL validation for included links
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) || [];
  if (urls.length > 0) {
    if (platform === 'TWITTER' && urls.length > 1 && content.length > 240) {
      return {
        code: 'URL_CONTENT_TOO_LONG',
        message: 'Twitter content with multiple URLs should be under 240 characters',
        field: `socialMediaContent.${platform}.text`,
        validationType: 'length'
      };
    }
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
  const [formData, setFormData] = useState<Partial<CalendarEvent>>(initialData || {
    title: "",
    description: "",
    type: "social",
    status: "draft",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    socialMediaContent: {
      platforms: [],
      crossPost: false,
      mediaUrls: [],
      platformSpecificContent: {}
    },
    blogPost: {
      title: "",
      content: "",
      slug: "",
      author: "",
      status: "draft",
      tags: []
    },
    emailCampaign: {
      subject: "",
      content: "",
      recipientList: "",
      status: "draft"
    },
    articleContent: {
      content: "",
      metadata: {}
    },
    customContent: {
      type: "",
      content: {}
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(
    initialData?.socialMediaContent?.platforms || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add new state for enhancements
  const [recurrence, setRecurrence] = useState<RecurrenceState>({
    enabled: false,
    pattern: {
      type: 'none',
      interval: 1
    },
    previewDates: []
  });
  
  const [templates, setTemplates] = useState<TemplateState>({
    templates: [],
    showTemplateDialog: false,
    saveAsTemplate: false
  });
  
  const [bulkCreation, setBulkCreation] = useState<BulkCreationState>({
    enabled: false,
    baseContent: {},
    variations: [],
    previewMode: false
  });
  
  const [autoSave, setAutoSave] = useState({
    enabled: true,
    lastSaved: null as Date | null,
    isDirty: false
  });

  // Update recurrence preview dates when form date changes
  React.useEffect(() => {
    if (recurrence.enabled && formData.date) {
      const generatePreviewDates = (pattern: RecurrencePattern, startDate: string): string[] => {
        const dates: string[] = [];
        const start = new Date(startDate);
        const maxDates = 10;
        
        for (let i = 0; i < maxDates; i++) {
          let nextDate = new Date(start);
          
          switch (pattern.type) {
            case 'daily':
              nextDate.setDate(start.getDate() + (i * pattern.interval));
              break;
            case 'weekly':
              nextDate.setDate(start.getDate() + (i * pattern.interval * 7));
              break;
            case 'monthly':
              nextDate.setMonth(start.getMonth() + (i * pattern.interval));
              break;
            case 'yearly':
              nextDate.setFullYear(start.getFullYear() + (i * pattern.interval));
              break;
          }
          
          if (pattern.endDate && nextDate > new Date(pattern.endDate)) break;
          if (pattern.occurrences && i >= pattern.occurrences) break;
          
          dates.push(format(nextDate, 'yyyy-MM-dd'));
        }
        
        return dates;
      };
      
      setRecurrence(prev => ({
        ...prev,
        previewDates: generatePreviewDates(prev.pattern, formData.date)
      }));
    }
  }, [formData.date, recurrence.enabled, recurrence.pattern]);

  const formatDate = (date: Date, format: string) => {
    return formatInTimeZone(date, userTimezone, format);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      // Date selected for event
      
      setFormData(prev => ({
        ...prev,
        date: formattedDate
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

        // Platform update complete
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
      const formattedDate = format(date, "yyyy-MM-dd");
      
      setFormData(prev => ({
        ...prev,
        date: formattedDate,
      }));
      
      onSchedule?.(date);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const validationErrors: ValidationError[] = [];
    
    // Validate title
    const titleError = validateTitle(formData.title || '');
    if (titleError) {
      newErrors.title = titleError.message;
      validationErrors.push(titleError);
    }
    
    // Validate date
    const dateError = validateDate(formData.date || '');
    if (dateError) {
      newErrors.date = dateError.message;
      validationErrors.push(dateError);
    }
    
    // Validate time
    const timeError = validateTime(formData.time || '');
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
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      // Focus the first input with an error
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
      
      // Show toast with validation summary
      const errorCount = Object.keys(errors).length;
      if (errorCount > 0) {
        toast({
          title: 'Validation Error',
          description: `Please fix the ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} in the form`,
          variant: 'destructive',
        });
      }
      
      return;
    }
    
    // Prepare form data for submission
    setIsSubmitting(true);
    
    try {
      // Create a deep copy of form data to avoid mutations
      const submissionData: CalendarEvent = JSON.parse(JSON.stringify({
        ...formData,
        id: formData.id || crypto.randomUUID()
      }));
      
      // Convert date and time to ISO format if both exist
      if (submissionData.date && submissionData.time) {
        submissionData.startTime = `${submissionData.date}T${submissionData.time}:00`;
        
        // Calculate endTime based on duration or default
        const duration = submissionData.duration || DEFAULT_DURATIONS[submissionData.type as ContentType] || 60;
        const startDate = new Date(`${submissionData.date}T${submissionData.time}`);
        const endDate = new Date(startDate.getTime() + duration * 60000);
        submissionData.endTime = endDate.toISOString();
      }
      
      // Add recurrence data if enabled
      if (recurrence.enabled) {
        submissionData.recurrence = recurrence.pattern;
      }
      
      // Submit the form
      await onSubmit?.(submissionData);
      
      toast({
        title: 'Success',
        description: mode === 'create' ? 'Event created successfully' : 'Event updated successfully',
      });
      
      // Additional cleanup or navigation logic
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit the form',
        variant: 'destructive',
      });
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
                onSelect={(date) => {
                  handleDateSelect(date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="schedule-time">Publish Time</Label>
          <Input
            id="schedule-time"
            name="time"
            type="time"
            value={formData.time || ''}
            onChange={handleTimeChange}
            required
          />
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Please select both a date and time for publishing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <Button 
            type="button" 
            className="w-full sm:flex-1 h-11 sm:h-10 touch-manipulation"
            onClick={() => {
              if (!formData.date) {
                setErrors(prev => ({
                  ...prev,
                  date: 'Please select a date'
                }));
                return;
              }
              
              if (!formData.time) {
                setErrors(prev => ({
                  ...prev,
                  time: 'Please select a time'
                }));
                return;
              }
              
              // Create a combined date from the selected date and time
              const dateStr = formData.date;
              const timeStr = formData.time;
              const scheduledDate = new Date(`${dateStr}T${timeStr}:00`);
              
              // Check if the date is valid
              if (isNaN(scheduledDate.getTime())) {
                setErrors(prev => ({
                  ...prev,
                  date: 'Invalid date or time format'
                }));
                return;
              }
              
              // If valid, call the onSchedule callback
              onSchedule?.(scheduledDate);
            }}
          >
            <span className="hidden sm:inline">Schedule Content</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        </div>
      </div>
    );
  }

  const TemplateManager = () => {
    const saveAsTemplate = async () => {
      const templateName = prompt('Enter template name:');
      if (!templateName) return;
      
      const template: ContentTemplate = {
        id: crypto.randomUUID(),
        name: templateName,
        type: formData.type as AllowedContentType,
        data: { ...formData },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      };
      
      // Save to localStorage or API
      const existingTemplates = JSON.parse(localStorage.getItem('contentTemplates') || '[]');
      existingTemplates.push(template);
      localStorage.setItem('contentTemplates', JSON.stringify(existingTemplates));
      
      setTemplates(prev => ({
        ...prev,
        templates: existingTemplates
      }));
      
      toast({
        title: 'Template Saved',
        description: `Template "${templateName}" has been saved successfully.`
      });
    };
    
    const loadTemplate = (template: ContentTemplate) => {
      setFormData(prev => ({
        ...prev,
        ...template.data,
        id: crypto.randomUUID() // Generate new ID
      }));
      
      // Update usage count
      const updatedTemplates = templates.templates.map(t => 
        t.id === template.id 
          ? { ...t, usageCount: t.usageCount + 1, updatedAt: new Date().toISOString() }
          : t
      );
      localStorage.setItem('contentTemplates', JSON.stringify(updatedTemplates));
      
      toast({
        title: 'Template Loaded',
        description: `Template "${template.name}" has been applied.`
      });
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Templates</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTemplates(prev => ({ ...prev, showTemplateDialog: true }))}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Load Template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveAsTemplate}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>
        </div>
        
        {templates.showTemplateDialog && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Template</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTemplates(prev => ({ ...prev, showTemplateDialog: false }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {templates.templates
                .filter(t => t.type === formData.type)
                .map(template => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => {
                      loadTemplate(template);
                      setTemplates(prev => ({ ...prev, showTemplateDialog: false }));
                    }}
                  >
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Used {template.usageCount} times • {format(new Date(template.updatedAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete template logic
                        const updatedTemplates = templates.templates.filter(t => t.id !== template.id);
                        localStorage.setItem('contentTemplates', JSON.stringify(updatedTemplates));
                        setTemplates(prev => ({ ...prev, templates: updatedTemplates }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              }
              {templates.templates.filter(t => t.type === formData.type).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found for {formData.type} content
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const RecurrenceSettings = () => {
    const generatePreviewDates = (pattern: RecurrencePattern, startDate: string): string[] => {
      const dates: string[] = [];
      const start = new Date(startDate);
      const maxDates = 10; // Show up to 10 preview dates
      
      for (let i = 0; i < maxDates; i++) {
        let nextDate = new Date(start);
        
        switch (pattern.type) {
          case 'daily':
            nextDate.setDate(start.getDate() + (i * pattern.interval));
            break;
          case 'weekly':
            nextDate.setDate(start.getDate() + (i * pattern.interval * 7));
            break;
          case 'monthly':
            nextDate.setMonth(start.getMonth() + (i * pattern.interval));
            break;
          case 'yearly':
            nextDate.setFullYear(start.getFullYear() + (i * pattern.interval));
            break;
        }
        
        if (pattern.endDate && nextDate > new Date(pattern.endDate)) break;
        if (pattern.occurrences && i >= pattern.occurrences) break;
        
        dates.push(format(nextDate, 'yyyy-MM-dd'));
      }
      
      return dates;
    };

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-recurrence"
            checked={recurrence.enabled}
            onCheckedChange={(checked) => {
              setRecurrence(prev => ({
                ...prev,
                enabled: !!checked,
                previewDates: checked ? generatePreviewDates(prev.pattern, formData.date || '') : []
              }));
            }}
          />
          <Label htmlFor="enable-recurrence" className="font-medium">
            Make this a recurring event
          </Label>
        </div>
        
        {recurrence.enabled && (
          <div className="space-y-4 ml-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Repeat</Label>
                <Select
                  value={recurrence.pattern.type}
                  onValueChange={(value: RecurrencePattern['type']) => {
                    const newPattern = { ...recurrence.pattern, type: value };
                    setRecurrence(prev => ({
                      ...prev,
                      pattern: newPattern,
                      previewDates: generatePreviewDates(newPattern, formData.date || '')
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={recurrence.pattern.interval}
                    onChange={(e) => {
                      const interval = parseInt(e.target.value) || 1;
                      const newPattern = { ...recurrence.pattern, interval };
                      setRecurrence(prev => ({
                        ...prev,
                        pattern: newPattern,
                        previewDates: generatePreviewDates(newPattern, formData.date || '')
                      }));
                    }}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {recurrence.pattern.type === 'daily' && 'day(s)'}
                    {recurrence.pattern.type === 'weekly' && 'week(s)'}
                    {recurrence.pattern.type === 'monthly' && 'month(s)'}
                    {recurrence.pattern.type === 'yearly' && 'year(s)'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  value={recurrence.pattern.endDate || ''}
                  onChange={(e) => {
                    const newPattern = { ...recurrence.pattern, endDate: e.target.value };
                    setRecurrence(prev => ({
                      ...prev,
                      pattern: newPattern,
                      previewDates: generatePreviewDates(newPattern, formData.date || '')
                    }));
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Or after (occurrences)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={recurrence.pattern.occurrences || ''}
                  onChange={(e) => {
                    const occurrences = e.target.value ? parseInt(e.target.value) : undefined;
                    const newPattern = { ...recurrence.pattern, occurrences };
                    setRecurrence(prev => ({
                      ...prev,
                      pattern: newPattern,
                      previewDates: generatePreviewDates(newPattern, formData.date || '')
                    }));
                  }}
                  placeholder="Number of events"
                />
              </div>
            </div>
            
            {recurrence.previewDates.length > 0 && (
              <div className="space-y-2">
                <Label>Preview Dates</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    {recurrence.previewDates.slice(0, 6).map((date, index) => (
                      <div key={index} className="text-muted-foreground">
                        {format(new Date(date), 'MMM dd, yyyy')}
                      </div>
                    ))}
                    {recurrence.previewDates.length > 6 && (
                      <div className="text-muted-foreground font-medium">
                        +{recurrence.previewDates.length - 6} more...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'create' || mode === 'edit' ? (
        <>
          {/* Auto-save indicator */}
          {autoSave.enabled && autoSave.isDirty && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <Clock className="h-4 w-4" />
              {autoSave.lastSaved ? (
                `Last saved: ${format(autoSave.lastSaved, 'HH:mm:ss')}`
              ) : (
                'Auto-saving enabled'
              )}
            </div>
          )}
          
          {/* Template Manager */}
          <TemplateManager />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
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
                className="min-h-[100px] sm:min-h-[80px] text-base sm:text-sm touch-manipulation resize-y"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11 sm:h-10 text-base sm:text-sm touch-manipulation",
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
                  className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
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
                <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation">
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

            {/* Add Recurring Events section after the time field */}
            <RecurrenceSettings />

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

          {/* Mobile-optimized button layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:flex-1 h-11 sm:h-10 touch-manipulation"
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }));
                handleSubmit(new Event('submit') as any);
              }}
              disabled={isSubmitting}
              className="w-full sm:flex-1 h-11 sm:h-10 touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Saving...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Save as Draft</span>
                  <span className="sm:hidden">Draft</span>
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 h-11 sm:h-10 touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                  <span className="sm:hidden">{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{mode === 'edit' ? 'Update Event' : 'Create Event'}</span>
                  <span className="sm:hidden">{mode === 'edit' ? 'Update' : 'Create'}</span>
                </>
              )}
            </Button>
          </div>
        </>
      ) : null}
    </form>
  );
}
