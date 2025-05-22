import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEvent, SocialPlatform, SocialMediaContent } from '@/components/content/content-calendar';
import { EventForm } from './EventForm';
import { EventDetails } from './EventDetails';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { saveContent } from '@/lib/api/content-service';
import { toast } from '@/components/ui/use-toast';
import { Alert } from '@/components/ui/Alert';
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, Loader2 } from 'lucide-react';

interface ContentWizardProps {
  onComplete?: (event: CalendarEvent) => void;
  initialData?: Partial<CalendarEvent>;
}

type Step = "type" | "details" | "schedule" | "preview";

type WizardStep = {
  id: Step;
  label: string;
  description: string;
  validation?: (event: Partial<CalendarEvent>) => boolean;
};

type ValidationErrorType = 
  | 'required'
  | 'length'
  | 'format'
  | 'media'
  | 'schedule'
  | 'content-type';

interface ValidationError {
  step: Step;
  type: ValidationErrorType;
  message: string;
  field?: string;
  details?: string;
}

type ContentType = "blog" | "social" | "email" | "article";

const steps: WizardStep[] = [
  {
    id: "type",
    label: "Content Type",
    description: "Choose the type of content you want to create.",
    validation: (event) => Boolean(event.type)
  },
  {
    id: "details",
    label: "Content Details",
    description: "Write your content and add any media you'd like to include.",
    validation: (event) => Boolean(event.title?.trim() && event.description?.trim())
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "Choose when you want your content to be published.",
    validation: (event) => {
      if (!event.date) return false;
      const date = new Date(event.date);
      const now = new Date();
      // Allow scheduling for today or future dates
      return !isNaN(date.getTime()) && date >= new Date(now.setHours(0, 0, 0, 0));
    }
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review your content before publishing.",
    validation: (event) => true
  }
];

// Add type guard
const isAllowedContentType = (type: string): type is ContentType => {
  return ["blog", "social", "email", "article"].includes(type);
};

// Content type specific validation rules
const contentTypeValidationRules = {
  blog: {
    minLength: 500,
    maxLength: 5000,
    requiredFields: ['title', 'description'],
    mediaRequirements: {
      minImages: 1,
      maxImages: 10,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif']
    }
  },
  social: {
    minLength: 10,
    maxLength: 280,
    requiredFields: ['title', 'description', 'socialMediaContent.platforms'],
    mediaRequirements: {
      minImages: 0,
      maxImages: 4,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    }
  },
  email: {
    minLength: 100,
    maxLength: 2000,
    requiredFields: ['title', 'description', 'content', 'preheaderText'],
    mediaRequirements: {
      minImages: 0,
      maxImages: 5,
      supportedFormats: ['image/jpeg', 'image/png']
    }
  },
  article: {
    minLength: 50,
    maxLength: 1000,
    requiredFields: ['title', 'description'],
    mediaRequirements: {
      minImages: 0,
      maxImages: 3,
      supportedFormats: ['image/jpeg', 'image/png']
    }
  }
} as const;

// Analytics interface
interface AnalyticsEvent {
  step: Step;
  action: 'start' | 'complete' | 'error' | 'back' | 'next' | 'validation' | 'media_upload' | 'preview';
  contentType?: ContentType;
  error?: string;
  duration?: number;
  metadata?: {
    contentLength?: number;
    mediaCount?: number;
    validationErrors?: string[];
    platformCount?: number;
    timeSpent?: number;
    interactionCount?: number;
  };
}

// Mock analytics tracking function (replace with your actual analytics implementation)
const trackEvent = (event: AnalyticsEvent) => {
  console.log('Analytics Event:', event);
  // Implement your analytics tracking here
};

