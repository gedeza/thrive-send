'use client';

import { useState, useEffect } from 'react';
import { getUserCurrencyAsync, getUserCurrency } from '@/lib/utils/currency';

/**
 * Amazon-style automatic currency detection hook
 * Returns immediate cached result + async detection for new users
 */
export function useCurrencyDetection() {
  const [currency, setCurrency] = useState<string>(() => getUserCurrency());
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionSource, setDetectionSource] = useState<'cache' | 'geolocation' | 'locale' | 'preference'>('cache');

  useEffect(() => {
    let mounted = true;

    async function detectCurrency() {
      // Skip detection if user has manual preference
      if (typeof window !== 'undefined' && localStorage.getItem('preferredCurrency')) {
        setDetectionSource('preference');
        return;
      }

      // Skip if we have recent cached detection
      const detectedTimestamp = localStorage.getItem('detectedCurrencyTimestamp');
      if (detectedTimestamp) {
        const age = Date.now() - parseInt(detectedTimestamp);
        if (age < 24 * 60 * 60 * 1000) { // Valid for 24 hours
          setDetectionSource('cache');
          return;
        }
      }

      setIsDetecting(true);
      
      try {
        const detectedCurrency = await getUserCurrencyAsync();
        
        if (mounted && detectedCurrency !== currency) {
          setCurrency(detectedCurrency);
          setDetectionSource('geolocation');
          
          // Show user-friendly notification about auto-detection
          if (typeof window !== 'undefined' && detectedCurrency !== 'USD') {
            console.log(`🌍 Welcome! We've detected you're from a ${detectedCurrency} region. Prices are now shown in ${detectedCurrency}.`);
          }
        }
      } catch (error) {
        console.warn('Currency auto-detection failed:', error);
        setDetectionSource('locale');
      } finally {
        if (mounted) {
          setIsDetecting(false);
        }
      }
    }

    detectCurrency();

    return () => {
      mounted = false;
    };
  }, [currency]);

  return {
    currency,
    isDetecting,
    detectionSource,
    isAutoDetected: detectionSource === 'geolocation'
  };
}

/**
 * Simple hook for immediate currency (synchronous)
 * Use this for components that need instant currency without loading states
 */
export function useUserCurrency() {
  const [currency] = useState(() => getUserCurrency());
  return currency;
}