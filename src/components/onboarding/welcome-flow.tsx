"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Plus, Clock, Share2, BarChart2, Settings, Users, Bell } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface WelcomeFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeFlow({ isOpen, onClose }: WelcomeFlowProps) {
  const { currentStep, steps, completeStep, skipStep, setCurrentStep } = useOnboarding();
  const totalSteps = steps.length;

  const currentStepData = steps[currentStep];

  // Handle loading state when steps are not yet available
  if (!currentStepData || totalSteps === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Loading...
            </DialogTitle>
            <DialogDescription>
              Preparing your onboarding experience...
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const Icon = getIconForStep(currentStepData.id);

  const handleNext = async () => {
    try {
      await completeStep(currentStepData.id);
      
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onClose();
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const handleSkip = async () => {
    try {
      await skipStep(currentStepData.id);
      
    if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
    } else {
      onClose();
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const handleClose = async () => {
    try {
      // If we're not on the last step, confirm before closing
      if (currentStep < totalSteps - 1) {
        const confirmed = window.confirm('Are you sure you want to exit the onboarding? You can always restart it later.');
        if (!confirmed) return;
      }
    onClose();
    } catch (_error) {
      console.error("", _error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary" />
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription>
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {getStepContent(currentStepData.id)}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center my-4">
          <div className="flex gap-2">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  i === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
          >
            Skip Tutorial
          </Button>
          <Button onClick={handleNext}>
            {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getIconForStep(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return Calendar;
    case 'account-setup':
      return Settings;
    case 'first-campaign':
      return Plus;
    case 'content-creation':
      return BarChart2;
    case 'client-management':
      return Users;
    case 'multi-client-campaign':
      return Share2;
    case 'client-reporting':
      return BarChart2;
    case 'team-collaboration':
      return Users;
    case 'integrations':
      return Share2;
    case 'advanced-features':
      return Bell;
    default:
      return Calendar;
  }
}

// Fix hardcoded colors in step content
function getStepContent(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return (
        <div className="space-y-8">
          <div className="relative w-full h-[300px] mb-8 rounded-lg overflow-hidden bg-muted">
            <Image
              src="/docs/images/analytics-dashboard-screenshot.png"
              alt="Analytics Dashboard Screenshot"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Content Calendar</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Plan and schedule content</li>
                <li>• Visual calendar interface</li>
                <li>• Drag & drop functionality</li>
                <li>• Multi-platform publishing</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Analytics Dashboard</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Real-time performance metrics</li>
                <li>• Engagement tracking</li>
                <li>• ROI analysis</li>
                <li>• Custom reports</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'account-setup':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Profile Setup</h4>
              <ol className="space-y-4 text-lg text-muted-foreground">
                <li>1. Complete your profile information</li>
                <li>2. Upload your company logo</li>
                <li>3. Set your brand colors</li>
                <li>4. Configure notification preferences</li>
              </ol>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Brand Guidelines</h4>
              <ol className="space-y-4 text-lg text-muted-foreground">
                <li>1. Define your brand voice</li>
                <li>2. Set content templates</li>
                <li>3. Create approval workflows</li>
                <li>4. Configure publishing rules</li>
              </ol>
            </div>
          </div>
        </div>
      );

    case 'first-campaign':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Content Types</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Social media posts</li>
                <li>• Blog articles</li>
                <li>• Email campaigns</li>
                <li>• Video content</li>
                <li>• Infographics</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Publishing Platforms</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Facebook & Instagram</li>
                <li>• Twitter & LinkedIn</li>
                <li>• YouTube & TikTok</li>
                <li>• WordPress & Medium</li>
                <li>• Custom integrations</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'team-collaboration':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Team Roles</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Content Creators</li>
                <li>• Reviewers & Editors</li>
                <li>• Approvers & Publishers</li>
                <li>• Analytics Viewers</li>
                <li>• Admin Users</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Collaboration Features</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Real-time editing</li>
                <li>• Comment & feedback system</li>
                <li>• Approval workflows</li>
                <li>• Task assignments</li>
                <li>• Activity notifications</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'content-creation':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Content Planning</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Content calendar management</li>
                <li>• Editorial workflows</li>
                <li>• Publishing schedules</li>
                <li>• Content templates</li>
                <li>• Brand consistency</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Content Creation</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Rich text editor</li>
                <li>• Media management</li>
                <li>• Version control</li>
                <li>• Collaboration tools</li>
                <li>• Preview & testing</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'client-management':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Client Organization</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Multiple client workspaces</li>
                <li>• Client-specific branding</li>
                <li>• Isolated content libraries</li>
                <li>• Custom workflows</li>
                <li>• Client access controls</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Service Management</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Service provider dashboard</li>
                <li>• Client onboarding tools</li>
                <li>• Billing & invoicing</li>
                <li>• Performance tracking</li>
                <li>• White-label options</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'multi-client-campaign':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Cross-Client Campaigns</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Unified campaign management</li>
                <li>• Template sharing</li>
                <li>• Bulk content creation</li>
                <li>• Cross-client analytics</li>
                <li>• Collaborative workflows</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Efficiency Tools</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Content duplication</li>
                <li>• Automated scheduling</li>
                <li>• Batch operations</li>
                <li>• Client approval flows</li>
                <li>• Performance comparison</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'client-reporting':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Automated Reports</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Scheduled report delivery</li>
                <li>• Client-specific metrics</li>
                <li>• Custom report templates</li>
                <li>• White-label reports</li>
                <li>• Executive summaries</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Client Dashboards</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Real-time performance data</li>
                <li>• Interactive visualizations</li>
                <li>• ROI tracking</li>
                <li>• Goal progress monitoring</li>
                <li>• Client portal access</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'advanced-features':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Analytics</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Performance tracking</li>
                <li>• Engagement analytics</li>
                <li>• ROI measurement</li>
                <li>• Custom dashboards</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Automation</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Smart scheduling</li>
                <li>• Content optimization</li>
                <li>• Workflow automation</li>
                <li>• AI-powered insights</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Optimization</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• A/B testing</li>
                <li>• Content suggestions</li>
                <li>• Best time optimization</li>
                <li>• Performance insights</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'integrations':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Social Platforms</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Facebook Business</li>
                <li>• Instagram Business</li>
                <li>• Twitter API</li>
                <li>• LinkedIn Company</li>
                <li>• YouTube Channel</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Analytics Tools</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• Google Analytics</li>
                <li>• Facebook Pixel</li>
                <li>• Custom tracking</li>
                <li>• Performance metrics</li>
                <li>• ROI tracking</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h4 className="text-xl font-medium mb-4">Additional Tools</h4>
              <ul className="space-y-2 text-lg text-muted-foreground">
                <li>• CRM integration</li>
                <li>• Marketing automation</li>
                <li>• Customer support</li>
                <li>• Project management</li>
                <li>• Custom webhooks</li>
              </ul>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}