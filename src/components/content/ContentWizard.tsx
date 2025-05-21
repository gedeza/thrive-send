import React, { useState } from 'react';
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

interface ContentWizardProps {
  onComplete: (event: CalendarEvent) => void;
  initialData?: Partial<CalendarEvent>;
}

const steps = [
  { id: 'type', label: 'Content Type' },
  { id: 'details', label: 'Content Details' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'preview', label: 'Preview' },
] as const;

type Step = typeof steps[number]['id'];

type ContentType = 'blog' | 'social' | 'email' | 'other';

export function ContentWizard({ onComplete, initialData }: ContentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'schedule' | 'preview'>('type');
  const [event, setEvent] = useState<Partial<CalendarEvent>>(() => ({
    id: initialData?.id || crypto.randomUUID(),
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'blog',
    status: initialData?.status || 'draft',
    date: initialData?.date || new Date().toISOString(),
    time: initialData?.time || '',
    socialMediaContent: initialData?.socialMediaContent || {
      platforms: [],
      mediaUrls: [],
      crossPost: false,
      platformSpecificContent: {}
    }
  }));

  const progress = ((steps.findIndex(step => step.id === currentStep) + 1) / steps.length) * 100;

  const handleContentTypeSelect = (type: string) => {
    setEvent(prev => ({
      ...prev,
      type: type as ContentType
    }));
    setCurrentStep('details');
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
    setEvent(prev => ({
      ...prev,
      date: date.toISOString(),
      status: 'scheduled'
    }));
  };

  const handleComplete = async () => {
    try {
      const eventData: CalendarEvent = {
        id: event.id!,
        title: event.title!,
        description: event.description!,
        type: event.type!,
        status: event.status!,
        date: event.date!,
        time: event.time!,
        socialMediaContent: event.socialMediaContent!
      };

      await onComplete(eventData);
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'type':
        return Boolean(event.type);
      case 'details':
        return Boolean(event.title?.trim() && event.description?.trim());
      case 'schedule':
        return true; // Schedule is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New Content</CardTitle>
          <CardDescription>
            Follow the steps below to create and schedule your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-2',
                      index < steps.findIndex(s => s.id === currentStep) && 'text-primary',
                      index === steps.findIndex(s => s.id === currentStep) && 'font-medium'
                    )}
                  >
                    <span className="hidden md:inline">{step.label}</span>
                    <span className="md:hidden">{index + 1}</span>
                  </div>
                ))}
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              {currentStep === 'type' && (
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

              {currentStep === 'details' && (
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

              {currentStep === 'schedule' && (
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

              {currentStep === 'preview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preview Your Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your content before publishing.
                  </p>
                  <EventDetails event={event as CalendarEvent} />
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'type'}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === 'preview' ? 'Create Content' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 