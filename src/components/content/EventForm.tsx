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

interface EventFormProps {
  initialData?: CalendarEvent;
  mode?: 'create' | 'edit';
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const contentTypes = [
  { value: 'email', label: 'Email Campaign' },
  { value: 'social', label: 'Social Media Post' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'other', label: 'Other' },
] as const;

const socialPlatforms = [
  { value: 'FACEBOOK', label: 'Facebook', icon: Facebook },
  { value: 'TWITTER', label: 'Twitter', icon: Twitter },
  { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: Linkedin },
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
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center",
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
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            Drag and drop or click to upload media
          </div>
          <div className="text-xs text-muted-foreground">
            Supported types: {supportedTypes.join(", ")}
          </div>
        </label>
      </div>

      {currentMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {currentMedia.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

export function EventForm({ initialData, mode = 'create', onSubmit, onCancel }: EventFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>(
    initialData || {
      title: '',
      description: '',
      date: new Date().toISOString(),
      time: format(new Date(), 'HH:mm'),
      type: 'email',
      status: 'draft',
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      }
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(
    initialData?.socialMediaContent?.platforms || []
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);

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

  const handleContentTypeChange = (value: ContentType) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      setFormData(prev => {
        const currentSocialContent = prev.socialMediaContent || {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        };

        return {
          ...prev,
          socialMediaContent: {
            ...currentSocialContent,
            platforms: newPlatforms,
            platformSpecificContent: {
              ...currentSocialContent.platformSpecificContent,
              [platform]: currentSocialContent.platformSpecificContent[platform] || {
                text: '',
                mediaUrls: [],
                scheduledTime: prev.time
              }
            }
          }
        };
      });

      return newPlatforms;
    });
  };

  const handlePlatformContentChange = (platform: SocialPlatform, content: string) => {
    setFormData(prev => {
      const currentSocialContent = prev.socialMediaContent || {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      };

      return {
        ...prev,
        socialMediaContent: {
          ...currentSocialContent,
          platformSpecificContent: {
            ...currentSocialContent.platformSpecificContent,
            [platform]: {
              ...currentSocialContent.platformSpecificContent[platform],
              text: content
            }
          }
        }
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
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
        const content = formData.socialMediaContent?.platformSpecificContent[platform];
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

  const handleMediaUpload = async (platform: SocialPlatform, files: File[]) => {
    setIsUploading(true);
    try {
      const newUrls = files.map(file => URL.createObjectURL(file));
      
      setFormData(prev => {
        const currentSocialContent = prev.socialMediaContent || {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        };

        const currentPlatformContent = currentSocialContent.platformSpecificContent[platform] || {
          text: '',
          mediaUrls: [],
          scheduledTime: prev.time
        };

        return {
          ...prev,
          socialMediaContent: {
            ...currentSocialContent,
            platformSpecificContent: {
              ...currentSocialContent.platformSpecificContent,
              [platform]: {
                ...currentPlatformContent,
                mediaUrls: [
                  ...(currentPlatformContent.mediaUrls || []),
                  ...newUrls
                ]
              }
            }
          }
        };
      });
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
      const currentSocialContent = prev.socialMediaContent || {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      };

      const currentPlatformContent = currentSocialContent.platformSpecificContent[platform] || {
        text: '',
        mediaUrls: [],
        scheduledTime: prev.time
      };

      return {
        ...prev,
        socialMediaContent: {
          ...currentSocialContent,
          platformSpecificContent: {
            ...currentSocialContent.platformSpecificContent,
            [platform]: {
              ...currentPlatformContent,
              mediaUrls: (currentPlatformContent.mediaUrls || []).filter((_, i) => i !== index)
            }
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: `Event ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      onCancel();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} event`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
            className={cn(errors.title && "border-destructive")}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
            className={cn(errors.description && "border-destructive")}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                    errors.date && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(formData.date)}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={handleTimeChange}
              required
              className={cn(errors.time && "border-destructive")}
            />
            {errors.time && (
              <p className="text-sm text-destructive mt-1">{errors.time}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Content Type</Label>
          <Select
            value={formData.type}
            onValueChange={handleContentTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.type === 'social' && (
          <div className="space-y-4">
            <Label>Social Media Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {socialPlatforms.map(platform => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.value}
                    type="button"
                    variant={selectedPlatforms.includes(platform.value as SocialPlatform) ? 'default' : 'outline'}
                    onClick={() => handlePlatformToggle(platform.value as SocialPlatform)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {platform.label}
                  </Button>
                );
              })}
            </div>

            {selectedPlatforms.map(platform => (
              <div key={platform} className="space-y-2">
                <Label>{platform} Content</Label>
                <Textarea
                  value={formData.socialMediaContent?.platformSpecificContent[platform]?.text || ''}
                  onChange={(e) => handlePlatformContentChange(platform, e.target.value)}
                  placeholder={`Enter ${platform.toLowerCase()} content`}
                  maxLength={platformContentLimits[platform].maxTextLength}
                  className={cn(
                    errors.socialMediaContent?.[platform]?.text && "border-destructive"
                  )}
                />
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">
                    {formData.socialMediaContent?.platformSpecificContent[platform]?.text?.length || 0} / {platformContentLimits[platform].maxTextLength} characters
                  </p>
                  {errors.socialMediaContent?.[platform]?.text && (
                    <p className="text-destructive">{errors.socialMediaContent[platform].text}</p>
                  )}
                </div>

                <MediaUploader
                  platform={platform}
                  maxCount={platformContentLimits[platform].maxMediaCount}
                  supportedTypes={platformContentLimits[platform].supportedMediaTypes}
                  currentMedia={formData.socialMediaContent?.platformSpecificContent[platform]?.mediaUrls || []}
                  onUpload={(files) => handleMediaUpload(platform, files)}
                  onRemove={(index) => handleMediaRemove(platform, index)}
                />
                {errors.socialMediaContent?.[platform]?.mediaUrls && (
                  <p className="text-sm text-destructive">
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
          disabled={isSubmitting || isUploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Event' : 'Update Event'}
        </Button>
      </div>
    </form>
  );
} 