/**
 * Marketplace listing management service
 * Handles creation, management, and optimization of boost product listings
 */

import { formatCurrency, getUserCurrency } from '@/lib/utils/currency';

export interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  type: 'engagement' | 'reach' | 'conversion' | 'awareness' | 'premium';
  category: string;
  basePrice: number;
  currency: string;
  duration: string;
  features: string[];
  targetAudience: string[];
  clientTypes: string[];
  
  // Performance metrics
  metrics: {
    averageIncrease: string;
    successRate: number;
    totalSales: number;
    activeInstances: number;
  };
  
  // Listing management
  status: 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected' | 'archived';
  visibility: 'public' | 'private' | 'featured';
  popularity: 'hot' | 'trending' | 'new' | 'bestseller' | 'regular';
  
  // SEO and marketing
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  images: string[];
  videoUrl?: string;
  
  // Pricing and promotions
  promotions: PromotionRule[];
  competitorAnalysis?: CompetitorData;
  
  // Provider information
  providerId: string;
  providerName: string;
  rating: number;
  reviewCount: number;
  estimatedROI: string;
  
  // Compliance and moderation
  moderationNotes?: string;
  complianceFlags: string[];
  lastReviewDate?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PromotionRule {
  id: string;
  type: 'percentage_discount' | 'fixed_discount' | 'bundle_offer' | 'seasonal';
  value: number;
  conditions: {
    minQuantity?: number;
    validFrom: string;
    validTo: string;
    applicableClientTypes?: string[];
    newCustomersOnly?: boolean;
  };
  isActive: boolean;
}

export interface CompetitorData {
  averagePrice: number;
  pricePosition: 'lowest' | 'below_average' | 'average' | 'above_average' | 'premium';
  marketShare: number;
  competitorCount: number;
  recommendedPrice: number;
  lastAnalyzed: string;
}

export interface ListingPerformance {
  listingId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    averageRating: number;
    newReviews: number;
  };
  trends: {
    viewsChange: number;
    clicksChange: number;
    conversionsChange: number;
    revenueChange: number;
  };
  optimization: {
    suggestions: OptimizationSuggestion[];
    score: number;
  };
}

export interface OptimizationSuggestion {
  type: 'pricing' | 'description' | 'images' | 'features' | 'targeting' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface ListingCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  subcategories?: ListingCategory[];
  requirements: string[];
  averagePrice: number;
  popularTags: string[];
}

// Available listing categories
export const LISTING_CATEGORIES: ListingCategory[] = [
  {
    id: 'government',
    name: 'Government & Municipal',
    description: 'Specialized boosts for government communications and civic engagement',
    requirements: ['Compliance certification', 'Government partnership'],
    averagePrice: 350,
    popularTags: ['civic', 'municipal', 'public-sector', 'compliance']
  },
  {
    id: 'business',
    name: 'Business & Commerce',
    description: 'Performance boosts for business growth and sales',
    requirements: ['Business verification', 'Performance guarantee'],
    averagePrice: 450,
    popularTags: ['sales', 'commerce', 'b2b', 'growth']
  },
  {
    id: 'startup',
    name: 'Startup & Innovation',
    description: 'Growth-focused solutions for startups and new ventures',
    requirements: ['Startup verification'],
    averagePrice: 200,
    popularTags: ['startup', 'innovation', 'growth', 'viral']
  },
  {
    id: 'nonprofit',
    name: 'Non-Profit & Social Impact',
    description: 'Community-focused boosts for social causes',
    requirements: ['Non-profit certification'],
    averagePrice: 150,
    popularTags: ['nonprofit', 'social-impact', 'community', 'awareness']
  },
  {
    id: 'enterprise',
    name: 'Enterprise & Corporate',
    description: 'Premium solutions for large-scale operations',
    requirements: ['Enterprise contract', 'Dedicated support'],
    averagePrice: 800,
    popularTags: ['enterprise', 'corporate', 'premium', 'scale']
  }
];

/**
 * Create a new marketplace listing
 */
