import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NotificationType } from '@/lib/services/websocket-service';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { type, message } = await req.json();

    if (!type || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    if (!Object.values(NotificationType).includes(type)) {
      return new Response('Invalid notification type', { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        userId,
        read: false,
      },
    });

    return new Response(JSON.stringify(notification), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 