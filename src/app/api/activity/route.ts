import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Fetch recent activities for the user
    const activities = await prisma.content.findMany({
      where: {
        authorId: user.id
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    // Transform activities into activity feed format
    const activityFeed = activities.map(content => ({
      id: content.id,
      type: 'content',
      title: `${content.type} ${content.status === 'PUBLISHED' ? 'Published' : 'Updated'}`,
      description: content.title,
      timestamp: content.updatedAt.toISOString(),
      status: content.status.toLowerCase()
    }));

    return NextResponse.json({ activities: activityFeed });
  } catch (_error) {
    console.error("", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}