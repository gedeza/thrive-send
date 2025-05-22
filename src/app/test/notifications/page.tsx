'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationService, NotificationType } from '@/lib/services/notification-service';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function NotificationTestPage() {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const generateTestNotification = async (type: NotificationType) => {
    if (!userId) {
      toast.error('You must be logged in to test notifications');
      return;
    }

    setIsLoading(true);
    try {
      await NotificationService.createNotification({
        userId,
        type,
        message: `Test notification of type: ${type}`,
      });
      toast.success('Test notification created');
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast.error('Failed to create test notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Notification System Test</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(NotificationType).map((type) => (
          <Button
            key={type}
            onClick={() => generateTestNotification(type)}
            disabled={isLoading}
            variant="outline"
            className="h-24"
          >
            Generate {type}
          </Button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Test Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click any of the buttons above to generate a test notification</li>
          <li>Check the notification center (bell icon) for the new notification</li>
          <li>Click on a notification to mark it as read</li>
          <li>Use the "Mark all as read" button to mark all notifications as read</li>
          <li>Verify that toast notifications appear when new notifications are created</li>
        </ol>
      </div>
    </div>
  );
} 