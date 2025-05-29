import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { AIConfigService } from '@/lib/services/ai-config';
import { z } from 'zod';
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { OrganizationService } from "@/lib/api/organization-service";

const configSchema = z.object({
  provider: z.enum(['ollama', 'openai', 'anthropic', 'huggingface']),
  model: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(4000),
});

const requestSchema = z.object({
  organizationId: z.string(),
  config: configSchema,
});

const organizationService = new OrganizationService();

export async function POST(req: Request) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { config } = body;

    // Update organization settings with AI config
    await db.organization.update({
      where: { id: orgId },
      data: {
        settings: {
          ...(await db.organization.findUnique({
            where: { id: orgId },
            select: { settings: true },
          }))?.settings,
          ai: config,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AI_SETTINGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscription = await organizationService.getSubscription(orgId);
    if (!subscription) {
      return NextResponse.json({
        config: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          apiKey: "",
          baseUrl: "",
          temperature: 0.7,
          maxTokens: 2000,
        },
        usage: {
          current: 0,
          limit: 0,
          enabled: false,
        },
      });
    }

    const features = subscription.features as { ai: { enabled: boolean; usage: number; limit: number } };
    const aiFeatures = features?.ai || { enabled: false, usage: 0, limit: 0 };

    // Get AI config from organization settings
    const organization = await db.organization.findUnique({
      where: { id: orgId },
      select: { settings: true },
    });

    const settings = organization?.settings as { ai?: any } || {};
    const aiConfig = settings.ai || {
      provider: "openai",
      model: "gpt-3.5-turbo",
      apiKey: "",
      baseUrl: "",
      temperature: 0.7,
      maxTokens: 2000,
    };

    return NextResponse.json({
      config: aiConfig,
      usage: {
        current: aiFeatures.usage,
        limit: aiFeatures.limit,
        enabled: aiFeatures.enabled,
      },
    });
  } catch (error) {
    console.error("[AI_SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 