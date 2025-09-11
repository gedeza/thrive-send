import { Queue, Job, QueueEvents } from 'bullmq';
import { queueRedisConnection } from './redis-connection';
import { logger } from '../utils/logger';
import { 
  EmailJobData, 
  EmailJobOptions, 
  QueueStats, 
  JobStatus,
  SingleEmailJob,
  BulkEmailJob,
  NewsletterJob,
  CampaignEmailJob
} from './types';

// Email Queue Configuration
const emailQueue = new Queue<EmailJobData>('email-processing', {
  connection: queueRedisConnection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 seconds, then 4, 8, etc.
    },
  },
});

// Queue events handler
const queueEvents = new QueueEvents('email-processing', {
  connection: queueRedisConnection,
});

queueEvents.on('completed', ({ jobId, returnvalue }: { jobId: string; returnvalue: unknown }) => {
  logger.queueEvent('job_completed', jobId, {
    status: 'completed',
    returnValue: returnvalue
  });
});

queueEvents.on('failed', ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
  logger.queueEvent('job_failed', jobId, {
    status: 'failed',
    error: failedReason
  });
});

queueEvents.on('stalled', ({ jobId }: { jobId: string }) => {
  logger.queueEvent('job_stalled', jobId, { 
    status: 'stalled' 
  });
});

queueEvents.on('waiting', ({ jobId }: { jobId: string }) => {
  logger.queueEvent('job_waiting', jobId, {
    status: 'waiting'
  });
});

// Queue Management Class
export class EmailQueueManager {
  /**
   * Add a single email job to the queue
   */
  static async addSingleEmail(
    emailData: Omit<SingleEmailJob, 'type'>, 
    options: EmailJobOptions = {}
  ): Promise<Job<EmailJobData>> {
    try {
      const job = await emailQueue.add(
        'process-single-email',
        {
          type: 'single_email',
          ...emailData,
        },
        {
          delay: options.delay,
          priority: options.priority || 0,
          attempts: options.attempts || 3,
          backoff: options.backoff,
          removeOnComplete: options.removeOnComplete || 100,
          removeOnFail: options.removeOnFail || 50,
        }
      );

      logger.queueEvent('job_added', job.id!, {
        type: 'single_email',
        to: emailData.to,
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
      });

      return job;
    } catch (_error) {
      logger.error('Failed to add single email job', error, {
        organizationId: emailData.organizationId,
        to: emailData.to,
      });
      throw _error;
    }
  }

