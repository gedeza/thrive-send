import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: {
    name: string;
    email: string;
  } | null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Get client goals data
    const goals = await db.$queryRaw<Goal[]>`
      SELECT 
        g.id,
        g.title,
        g.description,
        g.status,
        g.priority,
        g.due_date as "dueDate",
        g.progress,
        g.created_at as "createdAt",
        g.updated_at as "updatedAt",
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as "assignedTo"
      FROM "ClientGoal" g
      LEFT JOIN "User" u ON g."assignedToId" = u.id
      WHERE g."clientId" = ${clientId}
      ORDER BY 
        CASE g.status 
          WHEN 'IN_PROGRESS' THEN 1
          WHEN 'NOT_STARTED' THEN 2
          WHEN 'COMPLETED' THEN 3
          ELSE 4
        END,
        g.priority DESC,
        g.due_date ASC NULLS LAST
      ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
    `;

    // Transform dates to ISO strings
    const transformedGoals = goals.map(goal => ({
      ...goal,
      dueDate: goal.dueDate?.toISOString() || null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    }));

    // Calculate completion statistics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const inProgressGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
    const averageProgress = goals.length > 0 
      ? goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals
      : 0;

    return NextResponse.json({
      goals: transformedGoals,
      stats: {
        total: totalGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        averageProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching goals data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 