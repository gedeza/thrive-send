import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId,
      },
      data: {
        read: true,
      },
    });

    return new Response(JSON.stringify(notification), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 