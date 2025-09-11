'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ApprovalWorkflow } from '@/components/content/ApprovalWorkflow';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function ContentApprovalPage({ params }: PageProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [approval, setApproval] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [availableReviewers, setAvailableReviewers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovalData();
    fetchAvailableReviewers();
  }, [params.id]);

  const fetchApprovalData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch content details
      const contentResponse = await fetch(`/api/content/${params.id}`);
      if (!contentResponse.ok) {
        throw new Error('Failed to fetch content');
      }
      const contentData = await contentResponse.json();
      setContent(contentData);

      // Fetch approval workflow
      const approvalResponse = await fetch(`/api/content/${params.id}/approval`);
      if (approvalResponse.ok) {
        const approvalData = await approvalResponse.json();
        setApproval(approvalData);
      } else if (approvalResponse.status === 404) {
        // No approval workflow exists yet
        setApproval(null);
      } else {
        throw new Error('Failed to fetch approval workflow');
      }
    } catch (_error) {
      console.error("", _error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableReviewers = async () => {
    try {
      // Fetch organization members who can review content
      const response = await fetch('/api/organization/members?role=reviewer');
      if (response.ok) {
        const reviewers = await response.json();
        setAvailableReviewers(reviewers);
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const createApprovalWorkflow = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PENDING_REVIEW',
          step: 'REVIEW'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create approval workflow');
      }

      const newApproval = await response.json();
      setApproval(newApproval);
      
      toast({
        title: 'Success',
        description: 'Approval workflow created successfully',
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: 'Failed to create approval workflow',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (newStatus: any, comment?: string) => {
    try {
      const response = await fetch(`/api/content/${params.id}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          step: getStepForStatus(newStatus),
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }

      const updatedApproval = await response.json();
      setApproval(updatedApproval);
      
      // Refresh content data to get updated status
      await fetchApprovalData();
    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      const response = await fetch(`/api/content/${params.id}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approval.status,
          step: approval.currentStep,
          assignedTo: assigneeId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignee');
      }

      const updatedApproval = await response.json();
      setApproval(updatedApproval);
      
      toast({
        title: 'Success',
        description: 'Assignee updated successfully',
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: 'Failed to update assignee',
        variant: 'destructive',
      });
    }
  };

  const getStepForStatus = (status: string) => {
    switch (status) {
      case 'DRAFT':
      case 'PENDING_REVIEW':
      case 'IN_REVIEW':
      case 'CHANGES_REQUESTED':
        return 'REVIEW';
      case 'APPROVED':
      case 'REJECTED':
        return 'APPROVAL';
      case 'PUBLISHED':
      case 'ARCHIVED':
        return 'PUBLISH';
      default:
        return 'REVIEW';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-6 py-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-muted-foreground mb-4">Content not found</p>
            <Link href="/content">
              <Button>Back to Content</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Content Approval</h1>
          <p className="text-muted-foreground">
            Manage approval workflow for "{content.title}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">{content.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Type: {content.type} • Created: {new Date(content.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {content.excerpt && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Excerpt</h4>
                  <p className="text-sm text-muted-foreground">{content.excerpt}</p>
                </div>
              )}

              {content.tags && content.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Link href={`/content/${content.id}`}>
                  <Button variant="outline" className="w-full">
                    View Full Content
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Workflow */}
        <div className="lg:col-span-2">
          {approval ? (
            <ApprovalWorkflow
              approval={approval}
              contentTitle={content.title}
              contentType={content.type}
              onStatusUpdate={handleStatusUpdate}
              onAssigneeChange={handleAssigneeChange}
              availableReviewers={availableReviewers}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Approval Workflow</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  This content doesn't have an approval workflow yet.
                </p>
                {content.createdById === userId && (
                  <Button onClick={createApprovalWorkflow}>
                    Start Approval Process
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}