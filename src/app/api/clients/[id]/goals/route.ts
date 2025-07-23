import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number | null;
  startDate: Date;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  milestones: {
    id: string;
    name: string;
    description: string | null;
    dueDate: Date;
    completedDate: Date | null;
    status: string;
  }[];
  metrics: {
    id: string;
    name: string;
    description: string | null;
    metricType: string;
    targetValue: number | null;
    currentValue: number | null;
    unit: string | null;
  }[];
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

    // Verify client exists first
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true }
    });

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    // Get client goals data using standard Prisma queries
    const goals = await db.clientGoal.findMany({
      where: { clientId },
      include: {
        milestones: {
          select: {
            id: true,
            name: true,
            description: true,
            dueDate: true,
            completedDate: true,
            status: true,
          },
        },
        metrics: {
          select: {
            id: true,
            name: true,
            description: true,
            metricType: true,
            targetValue: true,
            currentValue: true,
            unit: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'desc' }
      ],
      take: limit || 10,
    });

    // Calculate completion statistics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const inProgressGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
    const averageProgress = goals.length > 0
      ? goals.reduce((sum, g) => {
          if (g.targetValue && g.currentValue) {
            return sum + (g.currentValue / g.targetValue) * 100;
          }
          return sum;
        }, 0) / totalGoals
      : 0;

    return NextResponse.json({
      goals,
      stats: {
        total: totalGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        averageProgress: Math.round(averageProgress)
      }
    });
  } catch (error) {
    console.error('Error fetching client goals:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // Create the goal
    const goals = await db.$queryRaw<Goal[]>`
      INSERT INTO "ClientGoal" (
        "id",
        "name",
        "description",
        "targetValue",
        "currentValue",
        "startDate",
        "endDate",
        "status",
        "createdAt",
        "updatedAt",
        "clientId"
      ) VALUES (
        gen_random_uuid(),
        ${body.name},
        ${body.description || null},
        ${body.targetValue || null},
        ${body.currentValue || null},
        ${new Date(body.startDate)},
        ${body.endDate ? new Date(body.endDate) : null},
        ${body.status || 'NOT_STARTED'},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        ${clientId}
      )
      RETURNING *
    `;

    return NextResponse.json(goals[0]);
  } catch (error) {
    console.error('Error creating client goal:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 