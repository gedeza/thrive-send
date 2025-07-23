// Job types for email processing
export interface BaseEmailJob {
  organizationId: string;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
}

export interface SingleEmailJob extends BaseEmailJob {
  type: 'single_email';
  to: string;
  subject: string;
  content: string;
  templateId?: string;
  campaignId?: string;
}

export interface BulkEmailJob extends BaseEmailJob {
  type: 'bulk_email';
  recipients: Array<{
    email: string;
    data?: Record<string, any>;
  }>;
  templateId: string;
  subject: string;
  campaignId: string;
  batchId?: string;
}

export interface NewsletterJob extends BaseEmailJob {
  type: 'newsletter';
  segmentId?: string;
  templateId: string;
  subject: string;
  campaignId: string;
}

export interface CampaignEmailJob extends BaseEmailJob {
  type: 'campaign_email';
  campaignId: string;
  templateId: string;
  subject: string;
  recipients: Array<{
    email: string;
    data?: Record<string, any>;
  }>;
}

export type EmailJobData = SingleEmailJob | BulkEmailJob | NewsletterJob | CampaignEmailJob;

// Job options for queue processing
export interface EmailJobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: number;
  removeOnFail?: number;
}

// Queue statistics interface
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

// Job status for tracking
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';

// Email delivery status
export interface EmailDeliveryStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'bounced' | 'rejected';
  recipient: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}