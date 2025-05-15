import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { CampaignsQuerySchema } from "./validation";
import { handleApiError } from "./errorHandler";

/**
 * GET: List filtered campaigns
 * Supports query parameters: organizationId, status, clientId, projectId
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const url = new URL(req.url);
    const query = {
      organizationId: url.searchParams.get("organizationId") || undefined,
      userId: userId,
      status: url.searchParams.get("status") || undefined,
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
      });
      
      // Format campaign data for frontend consumption
      const formattedCampaigns = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: campaign.channel || "Email",
        audience: campaign.audience || "All Subscribers",
        sentDate: campaign.sentDate ? campaign.sentDate.toISOString() : null,
        openRate: campaign.openRate || null,
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
      });
      
      // Format campaign data for frontend consumption
      const formattedCampaigns = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: campaign.channel || "Email",
        audience: campaign.audience || "All Subscribers",
        sentDate: campaign.sentDate ? campaign.sentDate.toISOString() : null,
        openRate: campaign.openRate || null,
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
  try {
    // Authenticate
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse input data
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }
    
    // If no organizationId provided, get user's primary organization
    if (!data.organizationId) {
      const membership = await db.organizationMember.findFirst({
        where: { user: { clerkId: userId } },
        select: { organizationId: true },
      });
      
      if (!membership) {
        return NextResponse.json({ error: "No organization found" }, { status: 400 });
      }
      
      data.organizationId = membership.organizationId;
    }
    
    // Prepare data for database
    const createData = {
      name: data.name,
      description: data.description || null,
      status: data.status || "Draft",
      channel: data.channel || "Email",
      audience: data.audience || "All Subscribers",
      organizationId: data.organizationId,
      clientId: data.clientId || null,
      projectId: data.projectId || null,
    };
    
    // Add dates if provided
    if (data.startDate) {
      createData.startDate = new Date(data.startDate);
      
      // If end date is provided, validate it's after start date
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (createData.startDate > endDate) {
          return NextResponse.json(
            { error: "End date cannot be before start date" },
            { status: 400 }
          );
        }
        createData.endDate = endDate;
      }
    }
    
    // Add optional fields if provided
    if (data.budget) createData.budget = data.budget;
    if (data.goals) createData.goals = data.goals;

    // Create campaign in database
    const campaign = await db.campaign.create({
      data: createData,
      include: {
        client: { select: { name: true } },
        organization: { select: { name: true } },
        project: { select: { name: true } },
      }
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
