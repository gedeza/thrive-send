import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// Validation schemas
const organizationSettingsSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().url().optional(),
  timezone: z.string().default('UTC'),
  logo: z.string().url().optional(),
});

const memberRoleSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export class OrganizationService {
  async getOrganization(organizationId: string) {
    return prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        subscription: true,
      },
    });
  }

  async updateSettings(organizationId: string, settings: z.infer<typeof organizationSettingsSchema>) {
    const validatedSettings = organizationSettingsSchema.parse(settings);
    
    return prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: validatedSettings.name,
        website: validatedSettings.domain,
        logoUrl: validatedSettings.logo,
      },
    });
  }

  async getMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: true,
      },
    });
  }

  async updateMemberRole(organizationId: string, memberId: string, role: string) {
    return prisma.organizationMember.update({
      where: {
        id: memberId,
        organizationId,
      },
      data: {
        role,
      },
    });
  }

  async removeMember(organizationId: string, memberId: string) {
    return prisma.organizationMember.delete({
      where: {
        id: memberId,
        organizationId,
      },
    });
  }

  async inviteMember(organizationId: string, email: string, role: string) {
    const validatedData = memberRoleSchema.parse({ email, role });

    // Generate a unique token for the invitation
    const token = randomBytes(32).toString('hex');

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        email: validatedData.email,
        role: validatedData.role,
        status: 'PENDING',
        token,
        organizationId,
      },
    });

    // TODO: Send invitation email
    // This would typically integrate with your email service

    return invitation;
  }

  async getSubscription(organizationId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId },
    });
  }

  async updateSubscription(organizationId: string, subscriptionData: {
    plan: string;
    status: string;
    billingCycle: string;
    price: number;
  }) {
    return prisma.subscription.upsert({
      where: { organizationId },
      update: subscriptionData,
      create: {
        ...subscriptionData,
        organizationId,
        startDate: new Date(),
      },
    });
  }

  async getBillingHistory(organizationId: string) {
    return prisma.payment.findMany({
      where: {
        subscription: {
          organizationId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 