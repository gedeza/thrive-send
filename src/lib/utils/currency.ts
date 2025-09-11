/**
 * Currency and localization utilities for international marketplace support
 * Avoids hardcoded currencies and provides dynamic formatting
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimals: number;
  position: 'before' | 'after';
  locale: string;
}

export interface LocaleConfig {
  code: string;
  name: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}

// Supported currencies for marketplace transactions
export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    decimals: 2,
    position: 'before',
    locale: 'en-US'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    decimals: 2,
    position: 'after',
    locale: 'de-DE'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    decimals: 2,
    position: 'before',
    locale: 'en-GB'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    decimals: 2,
    position: 'before',
    locale: 'en-CA'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    decimals: 2,
    position: 'before',
    locale: 'en-AU'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    decimals: 0,
    position: 'before',
    locale: 'ja-JP'
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    decimals: 2,
    position: 'before',
    locale: 'en-ZA'
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    decimals: 2,
    position: 'before',
    locale: 'en-NG'
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    decimals: 2,
    position: 'before',
    locale: 'en-IN'
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    decimals: 2,
    position: 'before',
    locale: 'pt-BR'
  }
};

// Regional locale configurations
export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = {
  'en-US': {
    code: 'en-US',
    name: 'English (United States)',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: 'en-US'
  },
  'en-GB': {
    code: 'en-GB',
    name: 'English (United Kingdom)',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'en-GB'
  },
  'en-CA': {
    code: 'en-CA',
    name: 'English (Canada)',
    currency: 'CAD',
    dateFormat: 'yyyy-MM-dd',
    numberFormat: 'en-CA'
  },
  'de-DE': {
    code: 'de-DE',
    name: 'Deutsch (Deutschland)',
    currency: 'EUR',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: 'de-DE'
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'Français (France)',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'fr-FR'
  },
  'ja-JP': {
    code: 'ja-JP',
    name: '日本語 (日本)',
    currency: 'JPY',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'ja-JP'
  },
  'en-ZA': {
    code: 'en-ZA',
    name: 'English (South Africa)',
    currency: 'ZAR',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'en-ZA'
  },
  'en-NG': {
    code: 'en-NG',
    name: 'English (Nigeria)',
    currency: 'NGN',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'en-NG'
  },
  'en-IN': {
    code: 'en-IN',
    name: 'English (India)',
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'en-IN'
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'pt-BR'
  }
};

/**
 * Country to currency mapping for geolocation-based detection
 */
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'US': 'USD', 'United States': 'USD',
  'ZA': 'ZAR', 'South Africa': 'ZAR',
  'BR': 'BRL', 'Brazil': 'BRL',
  'DE': 'EUR', 'Germany': 'EUR',
  'FR': 'EUR', 'France': 'EUR',
  'IT': 'EUR', 'Italy': 'EUR',
  'ES': 'EUR', 'Spain': 'EUR',
  'NL': 'EUR', 'Netherlands': 'EUR',
  'BE': 'EUR', 'Belgium': 'EUR',
  'AT': 'EUR', 'Austria': 'EUR',
  'GB': 'GBP', 'United Kingdom': 'GBP',
  'UK': 'GBP',
  'CA': 'CAD', 'Canada': 'CAD',
  'AU': 'AUD', 'Australia': 'AUD',
  'NZ': 'AUD', 'New Zealand': 'AUD',
  'JP': 'JPY', 'Japan': 'JPY',
  'NG': 'NGN', 'Nigeria': 'NGN',
  'IN': 'INR', 'India': 'INR',
  'CN': 'USD', 'China': 'USD', // Use USD for China as CNY not in supported list
  'MX': 'USD', 'Mexico': 'USD', // Use USD for Mexico
  'AR': 'USD', 'Argentina': 'USD' // Use USD for Argentina
};

/**
 * Detect user's country using multiple fallback methods
 */
