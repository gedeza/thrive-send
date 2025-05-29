import { db } from '@/lib/db';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { Subscription } from "@prisma/client";
import { sendInvitationEmail } from '@/lib/email';

// Validation schemas
const organizationSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).transform(val => val.trim()),
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
  logoUrl: z.string().url("Invalid logo URL format").optional(),
  slug: z.string().min(1, "Slug is required").max(100).optional(),
});

const memberRoleSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

const memberSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

const subscriptionPlanSchema = z.enum(['free', 'pro', 'enterprise']);

export class OrganizationService {
  private prisma = db;

  async getOrganization(organizationId: string) {
    return this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateOrganization(organizationId: string, data: z.infer<typeof organizationSettingsSchema>) {
    // Validate the input data
    const validatedData = organizationSettingsSchema.parse(data);

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: validatedData,
    });
  }

  async getMembers(organizationId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: true,
      },
    });
  }

  async addMember(organizationId: string, data: z.infer<typeof memberSchema>) {
    const validatedData = memberSchema.parse(data);
    return this.prisma.organizationMember.create({
      data: {
        ...validatedData,
        organizationId,
      },
      include: {
        user: true,
      },
    });
  }

  async updateMember(organizationId: string, userId: string, role: string) {
    // Validate the role
    const validatedRole = z.enum(['ADMIN', 'MEMBER', 'VIEWER']).parse(role);

    return this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: { role: validatedRole },
      include: {
        user: true,
      },
    });
  }

  async removeMember(organizationId: string, userId: string) {
    return this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  async getSubscription(organizationId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where: { organizationId },
    });
  }

  async updateSubscription(organizationId: string, plan: string): Promise<Subscription> {
    // Validate the plan
    const validatedPlan = subscriptionPlanSchema.parse(plan);

    const planPrices: Record<string, number> = {
      free: 0,
      pro: 29,
      enterprise: 99,
    };

    const features = {
      free: {
        ai: {
          enabled: false,
          usage: 0,
          limit: 0
        }
      },
      pro: {
        ai: {
          enabled: true,
          usage: 0,
          limit: 50
        }
      },
      enterprise: {
        ai: {
          enabled: true,
          usage: 0,
          limit: -1 // unlimited
        }
      }
    };

    return this.prisma.subscription.upsert({
      where: { organizationId },
      update: {
        plan: validatedPlan,
        updatedAt: new Date(),
        price: planPrices[validatedPlan],
        features: features[validatedPlan]
      },
      create: {
        organizationId,
        plan: validatedPlan,
        status: "active",
        startDate: new Date(),
        price: planPrices[validatedPlan],
        currency: "USD",
        billingCycle: "MONTHLY",
        cancelAtPeriodEnd: false,
        features: features[validatedPlan]
      },
    });
  }

  async checkAIFeatureAvailability(organizationId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId }
    });

    if (!subscription) return false;

    const aiFeatures = subscription.aiFeatures as { enabled: boolean; usage: number; limit: number };
    
    if (!aiFeatures.enabled) return false;
    if (aiFeatures.limit === -1) return true; // unlimited
    return aiFeatures.usage < aiFeatures.limit;
  }

  async trackAIFeatureUsage(organizationId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId }
    });

    if (!subscription) return;

    const aiFeatures = subscription.aiFeatures as { enabled: boolean; usage: number; limit: number };
    
    if (!aiFeatures.enabled || (aiFeatures.limit !== -1 && aiFeatures.usage >= aiFeatures.limit)) {
      return;
    }

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        aiFeatures: {
          ...aiFeatures,
          usage: aiFeatures.usage + 1
        }
      }
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

    // Get organization name for the email
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Send invitation email
    await sendInvitationEmail({
      email: validatedData.email,
      token,
      organizationName: organization.name,
      role: validatedData.role,
    });

    return invitation;
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