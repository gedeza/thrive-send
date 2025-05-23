import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/services/notification-service';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [notifications, unreadNotifications] = await Promise.all([
      NotificationService.getNotifications(userId),
      NotificationService.getUnreadNotifications(userId),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount: unreadNotifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 