'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { NotificationService, Notification } from '@/lib/services/notification-service';
import { toast } from 'sonner';

export function useNotifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (_error) {
        console.error("", _error);
        toast.error('Failed to fetch notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = NotificationService.subscribeToNotifications(userId, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast(notification.message, {
        description: `Type: ${notification.type}`,
        duration: 5000,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_error) {
      console.error("", _error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await NotificationService.markAllAsRead(userId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (_error) {
      console.error("", _error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  };
} 