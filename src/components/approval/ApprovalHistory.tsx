import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ApprovalHistoryItem {
  id: string;
  status: string;
  step: string;
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

interface ApprovalHistoryProps {
  history: ApprovalHistoryItem[];
}

export function ApprovalHistory({ history }: ApprovalHistoryProps) {
  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Avatar>
              <AvatarImage src={item.user.imageUrl} />
              <AvatarFallback>
                {item.user.firstName?.[0]}
                {item.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {index < history.length - 1 && (
              <div className="w-0.5 h-full bg-border my-2" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {item.user.firstName} {item.user.lastName}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.step}</Badge>
                <Badge>{item.status}</Badge>
              </div>
              {item.comment && (
                <p className="text-sm text-muted-foreground">{item.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 