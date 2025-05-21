import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEvent, SocialPlatform } from '@/types';
import { EventForm } from './EventForm';
import { EventDetails } from './EventDetails';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContentWizardProps {
  onComplete?: (event: CalendarEvent) => void;
}

const steps = [
  { id: 'platform', label: 'Select Platforms' },
  { id: 'content', label: 'Create Content' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'preview', label: 'Preview' },
] as const;

type Step = typeof steps[number]['id'];

export function ContentWizard({ onComplete }: ContentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('platform');
  const [event, setEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'social',
    status: 'draft',
    socialMediaContent: {
      platforms: [],
      text: '',
      mediaUrls: [],
    },
  });

  const progress = ((steps.findIndex(step => step.id === currentStep) + 1) / steps.length) * 100;

  const handlePlatformSelect = (platforms: SocialPlatform[]) => {
    setEvent(prev => ({
      ...prev,
      socialMediaContent: {
        ...prev.socialMediaContent,
        platforms,
      },
    }));
  };

  const handleContentUpdate = (content: string, mediaUrls: string[]) => {
    setEvent(prev => ({
      ...prev,
      socialMediaContent: {
        ...prev.socialMediaContent,
        text: content,
        mediaUrls,
      },
    }));
  };

  const handleSchedule = (date: Date) => {
    setEvent(prev => ({
      ...prev,
      scheduledDate: date.toISOString(),
    }));
  };

  const handleComplete = () => {
    if (onComplete && event.socialMediaContent?.platforms.length) {
      onComplete(event as CalendarEvent);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'platform':
        return event.socialMediaContent?.platforms.length > 0;
      case 'content':
        return Boolean(event.socialMediaContent?.text.trim());
      case 'schedule':
        return Boolean(event.scheduledDate);
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center',
                    index < steps.findIndex(s => s.id === currentStep) && 'text-primary'
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
          <div className="min-h-[400px]">
            {currentStep === 'platform' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Social Media Platforms</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the platforms where you want to publish your content.
                </p>
                <EventForm
                  initialData={event}
                  onPlatformsChange={handlePlatformSelect}
                  mode="platform-select"
                />
              </div>
            )}

            {currentStep === 'content' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Create Your Content</h3>
                <p className="text-sm text-muted-foreground">
                  Write your post and add any media you'd like to include.
                </p>
                <EventForm
                  initialData={event}
                  onContentChange={handleContentUpdate}
                  mode="content-edit"
                />
              </div>
            )}

            {currentStep === 'schedule' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Schedule Your Post</h3>
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
                <h3 className="text-lg font-medium">Preview Your Post</h3>
                <p className="text-sm text-muted-foreground">
                  Review how your content will appear on each platform.
                </p>
                <EventDetails event={event as CalendarEvent} />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'platform'}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === 'preview' ? 'Schedule Post' : 'Next'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 