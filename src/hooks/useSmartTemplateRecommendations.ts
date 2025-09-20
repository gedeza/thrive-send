'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserContext } from '@/hooks/useUserContext';
import { CAMPAIGN_TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/campaign-templates';
import { CampaignTemplate } from '@/types/campaign';

/**
 * Smart Template Recommendations Hook
 * Stage 2B: Context-aware template recommendations based on user type and behavior
 */
interface SmartTemplateRecommendation {
  template: CampaignTemplate;
  score: number;
  reasons: string[];
  category: 'perfect_match' | 'highly_recommended' | 'good_fit' | 'alternative';
  contextAlignment: {
    industry: boolean;
    userType: boolean;
    complexity: boolean;
    businessModel: boolean;
  };
}

interface UseSmartTemplateRecommendationsOptions {
  industry?: string;
  businessModel?: 'individual' | 'service_provider' | 'enterprise';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  previousCampaigns?: string[];
  limit?: number;
}

export function useSmartTemplateRecommendations(
  options: UseSmartTemplateRecommendationsOptions = {}
) {
  const userContext = useUserContext();
  const [recommendations, setRecommendations] = useState<SmartTemplateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine user characteristics from context
  const userProfile = useMemo(() => {
    return {
      businessModel: options.businessModel || userContext.organizationType || 'individual',
      isServiceProvider: userContext.isServiceProvider,
      hasMultipleClients: userContext.hasMultipleClients,
      clientCount: userContext.clientCount,
      experienceLevel: options.experienceLevel || determineExperienceLevel(userContext),
      industry: options.industry,
      previousCampaigns: options.previousCampaigns || []
    };
  }, [
    userContext.organizationType,
    userContext.isServiceProvider,
    userContext.hasMultipleClients,
    userContext.clientCount,
    options.businessModel,
    options.experienceLevel,
    options.industry,
    options.previousCampaigns
  ]);

  useEffect(() => {
    if (userContext.isLoading) return;

    calculateSmartRecommendations();
  }, [userContext.isLoading, userProfile]);

  const calculateSmartRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const scoredTemplates = CAMPAIGN_TEMPLATES.map(template =>
        scoreTemplate(template, userProfile, userContext)
      );

      // Sort by score and categorize
      const sortedRecommendations = scoredTemplates
        .sort((a, b) => b.score - a.score)
        .slice(0, options.limit || 6)
        .map(recommendation => ({
          ...recommendation,
          category: categorizeRecommendation(recommendation.score, recommendation.contextAlignment)
        }));

      setRecommendations(sortedRecommendations);
    } catch (err) {
      console.error('Error calculating template recommendations:', err);
      setError('Failed to calculate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Get recommendations by category
  const getRecommendationsByCategory = (category: SmartTemplateRecommendation['category']) => {
    return recommendations.filter(rec => rec.category === category);
  };

  // Get templates optimized for service providers
  const getServiceProviderTemplates = () => {
    if (!userContext.isServiceProvider) return [];

    return recommendations.filter(rec => {
      const template = rec.template;
      // Service providers benefit from templates with high lead generation
      const highLeadGeneration = template.estimatedResults.leads >= 50;
      const suitableForMultiClient = template.targetAudience.industries.length > 2;

      return highLeadGeneration || suitableForMultiClient || rec.score >= 0.7;
    });
  };

  // Get beginner-friendly templates
  const getBeginnerFriendlyTemplates = () => {
    return recommendations.filter(rec =>
      rec.template.difficulty === 'beginner' && rec.score >= 0.6
    );
  };

  return {
    recommendations,
    isLoading,
    error,
    userProfile,
    getRecommendationsByCategory,
    getServiceProviderTemplates,
    getBeginnerFriendlyTemplates,
    refresh: calculateSmartRecommendations
  };
}

/**
 * Score a template based on user context and profile
 */
function scoreTemplate(
  template: CampaignTemplate,
  userProfile: any,
  userContext: any
): SmartTemplateRecommendation {
  let score = 0.5; // Base score
  const reasons: string[] = [];
  const contextAlignment = {
    industry: false,
    userType: false,
    complexity: false,
    businessModel: false
  };

  // Industry alignment (30% weight)
  if (userProfile.industry) {
    const industryMatch = template.industry.toLowerCase().includes(userProfile.industry.toLowerCase()) ||
                          template.targetAudience.industries.some(ind =>
                            ind.toLowerCase().includes(userProfile.industry.toLowerCase())
                          );
    if (industryMatch) {
      score += 0.3;
      contextAlignment.industry = true;
      reasons.push(`Perfect match for ${userProfile.industry} industry`);
    }
  }

  // User type alignment (25% weight)
  if (userProfile.isServiceProvider) {
    // Service providers benefit from templates with higher lead generation
    const highLeadPotential = template.estimatedResults.leads >= 50;
    const multiClientSuitability = template.targetAudience.industries.length > 2;

    if (highLeadPotential) {
      score += 0.15;
      reasons.push(`High lead generation potential (${template.estimatedResults.leads}+ leads)`);
    }

    if (multiClientSuitability) {
      score += 0.1;
      contextAlignment.userType = true;
      reasons.push('Suitable for multiple client types');
    }

    // B2B-focused templates are better for service providers
    const isB2BFocused = template.targetAudience.jobTitles.some(title =>
      title.includes('Director') || title.includes('Manager') || title.includes('CEO')
    );

    if (isB2BFocused) {
      score += 0.1;
      reasons.push('B2B-focused campaign suitable for service providers');
    }
  } else {
    // Individual organizations prefer simpler, direct campaigns
    if (template.difficulty === 'beginner') {
      score += 0.15;
      contextAlignment.userType = true;
      reasons.push('Beginner-friendly template');
    }

    // Prefer templates with shorter duration for individual users
    const duration = parseInt(template.duration.split(' ')[0]);
    if (duration <= 4) {
      score += 0.1;
      reasons.push('Quick to implement campaign');
    }
  }

  // Experience level alignment (20% weight)
  if (template.difficulty === userProfile.experienceLevel) {
    score += 0.2;
    contextAlignment.complexity = true;
    reasons.push(`Matches your ${userProfile.experienceLevel} experience level`);
  } else if (userProfile.experienceLevel === 'beginner' && template.difficulty === 'intermediate') {
    score -= 0.1; // Slight penalty for complexity mismatch
  } else if (userProfile.experienceLevel === 'advanced' && template.difficulty === 'beginner') {
    score -= 0.05; // Small penalty for oversimplification
  }

  // ROI potential (15% weight)
  const roiText = template.estimatedResults.roi;
  const roiMatch = roiText.match(/(\d+)%/);
  if (roiMatch) {
    const roiPercentage = parseInt(roiMatch[1]);
    if (roiPercentage >= 400) {
      score += 0.15;
      reasons.push(`Excellent ROI potential (${roiPercentage}%)`);
    } else if (roiPercentage >= 300) {
      score += 0.1;
      reasons.push(`Good ROI potential (${roiPercentage}%)`);
    }
  }

  // Business model alignment (10% weight)
  if (userProfile.businessModel === 'service_provider') {
    // Service providers benefit from templates with consultation-focused outcomes
    if (template.estimatedResults.consultations >= 5) {
      score += 0.1;
      contextAlignment.businessModel = true;
      reasons.push(`Strong consultation potential (${template.estimatedResults.consultations}+ calls)`);
    }
  } else if (userProfile.businessModel === 'individual') {
    // Individual organizations might prefer direct sales or engagement
    const directSalesFocus = template.id.includes('sales') || template.id.includes('retail');
    if (directSalesFocus) {
      score += 0.1;
      contextAlignment.businessModel = true;
      reasons.push('Direct sales focused campaign');
    }
  }

  // Location relevance (bonus points)
  const userInSouthAfrica = userContext.organizationType !== 'enterprise'; // Assume SA unless enterprise
  const templateForSA = template.targetAudience.locations.some(loc =>
    loc.includes('Johannesburg') || loc.includes('Cape Town') || loc.includes('Durban')
  );

  if (userInSouthAfrica && templateForSA) {
    score += 0.05;
    reasons.push('Tailored for South African market');
  }

  // Previous campaign alignment (bonus for similar successful campaigns)
  if (userProfile.previousCampaigns.length > 0) {
    const hasSimilarCampaign = userProfile.previousCampaigns.some(prevCamp =>
      template.industry.toLowerCase().includes(prevCamp.toLowerCase())
    );

    if (hasSimilarCampaign) {
      score += 0.05;
      reasons.push('Similar to your previous successful campaigns');
    }
  }

  // Ensure score doesn't exceed 1.0
  score = Math.min(score, 1.0);

  // Ensure we have at least one reason
  if (reasons.length === 0) {
    reasons.push('Good baseline template for your needs');
  }

  return {
    template,
    score,
    reasons: reasons.slice(0, 3), // Limit to top 3 reasons
    category: 'good_fit', // Will be categorized later
    contextAlignment
  };
}

/**
 * Categorize recommendation based on score and alignment
 */
function categorizeRecommendation(
  score: number,
  contextAlignment: SmartTemplateRecommendation['contextAlignment']
): SmartTemplateRecommendation['category'] {
  // Perfect match: high score + multiple alignments
  const alignmentCount = Object.values(contextAlignment).filter(Boolean).length;

  if (score >= 0.8 && alignmentCount >= 3) {
    return 'perfect_match';
  } else if (score >= 0.7 && alignmentCount >= 2) {
    return 'highly_recommended';
  } else if (score >= 0.6) {
    return 'good_fit';
  } else {
    return 'alternative';
  }
}

/**
 * Determine experience level from user context
 */
function determineExperienceLevel(userContext: any): 'beginner' | 'intermediate' | 'advanced' {
  if (userContext.isServiceProvider && userContext.clientCount > 5) {
    return 'advanced';
  } else if (userContext.isServiceProvider || userContext.organizationType === 'enterprise') {
    return 'intermediate';
  }
  return 'beginner';
}