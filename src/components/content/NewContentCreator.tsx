"use client";

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuickStartStep } from './creator/QuickStartStep';
import { CreateContentStep } from './creator/CreateContentStep';
import { OptimizeScheduleStep } from './creator/OptimizeScheduleStep';
import { useRouter } from 'next/navigation';

export type ContentType = 'social-post' | 'email' | 'blog' | 'video' | 'newsletter' | 'announcement';
export type Platform = 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'email' | 'blog';

export interface ContentData {
  type: ContentType;
  platforms: Platform[];
  title: string;
  content: string;
  media?: File[];
  scheduleType: 'now' | 'later' | 'optimal';
  scheduledDate?: Date;
  tags?: string[];
  tone?: 'professional' | 'casual' | 'friendly' | 'urgent' | 'educational';
}

type Step = 'quick-start' | 'create' | 'optimize';

const steps = [
  { id: 'quick-start', label: 'Quick Start', icon: Sparkles },
  { id: 'create', label: 'Create Content', icon: Send },
  { id: 'optimize', label: 'Optimize & Schedule', icon: Clock },
];

interface NewContentCreatorProps {
  initialData?: any;
  mode?: 'create' | 'edit';
  contentId?: string;
}

export function NewContentCreator({ initialData, mode = 'create', contentId }: NewContentCreatorProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('quick-start');
  const [contentData, setContentData] = useState<Partial<ContentData>>(() => {
    if (mode === 'edit' && initialData) {
      // Map API data to our ContentData format
      return {
        type: mapApiTypeToContentType(initialData.type),
        platforms: [], // You might need to derive this from initialData
        title: initialData.title || '',
        content: initialData.content || '',
        scheduleType: initialData.status === 'PUBLISHED' ? 'now' : 
                      initialData.scheduledAt ? 'later' : 'now',
        scheduledDate: initialData.scheduledAt ? new Date(initialData.scheduledAt) : undefined,
        tags: initialData.tags || [],
        tone: 'professional' // Default, could be derived from initialData if available
      };
    }
    return {
      scheduleType: 'now',
      tone: 'professional'
    };
  });

  // Helper function to map API types back to UI types
  const mapApiTypeToContentType = (apiType: string): ContentType => {
    const typeMap: Record<string, ContentType> = {
      'SOCIAL': 'social-post',
      'EMAIL': 'email',
      'BLOG': 'blog',
      'ARTICLE': 'blog'
    };
    return typeMap[apiType] || 'social-post';
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateContentData = (updates: Partial<ContentData>) => {
    setContentData(prev => ({ ...prev, ...updates }));
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as Step);
    }
  };

  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as Step);
    }
  };

  const handleBack = () => {
    if (currentStep === 'quick-start') {
      router.push('/content');
    } else {
      goToPreviousStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 'quick-start' ? 'Back to Content' : 'Previous'}
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Content</h1>
                <p className="text-sm text-gray-500">
                  {steps.find(step => step.id === currentStep)?.label}
                </p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <StepIcon className="h-3 w-3" />
                      <span className="hidden md:inline">{step.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="sm:hidden w-24">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{currentStepIndex + 1} of {steps.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="p-6 sm:p-8">
            {currentStep === 'quick-start' && (
              <QuickStartStep
                contentData={contentData}
                onUpdate={updateContentData}
                onNext={goToNextStep}
              />
            )}
            
            {currentStep === 'create' && (
              <CreateContentStep
                contentData={contentData}
                onUpdate={updateContentData}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            )}
            
            {currentStep === 'optimize' && (
              <OptimizeScheduleStep
                contentData={contentData}
                onUpdate={updateContentData}
                onPrevious={goToPreviousStep}
                mode={mode}
                contentId={contentId}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}