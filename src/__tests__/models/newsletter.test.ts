import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/prisma';

describe('Newsletter Model', () => {
  let testOrganizationId: string;
  let testClientId: string;

  beforeEach(async () => {
    // Create test organization and client
    const testOrg = await prisma.organization?.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org-newsletter',
      },
    });
    testOrganizationId = testOrg!.id;

    const testClient = await prisma.client?.create({
      data: {
        name: 'Test Client',
        organizationId: testOrganizationId,
        type: 'BUSINESS',
        status: 'ACTIVE',
      },
    });
    testClientId = testClient!.id;
  });

  afterEach(async () => {
    // Clean up test data
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

  it('should create newsletter with required fields', async () => {
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter).toBeDefined();
    expect(newsletter?.title).toBe('Test Newsletter');
    expect(newsletter?.clientId).toBe(testClientId);
    expect(newsletter?.organizationId).toBe(testOrganizationId);
  });

  it('should validate title is required and non-empty', async () => {
    const newsletterData = {
      title: '',
      clientId: testClientId,
      organizationId: testOrganizationId,
    };

    await expect(
      prisma.newsletter?.create({
        data: newsletterData,
      })
    ).rejects.toThrow();
  });

  it('should validate clientId exists and user has access', async () => {
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: 'non-existent-client-id',
      organizationId: testOrganizationId,
    };

    await expect(
      prisma.newsletter?.create({
        data: newsletterData,
      })
    ).rejects.toThrow();
  });

  it('should default subscriberCount to 0', async () => {
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter?.subscriberCount).toBe(0);
  });

  it('should default isActiveForRecommendations to true', async () => {
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter?.isActiveForRecommendations).toBe(true);
  });

  it('should accept categories as string array', async () => {
    const categories = ['Tech', 'Business', 'Startups'];
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
      categories,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter?.categories).toEqual(categories);
  });

  it('should store targetAudience as JSON object', async () => {
    const targetAudience = {
      ageRange: { min: 25, max: 45 },
      interests: ['technology', 'business'],
      geographic: { country: 'US', region: 'West Coast' },
    };

    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
      targetAudience,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter?.targetAudience).toEqual(targetAudience);
  });

  it('should calculate recommendationWeight between 0-5', async () => {
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
      recommendationWeight: 3.5,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter?.recommendationWeight).toBe(3.5);
    expect(newsletter?.recommendationWeight).toBeGreaterThanOrEqual(0);
    expect(newsletter?.recommendationWeight).toBeLessThanOrEqual(5);
  });

  it('should track creation and update timestamps', async () => {
    const newsletterData = {
      title: 'Test Newsletter',
      clientId: testClientId,
      organizationId: testOrganizationId,
    };

    const newsletter = await prisma.newsletter?.create({
      data: newsletterData,
    });

    expect(newsletter?.createdAt).toBeDefined();
    expect(newsletter?.updatedAt).toBeDefined();
    expect(newsletter?.createdAt).toBeInstanceOf(Date);
    expect(newsletter?.updatedAt).toBeInstanceOf(Date);
  });

  it('should cascade delete recommendations when newsletter deleted', async () => {
    // Create two newsletters
    const newsletter1 = await prisma.newsletter?.create({
      data: {
        title: 'Newsletter 1',
        clientId: testClientId,
        organizationId: testOrganizationId,
      },
    });

    const newsletter2 = await prisma.newsletter?.create({
      data: {
        title: 'Newsletter 2',
        clientId: testClientId,
        organizationId: testOrganizationId,
      },
    });

    // Create recommendation between them
    await prisma.newsletterRecommendation?.create({
      data: {
        fromNewsletterId: newsletter1!.id,
        toNewsletterId: newsletter2!.id,
        type: 'ONE_WAY',
        status: 'ACTIVE',
        priority: 5,
        targetAudienceOverlap: 50,
        estimatedReach: 1000,
      },
    });

    // Verify recommendation exists
    const recommendationsBefore = await prisma.newsletterRecommendation?.count({
      where: {
        OR: [
          { fromNewsletterId: newsletter1?.id },
          { toNewsletterId: newsletter1?.id },
        ],
      },
    });
    expect(recommendationsBefore).toBe(1);

    // Delete newsletter
    await prisma.newsletter?.delete({
      where: { id: newsletter1?.id },
    });

    // Verify recommendations are deleted
    const recommendationsAfter = await prisma.newsletterRecommendation?.count({
      where: {
        OR: [
          { fromNewsletterId: newsletter1?.id },
          { toNewsletterId: newsletter1?.id },
        ],
      },
    });
    expect(recommendationsAfter).toBe(0);
  });
});