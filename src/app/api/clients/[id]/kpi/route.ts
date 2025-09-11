import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get real KPI data with parallel queries
    const [
      activeProjectsCount,
      allProjectsCount,
      budgetData,
      goalData,
      feedbackData
    ] = await Promise.all([
      // Active projects
      db.project.count({
        where: { 
          clientId,
          status: { in: ['IN_PROGRESS', 'PLANNING'] }
        }
      }),
      
      // All projects
      db.project.count({
        where: { clientId }
      }),

      // Budget data
      db.budget.aggregate({
        where: { clientId },
        _sum: {
          amount: true,
          spent: true
        }
      }),

      // Goals data
      db.clientGoal.aggregate({
        where: { clientId },
        _count: {
          id: true
        }
      }),

      // Feedback data
      db.clientFeedback.aggregate({
        where: { clientId },
        _avg: {
          rating: true
        },
        _count: {
          id: true
        }
      })
    ]);

    // Get completed goals count
    const completedGoalsCount = await db.clientGoal.count({
      where: { 
        clientId,
        status: 'COMPLETED'
      }
    });

    // Calculate KPIs
    const totalBudget = budgetData._sum.amount || 0;
    const totalSpent = budgetData._sum.spent || 0;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const totalGoals = goalData._count.id || 0;
    const completedGoals = completedGoalsCount;
    const goalCompletion = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    const averageFeedback = feedbackData._avg.rating || 0;
    const feedbackCount = feedbackData._count.id || 0;

    return NextResponse.json({
      activeProjects: activeProjectsCount,
      totalProjects: allProjectsCount,
      totalBudget,
      totalSpent,
      budgetUtilization: Math.round(budgetUtilization * 10) / 10,
      completedGoals,
      totalGoals,
      goalCompletion: Math.round(goalCompletion * 10) / 10,
      averageFeedback: Math.round(averageFeedback * 10) / 10,
      feedbackCount
    });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}