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

function getStepContent(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return (
        <div className="space-y-8">
          <div className="relative w-full h-[300px] mb-8 rounded-lg overflow-hidden bg-gray-50">
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
              <h4 className="font-medium mb-2">Quick Start</h4>
              <p className="text-sm text-muted-foreground">Create your first content in minutes</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground">Check our documentation anytime</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-3 text-lg text-gray-700">
                <li>• Email campaign management</li>
                <li>• Content creation tools</li>
                <li>• Analytics dashboard</li>
                <li>• Team collaboration</li>
                <li>• Audience segmentation</li>
                <li>• Automated workflows</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Getting Started</h3>
              <ul className="space-y-3 text-lg text-gray-700">
                <li>• Create your account</li>
                <li>• Set up your organization</li>
                <li>• Invite team members</li>
                <li>• Create your first campaign</li>
                <li>• Explore the dashboard</li>
                <li>• Set up your preferences</li>
              </ul>
            </div>
          </div>
        </div>
      );

    case 'account-setup':
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Sign Up Process</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">1. Create Your Account</h4>
                  <ol className="space-y-4 text-lg text-gray-700">
                    <li>1. Visit <a href="https://app.thrivesend.com/signup" className="text-blue-600 hover:underline">app.thrivesend.com/signup</a></li>
                    <li>2. Enter your email address</li>
                    <li>3. Create a strong password</li>
                    <li>4. Click "Create Account"</li>
                    <li>5. Verify your email address</li>
                  </ol>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">2. Complete Your Profile</h4>
                  <ol className="space-y-4 text-lg text-gray-700">
                    <li>1. Add your full name</li>
                    <li>2. Upload a profile picture</li>
                    <li>3. Set your timezone</li>
                    <li>4. Choose your notification preferences</li>
                    <li>5. Set up two-factor authentication (recommended)</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Account Settings</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Profile Settings</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Update personal information</li>
                    <li>• Change password</li>
                    <li>• Manage email preferences</li>
                    <li>• Set notification preferences</li>
                    <li>• Configure account settings</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Security Settings</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Two-factor authentication</li>
                    <li>• Session management</li>
                    <li>• Connected devices</li>
                    <li>• Security logs</li>
                    <li>• Access history</li>
          </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'first-content':
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Content Types</h3>
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
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Content Calendar</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Calendar Features</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Monthly/weekly views</li>
                    <li>• Drag-and-drop scheduling</li>
                    <li>• Content type filtering</li>
                    <li>• Team assignments</li>
                    <li>• Analytics integration</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Getting Started</h4>
                  <ol className="space-y-4 text-lg text-gray-700">
                    <li>1. Navigate to Content Calendar</li>
                    <li>2. Create your first content</li>
                    <li>3. Schedule it on the calendar</li>
                    <li>4. Set up recurring content</li>
                    <li>5. Monitor performance</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'team-setup':
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Team Management</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Invite Team Members</h4>
                  <ol className="space-y-4 text-lg text-gray-700">
                    <li>1. Go to Team Settings</li>
                    <li>2. Click "Invite Members"</li>
                    <li>3. Enter email addresses</li>
                    <li>4. Assign roles and permissions</li>
                    <li>5. Send invitations</li>
                  </ol>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Role Types</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Administrator: Full system access</li>
                    <li>• Manager: Team and campaign management</li>
                    <li>• Editor: Content creation and editing</li>
                    <li>• Viewer: Read-only access</li>
                    <li>• Custom: Tailored permissions</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Collaboration Tools</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Workflow Features</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Content approval workflows</li>
                    <li>• Team assignments</li>
                    <li>• Content scheduling</li>
                    <li>• Performance tracking</li>
                    <li>• Communication tools</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Best Practices</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Set clear roles and responsibilities</li>
                    <li>• Establish approval processes</li>
                    <li>• Use team communication tools</li>
                    <li>• Monitor team performance</li>
                    <li>• Regular team sync-ups</li>
          </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'integrations':
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Available Integrations</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Social Media</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Facebook</li>
                    <li>• Twitter</li>
                    <li>• Instagram</li>
                    <li>• LinkedIn</li>
                    <li>• TikTok</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Email Marketing</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Mailchimp</li>
                    <li>• SendGrid</li>
                    <li>• HubSpot</li>
                    <li>• ActiveCampaign</li>
                    <li>• Custom SMTP</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Analytics & Tools</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Analytics Platforms</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Google Analytics</li>
                    <li>• Facebook Pixel</li>
                    <li>• Custom tracking</li>
                    <li>• Performance metrics</li>
                    <li>• ROI tracking</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-medium mb-4">Additional Tools</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• CRM integration</li>
                    <li>• Marketing automation</li>
                    <li>• Customer support</li>
                    <li>• Project management</li>
                    <li>• Custom webhooks</li>
          </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
} 