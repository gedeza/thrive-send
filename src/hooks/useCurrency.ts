import { useState, useEffect } from 'react';

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

export function useCurrency(defaultCurrency: string = 'USD') {
  const [currency, setCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[defaultCurrency]);

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const currInfo = currencyCode ? SUPPORTED_CURRENCIES[currencyCode] : currency;
    if (!currInfo) return `${amount}`;
    
    try {
      return new Intl.NumberFormat(currInfo.locale, {
        style: 'currency',
        currency: currInfo.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currInfo.symbol}${amount.toLocaleString()}`;
    }
  };

  const changeCurrency = (newCurrencyCode: string) => {
    if (SUPPORTED_CURRENCIES[newCurrencyCode]) {
      setCurrency(SUPPORTED_CURRENCIES[newCurrencyCode]);
    }
  };

  return {
    currency,
    formatCurrency,
    changeCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}

export default useCurrency;