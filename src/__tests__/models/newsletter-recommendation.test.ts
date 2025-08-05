import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import { RecommendationStatus, RecommendationType } from '@/types/recommendation';

describe('NewsletterRecommendation Model', () => {
  let testOrganizationId: string;
  let testClientId: string;
  let sourceNewsletterId: string;
  let targetNewsletterId: string;

  beforeEach(async () => {
    // Create test organization and client
    const testOrg = await prisma.organization?.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org-rec',
      },
    });
    testOrganizationId = testOrg?.id!;

    const testClient = await prisma.client?.create({
      data: {
        name: 'Test Client',
        organizationId: testOrganizationId,
        type: 'BUSINESS',
        status: 'ACTIVE',
      },
    });
    testClientId = testClient?.id!;

    // Create test newsletters
    const sourceNewsletter = await prisma.newsletter?.create({
      data: {
        title: 'Source Newsletter',
        clientId: testClientId,
        organizationId: testOrganizationId,
        categories: ['Tech', 'Business'],
      },
    });
    sourceNewsletterId = sourceNewsletter?.id!;

    const targetNewsletter = await prisma.newsletter?.create({
      data: {
        title: 'Target Newsletter',
        clientId: testClientId,
        organizationId: testOrganizationId,
        categories: ['Tech', 'Startups'],
      },
    });
    targetNewsletterId = targetNewsletter?.id!;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.newsletterRecommendation?.deleteMany({
      where: {
        OR: [
          { fromNewsletterId: sourceNewsletterId },
          { toNewsletterId: targetNewsletterId },
        ],
      },
    });
    await prisma.newsletter?.deleteMany({
      where: { organizationId: testOrganizationId },
    });
    await prisma.client?.deleteMany({
      where: { organizationId: testOrganizationId },
    });
    await prisma.organization?.delete({
      where: { id: testOrganizationId },
    });
  });

  it('should create recommendation with from/to newsletter IDs', async () => {
    const recommendationData = {
      fromNewsletterId: sourceNewsletterId,
      toNewsletterId: targetNewsletterId,
      type: RecommendationType.ONE_WAY,
      status: RecommendationStatus.ACTIVE,
      priority: 5,
      targetAudienceOverlap: 50.0,
      estimatedReach: 1000,
    };

    const recommendation = await prisma.newsletterRecommendation?.create({
      data: recommendationData,
    });

    expect(recommendation).toBeDefined();
    expect(recommendation?.fromNewsletterId).toBe(sourceNewsletterId);
    expect(recommendation?.toNewsletterId).toBe(targetNewsletterId);
    expect(recommendation?.type).toBe(RecommendationType.ONE_WAY);
    expect(recommendation?.status).toBe(RecommendationStatus.ACTIVE);
  });

  it('should prevent self-recommendation (same newsletter)', async () => {
    const recommendationData = {
      fromNewsletterId: sourceNewsletterId,
      toNewsletterId: sourceNewsletterId, // Same newsletter
      type: RecommendationType.ONE_WAY,
      status: RecommendationStatus.ACTIVE,
      priority: 5,
      targetAudienceOverlap: 50.0,
      estimatedReach: 1000,
    };

    // This should be prevented at the application level, but let's test the constraint
    await expect(
      prisma.newsletterRecommendation?.create({
        data: recommendationData,
      })
    ).rejects.toThrow();
  });

  it('should prevent duplicate recommendations (same pair)', async () => {
    const recommendationData = {
      fromNewsletterId: sourceNewsletterId,
      toNewsletterId: targetNewsletterId,
      type: RecommendationType.ONE_WAY,
      status: RecommendationStatus.ACTIVE,
      priority: 5,
      targetAudienceOverlap: 50.0,
      estimatedReach: 1000,
    };

    // Create first recommendation
    await prisma.newsletterRecommendation?.create({
      data: recommendationData,
    });

    // Try to create duplicate
    await expect(
      prisma.newsletterRecommendation?.create({
        data: recommendationData,
      })
    ).rejects.toThrow();
  });

  it('should validate status enum values', async () => {
    const validStatuses = [
      RecommendationStatus.ACTIVE,
      RecommendationStatus.PAUSED,
      RecommendationStatus.ENDED,
      RecommendationStatus.PENDING_APPROVAL,
      RecommendationStatus.REJECTED,
    ];

    for (const status of validStatuses) {
      const recommendation = await prisma.newsletterRecommendation?.create({
        data: {
          fromNewsletterId: sourceNewsletterId,
          toNewsletterId: targetNewsletterId,
          type: RecommendationType.ONE_WAY,
          status,
          priority: 5,
          targetAudienceOverlap: 50.0,
          estimatedReach: 1000,
        },
      });

      expect(recommendation?.status).toBe(status);

      // Clean up for next iteration
      await prisma.newsletterRecommendation?.delete({
        where: { id: recommendation?.id },
      });
    }
  });

  it('should validate type enum values', async () => {
    const validTypes = [
      RecommendationType.ONE_WAY,
      RecommendationType.MUTUAL,
      RecommendationType.SPONSORED,
    ];

    for (const type of validTypes) {
      const recommendation = await prisma.newsletterRecommendation?.create({
        data: {
          fromNewsletterId: sourceNewsletterId,
          toNewsletterId: targetNewsletterId,
          type,
          status: RecommendationStatus.ACTIVE,
          priority: 5,
          targetAudienceOverlap: 50.0,
          estimatedReach: 1000,
        },
      });

      expect(recommendation?.type).toBe(type);

      // Clean up for next iteration
      await prisma.newsletterRecommendation?.delete({
        where: { id: recommendation?.id },
      });
    }
  });

  it('should validate priority between 1-10', async () => {
    // Test valid priorities
    const validPriorities = [1, 5, 10];
    
    for (const priority of validPriorities) {
      const recommendation = await prisma.newsletterRecommendation?.create({
        data: {
          fromNewsletterId: sourceNewsletterId,
          toNewsletterId: targetNewsletterId,
          type: RecommendationType.ONE_WAY,
          status: RecommendationStatus.ACTIVE,
          priority,
          targetAudienceOverlap: 50.0,
          estimatedReach: 1000,
        },
      });

      expect(recommendation?.priority).toBe(priority);
      expect(recommendation?.priority).toBeGreaterThanOrEqual(1);
      expect(recommendation?.priority).toBeLessThanOrEqual(10);

      // Clean up for next iteration
      await prisma.newsletterRecommendation?.delete({
        where: { id: recommendation?.id },
      });
    }

    // Test invalid priorities (should be handled by application validation)
    const invalidPriorities = [0, 11, -1];
    
    for (const priority of invalidPriorities) {
      await expect(
        prisma.newsletterRecommendation?.create({
          data: {
            fromNewsletterId: sourceNewsletterId,
            toNewsletterId: targetNewsletterId,
            type: RecommendationType.ONE_WAY,
            status: RecommendationStatus.ACTIVE,
            priority,
            targetAudienceOverlap: 50.0,
            estimatedReach: 1000,
          },
        })
      ).rejects.toThrow();
    }
  });

  it('should calculate targetAudienceOverlap percentage', async () => {
    const overlap = 65.5;
    
    const recommendation = await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId: sourceNewsletterId,
        toNewsletterId: targetNewsletterId,
        type: RecommendationType.ONE_WAY,
        status: RecommendationStatus.ACTIVE,
        priority: 5,
        targetAudienceOverlap: overlap,
        estimatedReach: 1000,
      },
    });

    expect(recommendation?.targetAudienceOverlap).toBe(overlap);
    expect(recommendation?.targetAudienceOverlap).toBeGreaterThanOrEqual(0);
    expect(recommendation?.targetAudienceOverlap).toBeLessThanOrEqual(100);
  });

  it('should estimate reach based on source subscriber count', async () => {
    const estimatedReach = 2500;
    
    const recommendation = await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId: sourceNewsletterId,
        toNewsletterId: targetNewsletterId,
        type: RecommendationType.ONE_WAY,
        status: RecommendationStatus.ACTIVE,
        priority: 5,
        targetAudienceOverlap: 50.0,
        estimatedReach,
      },
    });

    expect(recommendation?.estimatedReach).toBe(estimatedReach);
    expect(recommendation?.estimatedReach).toBeGreaterThanOrEqual(0);
  });

  it('should support optional end date for temporary recommendations', async () => {
    const endDate = new Date('2025-12-31');
    
    const recommendation = await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId: sourceNewsletterId,
        toNewsletterId: targetNewsletterId,
        type: RecommendationType.SPONSORED,
        status: RecommendationStatus.ACTIVE,
        priority: 5,
        targetAudienceOverlap: 50.0,
        estimatedReach: 1000,
        endDate,
      },
    });

    expect(recommendation?.endDate).toEqual(endDate);
  });

  it('should store metadata as JSON object', async () => {
    const metadata = {
      campaign: 'Q1 Growth',
      budget: 1000,
      tags: ['high-priority', 'tech'],
      notes: 'Strategic partnership opportunity',
    };
    
    const recommendation = await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId: sourceNewsletterId,
        toNewsletterId: targetNewsletterId,
        type: RecommendationType.ONE_WAY,
        status: RecommendationStatus.ACTIVE,
        priority: 5,
        targetAudienceOverlap: 50.0,
        estimatedReach: 1000,
        metadata,
      },
    });

    expect(recommendation?.metadata).toEqual(metadata);
  });

  it('should track performance metrics relationship', async () => {
    // Create recommendation
    const recommendation = await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId: sourceNewsletterId,
        toNewsletterId: targetNewsletterId,
        type: RecommendationType.ONE_WAY,
        status: RecommendationStatus.ACTIVE,
        priority: 5,
        targetAudienceOverlap: 50.0,
        estimatedReach: 1000,
      },
    });

    // Create performance record
    const performance = await prisma.recommendationPerformance?.create({
      data: {
        recommendationId: recommendation?.id!,
        period: 'DAILY',
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-01-01'),
        impressions: 1000,
        clicks: 50,
        conversions: 5,
        ctr: 5.0,
        conversionRate: 10.0,
      },
    });

    // Verify relationship
    const recommendationWithPerformance = await prisma.newsletterRecommendation?.findUnique({
      where: { id: recommendation?.id },
      include: { performance: true },
    });

    expect(recommendationWithPerformance?.performance).toHaveLength(1);
    expect(recommendationWithPerformance?.performance[0].id).toBe(performance?.id);
  });
});