async function detectUserCountry(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Method 1: Check for Cloudflare country header (fastest)
    const cfCountry = (window as any).__CF_COUNTRY__;
    if (cfCountry && COUNTRY_CURRENCY_MAP[cfCountry]) {
      console.log('🌍 Currency detected via Cloudflare:', cfCountry);
      return cfCountry;
    }

    // Method 2: Use free IP geolocation API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.country_code && COUNTRY_CURRENCY_MAP[data.country_code]) {
        console.log('🌍 Currency detected via IP geolocation:', data.country_code, data.country_name);
        return data.country_code;
      }
    }
  } catch (_error) {
    if (error.name !== 'AbortError') {
      console.warn('🌍 Geolocation API failed:', error);
    }
  }

  // Method 3: Fallback to timezone-based estimation
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneCountryMap: Record<string, string> = {
      'Africa/Johannesburg': 'ZA',
      'Africa/Cape_Town': 'ZA',
      'America/Sao_Paulo': 'BR',
      'America/Rio_Branco': 'BR',
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Europe/Amsterdam': 'NL',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Asia/Tokyo': 'JP',
      'Asia/Kolkata': 'IN',
      'Asia/Mumbai': 'IN',
      'Africa/Lagos': 'NG'
    };
    
    const country = timezoneCountryMap[timezone];
    if (country) {
      console.log('🌍 Currency detected via timezone:', timezone, '→', country);
      return country;
    }
  } catch (_error) {
    console.warn('🌍 Timezone detection failed:', error);
  }

  return null;
}

/**
 * Get currency based on detected country
 */
async function getCurrencyFromGeolocation(): Promise<string> {
  const country = await detectUserCountry();
  const currency = country ? COUNTRY_CURRENCY_MAP[country] || 'USD' : 'USD';
  
  if (country) {
    console.log(`🌍 Auto-detected currency: ${currency} for country: ${country}`);
  }
  
  return currency;
}

/**
 * Amazon-style automatic currency detection (async)
 */
export async function getUserCurrencyAsync(): Promise<string> {
  // Priority: localStorage (user preference) > geolocation > locale > default
  if (typeof window !== 'undefined') {
    const userPreference = localStorage.getItem('preferredCurrency');
    if (userPreference && SUPPORTED_CURRENCIES[userPreference]) {
      console.log('💰 Using saved currency preference:', userPreference);
      return userPreference;
    }
  }

  // Try geolocation-based auto-detection
  try {
    const geoCurrency = await getCurrencyFromGeolocation();
    if (geoCurrency && SUPPORTED_CURRENCIES[geoCurrency]) {
      // Cache the detected currency for faster future loads
      if (typeof window !== 'undefined') {
        localStorage.setItem('detectedCurrency', geoCurrency);
        localStorage.setItem('detectedCurrencyTimestamp', Date.now().toString());
      }
      return geoCurrency;
    }
  } catch (_error) {
    console.warn('🌍 Geolocation currency detection failed:', error);
  }

  // Fallback to locale-based detection
  const locale = getUserLocale();
  const localeConfig = SUPPORTED_LOCALES[locale];
  const fallbackCurrency = localeConfig?.currency || 'USD';
  
  console.log('🌍 Using locale fallback currency:', fallbackCurrency);
  return fallbackCurrency;
}

/**
 * Synchronous version with cached geolocation results
 */
export function getUserCurrency(): string {
  // Priority: localStorage (user preference) > cached detection > locale > default
  if (typeof window !== 'undefined') {
    const userPreference = localStorage.getItem('preferredCurrency');
    if (userPreference && SUPPORTED_CURRENCIES[userPreference]) {
      return userPreference;
    }

    // Check if we have a recent cached detection result (valid for 24 hours)
    const detected = localStorage.getItem('detectedCurrency');
    const detectedTimestamp = localStorage.getItem('detectedCurrencyTimestamp');
    
    if (detected && detectedTimestamp && SUPPORTED_CURRENCIES[detected]) {
      const age = Date.now() - parseInt(detectedTimestamp);
      const isValid = age < 24 * 60 * 60 * 1000; // 24 hours
      
      if (isValid) {
        return detected;
      } else {
        // Clear expired cache
        localStorage.removeItem('detectedCurrency');
        localStorage.removeItem('detectedCurrencyTimestamp');
      }
    }
  }

  // Fallback to locale-based detection
  const locale = getUserLocale();
  const localeConfig = SUPPORTED_LOCALES[locale];
  return localeConfig?.currency || 'USD';
}

/**
 * Get user's preferred locale
 */
export function getUserLocale(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferredLocale');
    if (stored && SUPPORTED_LOCALES[stored]) {
      return stored;
    }
    
    // Browser language detection
    const browserLang = navigator.language || 'en-US';
    if (SUPPORTED_LOCALES[browserLang]) {
      return browserLang;
    }
    
    // Try language without region
    const langCode = browserLang.split('-')[0];
    const matchingLocale = Object.keys(SUPPORTED_LOCALES).find(l => l.startsWith(langCode));
    if (matchingLocale) {
      return matchingLocale;
    }
  }
  
  return 'en-US';
}

/**
 * Format currency amount with proper localization
 */
