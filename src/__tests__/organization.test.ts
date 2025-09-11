import { OrganizationService } from '@/lib/api/organization-service';
import { setupTestDatabase, cleanupTestData, withTransaction, resetMocks } from '@/lib/test/setup';
import { sendInvitationEmail } from '@/lib/email';
import { prisma } from '@/lib/test/db';

// Increase the default timeout for all tests in this file
jest.setTimeout(30000);

describe('Organization Service', () => {
  let organizationService: OrganizationService;
  let testOrgId: string;
  let adminUserId: string;
  let memberUserId: string;

  beforeAll(async () => {
    try {
      organizationService = new OrganizationService();
      
      // Set up test data
      const { adminUser, memberUser, organization } = await setupTestDatabase();
      
      adminUserId = adminUser.id;
      memberUserId = memberUser.id;
      testOrgId = organization.id;
    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  });

  afterAll(async () => {
    try {
      await cleanupTestData();
      await prisma.$disconnect();
    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  });

  beforeEach(() => {
    resetMocks();
  });

  describe('Organization Settings', () => {
    it('should allow admin to update organization settings', async () => {
      const updatedOrg = await withTransaction(async () => {
        return organizationService.updateOrganization(testOrgId, {
          name: 'Updated Test Organization',
          slug: 'updated-test-org',
          website: 'https://updated-test-org.com',
          logoUrl: 'https://updated-test-org.com/logo.png',
        });
      });

      expect(updatedOrg.name).toBe('Updated Test Organization');
      expect(updatedOrg.slug).toBe('updated-test-org');
      expect(updatedOrg.website).toBe('https://updated-test-org.com');
      expect(updatedOrg.logoUrl).toBe('https://updated-test-org.com/logo.png');
    });

    it('should validate organization settings', async () => {
      await expect(
        withTransaction(async () => {
          return organizationService.updateOrganization(testOrgId, {
            name: '', // Invalid: empty name
            slug: 'test-org',
            website: 'invalid-url',
            logoUrl: 'invalid-url',
          });
        })
      ).rejects.toThrow();
    });
  });

  describe('Member Management', () => {
    it('should allow admin to update member role', async () => {
      const updatedMember = await withTransaction(async () => {
        return organizationService.updateMember(
          testOrgId,
          memberUserId,
          'ADMIN'
        );
      });

      expect(updatedMember.role).toBe('ADMIN');
    });

    it('should allow admin to remove member', async () => {
      await withTransaction(async () => {
        await organizationService.removeMember(testOrgId, memberUserId);
      });

      const members = await organizationService.getMembers(testOrgId);
      expect(members.find(m => m.userId === memberUserId)).toBeUndefined();
    });

    it('should validate member role updates', async () => {
      await expect(
        withTransaction(async () => {
          return organizationService.updateMember(testOrgId, memberUserId, 'INVALID_ROLE');
        })
      ).rejects.toThrow();
    });

    it('should send invitation email when inviting a new member', async () => {
      const email = 'newmember@test.com';
      const role = 'MEMBER';

      await withTransaction(async () => {
        await organizationService.inviteMember(testOrgId, email, role);
      });

      expect(sendInvitationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          role,
          organizationName: expect.any(String),
          token: expect.any(String),
        })
      );
    });
  });

  describe('Subscription Management', () => {
    it('should allow admin to update subscription plan', async () => {
      const subscription = await withTransaction(async () => {
        return organizationService.updateSubscription(
          testOrgId,
          'pro'
        );
      });

      expect(subscription.plan).toBe('pro');
      expect(subscription.price).toBe(29);
    });

    it('should validate subscription plan updates', async () => {
      await expect(
        withTransaction(async () => {
          return organizationService.updateSubscription(testOrgId, 'invalid-plan');
        })
      ).rejects.toThrow();
    });
  });
}); 