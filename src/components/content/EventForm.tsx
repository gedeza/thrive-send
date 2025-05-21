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
  mode?: 'create' | 'edit' | 'platform-select' | 'content-edit' | 'schedule';
  onPlatformsChange?: (platforms: SocialPlatform[]) => void;
  onContentChange?: (content: string, mediaUrls: string[]) => void;
  onSchedule?: (date: Date) => void;
  onSubmit?: (event: CalendarEvent) => void;
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

export function EventForm({
  initialData,
  mode = 'create',
  onPlatformsChange,
  onContentChange,
  onSchedule,
  onSubmit,
}: EventFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CalendarEvent>>(initialData || {
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

    onPlatformsChange?.(selectedPlatforms);
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

    onContentChange?.(content, formData.socialMediaContent?.mediaUrls || []);
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

      onContentChange?.(formData.socialMediaContent?.platformSpecificContent[platform]?.text || '', newUrls);
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

    onContentChange?.(formData.socialMediaContent?.platformSpecificContent[platform]?.text || '', formData.socialMediaContent?.platformSpecificContent[platform]?.mediaUrls || []);
  };

  const handleSchedule = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        scheduledDate: date.toISOString(),
      }));
      onSchedule?.(date);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      onSubmit?.(formData as CalendarEvent);
      toast({
        title: 'Success',
        description: `Event ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
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
      {mode === 'platform-select' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {socialPlatforms.map(platform => (
              <div key={platform.value} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.value}
                  checked={selectedPlatforms.includes(platform.value as SocialPlatform)}
                  onCheckedChange={() => handlePlatformToggle(platform.value as SocialPlatform)}
                />
                <Label htmlFor={platform.value} className="flex-1">
                  {platform.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.socialMediaContent && (
            <p className="text-sm text-destructive">{errors.socialMediaContent.text}</p>
          )}
        </div>
      )}

      {mode === 'content-edit' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={formData.socialMediaContent?.platformSpecificContent[selectedPlatforms[0]]?.text || ''}
              onChange={(content) => handlePlatformContentChange(selectedPlatforms[0], content)}
            />
            {errors.socialMediaContent && (
              <p className="text-sm text-destructive">{errors.socialMediaContent.text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Media</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMediaUpload(selectedPlatforms[0], Array.from(e.target.files));
                }
              }}
              className="hidden"
              multiple
              accept="image/*,video/*"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Media
            </Button>

            {selectedPlatforms.map(platform => (
              <MediaUploader
                key={platform}
                platform={platform}
                maxCount={platformContentLimits[platform].maxMediaCount}
                supportedTypes={platformContentLimits[platform].supportedMediaTypes}
                currentMedia={formData.socialMediaContent?.platformSpecificContent[platform]?.mediaUrls || []}
                onUpload={(files) => handleMediaUpload(platform, files)}
                onRemove={(index) => handleMediaRemove(platform, index)}
              />
            ))}
          </div>
        </div>
      )}

      {mode === 'schedule' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledDate ? (
                    format(new Date(formData.scheduledDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                  onSelect={handleSchedule}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.socialMediaContent && (
              <p className="text-sm text-destructive">{errors.socialMediaContent.mediaUrls}</p>
            )}
          </div>
        </div>
      )}

      {mode === 'create' || mode === 'edit' ? (
        <div className="flex justify-end gap-4">
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
      ) : null}
    </form>
  );
} 