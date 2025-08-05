/**
 * Payment processing service for marketplace transactions
 * Supports multiple payment providers and currencies
 */

import { formatCurrency, getUserCurrency, convertCurrency } from '@/lib/utils/currency';

export interface PaymentProvider {
  id: string;
  name: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  processingFee: number; // Percentage
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'digital_wallet' | 'crypto';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId?: string;
  clientSecret?: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  paymentIntentId: string;
  productId: string;
  productName: string;
  clientId: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  processingFee: number;
  netAmount: number;
  metadata: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  multiplier: number;
  minVolume: number;
  maxVolume: number;
  description: string;
}

export interface DiscountRule {
  id: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  value: number;
  conditions: {
    minAmount?: number;
    maxAmount?: number;
    clientType?: string[];
    productCategory?: string[];
    timeframe?: {
      start: string;
      end: string;
    };
  };
  isActive: boolean;
}

// Supported payment providers - Optimized for South Africa & Africa
export const PAYMENT_PROVIDERS: Record<string, PaymentProvider> = {
  payfast: {
    id: 'payfast',
    name: 'PayFast',
    supportedCurrencies: ['ZAR'],
    supportedCountries: ['ZA'],
    processingFee: 2.9, // 2.9% + R1.50 for cards, 2% + R1.50 for EFT
    isActive: true
  },
  flutterwave: {
    id: 'flutterwave',
    name: 'Flutterwave',
    supportedCurrencies: ['ZAR', 'NGN', 'KES', 'GHS', 'UGX', 'TZS', 'USD', 'EUR', 'GBP'],
    supportedCountries: ['ZA', 'NG', 'KE', 'GH', 'UG', 'TZ', 'RW', 'ZM', 'MW', 'BF'],
    processingFee: 1.4, // 1.4% local African, 3.5% international
    isActive: true
  },
  paystack: {
    id: 'paystack',
    name: 'Paystack',
    supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD', 'EUR', 'GBP'],
    supportedCountries: ['NG', 'GH', 'ZA', 'CI', 'SL', 'KE', 'UG', 'TZ'],
    processingFee: 1.5, // 1.5% African, 3.9% international
    isActive: true
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'ZAR'],
    supportedCountries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP', 'ZA'],
    processingFee: 2.9, // 2.9% + $0.30 (varies by country)
    isActive: false // Enable for global expansion
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'ZAR'],
    supportedCountries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'ZA'],
    processingFee: 3.4,
    isActive: false // Can be enabled later
  }
};

// Volume-based pricing tiers
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    multiplier: 1.0,
    minVolume: 0,
    maxVolume: 1000,
    description: 'Standard pricing for new service providers'
  },
  {
    id: 'growth',
    name: 'Growth',
    multiplier: 0.9,
    minVolume: 1001,
    maxVolume: 5000,
    description: '10% discount for growing service providers'
  },
  {
    id: 'scale',
    name: 'Scale',
    multiplier: 0.8,
    minVolume: 5001,
    maxVolume: 20000,
    description: '20% discount for established service providers'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    multiplier: 0.7,
    minVolume: 20001,
    maxVolume: Infinity,
    description: '30% discount for enterprise service providers'
  }
];

/**
 * Calculate pricing with tiers and discounts
 */
export async function calculatePricing(
  baseAmount: number,
  organizationId: string,
  productId: string,
  currency?: string
): Promise<{
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  tier: PricingTier | null;
  appliedDiscounts: DiscountRule[];
}> {
  const userCurrency = currency || getUserCurrency();
  
  // Convert base amount to user's currency if needed
  const convertedAmount = await convertCurrency(baseAmount, 'USD', userCurrency);
  
  // Get organization's volume tier (would come from database in real implementation)
  const monthlyVolume = await getOrganizationMonthlyVolume(organizationId);
  const tier = PRICING_TIERS.find(t => monthlyVolume >= t.minVolume && monthlyVolume <= t.maxVolume) || PRICING_TIERS[0];
  
  // Apply tier discount
  let finalAmount = convertedAmount * tier.multiplier;
  let discountAmount = convertedAmount - finalAmount;
  
  // Apply additional discount rules
  const discountRules = await getApplicableDiscounts(organizationId, productId, finalAmount);
  const appliedDiscounts: DiscountRule[] = [];
  
  for (const rule of discountRules) {
    if (rule.type === 'percentage') {
      const ruleDiscount = finalAmount * (rule.value / 100);
      finalAmount -= ruleDiscount;
      discountAmount += ruleDiscount;
      appliedDiscounts.push(rule);
    } else if (rule.type === 'fixed_amount') {
      const ruleDiscount = await convertCurrency(rule.value, 'USD', userCurrency);
      finalAmount -= ruleDiscount;
      discountAmount += ruleDiscount;
      appliedDiscounts.push(rule);
    }
  }
  
  return {
    baseAmount: convertedAmount,
    discountAmount,
    finalAmount: Math.max(0, finalAmount), // Ensure non-negative
    currency: userCurrency,
    tier,
    appliedDiscounts
  };
}

