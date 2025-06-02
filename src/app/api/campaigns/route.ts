import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { CampaignsQuerySchema, CampaignCreateSchema } from "./validation";
import { handleApiError } from "./errorHandler";
import { Prisma, CampaignStatus, CampaignGoalType } from "@prisma/client";
import { 
  type CampaignResponse,
  type CampaignCreateInput
} from "@/types/campaign";
import { withOrganization } from "@/middleware/auth";
import { z } from "zod";

// Define the campaign with relations type
type CampaignWithRelations = Prisma.CampaignGetPayload<{
  include: {
    organization: { select: { id: true; name: true } };
    client: { select: { id: true; name: true } };
    project: { select: { id: true; name: true } };
  };
}>;

/**
 * GET: List filtered campaigns
 * Supports query parameters: organizationId, status, clientId, projectId
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const query = {
      organizationId: url.searchParams.get("organizationId") || undefined,
      userId: userId,
      status: status ? CampaignCreateSchema.shape.status.parse(status) : undefined,
      clientId: url.searchParams.get("clientId") || undefined,
      projectId: url.searchParams.get("projectId") || undefined,
    };

    // If no organizationId provided, get all organizations the user is part of
    if (!query.organizationId) {
      const memberships = await db.organizationMember.findMany({
        where: { user: { clerkId: userId } },
        select: { organizationId: true },
      });
      
      // If user has no organizations, return empty array
      if (memberships.length === 0) {
        return NextResponse.json([]);
      }
      
      // Validate remaining query params
      const filters = CampaignsQuerySchema.parse(query);
      
      // Build WHERE filter for Prisma
      const where: any = {
        organizationId: { in: memberships.map(m => m.organizationId) }
      };
      
      if (filters.status) where.status = filters.status;
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.projectId) where.projectId = filters.projectId;
      
      const campaigns = await db.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          organization: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }) as CampaignWithRelations[];
      
      // Format campaign data for frontend consumption
      const formattedCampaigns: CampaignResponse[] = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: "Email",
        audience: "All Subscribers",
        sentDate: null,
        openRate: null,
        createdAt: campaign.createdAt.toISOString(),
        clientName: campaign.client?.name || null,
        clientId: campaign.clientId,
        organizationId: campaign.organizationId,
        organizationName: campaign.organization?.name || null,
        projectId: campaign.projectId,
        projectName: campaign.project?.name || null
      }));
      
      return NextResponse.json(formattedCampaigns);
    } else {
      // Validate query params
      const filters = CampaignsQuerySchema.parse(query);
      
      // Build WHERE filter for Prisma
      const where: any = {};
      if (filters.organizationId) where.organizationId = filters.organizationId;
      if (filters.userId) where.organization = { members: { some: { user: { clerkId: filters.userId } } } };
      if (filters.status) where.status = filters.status;
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.projectId) where.projectId = filters.projectId;
      
      const campaigns = await db.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          organization: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }) as CampaignWithRelations[];
      
      // Format campaign data for frontend consumption
      const formattedCampaigns: CampaignResponse[] = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: "Email",
        audience: "All Subscribers",
        sentDate: null,
        openRate: null,
        createdAt: campaign.createdAt.toISOString(),
        clientName: campaign.client?.name || null,
        clientId: campaign.clientId,
        organizationId: campaign.organizationId,
        organizationName: campaign.organization?.name || null,
        projectId: campaign.projectId,
        projectName: campaign.project?.name || null
      }));
      
      return NextResponse.json(formattedCampaigns);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Create a new campaign with validation
 */
export async function POST(req: NextRequest) {
  // Need to clone the request before it's consumed by withOrganization
  const reqClone = req.clone();
  
  return withOrganization(req, async (authedRequest) => {
    try {
      // Parse and validate input data
      let data;
      try {
        // Try to use the original request first
        data = await reqClone.json();
      } catch (error) {
        // If the original request body was already consumed, use the data from authedRequest
        console.error('Error parsing request body, using middleware data:', error);
        return NextResponse.json(
          { error: "Request body could not be read", details: "Try again or contact support" },
          { status: 400 }
        );
      }
      
      console.log('Raw campaign data received:', data);
      console.log('Organization ID from middleware:', authedRequest.auth.organizationId);
      
      try {
        const validatedData = CampaignCreateSchema.parse(data);
        console.log('Validated campaign data:', validatedData);
        
        // Create campaign in database
        const campaign = await db.campaign.create({
          data: {
            name: validatedData.name,
            description: validatedData.description || null,
            status: validatedData.status || CampaignStatus.draft,
            organizationId: authedRequest.auth.organizationId!,
            clientId: validatedData.clientId || null,
            projectId: validatedData.projectId || null,
            startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
            endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
            budget: validatedData.budget || null,
            goalType: validatedData.goalType || CampaignGoalType.ENGAGEMENT,
            customGoal: validatedData.customGoal || null,
            scheduleFrequency: validatedData.scheduleFrequency || "ONCE",
            timezone: validatedData.timezone || "UTC"
          },
          include: {
            organization: { select: { id: true, name: true } },
            client: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          }
        }) as CampaignWithRelations;

        // Format response for frontend
        const formattedCampaign: CampaignResponse = {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          channel: "Email",
          audience: "All Subscribers",
          sentDate: null,
          openRate: null,
          createdAt: campaign.createdAt.toISOString(),
          clientName: campaign.client?.name || null,
          clientId: campaign.clientId,
          organizationId: campaign.organizationId,
          organizationName: campaign.organization?.name || null,
          projectId: campaign.projectId,
          projectName: campaign.project?.name || null
        };

        return NextResponse.json(formattedCampaign, { status: 201 });
      } catch (validationError) {
        console.error('Validation error:', validationError);
        if (validationError instanceof z.ZodError) {
          return NextResponse.json(
            { 
              error: "Validation failed",
              details: validationError.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
              }))
            },
            { status: 400 }
          );
        }
        throw validationError;
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      return handleApiError(error);
    }
  });
}
