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
  // PRODUCTION FIX: Always set onboarding as complete to avoid failed API calls
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();

  // PRODUCTION FIX: Removed useEffect that calls non-existent API endpoint
  // This eliminates 404 errors and unnecessary network requests on every page load

  const completeStep = async (stepId: string) => {
    // PRODUCTION FIX: Simplified to avoid API calls
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      )
    );

    // Check if all required steps are completed locally
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, isCompleted: true } : step
    );

    const allRequiredStepsCompleted = updatedSteps
      .filter(step => step.isRequired)
      .every(step => step.isCompleted);

    if (allRequiredStepsCompleted) {
      setIsOnboardingComplete(true);
      toast({
        title: "Success",
        description: "Onboarding completed successfully!",
      });
    }
  };

  const skipStep = async (stepId: string) => {
    // PRODUCTION FIX: Simplified to avoid API calls
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      )
    );

    // Check if all required steps are completed locally
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, isCompleted: true } : step
    );

    const allRequiredStepsCompleted = updatedSteps
      .filter(step => step.isRequired)
      .every(step => step.isCompleted);

    if (allRequiredStepsCompleted) {
      setIsOnboardingComplete(true);
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