/**
 * Create payment intent with the preferred provider
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  productId: string,
  clientId: string,
  organizationId: string,
  metadata: Record<string, string> = {}
): Promise<PaymentIntent> {
  const provider = getPreferredPaymentProvider(currency);
  
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      productId,
      clientId,
      organizationId,
      provider: provider.id,
      metadata
    })
  });
  
  if (!response.ok) {
    throw new Error(`Payment intent creation failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Confirm payment with payment method
 */
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<PaymentIntent> {
  const response = await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentIntentId,
      paymentMethodId
    })
  });
  
  if (!response.ok) {
    throw new Error(`Payment confirmation failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get payment methods for organization
 */
export async function getPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
  const response = await fetch(`/api/payments/methods?organizationId=${organizationId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Add payment method
 */
export async function addPaymentMethod(
  organizationId: string,
  paymentMethodData: Partial<PaymentMethod>
): Promise<PaymentMethod> {
  const response = await fetch('/api/payments/methods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      organizationId,
      ...paymentMethodData
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add payment method: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  organizationId: string,
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    productId?: string;
    clientId?: string;
  }
): Promise<Transaction[]> {
  const params = new URLSearchParams({
    organizationId,
    ...filters
  });
  
  const response = await fetch(`/api/payments/transactions?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Process refund
 */
export async function processRefund(
  transactionId: string,
  amount?: number,
  reason?: string
): Promise<Transaction> {
  const response = await fetch('/api/payments/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionId,
      amount,
      reason
    })
  });
  
  if (!response.ok) {
    throw new Error(`Refund processing failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper functions
 */

function getPreferredPaymentProvider(currency: string, country?: string): PaymentProvider {
  const activeProviders = Object.values(PAYMENT_PROVIDERS).filter(p => p.isActive);
  const supportingProviders = activeProviders.filter(p => p.supportedCurrencies.includes(currency));
  
  if (supportingProviders.length === 0) {
    throw new Error(`No payment provider supports currency: ${currency}`);
  }
  
  // Smart provider selection based on geography and fees
  if (currency === 'ZAR') {
    // For South African Rand, prefer PayFast for local dominance
    const payfast = supportingProviders.find(p => p.id === 'payfast');
    if (payfast) return payfast;
    
    // Fallback to Flutterwave for ZAR
    const flutterwave = supportingProviders.find(p => p.id === 'flutterwave');
    if (flutterwave) return flutterwave;
  }
  
  // For other African currencies, prefer Flutterwave
  const africanCurrencies = ['NGN', 'KES', 'GHS', 'UGX', 'TZS'];
  if (africanCurrencies.includes(currency)) {
    const flutterwave = supportingProviders.find(p => p.id === 'flutterwave');
    if (flutterwave) return flutterwave;
    
    const paystack = supportingProviders.find(p => p.id === 'paystack');
    if (paystack) return paystack;
  }
  
  // For international currencies, return provider with lowest fee
  return supportingProviders.reduce((lowest, current) => 
    current.processingFee < lowest.processingFee ? current : lowest
  );
}

async function getOrganizationMonthlyVolume(organizationId: string): Promise<number> {
  // This would fetch from database in real implementation
  // For now, return mock data
  const mockVolumes: Record<string, number> = {
    'demo-org-1': 2500,  // Growth tier
    'demo-org-2': 8000,  // Scale tier
    'demo-org-3': 500    // Starter tier
  };
  
  return mockVolumes[organizationId] || 0;
}

async function getApplicableDiscounts(
  organizationId: string,
  productId: string,
  amount: number
): Promise<DiscountRule[]> {
  // This would fetch from database and apply complex business logic
  // For now, return mock discount rules
  const mockDiscounts: DiscountRule[] = [
    {
      id: 'first-purchase',
      type: 'percentage',
      value: 10,
      conditions: {
        minAmount: 100
      },
      isActive: true
    }
  ];
  
  return mockDiscounts.filter(rule => {
    if (!rule.isActive) return false;
    if (rule.conditions.minAmount && amount < rule.conditions.minAmount) return false;
    if (rule.conditions.maxAmount && amount > rule.conditions.maxAmount) return false;
    
    return true;
  });
}

/**
 * Format pricing display with currency
 */
export function formatPricingDisplay(
  baseAmount: number,
  finalAmount: number,
  currency: string,
  discountAmount?: number
): {
  original: string;
  final: string;
  discount?: string;
  savings?: string;
} {
  const original = formatCurrency(baseAmount, currency);
  const final = formatCurrency(finalAmount, currency);
  
  let discount: string | undefined;
  let savings: string | undefined;
  
  if (discountAmount && discountAmount > 0) {
    discount = formatCurrency(discountAmount, currency);
    const savingsPercent = Math.round((discountAmount / baseAmount) * 100);
    savings = `Save ${savingsPercent}%`;
  }
  
  return {
    original,
    final,
    discount,
    savings
  };
}