  /**
   * Add a bulk email job to the queue (with batching)
   */
  static async addBulkEmail(
    emailData: Omit<BulkEmailJob, 'type'>, 
    options: EmailJobOptions & { batchSize?: number } = {}
  ): Promise<Job<EmailJobData>[]> {
    try {
      const batchSize = options.batchSize || 100;
      const recipients = emailData.recipients;
      const jobs: Job<EmailJobData>[] = [];

      // Split recipients into batches
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchId = `${emailData.campaignId}-batch-${Math.floor(i / batchSize) + 1}`;

        const job = await emailQueue.add(
          'process-bulk-email',
          {
            type: 'bulk_email',
            ...emailData,
            recipients: batch,
            batchId,
          },
          {
            delay: options.delay,
            priority: options.priority || 1,
            attempts: options.attempts || 3,
            backoff: options.backoff,
            removeOnComplete: options.removeOnComplete || 100,
            removeOnFail: options.removeOnFail || 50,
          }
        );

        jobs.push(job);
      }

      logger.queueEvent('bulk_jobs_added', `${emailData.campaignId}-bulk`, {
        type: 'bulk_email',
        totalRecipients: recipients.length,
        batchCount: jobs.length,
        batchSize,
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
      });

      return jobs;
    } catch (_error) {
      logger.error('Failed to add bulk email jobs', error, {
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
        recipientCount: emailData.recipients.length,
      });
      throw _error;
    }
  }

  /**
   * Add a newsletter job to the queue
   */
  static async addNewsletter(
    emailData: Omit<NewsletterJob, 'type'>, 
    options: EmailJobOptions = {}
  ): Promise<Job<EmailJobData>> {
    try {
      // Calculate delay for scheduled newsletters
      const delay = emailData.scheduledFor 
        ? Math.max(0, emailData.scheduledFor.getTime() - Date.now())
        : options.delay;

      const job = await emailQueue.add(
        'process-newsletter',
        {
          type: 'newsletter',
          ...emailData,
        },
        {
          delay,
          priority: options.priority || 2,
          attempts: options.attempts || 3,
          backoff: options.backoff,
          removeOnComplete: options.removeOnComplete || 100,
          removeOnFail: options.removeOnFail || 50,
        }
      );

      logger.queueEvent('newsletter_job_added', job.id!, {
        type: 'newsletter',
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
        scheduledFor: emailData.scheduledFor,
        segmentId: emailData.segmentId,
      });

      return job;
    } catch (_error) {
      logger.error('Failed to add newsletter job', error, {
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
      });
      throw _error;
    }
  }

  /**
   * Add a campaign email job to the queue
   */
  static async addCampaignEmail(
    emailData: Omit<CampaignEmailJob, 'type'>, 
    options: EmailJobOptions & { batchSize?: number } = {}
  ): Promise<Job<EmailJobData>[]> {
    try {
      const batchSize = options.batchSize || 100;
      const recipients = emailData.recipients;
      const jobs: Job<EmailJobData>[] = [];

      // Split recipients into batches for large campaigns
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        const job = await emailQueue.add(
          'process-campaign-email',
          {
            type: 'campaign_email',
            ...emailData,
            recipients: batch,
          },
          {
            delay: options.delay,
            priority: options.priority || 1,
            attempts: options.attempts || 3,
            backoff: options.backoff,
            removeOnComplete: options.removeOnComplete || 100,
            removeOnFail: options.removeOnFail || 50,
          }
        );

        jobs.push(job);
      }

      logger.queueEvent('campaign_jobs_added', `${emailData.campaignId}-campaign`, {
        type: 'campaign_email',
        totalRecipients: recipients.length,
        batchCount: jobs.length,
        batchSize,
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
      });

      return jobs;
    } catch (_error) {
      logger.error('Failed to add campaign email jobs', error, {
        organizationId: emailData.organizationId,
        campaignId: emailData.campaignId,
        recipientCount: emailData.recipients.length,
      });
      throw _error;
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(): Promise<QueueStats | null> {
    try {
      const waiting = await emailQueue.getWaiting();
      const active = await emailQueue.getActive();
      const completed = await emailQueue.getCompleted();
      const failed = await emailQueue.getFailed();
      const delayed = await emailQueue.getDelayed();

      const stats: QueueStats = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };

      return stats;
    } catch (_error) {
      logger.error('Failed to get queue stats', error);
      return null;
    }
  }

  /**
   * Get jobs by status
   */
  static async getJobsByStatus(status: JobStatus, start = 0, end = 10) {
    try {
      switch (status) {
        case 'waiting':
          return await emailQueue.getWaiting();
        case 'active':
          return await emailQueue.getActive();
        case 'completed':
          return await emailQueue.getCompleted();
        case 'failed':
          return await emailQueue.getFailed();
        case 'delayed':
          return await emailQueue.getDelayed();
        default:
          return [];
      }
    } catch (_error) {
      logger.error(`Failed to get ${status} jobs`, error);
      return [];
    }
  }

  /**
   * Pause the email queue
   */
  static async pauseQueue(): Promise<void> {
    try {
      await emailQueue.pause();
      logger.info('Email queue paused');
    } catch (_error) {
      logger.error('Failed to pause queue', error);
      throw _error;
    }
  }

  /**
   * Resume the email queue
   */
  static async resumeQueue(): Promise<void> {
    try {
      await emailQueue.resume();
      logger.info('Email queue resumed');
    } catch (_error) {
      logger.error('Failed to resume queue', error);
      throw _error;
    }
  }

  /**
   * Clear queue by status
   */
  static async clearQueue(
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'all' = 'all',
    grace = 5000
  ): Promise<void> {
    try {
      switch (status) {
        case 'waiting':
          await emailQueue.clean(0, 0, 'wait');
          break;
        case 'active':
          await emailQueue.clean(0, 0, 'active');
          break;
        case 'completed':
          await emailQueue.clean(0, 0, 'completed');
          break;
        case 'failed':
          await emailQueue.clean(0, 0, 'failed');
          break;
        case 'delayed':
          await emailQueue.clean(0, 0, 'delayed');
          break;
        case 'all':
          await emailQueue.obliterate({ force: true });
          break;
      }
      
      logger.info(`Email queue cleared: ${status}`);
    } catch (_error) {
      logger.error(`Failed to clear queue (${status})`, error);
      throw _error;
    }
  }

  /**
   * Get job by ID
   */
  static async getJob(jobId: string): Promise<Job<EmailJobData> | undefined> {
    try {
      return await emailQueue.getJob(jobId);
    } catch (_error) {
      logger.error('Failed to get job', error, { jobId });
      return undefined;
    }
  }

  /**
   * Retry failed job
   */
  static async retryJob(jobId: string): Promise<void> {
    try {
      const job = await emailQueue.getJob(jobId);
      if (job) {
        await job.retry();
        logger.info('Job retried', { jobId });
      }
    } catch (_error) {
      logger.error('Failed to retry job', error, { jobId });
      throw _error;
    }
  }
}

export { emailQueue, queueEvents };