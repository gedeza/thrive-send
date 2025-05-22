import { useState } from 'react';
import { useApprovalWorkflow, ApprovalStatus } from '@/lib/hooks/useApprovalWorkflow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentSection } from './CommentSection';
import { ApprovalHistory } from './ApprovalHistory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ApprovalWorkflowProps {
  contentId: string;
  userRole: string;
}

export function ApprovalWorkflow({ contentId, userRole }: ApprovalWorkflowProps) {
  const {
    approval,
    isLoading,
    error,
    submitForApproval,
    updateStatus,
    addComment,
  } = useApprovalWorkflow(contentId);

  const [selectedReviewer, setSelectedReviewer] = useState<string>();
  const [statusComment, setStatusComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <div>Loading approval workflow...</div>;
  }

  if (error) {
    return <div>Error loading approval workflow: {error.message}</div>;
  }

  const canSubmit = userRole === 'CONTENT_CREATOR' && approval?.status === 'DRAFT';
  const canReview = userRole === 'REVIEWER' && approval?.status === 'PENDING_REVIEW';
  const canApprove = userRole === 'APPROVER' && approval?.status === 'IN_REVIEW';
  const canPublish = userRole === 'PUBLISHER' && approval?.status === 'APPROVED';

  const handleStatusUpdate = async (newStatus: ApprovalStatus) => {
    setIsSubmitting(true);
    try {
      await updateStatus({ status: newStatus, comment: statusComment });
      setStatusComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Approval Workflow</h2>
            <p className="text-muted-foreground">
              Current Status: <Badge>{approval?.status}</Badge>
            </p>
          </div>
          <div className="flex items-center gap-4">
            {canSubmit && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Submit for Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit for Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select
                      value={selectedReviewer}
                      onValueChange={setSelectedReviewer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add reviewer options here */}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => submitForApproval(selectedReviewer)}
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {canReview && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Content</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add your review comments..."
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate('CHANGES_REQUESTED')}
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Request Changes
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate('IN_REVIEW')}
                        disabled={isSubmitting}
                      >
                        Approve for Review
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {canApprove && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Approve</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Content</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add approval comments..."
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate('REJECTED')}
                        variant="destructive"
                        disabled={isSubmitting}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate('APPROVED')}
                        disabled={isSubmitting}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {canPublish && (
              <Button
                onClick={() => handleStatusUpdate('PUBLISHED')}
                disabled={isSubmitting}
              >
                Publish
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Approval History</h3>
            <ApprovalHistory history={approval?.history || []} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            <CommentSection
              comments={approval?.comments || []}
              onAddComment={addComment}
            />
          </div>
        </div>
      </Card>
    </div>
  );
} 