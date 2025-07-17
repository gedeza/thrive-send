import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    // Get user's organizations if no specific org provided
    let orgFilter = {};
    if (organizationId) {
      // Find the organization by either internal ID or Clerk ID
      const organization = await db.organization.findFirst({
        where: {
          OR: [
            { id: organizationId },
            { clerkOrganizationId: organizationId }
          ]
        }
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }
      orgFilter = { organizationId: organization.id };
    } else {
      // Get all organizations user has access to
      const memberships = await db.organizationMember.findMany({
        where: { user: { clerkId: userId } },
        select: { organizationId: true }
      });
      
      const orgIds = memberships.map(m => m.organizationId);
      orgFilter = { organizationId: { in: orgIds } };
    }

    // Get current period stats
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);

    // Get campaign statistics
    const [
      totalCampaigns,
      activeCampaigns,
      draftCampaigns,
      completedCampaigns,
      newCampaignsThisMonth,
      newCampaignsLastMonth,
      campaignsByStatus,
      campaignsByGoalType,
      avgSuccessRate
    ] = await Promise.all([
      // Total campaigns
      db.campaign.count({
        where: orgFilter
      }),
      
      // Active campaigns
      db.campaign.count({
        where: { 
          ...orgFilter,
          status: 'active'
        }
      }),
      
      // Draft campaigns
      db.campaign.count({
        where: { 
          ...orgFilter,
          status: 'draft'
        }
      }),
      
      // Completed campaigns
      db.campaign.count({
        where: { 
          ...orgFilter,
          status: 'completed'
        }
      }),
      
      // New campaigns this month
      db.campaign.count({
        where: {
          ...orgFilter,
          createdAt: { gte: lastMonth }
        }
      }),
      
      // New campaigns last month (for comparison)
      db.campaign.count({
        where: {
          ...orgFilter,
          createdAt: {
            gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1),
            lt: lastMonth
          }
        }
      }),
      
      // Campaigns by status
      db.campaign.groupBy({
        by: ['status'],
        where: orgFilter,
        _count: { status: true }
      }),
      
      // Campaigns by goal type
      db.campaign.groupBy({
        by: ['goalType'],
        where: orgFilter,
        _count: { goalType: true }
      }),
      
      // Average success rate (simplified calculation)
      db.campaign.aggregate({
        where: { 
          ...orgFilter,
          status: 'completed'
        },
        _avg: {
          // This would need to be calculated based on actual campaign metrics
          // For now, we'll use a placeholder calculation
        }
      })
    ]);

    // Calculate growth percentages
    const campaignGrowth = newCampaignsLastMonth > 0 
      ? ((newCampaignsThisMonth - newCampaignsLastMonth) / newCampaignsLastMonth) * 100 
      : newCampaignsThisMonth > 0 ? 100 : 0;

    const activePercentage = totalCampaigns > 0 
      ? (activeCampaigns / totalCampaigns) * 100 
      : 0;

    const completionRate = totalCampaigns > 0 
      ? (completedCampaigns / totalCampaigns) * 100 
      : 0;

    // Calculate estimated reach (this would come from actual campaign data)
    const estimatedReach = totalCampaigns * 1250; // Placeholder calculation

    const stats = {
      totalCampaigns,
      activeCampaigns,
      draftCampaigns,
      completedCampaigns,
      newCampaignsThisMonth,
      campaignGrowth: Number(campaignGrowth.toFixed(1)),
      activePercentage: Number(activePercentage.toFixed(1)),
      completionRate: Number(completionRate.toFixed(1)),
      estimatedReach,
      campaignsByStatus: campaignsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      campaignsByGoalType: campaignsByGoalType.reduce((acc, item) => {
        acc[item.goalType] = item._count.goalType;
        return acc;
      }, {} as Record<string, number>),
      successRate: completedCampaigns > 0 ? 85.2 : 0 // Placeholder success rate
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching campaign statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign statistics" },
      { status: 500 }
    );
  }
}