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
import { cacheService } from "@/lib/cache";

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

    // If no organizationId provided, get all campaigns for user's organizations in single query
    if (!query.organizationId) {
      // Validate remaining query params
      const filters = CampaignsQuerySchema.parse(query);
      
      // Build WHERE filter with single optimized query - no N+1 issue
      const where: any = {
        organization: {
          members: {
            some: { 
              user: { clerkId: userId } 
            }
          }
        }
      };
      
      if (filters.status) where.status = filters.status;
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.projectId) where.projectId = filters.projectId;
      
      // Create cache key based on filters
      const cacheKey = `campaigns:user:${userId}:${JSON.stringify(filters)}`;
      
      const campaigns = await cacheService.getAPIResponse(
        'campaigns', 
        cacheKey,
        async () => {
          const dbCampaigns = await db.campaign.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
              organization: { select: { id: true, name: true } },
              client: { select: { id: true, name: true } },
              project: { select: { id: true, name: true } },
              _count: {
                select: { 
                  analytics: true,
                  abTests: true 
                }
              }
            },
          }) as CampaignWithRelations[];
          
          // Ensure dates are properly serialized for cache
          return dbCampaigns.map(campaign => ({
            ...campaign,
            createdAt: typeof campaign.createdAt === 'string' ? campaign.createdAt : campaign.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: campaign.updatedAt instanceof Date ? campaign.updatedAt.toISOString() : campaign.updatedAt,
            startDate: campaign.startDate instanceof Date ? campaign.startDate.toISOString() : campaign.startDate,
            endDate: campaign.endDate instanceof Date ? campaign.endDate.toISOString() : campaign.endDate,
          }));
        }
      );
      
      // Add debugging for campaign data types
      if (campaigns.length > 0) {
        console.log('DEBUG: Campaigns data from cache/db:', {
          count: campaigns.length,
          sampleId: campaigns[0]?.id,
          createdAtType: typeof campaigns[0]?.createdAt,
          createdAtValue: campaigns[0]?.createdAt,
          isDate: campaigns[0]?.createdAt instanceof Date
        });
      }
      
      // Format campaign data for frontend consumption
      const formattedCampaigns: CampaignResponse[] = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: "Email",
        audience: "All Subscribers",
        sentDate: null,
        openRate: null,
        createdAt: typeof campaign.createdAt === 'string' ? campaign.createdAt : campaign.createdAt?.toISOString() || new Date().toISOString(),
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
      
      // Create cache key based on filters
      const cacheKey = `campaigns:org:${filters.organizationId}:${JSON.stringify(filters)}`;
      
      const campaigns = await cacheService.getAPIResponse(
        'campaigns',
        cacheKey,
        async () => {
          const dbCampaigns = await db.campaign.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
              organization: { select: { id: true, name: true } },
              client: { select: { id: true, name: true } },
              project: { select: { id: true, name: true } },
              _count: {
                select: { 
                  analytics: true,
                  abTests: true 
                }
              }
            },
          }) as CampaignWithRelations[];
          
          // Ensure dates are properly serialized for cache
          return dbCampaigns.map(campaign => ({
            ...campaign,
            createdAt: typeof campaign.createdAt === 'string' ? campaign.createdAt : campaign.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: campaign.updatedAt instanceof Date ? campaign.updatedAt.toISOString() : campaign.updatedAt,
            startDate: campaign.startDate instanceof Date ? campaign.startDate.toISOString() : campaign.startDate,
            endDate: campaign.endDate instanceof Date ? campaign.endDate.toISOString() : campaign.endDate,
          }));
        }
      );
      
      // Add debugging for campaign data types
      if (campaigns.length > 0) {
        console.log('DEBUG: Campaigns data from cache/db:', {
          count: campaigns.length,
          sampleId: campaigns[0]?.id,
          createdAtType: typeof campaigns[0]?.createdAt,
          createdAtValue: campaigns[0]?.createdAt,
          isDate: campaigns[0]?.createdAt instanceof Date
        });
      }
      
      // Format campaign data for frontend consumption
      const formattedCampaigns: CampaignResponse[] = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: "Email",
        audience: "All Subscribers",
        sentDate: null,
        openRate: null,
        createdAt: typeof campaign.createdAt === 'string' ? campaign.createdAt : campaign.createdAt?.toISOString() || new Date().toISOString(),
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

        // Invalidate campaign caches to ensure fresh data on next fetch
        try {
          // Invalidate all campaigns cache for this organization
          await cacheService.invalidateAPIResponse('campaigns', `org:${campaign.organizationId}`);
          
          // Invalidate user-specific campaigns cache
          await cacheService.invalidateAPIResponse('campaigns', `user:${authedRequest.auth.userId}`);
          
          // Also invalidate any specific cache keys that might exist
          await cacheService.invalidateAPIResponse('campaigns');
          
          // Invalidate campaign stats cache (future-proofing)
          await cacheService.invalidateAPIResponse('campaigns/stats');
          
          console.log('Successfully invalidated campaign caches after creation');
        } catch (cacheError) {
          // Don't fail the request if cache invalidation fails, just log it
          console.warn('Failed to invalidate campaign cache after creation:', cacheError);
        }

        // Format response for frontend
        const formattedCampaign: CampaignResponse = {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          channel: "Email",
          audience: "All Subscribers",
          sentDate: null,
          openRate: null,
          createdAt: typeof campaign.createdAt === 'string' ? campaign.createdAt : campaign.createdAt?.toISOString() || new Date().toISOString(),
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
