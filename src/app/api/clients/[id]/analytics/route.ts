import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { Analytics } from "@prisma/client";

type ProjectStats = {
  status: string;
  _count: {
    id: number;
  };
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId || !session?.orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate client exists and user has access
    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                user: {
                  clerkId: session.userId,
                },
              },
            },
          },
        },
      },
    });

    if (!client) {
      return new NextResponse("Client not found", { status: 404 });
    }

    if (client.organization.members.length === 0) {
      return new NextResponse("You don't have access to this client", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // Default to last 30 days

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch client analytics
    const analytics = await db.analytics.findMany({
      where: {
        clientId: params.id,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Fetch client projects summary
    const projectStats = await db.project.groupBy({
      by: ["status"],
      where: {
        clientId: params.id,
      },
      _count: {
        id: true,
      },
    });

    // Calculate project metrics
    const projectMetrics = {
      total: projectStats.reduce((acc: number, curr: ProjectStats) => acc + curr._count.id, 0),
      active: projectStats.find((s: ProjectStats) => s.status === "ACTIVE")?._count.id || 0,
      completed: projectStats.find((s: ProjectStats) => s.status === "COMPLETED")?._count.id || 0,
      planned: projectStats.find((s: ProjectStats) => s.status === "PLANNED")?._count.id || 0,
    };

    // Fetch content engagement metrics - using Content model with proper project relationship
    const contentMetrics = await db.content.aggregate({
      where: {
        project: {
          clientId: params.id,
        },
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      _count: {
        id: true,
      },
    });

    // Calculate client health score
    const healthScore = await calculateClientHealthScore(params.id);

    return NextResponse.json({
      analytics,
      projectMetrics,
      contentMetrics,
      healthScore,
    });
  } catch (_error) {
    return handleApiError(error);
  }
}

async function calculateClientHealthScore(clientId: string): Promise<number> {
  const weights = {
    projectCompletion: 0.3,
    engagement: 0.2,
    budget: 0.2,
    activity: 0.15,
    contentDelivery: 0.15,
  };

  try {
    // Get latest analytics
    const latestAnalytics = await db.analytics.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    }) as Analytics | null;

    if (!latestAnalytics) return 0;

    // Calculate individual scores
    const projectScore = latestAnalytics.completedProjects / 
      (latestAnalytics.projectCount || 1) * 100;
    
    const engagementScore = latestAnalytics.engagementRate;
    
    const budgetScore = (latestAnalytics.usedBudget / 
      (latestAnalytics.totalBudget || 1)) * 100;
    
    const activityScore = ((new Date().getTime() - 
      new Date(latestAnalytics.lastActivity).getTime()) / (1000 * 60 * 60 * 24)) < 7 
      ? 100 : 50;
    
    const contentScore = (latestAnalytics.contentCount > 0) 
      ? (latestAnalytics.interactionCount / latestAnalytics.contentCount) * 100 
      : 0;

    // Calculate weighted score
    const healthScore = 
      (projectScore * weights.projectCompletion) +
      (engagementScore * weights.engagement) +
      (budgetScore * weights.budget) +
      (activityScore * weights.activity) +
      (contentScore * weights.contentDelivery);

    return Math.min(Math.max(healthScore, 0), 100);
  } catch (_error) {
    console.error("", _error);
    return 0;
  }
} 