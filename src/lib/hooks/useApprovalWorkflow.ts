import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ApprovalStatus = 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
export type ApprovalStep = 'CREATION' | 'REVIEW' | 'APPROVAL' | 'PUBLICATION';

interface ApprovalData {
  id: string;
  contentId: string;
  status: ApprovalStatus;
  currentStep: ApprovalStep;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  comments: Comment[];
  history: ApprovalHistory[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  replies: Comment[];
}

interface ApprovalHistory {
  id: string;
  status: ApprovalStatus;
  step: ApprovalStep;
  comment?: string;
  createdAt: string;
  createdBy: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
}

export function useApprovalWorkflow(contentId: string) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch approval data
  const { data: approval, isLoading, error } = useQuery<ApprovalData>({
    queryKey: ['approval', contentId],
    queryFn: async () => {
      const response = await fetch(`/api/content/${contentId}/approval`);
      if (!response.ok) {
        throw new Error('Failed to fetch approval data');
      }
      return response.json();
    },
  });

  // Submit for approval
  const submitMutation = useMutation({
    mutationFn: async (assignedTo?: string) => {
      const response = await fetch(`/api/content/${contentId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit for approval');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', contentId] });
      toast.success('Content submitted for approval');
    },
    onError: (error) => {
      toast.error('Failed to submit for approval');
      console.error("", _error);
    },
  });

  // Update approval status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, comment }: { status: ApprovalStatus; comment?: string }) => {
      const response = await fetch(`/api/content/${contentId}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment }),
      });
      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', contentId] });
      toast.success('Approval status updated');
    },
    onError: (error) => {
      toast.error('Failed to update approval status');
      console.error("", _error);
    },
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const response = await fetch(`/api/content/${contentId}/approval/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', contentId] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error("", _error);
    },
  });

  return {
    approval,
    isLoading,
    error,
    isSubmitting,
    submitForApproval: submitMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    addComment: addCommentMutation.mutate,
  };
} 