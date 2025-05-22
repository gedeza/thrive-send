import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (data: { content: string; parentId?: string }) => Promise<void>;
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (parentId?: string) => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment({ content: newComment, parentId });
      setNewComment('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="space-y-4">
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src={comment.user.imageUrl} />
          <AvatarFallback>
            {comment.user.firstName?.[0]}
            {comment.user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {comment.user.firstName} {comment.user.lastName}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1">{comment.content}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            Reply
          </Button>
          {replyingTo === comment.id && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(comment.id)}
                  disabled={isSubmitting}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="ml-12 space-y-4">
          {comment.replies.map((reply) => renderComment(reply))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map(renderComment)}
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
        >
          Comment
        </Button>
      </div>
    </div>
  );
} 