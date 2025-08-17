import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/services/notification-service';
import { db } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user-utils';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create user with real data from Clerk
    const user = await getOrCreateUser(userId);

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