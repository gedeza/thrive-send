import { prisma } from '@/lib/prisma';

export type NotificationType = 
  | 'CONTENT_SUBMITTED'
  | 'REVIEW_ASSIGNED'
  | 'FEEDBACK_PROVIDED'
  | 'STATUS_CHANGED'
  | 'APPROVAL_REJECTED'
  | 'CONTENT_PUBLISHED';

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
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });

    // Notify any active listeners
    this.notifyListeners(userId, notification);
    return notification;
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
        type: 'CONTENT_SUBMITTED',
        message: `New content submitted for review (ID: ${contentId})`,
      })
    );

    await Promise.all(notifications);
  }

  static async notifyReviewAssigned(contentId: string, reviewerId: string) {
    await this.createNotification({
      userId: reviewerId,
      type: 'REVIEW_ASSIGNED',
      message: `You have been assigned to review content (ID: ${contentId})`,
    });
  }

  static async notifyFeedbackProvided(contentId: string, creatorId: string) {
    await this.createNotification({
      userId: creatorId,
      type: 'FEEDBACK_PROVIDED',
      message: `New feedback received on your content (ID: ${contentId})`,
    });
  }

  static async notifyStatusChanged(contentId: string, creatorId: string, status: string) {
    await this.createNotification({
      userId: creatorId,
      type: 'STATUS_CHANGED',
      message: `Content status changed to ${status} (ID: ${contentId})`,
    });
  }

  static async notifyApprovalRejected(contentId: string, creatorId: string) {
    await this.createNotification({
      userId: creatorId,
      type: 'APPROVAL_REJECTED',
      message: `Your content was rejected (ID: ${contentId})`,
    });
  }

  static async notifyContentPublished(contentId: string, creatorId: string) {
    await this.createNotification({
      userId: creatorId,
      type: 'CONTENT_PUBLISHED',
      message: `Your content has been published (ID: ${contentId})`,
    });
  }

  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  static async getUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAllNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
} 