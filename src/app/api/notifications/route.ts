import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/services/notification-service';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to find user by Clerk ID
    let user = await db.user.findUnique({ 
      where: { clerkId: userId } 
    });

    // If user doesn't exist, create them
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        throw new Error('Failed to get current user');
      }
      
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || ''
        }
      });
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