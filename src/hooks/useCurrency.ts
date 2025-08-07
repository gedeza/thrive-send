/**
 * Currency Configuration Hook
 * Provides consistent currency handling across the entire application
 */

import { useCallback } from 'react';
import { formatCurrency as globalFormatCurrency, getUserCurrency } from '@/lib/utils/currency';

// Application-wide currency configuration
const APP_CONFIG = {
  // For consistency during development and analytics, we use USD as default
  // In production, this could be configurable per organization
  defaultCurrency: 'USD',
  
  // Whether to respect user's locale-based currency detection
  respectUserLocale: false, // Set to true when multi-currency is fully implemented
  
  // Analytics always use USD for consistency in reporting
  analyticsCurrency: 'USD',
};

/**
 * Hook for consistent currency formatting across the application
 */
export function useCurrency() {
  const getAppCurrency = useCallback(() => {
    if (APP_CONFIG.respectUserLocale) {
      return getUserCurrency();
    }
    return APP_CONFIG.defaultCurrency;
  }, []);

  const formatCurrency = useCallback((amount: number, override?: string) => {
    const currency = override || getAppCurrency();
    return globalFormatCurrency(amount, currency);
  }, [getAppCurrency]);

  const formatAnalyticsCurrency = useCallback((amount: number) => {
    return globalFormatCurrency(amount, APP_CONFIG.analyticsCurrency);
  }, []);

  return {
    formatCurrency,
    formatAnalyticsCurrency,
    getAppCurrency,
    defaultCurrency: APP_CONFIG.defaultCurrency,
    analyticsCurrency: APP_CONFIG.analyticsCurrency,
  };
}

/**
 * Hook specifically for analytics components
 */
export function useAnalyticsCurrency() {
  const formatCurrency = useCallback((amount: number) => {
    return globalFormatCurrency(amount, APP_CONFIG.analyticsCurrency);
  }, []);

  return {
    formatCurrency,
    currency: APP_CONFIG.analyticsCurrency,
  };
}