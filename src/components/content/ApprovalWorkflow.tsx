'use client';

import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  User, 
  ArrowRight,
  AlertCircle,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

export type ContentStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type ApprovalStep = 'REVIEW' | 'APPROVAL' | 'PUBLISH';

interface ApprovalHistory {
  id: string;
  status: ContentStatus;
  step: ApprovalStep;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
}

interface ContentApproval {
  id: string;
  contentId: string;
  status: ContentStatus;
  currentStep: ApprovalStep;
  createdAt: string;
  assignedTo?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  history: ApprovalHistory[];
  comments: Comment[];
}

interface ApprovalWorkflowProps {
  approval: ContentApproval;
  contentTitle: string;
  contentType: string;
  onStatusUpdate?: (newStatus: ContentStatus, comment?: string) => void;
  onAssigneeChange?: (assigneeId: string) => void;
  availableReviewers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    role: string;
  }>;
}

export function ApprovalWorkflow({
  approval,
  contentTitle,
  contentType,
  onStatusUpdate,
  onAssigneeChange,
  availableReviewers = []
}: ApprovalWorkflowProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusConfig = (status: ContentStatus) => {
    const configs = {
      DRAFT: { color: 'bg-gray-500', icon: Clock, label: 'Draft' },
      PENDING_REVIEW: { color: 'bg-yellow-500', icon: Clock, label: 'Pending Review' },
      IN_REVIEW: { color: 'bg-blue-500', icon: Eye, label: 'In Review' },
      CHANGES_REQUESTED: { color: 'bg-orange-500', icon: AlertCircle, label: 'Changes Requested' },
      APPROVED: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
      REJECTED: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
      PUBLISHED: { color: 'bg-purple-500', icon: CheckCircle, label: 'Published' },
      ARCHIVED: { color: 'bg-gray-400', icon: XCircle, label: 'Archived' }
    };
    return configs[status];
  };

  const getStepConfig = (step: ApprovalStep) => {
    const configs = {
      REVIEW: { label: 'Review', description: 'Content review and feedback' },
      APPROVAL: { label: 'Approval', description: 'Final approval for publication' },
      PUBLISH: { label: 'Publish', description: 'Content publishing and distribution' }
    };
    return configs[step];
  };

  const canUserTakeAction = () => {
    // User can take action if they are the assignee or if no one is assigned and they are a reviewer
    return approval.assignedTo === userId || 
           (!approval.assignedTo && availableReviewers.some(r => r.id === userId));
  };

  const getAvailableActions = () => {
    const actions = [];
    const { status, currentStep } = approval;

    if (!canUserTakeAction()) return actions;

    switch (status) {
      case 'PENDING_REVIEW':
        actions.push(
          { key: 'start-review', label: 'Start Review', status: 'IN_REVIEW' as ContentStatus },
          { key: 'request-changes', label: 'Request Changes', status: 'CHANGES_REQUESTED' as ContentStatus },
          { key: 'reject', label: 'Reject', status: 'REJECTED' as ContentStatus, variant: 'destructive' }
        );
        break;
      case 'IN_REVIEW':
        if (currentStep === 'REVIEW') {
          actions.push(
            { key: 'approve-review', label: 'Complete Review', status: 'APPROVED' as ContentStatus },
            { key: 'request-changes', label: 'Request Changes', status: 'CHANGES_REQUESTED' as ContentStatus },
            { key: 'reject', label: 'Reject', status: 'REJECTED' as ContentStatus, variant: 'destructive' }
          );
        } else if (currentStep === 'APPROVAL') {
          actions.push(
            { key: 'final-approve', label: 'Final Approval', status: 'APPROVED' as ContentStatus },
            { key: 'reject', label: 'Reject', status: 'REJECTED' as ContentStatus, variant: 'destructive' }
          );
        }
        break;
      case 'APPROVED':
        if (currentStep === 'PUBLISH') {
          actions.push(
            { key: 'publish', label: 'Publish Content', status: 'PUBLISHED' as ContentStatus }
          );
        }
        break;
      case 'CHANGES_REQUESTED':
        actions.push(
          { key: 'resubmit', label: 'Resubmit for Review', status: 'PENDING_REVIEW' as ContentStatus }
        );
        break;
    }

    return actions;
  };

  const handleStatusUpdate = async (newStatus: ContentStatus, actionKey: string) => {
    if (!comment.trim() && ['request-changes', 'reject'].includes(actionKey)) {
      toast({
        title: 'Comment Required',
        description: 'Please provide a comment when requesting changes or rejecting content.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onStatusUpdate?.(newStatus, comment.trim() || undefined);
      setComment('');
      toast({
        title: 'Status Updated',
        description: `Content status updated to ${getStatusConfig(newStatus).label}`,
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = getStatusConfig(approval.status);
  const stepConfig = getStepConfig(approval.currentStep);
  const StatusIcon = statusConfig.icon;
  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}></div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  {statusConfig.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stepConfig.label}: {stepConfig.description}
                </p>
              </div>
            </div>
            <Badge variant="outline">{contentType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{contentTitle}</h3>
              <p className="text-sm text-muted-foreground">
                Created {formatDate(approval.createdAt)}
              </p>
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assigned to:</span>
              </div>
              <div className="flex items-center gap-2">
                {approval.assignee ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={approval.assignee.imageUrl} />
                      <AvatarFallback>
                        {approval.assignee.firstName.charAt(0)}{approval.assignee.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {approval.assignee.firstName} {approval.assignee.lastName}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
                {onAssigneeChange && (
                  <Select 
                    value={approval.assignedTo || ''} 
                    onValueChange={onAssigneeChange}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {availableReviewers.map((reviewer) => (
                        <SelectItem key={reviewer.id} value={reviewer.id}>
                          {reviewer.firstName} {reviewer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {availableActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Comment {['request-changes', 'reject'].some(action => 
                  availableActions.some(a => a.key === action)
                ) && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (required for changes/rejection)..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {availableActions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant as any || 'default'}
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleStatusUpdate(action.status, action.key)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approval.history.map((historyItem, index) => {
              const historyStatusConfig = getStatusConfig(historyItem.status);
              const HistoryIcon = historyStatusConfig.icon;
              
              return (
                <div key={historyItem.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${historyStatusConfig.color} flex items-center justify-center`}>
                    <HistoryIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {historyItem.user.firstName} {historyItem.user.lastName}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {historyStatusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatDate(historyItem.createdAt)}
                    </p>
                    {historyItem.comment && (
                      <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
                        {historyItem.comment}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      {approval.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({approval.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approval.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.imageUrl} />
                    <AvatarFallback>
                      {comment.user.firstName.charAt(0)}{comment.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}