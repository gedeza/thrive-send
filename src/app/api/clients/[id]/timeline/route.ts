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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true }
    });

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    // Get simplified timeline data using standard Prisma queries
    const [goals, feedback, projects] = await Promise.all([
      db.clientGoal.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      db.clientFeedback.findMany({
        where: { clientId },
        select: {
          id: true,
          comment: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      db.project.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          startDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    // Transform and combine the data
    const items: TimelineItem[] = [
      ...goals.map((g) => ({
        id: g.id,
        type: 'goal' as const,
        title: g.name,
        description: g.description,
        status: g.status,
        date: g.createdAt.toISOString(),
      })),
      ...feedback.map((f) => ({
        id: f.id,
        type: 'feedback' as const,
        title: 'Feedback Received',
        description: f.comment,
        status: f.status,
        date: f.createdAt.toISOString(),
      })),
      ...projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        description: p.description,
        status: p.status,
        date: (p.startDate || p.createdAt).toISOString(),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply final limit
    const limitedItems = items.slice(0, limit);

    return NextResponse.json({ items: limitedItems });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 