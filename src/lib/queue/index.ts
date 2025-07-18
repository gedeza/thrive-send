// Main export file for email queue system
export { EmailQueueManager, emailQueue, queueEvents } from './email-queue';
export { EmailWorkerManager, emailWorker, EmailJobProcessor } from './email-worker';
export { 
  EmailServiceProvider, 
  MockEmailService, 
  SendEmailRequest, 
  SendEmailResponse 
} from '../services/email-service-interface';
export type {
  EmailJobData,
  SingleEmailJob,
  BulkEmailJob,
  NewsletterJob,
  CampaignEmailJob,
  EmailJobOptions,
  QueueStats,
  JobStatus,
  EmailDeliveryStatus
} from './types';

// Re-export logger for convenience
export { logger } from '../utils/logger';