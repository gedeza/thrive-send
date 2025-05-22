import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const requestUserId = searchParams.get('userId');

  if (requestUserId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      // Set up a polling interval to check for new notifications
      const interval = setInterval(async () => {
        try {
          const newNotifications = await prisma.notification.findMany({
            where: {
              userId,
              read: false,
              createdAt: {
                gt: new Date(Date.now() - 5000), // Only get notifications from the last 5 seconds
              },
            },
          });

          for (const notification of newNotifications) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
            );
          }
        } catch (error) {
          console.error('Error in notification stream:', error);
        }
      }, 5000);

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 