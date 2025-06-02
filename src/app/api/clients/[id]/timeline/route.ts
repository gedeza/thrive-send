import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface TimelineItem {
  id: string;
  type: 'milestone' | 'goal' | 'feedback' | 'project';
  title: string;
  description?: string | null;
  status: string;
  date: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
}

interface Feedback {
  id: string;
  comment: string | null;
  status: string;
  createdAt: Date;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: Date;
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

    // Get client timeline data
    const [milestones, goals, feedback, projects] = await Promise.all([
      db.$queryRaw<Milestone[]>`
        SELECT 
          m.id,
          m.name as title,
          m.description,
          m.status,
          m."dueDate"
        FROM "Milestone" m
        INNER JOIN "ClientGoal" g ON m."goalId" = g.id
        WHERE g."clientId" = ${clientId}
        ORDER BY m."dueDate" DESC
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
      `,
      db.$queryRaw<Goal[]>`
        SELECT 
          id,
          title,
          description,
          status,
          "createdAt"
        FROM "ClientGoal"
        WHERE "clientId" = ${clientId}
        ORDER BY "createdAt" DESC
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
      `,
      db.$queryRaw<Feedback[]>`
        SELECT 
          id,
          comment,
          status,
          "createdAt"
        FROM "ClientFeedback"
        WHERE "clientId" = ${clientId}
        ORDER BY "createdAt" DESC
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
      `,
      db.$queryRaw<Project[]>`
        SELECT 
          id,
          name as title,
          description,
          status,
          "startDate"
        FROM "Project"
        WHERE "clientId" = ${clientId}
        ORDER BY "startDate" DESC
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
      `,
    ]);

    // Transform and combine the data
    const items: TimelineItem[] = [
      ...milestones.map((m: Milestone) => ({
        id: m.id,
        type: 'milestone' as const,
        title: m.title,
        description: m.description,
        status: m.status,
        date: m.dueDate.toISOString(),
      })),
      ...goals.map((g: Goal) => ({
        id: g.id,
        type: 'goal' as const,
        title: g.title,
        description: g.description,
        status: g.status,
        date: g.createdAt.toISOString(),
      })),
      ...feedback.map((f: Feedback) => ({
        id: f.id,
        type: 'feedback' as const,
        title: 'Feedback Received',
        description: f.comment,
        status: f.status,
        date: f.createdAt.toISOString(),
      })),
      ...projects.map((p: Project) => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        description: p.description,
        status: p.status,
        date: p.startDate.toISOString(),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit if specified
    const limitedItems = limit ? items.slice(0, limit) : items;

    return NextResponse.json({ items: limitedItems });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 