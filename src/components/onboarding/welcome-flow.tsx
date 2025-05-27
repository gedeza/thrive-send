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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WelcomeFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeFlow({ isOpen, onClose }: WelcomeFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const steps = [
    {
      title: "Welcome to ThriveSend!",
      description: "Let's get you started with your content calendar. We'll guide you through the key features.",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ThriveSend helps you manage and schedule your content across multiple platforms.
            You can create, schedule, and track all your content from one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Quick Start</h4>
              <p className="text-sm text-muted-foreground">Create your first content in minutes</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground">Check our documentation anytime</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Create Your First Content",
      description: "Click the + button to create and schedule your content across multiple platforms.",
      icon: Plus,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose from different content types:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Social Media</h4>
              <p className="text-sm text-muted-foreground">Posts for multiple platforms</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Blog Posts</h4>
              <p className="text-sm text-muted-foreground">Long-form content</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Email Campaigns</h4>
              <p className="text-sm text-muted-foreground">Newsletters and updates</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Custom Content</h4>
              <p className="text-sm text-muted-foreground">Other content types</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Schedule and Manage",
      description: "Use the calendar to schedule, reschedule, and manage all your content in one place.",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Key calendar features:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Drag and drop to reschedule content</li>
            <li>• View content by type or status</li>
            <li>• Set up recurring content</li>
            <li>• Get notifications for upcoming posts</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Team Collaboration",
      description: "Invite team members and manage content approval workflows.",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Work together effectively:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Assign content to team members</li>
            <li>• Set up approval workflows</li>
            <li>• Track content status</li>
            <li>• Manage team permissions</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Track Performance",
      description: "Monitor your content's performance and engagement across all platforms.",
      icon: BarChart2,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Analytics features:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• View engagement metrics</li>
            <li>• Track content performance</li>
            <li>• Generate reports</li>
            <li>• Optimize posting times</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Customize Your Experience",
      description: "Set up your preferences and notifications to stay on top of your content.",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Personalize your workspace:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Set your timezone</li>
            <li>• Configure notifications</li>
            <li>• Customize your calendar view</li>
            <li>• Set up integrations</li>
          </ul>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary" />
            {currentStep.title}
          </DialogTitle>
          <DialogDescription>
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep.content}
        </div>

        <div className="flex justify-center my-4">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i + 1 === step ? 'bg-primary' : 'bg-muted'
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
            {step === totalSteps ? 'Get Started' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 