export async function createListing(
  listingData: Partial<MarketplaceListing>,
  providerId: string
): Promise<MarketplaceListing> {
  const response = await fetch('/api/marketplace/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...listingData,
      providerId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create listing: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing listing
 */
export async function updateListing(
  listingId: string,
  updates: Partial<MarketplaceListing>
): Promise<MarketplaceListing> {
  const response = await fetch(`/api/marketplace/listings/${listingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...updates,
      updatedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update listing: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get listings for a provider
 */
export async function getProviderListings(
  providerId: string,
  filters?: {
    status?: string;
    category?: string;
    search?: string;
  }
): Promise<MarketplaceListing[]> {
  const params = new URLSearchParams({
    providerId,
    ...filters
  });

  const response = await fetch(`/api/marketplace/listings?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submit listing for review
 */
export async function submitForReview(listingId: string): Promise<MarketplaceListing> {
  const response = await fetch(`/api/marketplace/listings/${listingId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to submit listing for review: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get listing performance analytics
 */
export async function getListingPerformance(
  listingId: string,
  period?: { start: string; end: string }
): Promise<ListingPerformance> {
  const params = new URLSearchParams({
    listingId,
    ...(period && { start: period.start, end: period.end })
  });

  const response = await fetch(`/api/marketplace/analytics/performance?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch listing performance: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Run competitor analysis for a listing
 */
export async function runCompetitorAnalysis(
  listingId: string,
  category: string
): Promise<CompetitorData> {
  const response = await fetch('/api/marketplace/analytics/competitors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listingId,
      category
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to run competitor analysis: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get optimization suggestions for a listing
 */
export async function getOptimizationSuggestions(
  listingId: string
): Promise<OptimizationSuggestion[]> {
  const response = await fetch(`/api/marketplace/analytics/optimize/${listingId}`);

  if (!response.ok) {
    throw new Error(`Failed to get optimization suggestions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Clone an existing listing
 */
export async function cloneListing(
  listingId: string,
  modifications?: Partial<MarketplaceListing>
): Promise<MarketplaceListing> {
  const response = await fetch(`/api/marketplace/listings/${listingId}/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(modifications || {})
  });

  if (!response.ok) {
    throw new Error(`Failed to clone listing: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Bulk update multiple listings
 */
export async function bulkUpdateListings(
  listingIds: string[],
  updates: Partial<MarketplaceListing>
): Promise<MarketplaceListing[]> {
  const response = await fetch('/api/marketplace/listings/bulk-update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listingIds,
      updates: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk update listings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Validate listing data before submission
 */
export function validateListing(listing: Partial<MarketplaceListing>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!listing.name || listing.name.trim().length === 0) {
    errors.push('Listing name is required');
  }
  
  if (!listing.description || listing.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters');
  }
  
  if (!listing.basePrice || listing.basePrice <= 0) {
    errors.push('Base price must be greater than 0');
  }
  
  if (!listing.features || listing.features.length === 0) {
    errors.push('At least one feature is required');
  }
  
  if (!listing.targetAudience || listing.targetAudience.length === 0) {
    errors.push('Target audience is required');
  }

  // Warning validations
  if (listing.name && listing.name.length > 100) {
    warnings.push('Listing name is quite long, consider shortening for better display');
  }
  
  if (listing.features && listing.features.length > 10) {
    warnings.push('Too many features might overwhelm potential buyers');
  }
  
  if (listing.images && listing.images.length === 0) {
    warnings.push('Adding images will significantly improve listing performance');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate recommended pricing based on category and features
 */
export async function calculateRecommendedPricing(
  category: string,
  features: string[],
  targetAudience: string[]
): Promise<{
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string[];
}> {
  // Mock implementation - would use ML model in production
  const categoryData = LISTING_CATEGORIES.find(c => c.id === category);
  const basePrice = categoryData?.averagePrice || 300;
  
  let multiplier = 1;
  const reasoning: string[] = [];
  
  // Adjust based on features count
  if (features.length > 5) {
    multiplier += 0.2;
    reasoning.push('Premium feature set increases value');
  }
  
  // Adjust based on target audience
  if (targetAudience.includes('enterprise')) {
    multiplier += 0.5;
    reasoning.push('Enterprise targeting commands premium pricing');
  }
  
  if (targetAudience.includes('government')) {
    multiplier += 0.3;
    reasoning.push('Government sector has specialized requirements');
  }
  
  const recommendedPrice = Math.round(basePrice * multiplier);
  
  return {
    recommendedPrice,
    priceRange: {
      min: Math.round(recommendedPrice * 0.8),
      max: Math.round(recommendedPrice * 1.3)
    },
    reasoning
  };
}

/**
 * Generate SEO-optimized content suggestions
 */
export function generateSEOSuggestions(listing: Partial<MarketplaceListing>): {
  title: string;
  description: string;
  tags: string[];
} {
  const category = listing.category || '';
  const type = listing.type || '';
  const features = listing.features || [];
  
  // Generate SEO title
  const title = `${listing.name} - ${type} Boost for ${category} | ThriveSend Marketplace`;
  
  // Generate SEO description
  const topFeatures = features.slice(0, 3).join(', ');
  const description = `Boost your ${category.toLowerCase()} performance with ${listing.name}. Features: ${topFeatures}. Proven ${listing.metrics?.successRate || 90}% success rate. Get started today!`;
  
  // Generate relevant tags
  const tags = [
    category.toLowerCase(),
    type,
    'boost',
    'social-media',
    'performance',
    ...features.slice(0, 5).map(f => f.toLowerCase().replace(/\s+/g, '-'))
  ];
  
  return {
    title: title.substring(0, 60), // SEO title limit
    description: description.substring(0, 160), // SEO description limit
    tags: [...new Set(tags)] // Remove duplicates
  };
}