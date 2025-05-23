'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { NotificationType } from "@prisma/client";

export default function TestNotificationsPage() {
  const { toast } = useToast();

  const createTestNotification = async (type: NotificationType) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          message: `Test ${type.toLowerCase()} notification`,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create notification: ${error}`);
      }

      toast({
        title: "Success",
        description: `Created ${type.toLowerCase()} notification`,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Create test notifications of different types to verify the notification system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => createTestNotification(NotificationType.CONTENT_SUBMITTED)}
              variant="outline"
            >
              Create Content Submitted Notification
            </Button>
            <Button
              onClick={() => createTestNotification(NotificationType.REVIEW_ASSIGNED)}
              variant="outline"
            >
              Create Review Assigned Notification
            </Button>
            <Button
              onClick={() => createTestNotification(NotificationType.FEEDBACK_PROVIDED)}
              variant="outline"
            >
              Create Feedback Provided Notification
            </Button>
            <Button
              onClick={() => createTestNotification(NotificationType.STATUS_CHANGED)}
              variant="outline"
            >
              Create Status Changed Notification
            </Button>
            <Button
              onClick={() => createTestNotification(NotificationType.APPROVAL_REJECTED)}
              variant="outline"
            >
              Create Approval Rejected Notification
            </Button>
            <Button
              onClick={() => createTestNotification(NotificationType.CONTENT_PUBLISHED)}
              variant="outline"
            >
              Create Content Published Notification
            </Button>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click any of the buttons above to create a test notification</li>
              <li>Check the notification center (bell icon) in the header</li>
              <li>Verify that the notification appears in the list</li>
              <li>Try marking notifications as read</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 