export function formatCurrency(
  amount: number,
  currencyCode?: string,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  const currency = currencyCode || getUserCurrency();
  const config = SUPPORTED_CURRENCIES[currency];
  
  if (!config) {
    console.warn(`Unsupported currency: ${currency}. Falling back to USD.`);
    return formatCurrency(amount, 'USD', options);
  }

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: options.minimumFractionDigits ?? config.decimals,
    maximumFractionDigits: options.maximumFractionDigits ?? config.decimals,
    ...options
  };

  return new Intl.NumberFormat(config.locale, formatOptions).format(amount);
}

/**
 * Format number with proper localization
 */
export function formatNumber(
  value: number,
  locale?: string,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  const userLocale = locale || getUserLocale();
  return new Intl.NumberFormat(userLocale, options).format(value);
}

/**
 * Format date with proper localization
 */
export function formatDate(
  date: Date | string,
  locale?: string,
  options: Partial<Intl.DateTimeFormatOptions> = {}
): string {
  const userLocale = locale || getUserLocale();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(userLocale, defaultOptions).format(dateObj);
}

/**
 * Convert currency amounts between different currencies
 * This would connect to a real exchange rate API in production
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  // Mock exchange rates - replace with real API call (e.g., exchangerate-api.com)
  const mockRates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.85, GBP: 0.73, CAD: 1.25, AUD: 1.35, JPY: 110, ZAR: 18.5, NGN: 410, INR: 74, BRL: 5.2 },
    EUR: { USD: 1.18, GBP: 0.86, CAD: 1.47, AUD: 1.59, JPY: 129, ZAR: 21.8, NGN: 483, INR: 87, BRL: 6.1 },
    GBP: { USD: 1.37, EUR: 1.16, CAD: 1.71, AUD: 1.85, JPY: 150, ZAR: 25.3, NGN: 562, INR: 101, BRL: 7.1 },
    CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, AUD: 1.08, JPY: 88, ZAR: 14.8, NGN: 328, INR: 59, BRL: 4.2 },
    AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, CAD: 0.93, JPY: 81, ZAR: 13.7, NGN: 303, INR: 55, BRL: 3.8 },
    JPY: { USD: 0.0091, EUR: 0.0078, GBP: 0.0067, CAD: 0.011, AUD: 0.012, ZAR: 0.17, NGN: 3.7, INR: 0.67, BRL: 0.047 },
    ZAR: { USD: 0.054, EUR: 0.046, GBP: 0.040, CAD: 0.068, AUD: 0.073, JPY: 5.9, NGN: 22.2, INR: 4.0, BRL: 0.28 },
    NGN: { USD: 0.0024, EUR: 0.0021, GBP: 0.0018, CAD: 0.0030, AUD: 0.0033, JPY: 0.27, ZAR: 0.045, INR: 0.18, BRL: 0.013 },
    INR: { USD: 0.014, EUR: 0.011, GBP: 0.0099, CAD: 0.017, AUD: 0.018, JPY: 1.5, ZAR: 0.25, NGN: 5.5, BRL: 0.070 },
    BRL: { USD: 0.19, EUR: 0.16, GBP: 0.14, CAD: 0.24, AUD: 0.26, JPY: 21, ZAR: 3.6, NGN: 79, INR: 14 }
  };
  
  const rate = mockRates[fromCurrency]?.[toCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }
  
  return amount * rate;
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currencyCode: string): string {
  const config = SUPPORTED_CURRENCIES[currencyCode];
  return config?.symbol || currencyCode;
}

/**
 * Validate currency code
 */
export function isValidCurrency(currencyCode: string): boolean {
  return currencyCode in SUPPORTED_CURRENCIES;
}

/**
 * Set user's preferred currency
 */
export function setUserCurrency(currencyCode: string): void {
  if (!isValidCurrency(currencyCode)) {
    throw new Error(`Invalid currency code: ${currencyCode}`);
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredCurrency', currencyCode);
  }
}

/**
 * Set user's preferred locale
 */
export function setUserLocale(localeCode: string): void {
  if (!(localeCode in SUPPORTED_LOCALES)) {
    throw new Error(`Invalid locale code: ${localeCode}`);
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLocale', localeCode);
  }
}

/**
 * Get pricing display options for a currency
 */
export function getPricingOptions(currencyCode: string) {
  const config = SUPPORTED_CURRENCIES[currencyCode];
  if (!config) return null;
  
  return {
    decimals: config.decimals,
    symbol: config.symbol,
    position: config.position,
    locale: config.locale
  };
}