import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { withOrganization } from "@/middleware/auth";
import { handleApiError } from "../errorHandler";
import { CampaignStatus } from "@prisma/client";

/**
 * GET: Fetch a campaign by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = params.id;
    
    // Fetch campaign with relations
    const campaign = await db.campaign.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        organization: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // If campaign not found
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Check if user has access to the campaign's organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: campaign.organizationId,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this campaign" },
        { status: 403 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return handleApiError(error);
  }
}

/**
 * PATCH: Update a campaign
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Clone request for body consumption
  const reqClone = req.clone();
  
  return withOrganization(req, async (authedRequest) => {
    try {
      const campaignId = params.id;
      
      // Check if campaign exists
      const existingCampaign = await db.campaign.findUnique({
        where: { id: campaignId },
      });
      
      if (!existingCampaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }
      
      // Check if user has access to the campaign's organization
      if (existingCampaign.organizationId !== authedRequest.auth.organizationId) {
        return NextResponse.json(
          { error: "Access denied to this campaign" },
          { status: 403 }
        );
      }
      
      // Parse update data
      let data;
      try {
        data = await reqClone.json();
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid request data", details: "Could not parse request body" },
          { status: 400 }
        );
      }
      
      // Update campaign
      const updatedCampaign = await db.campaign.update({
        where: { id: campaignId },
        data: {
          name: data.name !== undefined ? data.name : undefined,
          description: data.description !== undefined ? data.description : undefined,
          status: data.status !== undefined ? data.status as CampaignStatus : undefined,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          budget: data.budget !== undefined ? data.budget : undefined,
          goalType: data.goalType !== undefined ? data.goalType : undefined,
          customGoal: data.customGoal !== undefined ? data.customGoal : undefined,
          scheduleFrequency: data.scheduleFrequency !== undefined ? data.scheduleFrequency : undefined,
          timezone: data.timezone !== undefined ? data.timezone : undefined,
          clientId: data.clientId !== undefined ? data.clientId : undefined,
          projectId: data.projectId !== undefined ? data.projectId : undefined,
        },
        include: {
          organization: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      });
      
      return NextResponse.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      return handleApiError(error);
    }
  });
}

/**
 * DELETE: Delete a campaign
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOrganization(req, async (authedRequest) => {
    try {
      const campaignId = params.id;
      
      // Check if campaign exists
      const existingCampaign = await db.campaign.findUnique({
        where: { id: campaignId },
      });
      
      if (!existingCampaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }
      
      // Check if user has access to the campaign's organization
      if (existingCampaign.organizationId !== authedRequest.auth.organizationId) {
        return NextResponse.json(
          { error: "Access denied to this campaign" },
          { status: 403 }
        );
      }
      
      // Delete campaign
      await db.campaign.delete({
        where: { id: campaignId },
      });
      
      return NextResponse.json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return handleApiError(error);
    }
  });
} 