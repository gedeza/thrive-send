'use client';

import { useState } from 'react';
import { WelcomeFlow } from '@/components/onboarding/welcome-flow';
import { OnboardingProvider } from '@/context/OnboardingContext';

export default function WelcomeFlowPage() {
  const [isFlowOpen, setIsFlowOpen] = useState(false);

  return (
    <OnboardingProvider>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Interactive Welcome Flow</h1>
        
        <div className="mb-10">
          <p className="text-xl text-gray-700 mb-6">
            Experience our guided onboarding process that will help you get started with ThriveSend quickly and efficiently.
          </p>
          
          <button
            onClick={() => setIsFlowOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-custom-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Welcome Flow 🚀
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>• Platform overview and key features</li>
            <li>• Account setup and configuration</li>
            <li>• Creating your first content</li>
            <li>• Team setup and collaboration</li>
            <li>• Integration with external tools</li>
          </ul>
        </div>

        <WelcomeFlow 
          isOpen={isFlowOpen} 
          onClose={() => setIsFlowOpen(false)} 
        />
      </div>
    </OnboardingProvider>
  );
}