
## 3. Fixed Color System Violations in welcome-flow.tsx

```tsx:%2FUsers%2Fnhla%2FDesktop%2FPROJECTS%2F2025%2Fthrive-send%2Fsrc%2Fcomponents%2Fonboarding%2Fwelcome-flow.tsx
'use client';

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
  const Icon = getIconForStep(currentStepData.id);

  const handleNext = async () => {
    try {
      await completeStep(currentStepData.id);
      
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error completing step:', error);
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
    } catch (error) {
      console.error('Error skipping step:', error);
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
    } catch (error) {
      console.error('Error closing onboarding:', error);
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
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentStep
                    ? 'bg-primary'
                    : i < currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {!currentStepData.isRequired && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            
            <Button onClick={handleNext}>
              {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStepContent(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Welcome to ThriveSend! 🎉</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Your all-in-one content marketing platform. Let's get you set up in just a few minutes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Content Calendar</h4>
              <p className="text-sm text-muted-foreground">
                Plan, schedule, and manage all your content in one place.
              </p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <BarChart2 className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Analytics Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Track performance and optimize your content strategy.
              </p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Team Collaboration</h4>
              <p className="text-sm text-muted-foreground">
                Work together with approval workflows and role management.
              </p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <Share2 className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Multi-Platform Publishing</h4>
              <p className="text-sm text-muted-foreground">
                Publish to all your social media channels simultaneously.
              </p>
            </div>
          </div>
        </div>
      );
      
    case 'account-setup':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Set Up Your Account</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Complete your profile to personalize your ThriveSend experience.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg border">
            <h4 className="font-semibold mb-4">Account Setup Checklist</h4>
            <ul className="space-y-2 text-lg text-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Complete your profile information
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Set your timezone and preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Choose your content categories
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Configure notification settings
              </li>
            </ul>
          </div>
          
          <div className="bg-background p-6 rounded-lg border">
            <h4 className="font-semibold mb-4">Quick Setup Tips</h4>
            <ol className="space-y-4 text-lg text-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <div>
                  <strong>Profile Photo:</strong> Add a professional photo to help your team recognize you.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <div>
                  <strong>Timezone:</strong> Set your correct timezone for accurate scheduling.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <div>
                  <strong>Preferences:</strong> Choose your content types and posting frequency.
                </div>
              </li>
            </ol>
          </div>
        </div>
      );
      
    case 'first-content':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Create Your First Content</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Let's walk through creating and scheduling your first piece of content.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Content Creation Process</h4>
            <div className="bg-background p-6 rounded-lg border">
              <h5 className="font-medium mb-3">Step-by-Step Guide</h5>
              <ol className="space-y-4 text-lg text-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>Click the "Create Content" button in your dashboard</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>Choose your content type (post, story, video, etc.)</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <div>Write your content and add media</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <div>Select your target platforms</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">5</span>
                  <div>Schedule or publish immediately</div>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="bg-background p-6 rounded-lg border">
            <h4 className="font-semibold mb-4">Content Best Practices</h4>
            <ul className="space-y-2 text-lg text-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Use high-quality images and videos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Write engaging captions with clear calls-to-action
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Use relevant hashtags and mentions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Schedule posts for optimal engagement times
              </li>
            </ul>
          </div>
        </div>
      );
      
    case 'team-setup':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Set Up Your Team</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Invite team members and configure roles for collaborative content creation.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Team Roles</h4>
            <div className="bg-background p-6 rounded-lg border">
              <h5 className="font-medium mb-3">Available Roles</h5>
              <ol className="space-y-4 text-lg text-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">👑</span>
                  <div>
                    <strong>Admin:</strong> Full access to all features and settings
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">✏️</span>
                  <div>
                    <strong>Creator:</strong> Can create and edit content
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">👀</span>
                  <div>
                    <strong>Reviewer:</strong> Can review and approve content
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">📊</span>
                  <div>
                    <strong>Viewer:</strong> Can view content and analytics
                  </div>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="bg-background p-6 rounded-lg border">
            <h4 className="font-semibold mb-4">Invitation Process</h4>
            <ul className="space-y-2 text-lg text-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Go to Team Settings in your dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Click "Invite Team Member"
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Enter their email and select a role
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Send the invitation
              </li>
            </ul>
          </div>
        </div>
      );
      
    case 'integrations':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Connect Your Platforms</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Link your social media accounts and other tools to streamline your workflow.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Available Integrations</h4>
            <div className="bg-background p-6 rounded-lg border">
              <h5 className="font-medium mb-3">Social Media Platforms</h5>
              <ul className="space-y-2 text-lg text-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Facebook Pages and Groups
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Instagram Business Accounts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Twitter/X Accounts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  LinkedIn Pages and Profiles
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  TikTok Business Accounts
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-background p-6 rounded-lg border">
            <h4 className="font-semibold mb-4">Other Integrations</h4>
            <ul className="space-y-2 text-lg text-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Google Analytics for tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Canva for design assets
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Unsplash for stock photos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Zapier for workflow automation
              </li>
            </ul>
          </div>
        </div>
      );
      
    default:
      return <div>Step content not found</div>;
  }
}

function getIconForStep(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return Bell;
    case 'account-setup':
      return Settings;
    case 'first-content':
      return Plus;
    case 'team-setup':
      return Users;
    case 'integrations':
      return Share2;
    default:
      return Calendar;
  }
}