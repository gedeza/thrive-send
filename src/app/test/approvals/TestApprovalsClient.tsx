'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function TestApprovalsClient() {
  const { toast } = useToast();

  const createTestApproval = async () => {
    try {
      const response = await fetch('/api/approvals/test', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create test approval');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Test approval created successfully',
      });
    } catch (error) {
      console.error('Error creating test approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test approval',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Test Approvals</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Test Approval</h2>
          <p className="text-muted-foreground">
            This will create a test content and approval for testing the approval workflow.
          </p>
          <Button onClick={createTestApproval}>
            Create Test Approval
          </Button>
        </div>
      </Card>
    </div>
  );
} 