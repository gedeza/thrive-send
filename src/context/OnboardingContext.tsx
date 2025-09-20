"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/nextjs';
import { useUserContext } from '@/hooks/useUserContext';

// Enhanced onboarding with campaign-based intelligence
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
  context?: 'individual' | 'service_provider' | 'both';
  campaignType?: 'standard' | 'multi_client' | 'both';
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

// Campaign-aware onboarding steps
const allOnboardingSteps: OnboardingStep[] = [
  // Universal steps for all users
  {
    id: 'welcome',
    title: 'Welcome to ThriveSend',
    description: 'Let\'s get you started with your content marketing journey.',
    isCompleted: false,
    isRequired: true,
    context: 'both',
    campaignType: 'both',
  },
  {
    id: 'account-setup',
    title: 'Account Setup',
    description: 'Complete your profile and business preferences.',
    isCompleted: false,
    isRequired: true,
    context: 'both',
    campaignType: 'both',
  },

  // Individual user specific steps
  {
    id: 'first-campaign',
    title: 'Create Your First Campaign',
    description: 'Set up a standard marketing campaign for your business.',
    isCompleted: false,
    isRequired: true,
    context: 'individual',
    campaignType: 'standard',
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    description: 'Learn to create and schedule engaging content.',
    isCompleted: false,
    isRequired: false,
    context: 'individual',
    campaignType: 'standard',
  },

  // Service provider specific steps
  {
    id: 'client-management',
    title: 'Client Management Setup',
    description: 'Configure your workspace for managing multiple clients.',
    isCompleted: false,
    isRequired: true,
    context: 'service_provider',
    campaignType: 'multi_client',
  },
  {
    id: 'multi-client-campaign',
    title: 'Multi-Client Campaigns',
    description: 'Learn to create campaigns across multiple client accounts.',
    isCompleted: false,
    isRequired: true,
    context: 'service_provider',
    campaignType: 'multi_client',
  },
  {
    id: 'client-reporting',
    title: 'Client Reporting',
    description: 'Set up automated reports for your clients.',
    isCompleted: false,
    isRequired: false,
    context: 'service_provider',
    campaignType: 'multi_client',
  },

  // Common optional steps
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    description: 'Invite team members and set up approval workflows.',
    isCompleted: false,
    isRequired: false,
    context: 'both',
    campaignType: 'both',
  },
  {
    id: 'integrations',
    title: 'Connect Integrations',
    description: 'Set up your social media and analytics integrations.',
    isCompleted: false,
    isRequired: false,
    context: 'both',
    campaignType: 'both',
  },
  {
    id: 'advanced-features',
    title: 'Explore Advanced Features',
    description: 'Discover analytics, automation, and optimization tools.',
    isCompleted: false,
    isRequired: false,
    context: 'both',
    campaignType: 'both',
  },
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(
    allOnboardingSteps.filter(step => step.context === 'both')
  );
  const [showWelcomeFlow, setShowWelcomeFlow] = useState(false);
  // PRODUCTION FIX: Always set onboarding as complete to avoid failed API calls
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const userContext = useUserContext();

  // Filter steps based on user context and campaign type
  const getContextAwareSteps = (): OnboardingStep[] => {
    if (!userContext || userContext.isLoading) {
      // Return universal steps while loading
      return allOnboardingSteps.filter(step => step.context === 'both');
    }

    const userType = userContext.isServiceProvider ? 'service_provider' : 'individual';
    const campaignType = userContext.hasMultipleClients ? 'multi_client' : 'standard';

    return allOnboardingSteps.filter(step => {
      // Include steps that match user context or are for both
      const contextMatch = step.context === 'both' || step.context === userType;

      // Include steps that match campaign type or are for both
      const campaignMatch = step.campaignType === 'both' || step.campaignType === campaignType;

      return contextMatch && campaignMatch;
    });
  };

  // Update steps when user context changes - TEMP DISABLED to fix React hook violations
  useEffect(() => {
    if (isLoaded) {
      // Use basic steps without context awareness temporarily
      const basicSteps = allOnboardingSteps.filter(step => step.context === 'both');
      setSteps(basicSteps);
    }
  }, [isLoaded]);

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
    const contextAwareSteps = getContextAwareSteps();
    setSteps(contextAwareSteps.map(step => ({ ...step, isCompleted: false })));
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