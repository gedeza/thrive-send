"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/nextjs';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
}

interface OnboardingContextType {
  currentStep: number;
  steps: OnboardingStep[];
  isOnboardingComplete: boolean;
  showWelcomeFlow: boolean;
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string) => Promise<void>;
  skipStep: (stepId: string) => Promise<void>;
  closeWelcomeFlow: () => void;
  startOnboarding: () => void;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ThriveSend',
    description: 'Let\'s get you started with your content calendar.',
    isCompleted: false,
    isRequired: true,
  },
  {
    id: 'account-setup',
    title: 'Account Setup',
    description: 'Complete your profile and preferences.',
    isCompleted: false,
    isRequired: true,
  },
  {
    id: 'first-content',
    title: 'Create Your First Content',
    description: 'Learn how to create and schedule content.',
    isCompleted: false,
    isRequired: true,
  },
  {
    id: 'team-setup',
    title: 'Team Setup',
    description: 'Invite team members and set up roles.',
    isCompleted: false,
    isRequired: false,
  },
  {
    id: 'integrations',
    title: 'Connect Integrations',
    description: 'Set up your social media and other integrations.',
    isCompleted: false,
    isRequired: false,
  },
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(defaultSteps);
  const [showWelcomeFlow, setShowWelcomeFlow] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser(); // Add this line

  useEffect(() => {
    // Only run when user is loaded and authenticated
    if (!isLoaded || !user) return;
    
    // Check if user has completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/profile/onboarding');
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding status');
        }
        const data = await response.json();
        setIsOnboardingComplete(data.hasCompletedOnboarding);
        if (!data.hasCompletedOnboarding) {
          setShowWelcomeFlow(true);
        }
      } catch (error) {
        // Error checking onboarding status
        toast({
          title: "Error",
          description: "Failed to load onboarding status. Please try again.",
          variant: "destructive",
        });
      }
    };

    checkOnboardingStatus();
  }, [toast, isLoaded, user]); // Add isLoaded and user to dependencies

  const completeStep = async (stepId: string) => {
    try {
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, isCompleted: true } : step
        )
      );

      // If this was the last required step, mark onboarding as complete
      const updatedSteps = steps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      );
      
      const allRequiredStepsCompleted = updatedSteps
        .filter(step => step.isRequired)
        .every(step => step.isCompleted);

      if (allRequiredStepsCompleted) {
        const response = await fetch('/api/profile/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hasCompletedOnboarding: true }),
        });

        if (!response.ok) {
          throw new Error('Failed to update onboarding status');
        }

        setIsOnboardingComplete(true);
        toast({
          title: "Success",
          description: "Onboarding completed successfully!",
        });
      }
    } catch (error) {
      // Error completing step
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const skipStep = async (stepId: string) => {
    try {
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, isCompleted: true } : step
        )
      );

      // If this was the last required step, mark onboarding as complete
      const updatedSteps = steps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      );
      
      const allRequiredStepsCompleted = updatedSteps
        .filter(step => step.isRequired)
        .every(step => step.isCompleted);

      if (allRequiredStepsCompleted) {
        const response = await fetch('/api/profile/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hasCompletedOnboarding: true }),
        });

        if (!response.ok) {
          throw new Error('Failed to update onboarding status');
        }

        setIsOnboardingComplete(true);
      }
    } catch (error) {
      // Error skipping step
      toast({
        title: "Error",
        description: "Failed to skip step. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const closeWelcomeFlow = () => {
    setShowWelcomeFlow(false);
  };

  const startOnboarding = () => {
    setShowWelcomeFlow(true);
    setCurrentStep(0);
    setSteps(defaultSteps.map(step => ({ ...step, isCompleted: false })));
    setIsOnboardingComplete(false);
  };

  const value = {
    currentStep,
    steps,
    isOnboardingComplete,
    showWelcomeFlow,
    setCurrentStep,
    completeStep,
    skipStep,
    closeWelcomeFlow,
    startOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}