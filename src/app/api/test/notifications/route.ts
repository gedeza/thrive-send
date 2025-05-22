import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { NotificationService, NotificationType } from '@/lib/services/notification-service';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { type, message } = await req.json();

    if (!type || !Object.values(NotificationType).includes(type)) {
      return new Response('Invalid notification type', { status: 400 });
    }

    const notification = await NotificationService.createNotification({
      userId,
      type: type as NotificationType,
      message: message || `Test notification of type: ${type}`,
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