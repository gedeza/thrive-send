import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/services/notification-service';
import { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log('Auth user ID:', userId);
    
    if (!userId) {
      console.error('No userId found in auth');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, message } = await req.json();
    console.log('Received request:', { type, message, userId });

    if (!type || !message) {
      console.error('Missing required fields:', { type, message });
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      );
    }

    if (!Object.values(NotificationType).includes(type)) {
      console.error('Invalid notification type:', type);
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log('Found user in database:', user);

    if (!user) {
      console.error('User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const notification = await NotificationService.createNotification({
      userId: user.id, // Use the database user ID instead of Clerk ID
      type,
      message,
    });

    console.log('Created notification:', notification);
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Detailed error creating test notification:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 