export function ContentWizard({ onComplete, initialData }: ContentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [event, setEvent] = useState<Partial<CalendarEvent>>(() => ({
    id: initialData?.id || crypto.randomUUID(),
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || "blog",
    status: initialData?.status || "draft",
    date: initialData?.date || new Date().toISOString(),
    time: initialData?.time || '',
    socialMediaContent: initialData?.socialMediaContent || {
      platforms: [],
      mediaUrls: [],
      crossPost: false,
      platformSpecificContent: {}
    }
  }));
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  } | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const progress = ((steps.findIndex(step => step.id === currentStep) + 1) / steps.length) * 100;

  // Track step changes
  useEffect(() => {
    const duration = Date.now() - stepStartTime;
    trackEvent({
      step: currentStep,
      action: 'complete',
      contentType: event.type,
      duration
    });
    setStepStartTime(Date.now());
  }, [currentStep]);

  // Track time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Enhanced analytics tracking
  const trackAnalytics = (action: AnalyticsEvent['action'], metadata?: AnalyticsEvent['metadata']) => {
    const analyticsEvent: AnalyticsEvent = {
      step: currentStep,
      action,
      contentType: event.type,
      duration: Date.now() - stepStartTime,
      metadata: {
        ...metadata,
        timeSpent,
        interactionCount,
        contentLength: event.description?.length,
        mediaCount: event.socialMediaContent?.mediaUrls.length,
        platformCount: event.socialMediaContent?.platforms.length
      }
    };
    trackEvent(analyticsEvent);
  };

  // Enhanced validation for content type specific rules
  const validateContentTypeRules = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const rules = contentTypeValidationRules[event.type as keyof typeof contentTypeValidationRules];

    if (!rules) return errors;

    // Validate content length
    if (event.description) {
      const length = event.description.length;
      if (length < rules.minLength) {
        errors.push({
          step: 'details',
          type: 'length',
          message: `Content is too short`,
          field: 'description',
          details: `Minimum length is ${rules.minLength} characters`
        });
      }
      if (length > rules.maxLength) {
        errors.push({
          step: 'details',
          type: 'length',
          message: `Content is too long`,
          field: 'description',
          details: `Maximum length is ${rules.maxLength} characters`
        });
      }
    }

    // Validate required fields
    rules.requiredFields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields (e.g., socialMediaContent.platforms)
        const [parent, child] = field.split('.');
        const parentValue = event[parent as keyof typeof event];
        if (!parentValue || !(parentValue as any)[child]) {
          errors.push({
            step: 'details',
            type: 'required',
            message: `${child} is required`,
            field: child,
            details: `Please select at least one social media platform`
          });
        }
      } else if (!event[field as keyof typeof event]) {
        errors.push({
          step: 'details',
          type: 'required',
          message: `${field} is required`,
          field
        });
      }
    });

    // Validate media requirements
    if (event.socialMediaContent?.mediaUrls) {
      const mediaCount = event.socialMediaContent.mediaUrls.length;
      if (mediaCount < rules.mediaRequirements.minImages) {
        errors.push({
          step: 'details',
          type: 'media',
          message: `Not enough media files`,
          field: 'mediaUrls',
          details: `Minimum ${rules.mediaRequirements.minImages} media files required`
        });
      }
      if (mediaCount > rules.mediaRequirements.maxImages) {
        errors.push({
          step: 'details',
          type: 'media',
          message: `Too many media files`,
          field: 'mediaUrls',
          details: `Maximum ${rules.mediaRequirements.maxImages} media files allowed`
        });
      }
    }

    return errors;
  };

  // Track user interactions
  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
    trackAnalytics('validation');
  };

  // Enhanced step validation with analytics
  const validateStep = (step: Step): boolean => {
    handleInteraction();
    const stepConfig = steps.find(s => s.id === step);
    if (!stepConfig?.validation) return true;
    
    const baseValidation = stepConfig.validation(event);
    if (!baseValidation) {
      const error: ValidationError = {
        step,
        type: 'required',
        message: `Please complete all required fields in ${stepConfig.label}`,
        field: step
      };
      setValidationErrors(prev => [...prev, error]);
      handleError(error);
      return false;
    }

    if (step === 'details') {
      const contentTypeErrors = validateContentTypeRules();
      if (contentTypeErrors.length > 0) {
        setValidationErrors(prev => [...prev, ...contentTypeErrors]);
        contentTypeErrors.forEach(handleError);
        return false;
      }
    }

    return true;
  };

  // Enhanced error handling with accessibility
  const handleError = (error: ValidationError) => {
    setFeedback({
      type: error.type === 'required' ? 'info' : 'error',
      message: error.message
    });

    setAnnouncement(`${error.type === 'required' ? 'Notice' : 'Error'}: ${error.message}. ${error.details || ''}`);

    // Only show destructive toast for critical errors
    if (error.type !== 'required') {
      toast({
        title: 'Validation Error',
        description: error.details || error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Required Field',
        description: error.details || error.message,
      });
    }

    trackAnalytics('error', {
      validationErrors: [error.message]
    });
  };

  // Enhanced success handling with accessibility
  const handleSuccess = (message: string) => {
    setFeedback({
      type: 'success',
      message
    });

    setAnnouncement(`Success: ${message}`);

    toast({
      title: 'Success',
      description: message,
    });

    trackAnalytics('complete');
  };

  const handleContentTypeSelect = (type: string) => {
    if (!isAllowedContentType(type)) {
      setFeedback({
        type: 'info',
        message: 'Please select a valid content type'
      });
      return;
    }

    setEvent(prev => ({
      ...prev,
      type: type as ContentType
    }));
    setCurrentStep("details");
  };

  const handleContentUpdate = (content: string, mediaUrls: string[]) => {
    setEvent(prev => {
      const currentSocialContent = prev.socialMediaContent || {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      };

      return {
        ...prev,
        description: content,
        socialMediaContent: {
          ...currentSocialContent,
          mediaUrls
        }
      };
    });
  };

  const handleTitleChange = (title: string) => {
    setEvent(prev => ({
      ...prev,
      title
    }));
  };

  const handleSchedule = (date: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (date < now) {
      toast({
        title: 'Invalid Date',
        description: 'Please select today or a future date',
        variant: 'destructive',
      });
      return;
    }

    setEvent(prev => ({
      ...prev,
      date: date.toISOString(),
      time: prev.time || '12:00', // Set default time if not provided
      status: "scheduled"
    }));

    // Show success feedback
    setFeedback({
      type: 'success',
      message: `Content scheduled for ${format(date, 'MMMM d, yyyy')}`
    });

    // Track the scheduling
    trackAnalytics('validation', {
      validationErrors: []
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Validate all steps before completing
      const allStepsValid = steps.every(step => validateStep(step.id));
      if (!allStepsValid) {
        throw new Error("Please complete all required fields before submitting");
      }

      // Ensure we have the required fields
      if (!event.title || !event.type || !event.description) {
        throw new Error("Title, content type, and content are required");
      }

      // Additional validation for social media content
      if (event.type === 'social') {
        console.log('Validating social media content:', {
          platforms: event.socialMediaContent?.platforms,
          hasPlatforms: Boolean(event.socialMediaContent?.platforms),
          platformsLength: event.socialMediaContent?.platforms?.length
        });
        
        if (!event.socialMediaContent?.platforms || event.socialMediaContent.platforms.length === 0) {
          throw new Error("Please select at least one social media platform");
        }
      }

      // Prepare the data for the content service
      const contentData = {
        title: event.title,
        type: event.type,
        content: event.description,
        tags: event.socialMediaContent?.platforms || [],
        status: event.status || 'draft',
        scheduledAt: event.date ? new Date(event.date).toISOString() : undefined,
        media: event.socialMediaContent?.mediaUrls || [],
        excerpt: event.description?.substring(0, 200) || undefined,
        platforms: event.type === 'social' ? event.socialMediaContent?.platforms : undefined,
      };

      console.log('Sending content data:', contentData);

      // Save using the content service
      const savedContent = await saveContent(contentData);
      console.log('Content saved:', savedContent);
      
      // Call onComplete if provided
      if (onComplete) {
        const calendarEvent: CalendarEvent = {
          id: savedContent.id,
          title: savedContent.title,
          description: savedContent.content,
          type: savedContent.type,
          status: savedContent.status === 'published' ? 'sent' : 
                 savedContent.status === 'archived' ? 'failed' : 
                 savedContent.status === 'scheduled' ? 'scheduled' : 'draft',
          date: savedContent.scheduledAt || savedContent.createdAt,
          time: savedContent.scheduledAt ? new Date(savedContent.scheduledAt).toLocaleTimeString() : undefined,
          socialMediaContent: {
            platforms: savedContent.tags as SocialPlatform[],
            mediaUrls: savedContent.media || [],
            crossPost: false,
            platformSpecificContent: {}
          },
          analytics: {
            lastUpdated: new Date().toISOString()
          }
        };
        await onComplete(calendarEvent);
      }
      
      toast({
        title: 'Success',
        description: 'Content saved successfully',
        action: (
          <Button
            variant="outline"
            onClick={() => router.push('/content/calendar')}
            className="mt-2"
          >
            View Content
          </Button>
        ),
      });
      
      // Navigate to the calendar view
      router.push('/content/calendar');
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

  const canProceed = () => {
    const currentStepConfig = steps.find(step => step.id === currentStep);
    return currentStepConfig?.validation?.(event) ?? true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      setErrors(prev => prev.filter(error => error.step !== currentStep));
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
      setErrors(prev => prev.filter(error => error.step !== currentStep));
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      {/* Accessibility Announcements */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {announcement}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New Content</CardTitle>
          <CardDescription>
            Follow the steps below to create and schedule your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Progress Bar with ARIA labels */}
            <div className="space-y-4">
              <div 
                className="flex justify-between text-sm text-muted-foreground"
                role="navigation"
                aria-label="Content creation steps"
              >
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-2',
                      index < steps.findIndex(s => s.id === currentStep) && 'text-primary',
                      index === steps.findIndex(s => s.id === currentStep) && 'font-medium'
                    )}
                    role="tab"
                    aria-selected={index === steps.findIndex(s => s.id === currentStep)}
                    aria-label={`Step ${index + 1}: ${step.label}`}
                  >
                    <span className="hidden md:inline">{step.label}</span>
                    <span className="md:hidden">{index + 1}</span>
                  </div>
                ))}
              </div>
              <Progress 
                value={progress} 
                className="h-2"
                aria-label={`Progress: ${Math.round(progress)}% complete`}
              />
            </div>

            {/* Feedback Alert with ARIA labels */}
            {feedback && (
              <div
                role="alert"
                aria-live="polite"
                className={cn(
                  'transition-opacity duration-200 rounded-lg border p-4',
                  feedback.type === 'success' && 'bg-green-50 border-green-200',
                  feedback.type === 'error' && 'bg-red-50 border-red-200',
                  feedback.type === 'info' && 'bg-blue-50 border-blue-200'
                )}
              >
                <div className="flex items-center gap-2">
                  {feedback.type === 'error' ? (
                    <AlertCircleIcon className="h-4 w-4 text-red-500" aria-hidden="true" />
                  ) : feedback.type === 'success' ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" aria-hidden="true" />
                  ) : (
                    <InfoIcon className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {feedback.type === 'error' ? 'Error' : 
                       feedback.type === 'success' ? 'Success' : 'Information'}
                    </h3>
                    <p className="text-sm">{feedback.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Content with ARIA labels */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
              role="tabpanel"
              aria-labelledby={`step-${currentStep}`}
            >
              {currentStep === "type" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Content Type</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the type of content you want to create.
                  </p>
                  <EventForm
                    initialData={event}
                    onContentTypeChange={handleContentTypeSelect}
                    mode="type-select"
                  />
                </div>
              )}

              {currentStep === "details" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create Your Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Write your content and add any media you'd like to include.
                  </p>
                  <EventForm
                    initialData={event}
                    onContentChange={handleContentUpdate}
                    onTitleChange={handleTitleChange}
                    mode="content-edit"
                  />
                </div>
              )}

              {currentStep === "schedule" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Schedule Your Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose when you want your content to be published.
                  </p>
                  <EventForm
                    initialData={event}
                    onSchedule={handleSchedule}
                    mode="schedule"
                  />
                </div>
              )}

              {currentStep === "preview" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preview Your Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your content before publishing.
                  </p>
                  <EventDetails 
                    event={{
                      ...event,
                      scheduledDate: event.date ? new Date(event.date).toISOString() : undefined,
                      scheduledTime: event.time
                    } as CalendarEvent} 
                  />
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons with ARIA labels */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === "type"}
                aria-label="Go to previous step"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                aria-label={currentStep === "preview" ? "Create content" : "Go to next step"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>{currentStep === "preview" ? "Creating..." : "Processing..."}</span>
                  </>
                ) : (
                  currentStep === "preview" ? "Create Content" : "Next"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 