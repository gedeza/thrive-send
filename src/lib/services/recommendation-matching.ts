// Recommendation Matching Algorithm Service
import { 
  Newsletter, 
  RecommendationMatch,
  MatchingAlgorithmInput,
  MatchingAlgorithmResult,
  RecommendationMatchingCriteria
} from '@/types/recommendation';

export class RecommendationMatchingService {
  private static instance: RecommendationMatchingService;
  
  public static getInstance(): RecommendationMatchingService {
    if (!RecommendationMatchingService.instance) {
      RecommendationMatchingService.instance = new RecommendationMatchingService();
    }
    return RecommendationMatchingService.instance;
  }

  /**
   * Default matching criteria
   */
  public getDefaultCriteria(): RecommendationMatchingCriteria {
    return {
      categoryWeight: 0.25,
      audienceCompatibilityWeight: 0.20,
      performanceHistoryWeight: 0.20,
      geographicWeight: 0.15,
      seasonalWeight: 0.10,
      competitionWeight: 0.10,
      minMatchScore: 50.0,
      maxSuggestions: 10,
    };
  }

  /**
   * Main matching algorithm
   */
  public async findMatches(input: MatchingAlgorithmInput): Promise<MatchingAlgorithmResult> {
    const startTime = Date.now();
    
    const {
      sourceNewsletter,
      candidateNewsletters,
      criteria,
      excludeOrganizations = [],
      includeCategories = []
    } = input;

    // Filter candidates
    const filteredCandidates = this.filterCandidates(
      candidateNewsletters,
      sourceNewsletter,
      excludeOrganizations,
      includeCategories
    );

    // Calculate matches
    const matches: RecommendationMatch[] = [];
    
    for (const candidate of filteredCandidates) {
      const matchScore = this.calculateMatchScore(sourceNewsletter, candidate, criteria);
      
      if (matchScore >= criteria.minMatchScore) {
        const match = this.createRecommendationMatch(
          sourceNewsletter,
          candidate,
          matchScore,
          criteria
        );
        matches.push(match);
      }
    }

    // Sort by match score and limit results
    matches.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = matches.slice(0, criteria.maxSuggestions);

    const processingTime = Date.now() - startTime;

    return {
      matches: topMatches,
      totalCandidates: filteredCandidates.length,
      processingTimeMs: processingTime,
      algorithmVersion: '1.0.0',
    };
  }

  /**
   * Filter candidate newsletters
   */
  private filterCandidates(
    candidates: Newsletter[],
    source: Newsletter,
    excludeOrganizations: string[],
    includeCategories: string[]
  ): Newsletter[] {
    return candidates.filter(candidate => {
      // Don't recommend to self
      if (candidate.id === source.id) return false;
      
      // Don't recommend to same organization
      if (candidate.organizationId === source.organizationId) return false;
      
      // Skip excluded organizations
      if (excludeOrganizations.includes(candidate.organizationId)) return false;
      
      // Must be active for recommendations
      if (!candidate.isActiveForRecommendations) return false;
      
      // Must have minimum subscriber count (10% of source)
      if (candidate.subscriberCount < source.subscriberCount * 0.1) return false;
      
      // If categories specified, must have at least one matching category
      if (includeCategories.length > 0) {
        const hasMatchingCategory = candidate.categories.some(cat => 
          includeCategories.includes(cat)
        );
        if (!hasMatchingCategory) return false;
      }
      
      return true;
    });
  }

