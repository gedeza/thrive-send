import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { CampaignsQuerySchema, CampaignCreateSchema } from "./validation";
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
    
    return NextResponse.json(campaigns);
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

    // Parse and validate input data
    const data = await req.json();
    const validatedData = CampaignCreateSchema.parse(data);

    // Dates must be logical
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    if (startDate > endDate) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    // Prepare data for database
    const createData = {
      name: validatedData.name,
      description: validatedData.description || null,
      startDate,
      endDate,
      status: validatedData.status,
      budget: validatedData.budget,
      goals: validatedData.goals,
      organizationId: validatedData.organizationId,
      clientId: validatedData.clientId,
      projectId: validatedData.projectId,
    };

    // Create campaign in database
    const campaign = await db.campaign.create({
      data: createData,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
