import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import type { Client, Project, Analytics, Prisma } from '@prisma/client';

type ClientWithRelations = Client & {
  projects: Project[];
  analytics: Analytics[];
};

interface Budget {
  id: string;
  amount: number;
  spent: number;
  clientId: string;
}

interface ClientGoal {
  id: string;
  status: string;
  clientId: string;
}

interface ClientFeedback {
  id: string;
  rating: number;
  clientId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = getAuth(request);
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;

    // Fetch client details
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        projects: {
          include: {
            campaigns: true,
          },
        },
        analytics: true,
      },
    }) as ClientWithRelations | null;

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    // Calculate KPIs
    const activeProjects = client.projects.filter(
      (project) => project.status === 'IN_PROGRESS'
    ).length;

    // Fetch additional data separately
    const budgets = await db.$queryRaw<Budget[]>`
      SELECT id, amount, spent, "clientId" FROM "Budget" WHERE "clientId" = ${clientId}
    `;

    const goals = await db.$queryRaw<ClientGoal[]>`
      SELECT id, status, "clientId" FROM "ClientGoal" WHERE "clientId" = ${clientId}
    `;

    const feedback = await db.$queryRaw<ClientFeedback[]>`
      SELECT id, rating, "clientId" FROM "ClientFeedback" WHERE "clientId" = ${clientId}
    `;

    const totalBudget = budgets.reduce(
      (sum: number, budget: Budget) => sum + budget.amount,
      0
    );
    const totalSpent = budgets.reduce(
      (sum: number, budget: Budget) => sum + budget.spent,
      0
    );
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const completedGoals = goals.filter(
      (goal: ClientGoal) => goal.status === 'COMPLETED'
    ).length;
    const totalGoals = goals.length;
    const goalCompletion = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    const averageFeedback =
      feedback.length > 0
        ? feedback.reduce(
            (sum: number, fb: ClientFeedback) => sum + fb.rating,
            0
          ) / feedback.length
        : 0;

    // Prepare response data
    const dashboardData = {
      client,
      kpis: {
        activeProjects,
        totalBudget,
        totalSpent,
        budgetUtilization,
        completedGoals,
        totalGoals,
        goalCompletion,
        averageFeedback,
      },
      recentActivity: {
        projects: client.projects.slice(0, 5),
        feedback: feedback.slice(0, 5),
        goals: goals.slice(0, 5),
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching client dashboard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 