  /**
   * Calculate overall match score
   */
  private calculateMatchScore(
    source: Newsletter,
    candidate: Newsletter,
    criteria: RecommendationMatchingCriteria
  ): number {
    const categoryScore = this.calculateCategoryAlignment(source, candidate);
    const audienceScore = this.calculateAudienceCompatibility(source, candidate);
    const performanceScore = this.calculatePerformanceHistory(source, candidate);
    const geographicScore = this.calculateGeographicAlignment(source, candidate);
    const seasonalScore = this.calculateSeasonalRelevance(source, candidate);
    const competitionScore = this.calculateCompetitionLevel(source, candidate);

    const weightedScore = 
      (categoryScore * criteria.categoryWeight) +
      (audienceScore * criteria.audienceCompatibilityWeight) +
      (performanceScore * criteria.performanceHistoryWeight) +
      (geographicScore * criteria.geographicWeight) +
      (seasonalScore * criteria.seasonalWeight) +
      (competitionScore * criteria.competitionWeight);

    return Math.round(weightedScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate category alignment score (0-100)
   */
  private calculateCategoryAlignment(source: Newsletter, candidate: Newsletter): number {
    if (!source.categories.length || !candidate.categories.length) return 0;
    
    const intersection = source.categories.filter(cat => 
      candidate.categories.includes(cat)
    );
    const union = [...new Set([...source.categories, ...candidate.categories])];
    
    // Jaccard similarity with bonus for exact matches
    const jaccardSimilarity = intersection.length / union.length;
    const exactMatchBonus = intersection.length > 0 ? 0.2 : 0;
    
    return Math.min(100, (jaccardSimilarity + exactMatchBonus) * 100);
  }

  /**
   * Calculate audience compatibility score (0-100)
   */
  private calculateAudienceCompatibility(source: Newsletter, candidate: Newsletter): number {
    // Size compatibility - prefer newsletters of similar size
    const sizeRatio = Math.min(source.subscriberCount, candidate.subscriberCount) / 
                     Math.max(source.subscriberCount, candidate.subscriberCount);
    
    // Engagement compatibility - prefer similar engagement rates
    const engagementDiff = Math.abs(source.averageOpenRate - candidate.averageOpenRate);
    const engagementCompatibility = Math.max(0, 100 - (engagementDiff * 2));
    
    // Target audience overlap (if available)
    let targetAudienceScore = 50; // Default neutral score
    if (source.targetAudience && candidate.targetAudience) {
      targetAudienceScore = this.calculateTargetAudienceOverlap(
        source.targetAudience,
        candidate.targetAudience
      );
    }
    
    return (sizeRatio * 30) + (engagementCompatibility * 0.4) + (targetAudienceScore * 0.3);
  }

  /**
   * Calculate performance history score (0-100)
   */
  private calculatePerformanceHistory(source: Newsletter, candidate: Newsletter): number {
    // Base score on open rates and subscriber count
    const sourcePerformance = (source.averageOpenRate * 0.7) + 
                            (Math.log10(source.subscriberCount + 1) * 10);
    const candidatePerformance = (candidate.averageOpenRate * 0.7) + 
                                (Math.log10(candidate.subscriberCount + 1) * 10);
    
    // Prefer candidates with good performance
    const performanceScore = Math.min(100, candidatePerformance * 2);
    
    // Bonus for consistent performance (placeholder - would use historical data)
    const consistencyBonus = candidate.averageOpenRate > 20 ? 10 : 0;
    
    return Math.min(100, performanceScore + consistencyBonus);
  }

  /**
   * Calculate geographic alignment score (0-100)
   */
  private calculateGeographicAlignment(source: Newsletter, candidate: Newsletter): number {
    // Placeholder implementation - would use actual geographic data
    // For now, return a base score that can be enhanced with real data
    
    const sourceGeo = source.targetAudience?.geographic || {};
    const candidateGeo = candidate.targetAudience?.geographic || {};
    
    if (!sourceGeo || !candidateGeo) return 50; // Neutral score
    
    // Simple overlap calculation (would be more sophisticated with real geo data)
    let overlapScore = 50;
    
    if (sourceGeo.country && candidateGeo.country) {
      overlapScore = sourceGeo.country === candidateGeo.country ? 80 : 20;
    }
    
    if (sourceGeo.region && candidateGeo.region) {
      const regionBonus = sourceGeo.region === candidateGeo.region ? 20 : 0;
      overlapScore = Math.min(100, overlapScore + regionBonus);
    }
    
    return overlapScore;
  }

  /**
   * Calculate seasonal relevance score (0-100)
   */
  private calculateSeasonalRelevance(source: Newsletter, candidate: Newsletter): number {
    // Placeholder implementation - would use actual seasonal patterns
    const currentMonth = new Date().getMonth();
    const seasonalCategories = ['seasonal', 'holiday', 'events', 'weather'];
    
    const hasSeasonalContent = source.categories.some(cat => 
      seasonalCategories.some(seasonal => cat.toLowerCase().includes(seasonal))
    ) || candidate.categories.some(cat => 
      seasonalCategories.some(seasonal => cat.toLowerCase().includes(seasonal))
    );
    
    // Higher relevance during certain months for seasonal content
    if (hasSeasonalContent) {
      const seasonalMonths = [10, 11, 0, 1, 2]; // Nov, Dec, Jan, Feb, Mar
      return seasonalMonths.includes(currentMonth) ? 80 : 60;
    }
    
    return 70; // Neutral score for non-seasonal content
  }

  /**
   * Calculate competition level score (0-100)
   */
  private calculateCompetitionLevel(source: Newsletter, candidate: Newsletter): number {
    // Lower competition = higher score
    const categoryOverlap = this.calculateCategoryAlignment(source, candidate);
    
    // If high category overlap, there might be competition
    if (categoryOverlap > 80) {
      return 30; // High competition, lower score
    } else if (categoryOverlap > 50) {
      return 60; // Medium competition
    } else {
      return 90; // Low competition, high score
    }
  }

  /**
   * Calculate target audience overlap
   */
  private calculateTargetAudienceOverlap(
    sourceAudience: Record<string, any>,
    candidateAudience: Record<string, any>
  ): number {
    let overlapScore = 0;
    let totalFactors = 0;
    
    // Age overlap
    if (sourceAudience.ageRange && candidateAudience.ageRange) {
      const ageOverlap = this.calculateRangeOverlap(
        sourceAudience.ageRange,
        candidateAudience.ageRange
      );
      overlapScore += ageOverlap;
      totalFactors++;
    }
    
    // Interest overlap
    if (sourceAudience.interests && candidateAudience.interests) {
      const interestOverlap = this.calculateArrayOverlap(
        sourceAudience.interests,
        candidateAudience.interests
      );
      overlapScore += interestOverlap;
      totalFactors++;
    }
    
    // Income overlap
    if (sourceAudience.incomeRange && candidateAudience.incomeRange) {
      const incomeOverlap = this.calculateRangeOverlap(
        sourceAudience.incomeRange,
        candidateAudience.incomeRange
      );
      overlapScore += incomeOverlap;
      totalFactors++;
    }
    
    return totalFactors > 0 ? overlapScore / totalFactors : 50;
  }

  /**
   * Calculate range overlap (for age, income, etc.)
   */
  private calculateRangeOverlap(range1: any, range2: any): number {
    if (!range1 || !range2) return 0;
    
    const min1 = range1.min || 0;
    const max1 = range1.max || 100;
    const min2 = range2.min || 0;
    const max2 = range2.max || 100;
    
    const overlapStart = Math.max(min1, min2);
    const overlapEnd = Math.min(max1, max2);
    
    if (overlapStart >= overlapEnd) return 0;
    
    const overlapSize = overlapEnd - overlapStart;
    const totalRange = Math.max(max1, max2) - Math.min(min1, min2);
    
    return (overlapSize / totalRange) * 100;
  }

  /**
   * Calculate array overlap (for interests, etc.)
   */
  private calculateArrayOverlap(array1: string[], array2: string[]): number {
    if (!array1.length || !array2.length) return 0;
    
    const intersection = array1.filter(item => array2.includes(item));
    const union = [...new Set([...array1, ...array2])];
    
    return (intersection.length / union.length) * 100;
  }

  /**
   * Create a RecommendationMatch object
   */
  private createRecommendationMatch(
    source: Newsletter,
    candidate: Newsletter,
    matchScore: number,
    criteria: RecommendationMatchingCriteria
  ): RecommendationMatch {
    return {
      id: `match-${source.id}-${candidate.id}-${Date.now()}`,
      fromNewsletterId: source.id,
      toNewsletterId: candidate.id,
      matchScore,
      categoryAlignment: this.calculateCategoryAlignment(source, candidate),
      audienceCompatibility: this.calculateAudienceCompatibility(source, candidate),
      performanceHistory: this.calculatePerformanceHistory(source, candidate),
      geographicAlignment: this.calculateGeographicAlignment(source, candidate),
      seasonalRelevance: this.calculateSeasonalRelevance(source, candidate),
      competitionLevel: this.calculateCompetitionLevel(source, candidate),
      isAutoGenerated: true,
      lastCalculated: new Date().toISOString(),
      metadata: {
        algorithmVersion: '1.0.0',
        criteria,
        generatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Batch process multiple newsletters for matching
   */
  public async batchFindMatches(
    sourceNewsletters: Newsletter[],
    candidatePool: Newsletter[],
    criteria?: Partial<RecommendationMatchingCriteria>
  ): Promise<Record<string, MatchingAlgorithmResult>> {
    const fullCriteria = { ...this.getDefaultCriteria(), ...criteria };
    const results: Record<string, MatchingAlgorithmResult> = {};
    
    const promises = sourceNewsletters.map(async (source) => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter: source,
        candidateNewsletters: candidatePool,
        criteria: fullCriteria,
      };
      
      const result = await this.findMatches(input);
      results[source.id] = result;
      return result;
    });
    
    await Promise.all(promises);
    return results;
  }
}

export const recommendationMatchingService = RecommendationMatchingService.getInstance();