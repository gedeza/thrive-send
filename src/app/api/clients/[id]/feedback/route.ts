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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Get client feedback data
    const feedback = await db.$queryRaw<Feedback[]>`
      SELECT 
        f.id,
        f.rating,
        f.comment,
        f.category,
        f.status,
        f."createdAt",
        f."updatedAt",
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as "createdBy"
      FROM "ClientFeedback" f
      LEFT JOIN "User" u ON f."uploadedById" = u.id
      WHERE f."clientId" = ${clientId}
      ORDER BY f."createdAt" DESC
      ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
    `;

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
      averageRating,
      totalCount: feedback.length,
    });
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 