import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private static eventSources: Map<string, EventSource> = new Map();
  private static listeners: Map<string, Set<(notification: Notification) => void>> = new Map();

  static async createNotification({
    userId,
    type,
    message,
  }: {
    userId: string;
    type: NotificationType;
    message: string;
  }): Promise<Notification> {
    // First try to find the user by database ID
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If not found, try to find by Clerk ID
    if (!user) {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });
    }

    if (!user) {
      throw new Error('User not found');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id, // Use the database user ID
        type,
        message,
        read: false,
      },
    });

    // Notify any active listeners
    this.notifyListeners(user.clerkId, notification);
    return notification;
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.notification.findMany({
      where: { 
        userId: user.id,
        read: false 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(notificationId: string): Promise<Notification> {
    // First find the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Update the notification
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.notification.updateMany({
      where: { 
        userId: user.id,
        read: false 
      },
      data: { read: true },
    });
  }

  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
    // Add callback to listeners
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)?.add(callback);

    // Set up SSE if not already connected
    if (!this.eventSources.has(userId)) {
      const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);
      
      eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data) as Notification;
        this.notifyListeners(userId, notification);
      };

      eventSource.onerror = () => {
        eventSource.close();
        this.eventSources.delete(userId);
      };

      this.eventSources.set(userId, eventSource);
    }

    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        userListeners.delete(callback);
        if (userListeners.size === 0) {
          this.listeners.delete(userId);
          const eventSource = this.eventSources.get(userId);
          if (eventSource) {
            eventSource.close();
            this.eventSources.delete(userId);
          }
        }
      }
    };
  }

  private static notifyListeners(userId: string, notification: Notification) {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(callback => callback(notification));
    }
  }

  static async notifyContentSubmitted(contentId: string, creatorId: string) {
    // Notify admins and reviewers
    const adminsAndReviewers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'REVIEWER'],
        },
      },
    });

    const notifications = adminsAndReviewers.map(user =>
      this.createNotification({
        userId: user.id,
        type: NotificationType.CONTENT_SUBMITTED,
        message: `New content submitted for review (ID: ${contentId})`,
      })
    );

    await Promise.all(notifications);
  }

  static async notifyReviewAssigned(contentId: string, reviewerId: string) {
    await this.createNotification({
      userId: reviewerId,
      type: NotificationType.REVIEW_ASSIGNED,
      message: `You have been assigned to review content (ID: ${contentId})`,
    });
  }

  static async notifyFeedbackProvided(contentId: string, creatorId: string) {
    await this.createNotification({
      userId: creatorId,
      type: NotificationType.FEEDBACK_PROVIDED,
      message: `New feedback received on your content (ID: ${contentId})`,
    });
  }

  static async notifyStatusChanged(contentId: string, creatorId: string, status: string) {
    await this.createNotification({
      userId: creatorId,
      type: NotificationType.STATUS_CHANGED,
      message: `Content status changed to ${status} (ID: ${contentId})`,
    });
  }

  static async notifyApprovalRejected(contentId: string, creatorId: string) {
    await this.createNotification({
      userId: creatorId,
      type: NotificationType.APPROVAL_REJECTED,
      message: `Your content was rejected (ID: ${contentId})`,
    });
  }

  static async notifyContentPublished(contentId: string, creatorId: string) {
    await this.createNotification({
      userId: creatorId,
      type: NotificationType.CONTENT_PUBLISHED,
      message: `Your content has been published (ID: ${contentId})`,
    });
  }
} 