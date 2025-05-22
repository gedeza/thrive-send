'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';

interface ContentApproval {
  id: string;
  contentId: string;
  status: ContentStatus;
  currentStep: string;
  createdAt: string;
  content: {
    id: string;
    title: string;
    type: string;
  };
  creator: {
    firstName: string;
    lastName: string;
  };
  assignee?: {
    firstName: string;
    lastName: string;
  };
}

export function ApprovalDashboard() {
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'ALL'>('ALL');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals, isLoading } = useQuery<ContentApproval[]>({
    queryKey: ['approvals', statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/approvals${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch approvals');
      }
      return response.json();
    },
  });

  const handleApprove = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve content');
      }

      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast({
        title: 'Success',
        description: 'Content approved successfully',
      });
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve content',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject content');
      }

      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast({
        title: 'Success',
        description: 'Content rejected successfully',
      });
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject content',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-500';
      case 'PENDING_REVIEW':
        return 'bg-yellow-500';
      case 'IN_REVIEW':
        return 'bg-blue-500';
      case 'CHANGES_REQUESTED':
        return 'bg-orange-500';
      case 'APPROVED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      case 'PUBLISHED':
        return 'bg-purple-500';
      case 'ARCHIVED':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div>Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ContentStatus | 'ALL')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {approvals?.map((approval) => (
          <Card key={approval.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{approval.content.title}</h3>
                  <Badge variant="outline">{approval.content.type}</Badge>
                  <Badge className={getStatusColor(approval.status)}>
                    {approval.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created by {approval.creator.firstName} {approval.creator.lastName} •{' '}
                  {formatDistanceToNow(new Date(approval.createdAt), { addSuffix: true })}
                  {approval.assignee && (
                    <> • Assigned to {approval.assignee.firstName} {approval.assignee.lastName}</>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/content/${approval.contentId}/approval`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Link>
                </Button>
                {approval.status === 'PENDING_REVIEW' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleApprove(approval.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleReject(approval.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 