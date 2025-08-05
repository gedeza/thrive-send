'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Globe, Check } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

interface CurrencyDetectionBannerProps {
  detectedCurrency: string;
  onAccept: () => void;
  onDismiss: () => void;
  className?: string;
}

export function CurrencyDetectionBanner({ 
  detectedCurrency, 
  onAccept, 
  onDismiss,
  className 
}: CurrencyDetectionBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    onAccept();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    onDismiss();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currencySymbol = getCurrencySymbol(detectedCurrency);
  const examplePrice = formatCurrency(29.99, detectedCurrency);

  return (
    <Alert className={cn(
      "border-blue-200 bg-blue-50 text-blue-900 mb-6",
      className
    )}>
      <Globe className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="font-medium mb-1">
            🌍 We've detected you're in a {detectedCurrency} region
          </div>
          <div className="text-sm text-blue-700">
            Prices are now displayed in {detectedCurrency} ({currencySymbol}). 
            Example: {examplePrice} • You can change this in Settings anytime.
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAccept}
            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
          >
            <Check className="h-3 w-3 mr-1" />
            Got it
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Auto-detection banner that shows once per session for new currency detections
 */
export function AutoCurrencyDetectionBanner() {
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const checkForNewDetection = () => {
      if (typeof window === 'undefined') return;

      const detected = localStorage.getItem('detectedCurrency');
      const bannerShown = sessionStorage.getItem('currencyBannerShown');
      const userPreference = localStorage.getItem('preferredCurrency');

      // Show banner if:
      // 1. We detected a currency automatically
      // 2. User hasn't manually set a preference
      // 3. We haven't shown the banner this session
      // 4. The detected currency is not USD (default)
      if (detected && !userPreference && !bannerShown && detected !== 'USD') {
        setDetectedCurrency(detected);
        setShowBanner(true);
      }
    };

    // Check immediately and after a short delay to ensure localStorage is ready
    checkForNewDetection();
    const timer = setTimeout(checkForNewDetection, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currencyBannerShown', 'true');
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currencyBannerShown', 'true');
      // Don't set as preference, just dismiss the banner
    }
    setShowBanner(false);
  };

  if (!showBanner || !detectedCurrency) {
    return null;
  }

  return (
    <CurrencyDetectionBanner
      detectedCurrency={detectedCurrency}
      onAccept={handleAccept}
      onDismiss={handleDismiss}
    />
  );
}