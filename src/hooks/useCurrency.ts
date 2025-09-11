import { useState, useCallback } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
};

// Application-wide currency configuration for analytics consistency
const APP_CONFIG = {
  defaultCurrency: 'USD',
  analyticsCurrency: 'USD', // Always use USD for analytics consistency
};

export function useCurrency(defaultCurrency: string = 'USD') {
  const [currency, setCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[defaultCurrency]);

  const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
    const currInfo = currencyCode ? SUPPORTED_CURRENCIES[currencyCode] : currency;
    if (!currInfo) return `${amount}`;
    
    try {
      return new Intl.NumberFormat(currInfo.locale, {
        style: 'currency',
        currency: currInfo.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (_error) {
      // Fallback formatting
      return `${currInfo.symbol}${amount.toLocaleString()}`;
    }
  }, [currency]);

  const formatAnalyticsCurrency = useCallback((amount: number) => {
    const analyticsCurrInfo = SUPPORTED_CURRENCIES[APP_CONFIG.analyticsCurrency];
    return formatCurrency(amount, analyticsCurrInfo.code);
  }, [formatCurrency]);

  const changeCurrency = useCallback((newCurrencyCode: string) => {
    if (SUPPORTED_CURRENCIES[newCurrencyCode]) {
      setCurrency(SUPPORTED_CURRENCIES[newCurrencyCode]);
    }
  }, []);

  return {
    currency,
    formatCurrency,
    formatAnalyticsCurrency,
    changeCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    defaultCurrency: APP_CONFIG.defaultCurrency,
    analyticsCurrency: APP_CONFIG.analyticsCurrency,
  };
}

/**
 * Hook specifically for analytics components
 */
export function useAnalyticsCurrency() {
  const formatCurrency = useCallback((amount: number) => {
    const analyticsCurrInfo = SUPPORTED_CURRENCIES[APP_CONFIG.analyticsCurrency];
    try {
      return new Intl.NumberFormat(analyticsCurrInfo.locale, {
        style: 'currency',
        currency: analyticsCurrInfo.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (_error) {
      return `${analyticsCurrInfo.symbol}${amount.toLocaleString()}`;
    }
  }, []);

  return {
    formatCurrency,
    currency: APP_CONFIG.analyticsCurrency,
  };
}

export default useCurrency;
