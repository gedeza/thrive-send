'use client';

import { WelcomeFlow } from './welcome-flow';
import { useOnboarding } from '@/context/OnboardingContext';

export function WelcomeFlowGlobal() {
  const { showWelcomeFlow, closeWelcomeFlow } = useOnboarding();

  return (
    <WelcomeFlow 
      isOpen={showWelcomeFlow} 
      onClose={closeWelcomeFlow} 
    />
  );
}