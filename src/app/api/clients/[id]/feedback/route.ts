import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true }
    });

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    // Get client feedback data using standard Prisma queries
    const feedback = await db.clientFeedback.findMany({
      where: { clientId },
      select: {
        id: true,
        rating: true,
        comment: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate average rating
    const averageRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

    // Transform dates to ISO strings
    const transformedFeedback = feedback.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      feedback: transformedFeedback,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalCount: feedback.length,
    });
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 