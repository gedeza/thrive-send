import { db } from '@/lib/db';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// Validation schemas
const organizationSettingsSchema = z.object({
  name: z.string().min(1).max(100).transform(val => val.trim()),
  website: z.string().refine((val) => {
    if (!val) return true; // Allow empty values
    // Accept either a full URL or just a domain name
    try {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        new URL(val);
        return true;
      }
      // Check if it's a valid domain name
      return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(val);
    } catch {
      return false;
    }
  }, "Invalid domain format. Please enter a valid domain (e.g., example.com) or full URL").transform(val => {
    if (!val) return null;
    // If it's already a full URL, return as is
    if (val.startsWith('http://') || val.startsWith('https://')) {
      return val;
    }
    // Otherwise, prepend https://
    return `https://${val}`;
  }).optional(),
  logoUrl: z.string().url().optional(),
});

const memberRoleSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export class OrganizationService {
  async getOrganization(organizationId: string) {
    return db.organization.findUnique({
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
    try {
      console.log("[OrganizationService] Starting updateSettings with:", {
        organizationId,
        settings,
        settingsType: typeof settings,
        settingsKeys: Object.keys(settings),
        settingsValues: Object.values(settings)
      });
      
      // Validate the settings
      console.log("[OrganizationService] Attempting to validate settings...");
      const validatedSettings = organizationSettingsSchema.parse(settings);
      console.log("[OrganizationService] Successfully validated settings:", validatedSettings);
      
      // Get current organization to preserve slug
      console.log("[OrganizationService] Fetching current organization...");
      const currentOrg = await db.organization.findUnique({
        where: { id: organizationId },
        include: {
          members: {
            where: {
              role: "ADMIN"
            }
          }
        }
      });
      console.log("[OrganizationService] Found current organization:", {
        id: currentOrg?.id,
        name: currentOrg?.name,
        memberCount: currentOrg?.members.length,
        hasAdmin: currentOrg?.members.some(m => m.role === "ADMIN")
      });
      
      if (!currentOrg) {
        throw new Error("Organization not found");
      }

      if (currentOrg.members.length === 0) {
        throw new Error("No admin members found for this organization");
      }
      
      // Prepare update data
      const updateData = {
        name: validatedSettings.name,
        website: validatedSettings.website || null, // Ensure null for empty strings
        logoUrl: validatedSettings.logoUrl || null, // Ensure null for empty strings
        // Don't update the slug as it's a unique identifier
      };
      console.log("[OrganizationService] Prepared update data:", updateData);
      
      // Update the organization
      console.log("[OrganizationService] Attempting to update organization...");
      const updatedOrg = await db.organization.update({
        where: { id: organizationId },
        data: updateData,
      });
      
      console.log("[OrganizationService] Successfully updated organization:", {
        id: updatedOrg.id,
        name: updatedOrg.name,
        website: updatedOrg.website,
        logoUrl: updatedOrg.logoUrl
      });
      return updatedOrg;
    } catch (error) {
      console.error("[OrganizationService] Error updating settings:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        organizationId,
        settings,
        errorType: error?.constructor?.name,
        errorKeys: error ? Object.keys(error) : [],
        isZodError: error instanceof z.ZodError,
        zodErrors: error instanceof z.ZodError ? error.errors : undefined
      });
      throw error;
    }
  }

  async getMembers(organizationId: string) {
    return db.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: true,
      },
    });
  }

  async updateMemberRole(organizationId: string, memberId: string, role: string) {
    return db.organizationMember.update({
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
    return db.organizationMember.delete({
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
    const invitation = await db.invitation.create({
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
    return db.subscription.findUnique({
      where: { organizationId },
    });
  }

  async updateSubscription(organizationId: string, subscriptionData: {
    plan: string;
    status: string;
    billingCycle: string;
    price: number;
  }) {
    return db.subscription.upsert({
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
    return db.payment.findMany({
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

  async getOrganizationByUserId(userId: string) {
    const membership = await db.organizationMember.findFirst({
      where: { userId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
            subscription: true,
          },
        },
      },
    });

    return membership?.organization;
  }
} 