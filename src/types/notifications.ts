export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CONTENT_SUBMITTED = 'CONTENT_SUBMITTED',
  REVIEW_ASSIGNED = 'REVIEW_ASSIGNED',
  FEEDBACK_PROVIDED = 'FEEDBACK_PROVIDED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
  CONTENT_PUBLISHED = 'CONTENT_PUBLISHED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
} 