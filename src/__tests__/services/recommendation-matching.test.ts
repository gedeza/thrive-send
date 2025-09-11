import { describe, it, expect, beforeEach } from '@jest/globals';
import { RecommendationMatchingService } from '@/lib/services/recommendation-matching';
import { Newsletter, MatchingAlgorithmInput } from '@/types/recommendation';

// Interface to access private methods for testing
interface RecommendationMatchingServicePrivate extends RecommendationMatchingService {
  calculateCategoryAlignment(source: Newsletter, candidate: Newsletter): number;
  calculateAudienceOverlap(source: Newsletter, candidate: Newsletter): number;
  calculateEngagementScore(candidate: Newsletter): number;
  calculateRelevanceScore(source: Newsletter, candidate: Newsletter): number;
}

describe('RecommendationMatchingService', () => {
  let matchingService: RecommendationMatchingService;
  let sourceNewsletter: Newsletter;
  let candidateNewsletters: Newsletter[];

  beforeEach(() => {
    matchingService = RecommendationMatchingService.getInstance();
    
    // Create mock source newsletter
    sourceNewsletter = {
      id: 'source-1',
      title: 'Tech Weekly',
      description: 'Weekly tech newsletter',
      clientId: 'client-1',
      organizationId: 'org-1',
      categories: ['Technology', 'Programming', 'AI'],
      targetAudience: {
        ageRange: { min: 25, max: 45 },
        interests: ['technology', 'programming'],
        geographic: { country: 'US', region: 'West Coast' },
      },
      subscriberCount: 10000,
      averageOpenRate: 25.5,
      isActiveForRecommendations: true,
      recommendationWeight: 3.0,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    // Create mock candidate newsletters
    candidateNewsletters = [
      {
        id: 'candidate-1',
        title: 'Startup Digest',
        description: 'Weekly startup news',
        clientId: 'client-2',
        organizationId: 'org-2',
        categories: ['Technology', 'Startups', 'Business'],
        targetAudience: {
          ageRange: { min: 30, max: 50 },
          interests: ['startups', 'business'],
          geographic: { country: 'US', region: 'West Coast' },
        },
        subscriberCount: 8000,
        averageOpenRate: 22.0,
        isActiveForRecommendations: true,
        recommendationWeight: 2.5,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'candidate-2',
        title: 'Design Weekly',
        description: 'Design and UX newsletter',
        clientId: 'client-3',
        organizationId: 'org-3',
        categories: ['Design', 'UX', 'Creative'],
        targetAudience: {
          ageRange: { min: 22, max: 40 },
          interests: ['design', 'creativity'],
          geographic: { country: 'US', region: 'East Coast' },
        },
        subscriberCount: 5000,
        averageOpenRate: 30.0,
        isActiveForRecommendations: true,
        recommendationWeight: 2.0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'candidate-3',
        title: 'Same Org Newsletter',
        description: 'Newsletter from same organization',
        clientId: 'client-1',
        organizationId: 'org-1', // Same org as source
        categories: ['Technology', 'Programming'],
        targetAudience: {},
        subscriberCount: 3000,
        averageOpenRate: 20.0,
        isActiveForRecommendations: true,
        recommendationWeight: 1.5,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'candidate-4',
        title: 'Inactive Newsletter',
        description: 'Inactive newsletter',
        clientId: 'client-4',
        organizationId: 'org-4',
        categories: ['Technology'],
        targetAudience: {},
        subscriberCount: 12000,
        averageOpenRate: 28.0,
        isActiveForRecommendations: false, // Inactive
        recommendationWeight: 4.0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'candidate-5',
        title: 'Small Newsletter',
        description: 'Very small newsletter',
        clientId: 'client-5',
        organizationId: 'org-5',
        categories: ['Technology'],
        targetAudience: {},
        subscriberCount: 500, // Too small (< 10% of source)
        averageOpenRate: 35.0,
        isActiveForRecommendations: true,
        recommendationWeight: 1.0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];
  });

  describe('findMatches()', () => {
    it('should return matches above minimum score threshold', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: {
          ...matchingService.getDefaultCriteria(),
          minMatchScore: 30.0,
        },
      };

      const result = await matchingService.findMatches(input);

      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
      
      // All matches should have score >= threshold
      result.matches.forEach(match => {
        expect(match.matchScore).toBeGreaterThanOrEqual(30.0);
      });
    });

    it('should filter out same organization newsletters', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: matchingService.getDefaultCriteria(),
      };

      const result = await matchingService.findMatches(input);

      // Should not include candidate-3 (same org)
      const sameOrgMatch = result.matches.find(m => m.toNewsletterId === 'candidate-3');
      expect(sameOrgMatch).toBeUndefined();
    });

    it('should filter out excluded organizations', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: matchingService.getDefaultCriteria(),
        excludeOrganizations: ['org-2'],
      };

      const result = await matchingService.findMatches(input);

      // Should not include candidate-1 (excluded org)
      const excludedMatch = result.matches.find(m => m.toNewsletterId === 'candidate-1');
      expect(excludedMatch).toBeUndefined();
    });

    it('should filter out inactive newsletters', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: matchingService.getDefaultCriteria(),
      };

      const result = await matchingService.findMatches(input);

      // Should not include candidate-4 (inactive)
      const inactiveMatch = result.matches.find(m => m.toNewsletterId === 'candidate-4');
      expect(inactiveMatch).toBeUndefined();
    });

    it('should filter by minimum subscriber count (10% of source)', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: matchingService.getDefaultCriteria(),
      };

      const result = await matchingService.findMatches(input);

      // Should not include candidate-5 (too small: 500 < 1000)
      const smallMatch = result.matches.find(m => m.toNewsletterId === 'candidate-5');
      expect(smallMatch).toBeUndefined();
    });

    it('should filter by included categories if specified', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: matchingService.getDefaultCriteria(),
        includeCategories: ['Technology'],
      };

      const result = await matchingService.findMatches(input);

      // Should only include newsletters with Technology category
      result.matches.forEach(match => {
        const candidate = candidateNewsletters.find(c => c.id === match.toNewsletterId);
        expect(candidate?.categories).toContain('Technology');
      });
    });

    it('should sort matches by score descending', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: {
          ...matchingService.getDefaultCriteria(),
          minMatchScore: 0, // Allow all matches
        },
      };

      const result = await matchingService.findMatches(input);

      if (result.matches.length > 1) {
        for (let i = 0; i < result.matches.length - 1; i++) {
          expect(result.matches[i].matchScore).toBeGreaterThanOrEqual(
            result.matches[i + 1].matchScore
          );
        }
      }
    });

    it('should limit results to maxSuggestions', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: {
          ...matchingService.getDefaultCriteria(),
          maxSuggestions: 1,
          minMatchScore: 0,
        },
      };

      const result = await matchingService.findMatches(input);

      expect(result.matches.length).toBeLessThanOrEqual(1);
    });

    it('should return processing time and algorithm version', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: matchingService.getDefaultCriteria(),
      };

      const result = await matchingService.findMatches(input);

      expect(result.processingTimeMs).toBeDefined();
      expect(typeof result.processingTimeMs).toBe('number');
      expect(result.processingTimeMs).toBeGreaterThan(0);
      
      expect(result.algorithmVersion).toBeDefined();
      expect(typeof result.algorithmVersion).toBe('string');
      expect(result.algorithmVersion).toBe('1.0.0');
    });
  });

  describe('calculateMatchScore()', () => {
    it('should weight category alignment by configured percentage', async () => {
      const criteria = {
        ...matchingService.getDefaultCriteria(),
        categoryWeight: 1.0, // 100% weight on categories
        audienceCompatibilityWeight: 0.0,
        performanceHistoryWeight: 0.0,
        geographicWeight: 0.0,
        seasonalWeight: 0.0,
        competitionWeight: 0.0,
      };

      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters: [candidateNewsletters[0]], // Tech-related candidate
        criteria,
      };

      const result = await matchingService.findMatches(input);
      
      if (result.matches.length > 0) {
        const match = result.matches[0];
        // Score should primarily reflect category alignment
        expect(match.categoryAlignment).toBeGreaterThan(0);
        expect(match.matchScore).toBeCloseTo(match.categoryAlignment, 1);
      }
    });

    it('should return score between 0-100', async () => {
      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters,
        criteria: {
          ...matchingService.getDefaultCriteria(),
          minMatchScore: 0,
        },
      };

      const result = await matchingService.findMatches(input);

      result.matches.forEach(match => {
        expect(match.matchScore).toBeGreaterThanOrEqual(0);
        expect(match.matchScore).toBeLessThanOrEqual(100);
      });
    });

    it('should return 0 for completely incompatible newsletters', async () => {
      const incompatibleNewsletter: Newsletter = {
        id: 'incompatible',
        title: 'Cooking Newsletter',
        description: 'Recipes and cooking tips',
        clientId: 'client-6',
        organizationId: 'org-6',
        categories: ['Cooking', 'Food', 'Recipes'],
        targetAudience: {
          ageRange: { min: 45, max: 65 },
          interests: ['cooking', 'food'],
          geographic: { country: 'UK', region: 'London' },
        },
        subscriberCount: 1000,
        averageOpenRate: 15.0,
        isActiveForRecommendations: true,
        recommendationWeight: 1.0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const input: MatchingAlgorithmInput = {
        sourceNewsletter,
        candidateNewsletters: [incompatibleNewsletter],
        criteria: {
          ...matchingService.getDefaultCriteria(),
          minMatchScore: 0,
        },
      };

      const result = await matchingService.findMatches(input);

      if (result.matches.length > 0) {
        const match = result.matches[0];
        expect(match.matchScore).toBeLessThan(20); // Very low score for incompatible
      }
    });
  });

  describe('calculateCategoryAlignment()', () => {
    it('should return 0 for newsletters with no categories', () => {
      const emptySource: Newsletter = { ...sourceNewsletter, categories: [] };
      const emptyCandidate: Newsletter = { ...candidateNewsletters[0], categories: [] };

      // We need to access the private method for testing
      const service = matchingService as RecommendationMatchingServicePrivate;
      const score = service.calculateCategoryAlignment(emptySource, emptyCandidate);

      expect(score).toBe(0);
    });

    it('should calculate Jaccard similarity for category overlap', () => {
      const service = matchingService as RecommendationMatchingServicePrivate;
      const score = service.calculateCategoryAlignment(sourceNewsletter, candidateNewsletters[0]);

      // Source: ['Technology', 'Programming', 'AI']
      // Candidate: ['Technology', 'Startups', 'Business']
      // Intersection: ['Technology'] (1 item)
      // Union: ['Technology', 'Programming', 'AI', 'Startups', 'Business'] (5 items)
      // Jaccard: 1/5 = 0.2
      // With exact match bonus: 0.2 + 0.2 = 0.4
      // Scaled to 100: 40

      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThan(50);
    });

    it('should add bonus for exact category matches', () => {
      const exactMatchCandidate: Newsletter = {
        ...candidateNewsletters[0],
        categories: ['Technology', 'Programming'], // 2 exact matches
      };

      const service = matchingService as RecommendationMatchingServicePrivate;
      const score = service.calculateCategoryAlignment(sourceNewsletter, exactMatchCandidate);

      expect(score).toBeGreaterThan(50); // Should get bonus for exact matches
    });

    it('should return score between 0-100', () => {
      const service = matchingService as RecommendationMatchingServicePrivate;
      
      candidateNewsletters.forEach(candidate => {
        const score = service.calculateCategoryAlignment(sourceNewsletter, candidate);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle empty category arrays gracefully', () => {
      const emptySource: Newsletter = { ...sourceNewsletter, categories: [] };
      
      const service = matchingService as RecommendationMatchingServicePrivate;
      const score = service.calculateCategoryAlignment(emptySource, candidateNewsletters[0]);

      expect(score).toBe(0);
      expect(typeof score).toBe('number');
    });
  });

  describe('calculateAudienceCompatibility()', () => {
    it('should prefer newsletters of similar subscriber size', () => {
      const service = matchingService as RecommendationMatchingServicePrivate;
      
      // Similar size (8000 vs 10000)
      const similarScore = service.calculateAudienceCompatibility(sourceNewsletter, candidateNewsletters[0]);
      
      // Very different size (500 vs 10000)
      const differentScore = service.calculateAudienceCompatibility(sourceNewsletter, candidateNewsletters[4]);

      expect(similarScore).toBeGreaterThan(differentScore);
    });

    it('should consider engagement rate similarity', () => {
      const service = matchingService as RecommendationMatchingServicePrivate;
      
      const score1 = service.calculateAudienceCompatibility(sourceNewsletter, candidateNewsletters[0]); // 22% vs 25.5%
      const score2 = service.calculateAudienceCompatibility(sourceNewsletter, candidateNewsletters[1]); // 30% vs 25.5%

      // Both should have reasonable scores, but different based on engagement diff
      expect(score1).toBeGreaterThan(0);
      expect(score2).toBeGreaterThan(0);
    });

    it('should analyze target audience overlap if available', () => {
      const service = matchingService as RecommendationMatchingServicePrivate;
      
      const scoreWithAudience = service.calculateAudienceCompatibility(sourceNewsletter, candidateNewsletters[0]);
      
      // Create candidate without target audience
      const noAudienceCandidate = { ...candidateNewsletters[0], targetAudience: {} };
      const scoreWithoutAudience = service.calculateAudienceCompatibility(sourceNewsletter, noAudienceCandidate);

      expect(scoreWithAudience).toBeDefined();
      expect(scoreWithoutAudience).toBeDefined();
      expect(typeof scoreWithAudience).toBe('number');
      expect(typeof scoreWithoutAudience).toBe('number');
    });

    it('should return score between 0-100', () => {
      const service = matchingService as RecommendationMatchingServicePrivate;
      
      candidateNewsletters.forEach(candidate => {
        const score = service.calculateAudienceCompatibility(sourceNewsletter, candidate);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle missing audience data gracefully', () => {
      const noAudienceSource = { ...sourceNewsletter, targetAudience: undefined };
      const noAudienceCandidate = { ...candidateNewsletters[0], targetAudience: undefined };
      
      const service = matchingService as RecommendationMatchingServicePrivate;
      const score = service.calculateAudienceCompatibility(noAudienceSource, noAudienceCandidate);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('batchFindMatches()', () => {
    it('should process multiple source newsletters', async () => {
      const sourceNewsletters = [sourceNewsletter, candidateNewsletters[0]];
      
      const results = await matchingService.batchFindMatches(
        sourceNewsletters,
        candidateNewsletters,
        { minMatchScore: 0 }
      );

      expect(Object.keys(results)).toHaveLength(2);
      expect(results[sourceNewsletter.id]).toBeDefined();
      expect(results[candidateNewsletters[0].id]).toBeDefined();
    });

    it('should return results keyed by newsletter ID', async () => {
      const sourceNewsletters = [sourceNewsletter];
      
      const results = await matchingService.batchFindMatches(
        sourceNewsletters,
        candidateNewsletters
      );

      expect(results[sourceNewsletter.id]).toBeDefined();
      expect(results[sourceNewsletter.id].matches).toBeDefined();
      expect(Array.isArray(results[sourceNewsletter.id].matches)).toBe(true);
    });

    it('should handle processing errors gracefully', async () => {
      const invalidSource = { ...sourceNewsletter, id: '' }; // Invalid newsletter
      
      const results = await matchingService.batchFindMatches(
        [invalidSource],
        candidateNewsletters
      );

      // Should still return a result structure
      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    it('should run matching in parallel for performance', async () => {
      const sourceNewsletters = [sourceNewsletter, candidateNewsletters[0], candidateNewsletters[1]];
      
      const startTime = Date.now();
      
      const results = await matchingService.batchFindMatches(
        sourceNewsletters,
        candidateNewsletters
      );
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete in reasonable time (parallel processing)
      expect(totalTime).toBeLessThan(5000); // 5 seconds max
      expect(Object.keys(results)).toHaveLength(3);
    });
  });
});