import { Worker, Job } from 'bullmq';
import { getQueueRedisConnection } from './redis-connection';
import { logger } from '../utils/logger';
import { 
  EmailJobData, 
  SingleEmailJob, 
  BulkEmailJob, 
  NewsletterJob, 
  CampaignEmailJob 
} from './types';
import { 
  EmailServiceProvider, 
  SendEmailRequest 
} from '../services/email-service-interface';
import { MockEmailProvider } from '../services/email-providers/mock-email-provider';
import { EnhancedEmailService } from '../services/enhanced-email-service';
import { EmailServiceConfig } from '../services/email-service-factory';

// Worker configuration
const WORKER_CONCURRENCY = parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '5');
const WORKER_MAX_STALLED_COUNT = parseInt(process.env.EMAIL_WORKER_MAX_STALLED_COUNT || '3');
const WORKER_STALLED_INTERVAL = parseInt(process.env.EMAIL_WORKER_STALLED_INTERVAL || '30000');

// Enhanced email service configuration
const emailServiceConfig: EmailServiceConfig = {
  primary: (process.env.EMAIL_PRIMARY_PROVIDER as any) || 'mock',
  fallback: (process.env.EMAIL_FALLBACK_PROVIDER as any) || undefined,
  providers: {
    mock: {
      apiKey: 'mock-key',
      defaultFrom: 'noreply@thrive-send.com',
    },
    sendgrid: process.env.SENDGRID_API_KEY ? {
      apiKey: process.env.SENDGRID_API_KEY,
      defaultFrom: process.env.SENDGRID_DEFAULT_FROM || 'noreply@thrive-send.com',
      rateLimits: {
        requestsPerSecond: 100,
        requestsPerMinute: 6000,
        requestsPerHour: 360000,
      },
    } : undefined,
    'aws-ses': (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
      apiKey: '', // Not used for AWS SES
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      defaultFrom: process.env.AWS_SES_DEFAULT_FROM || 'noreply@thrive-send.com',
      rateLimits: {
        requestsPerSecond: 14, // AWS SES default
        requestsPerMinute: 200,
        requestsPerHour: 200,
      },
    } : undefined,
  },
  loadBalancing: {
    enabled: process.env.EMAIL_LOAD_BALANCING === 'true',
    strategy: (process.env.EMAIL_LOAD_BALANCING_STRATEGY as any) || 'round-robin',
  },
  failover: {
    enabled: process.env.EMAIL_FAILOVER === 'true' || true,
    maxRetries: parseInt(process.env.EMAIL_FAILOVER_RETRIES || '3'),
    retryDelay: parseInt(process.env.EMAIL_FAILOVER_DELAY || '1000'),
  },
};

// Email service instance (enhanced with multiple providers)
let emailService: EnhancedEmailService;

// Initialize enhanced email service
try {
  emailService = new EnhancedEmailService(emailServiceConfig);
  logger.info('Enhanced email service initialized', {
    primary: emailServiceConfig.primary,
    fallback: emailServiceConfig.fallback,
    providers: Object.keys(emailServiceConfig.providers),
  });
} catch (_error) {
  logger.error('Failed to initialize enhanced email service, falling back to mock', error as Error);
  emailService = new MockEmailProvider() as any;
}

// Job processor functions
class EmailJobProcessor {
  /**
   * Process single email job
   */
  static async processSingleEmail(job: Job<SingleEmailJob>): Promise<any> {
    const { to, subject, content, templateId, organizationId, campaignId } = job.data;
    
    logger.jobProcessing(job.id!, 'single_email', {
      to,
      organizationId,
      campaignId,
    });

    try {
      const emailRequest: SendEmailRequest = {
        to,
        subject,
        content,
        templateId,
        metadata: {
          organizationId,
          campaignId,
          jobId: job.id,
        },
      };

      const result = await emailService.sendEmail(emailRequest);

      if (result.success) {
        logger.emailSent(to, subject, {
          organizationId,
          campaignId,
          messageId: result.messageId,
          provider: result.provider,
        });

        return {
          success: true,
          messageId: result.messageId,
          provider: result.provider,
          recipient: to,
          sentAt: new Date().toISOString(),
        };
      } else {
        throw new Error(`Email delivery failed: ${result.error}`);
      }
    } catch (_error) {
      logger.emailFailed(to, error as Error, {
        organizationId,
        campaignId,
        jobId: job.id,
      });
      throw _error;
    }
  }

  /**
   * Process bulk email job
   */
  static async processBulkEmail(job: Job<BulkEmailJob>): Promise<any> {
    const { recipients, templateId, subject, organizationId, campaignId, batchId } = job.data;
    
    logger.jobProcessing(job.id!, 'bulk_email', {
      recipientCount: recipients.length,
      organizationId,
      campaignId,
      batchId,
    });

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    try {
      // Process emails in batch
      for (const recipient of recipients) {
        try {
          const emailRequest: SendEmailRequest = {
            to: recipient.email,
            subject,
            content: '', // Will be filled by template
            templateId,
            templateData: recipient.data,
            metadata: {
              organizationId,
              campaignId,
              batchId,
              jobId: job.id,
            },
          };

          const result = await emailService.sendEmail(emailRequest);

          if (result.success) {
            successCount++;
            logger.emailSent(recipient.email, subject, {
              organizationId,
              campaignId,
              batchId,
              messageId: result.messageId,
            });

            results.push({
              recipient: recipient.email,
              success: true,
              messageId: result.messageId,
              sentAt: new Date().toISOString(),
            });
          } else {
            failureCount++;
            logger.emailFailed(recipient.email, new Error(result.error || 'Unknown error'), {
              organizationId,
              campaignId,
              batchId,
            });

            results.push({
              recipient: recipient.email,
              success: false,
              error: result.error,
            });
          }

          // Log progress every 10 emails
          if ((successCount + failureCount) % 10 === 0) {
            logger.bulkEmailProgress(successCount, recipients.length, {
              campaignId,
              batchId,
              failed: failureCount,
            });
          }

        } catch (_error) {
          failureCount++;
          logger.emailFailed(recipient.email, error as Error, {
            organizationId,
            campaignId,
            batchId,
          });

          results.push({
            recipient: recipient.email,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      // Final progress log
      logger.bulkEmailProgress(successCount, recipients.length, {
        campaignId,
        batchId,
        failed: failureCount,
        completed: true,
      });

      return {
        totalRecipients: recipients.length,
        successCount,
        failureCount,
        batchId,
        results,
        completedAt: new Date().toISOString(),
      };

    } catch (_error) {
      logger.error('Bulk email processing failed', error as Error, {
        organizationId,
        campaignId,
        batchId,
        jobId: job.id,
      });
      throw _error;
    }
  }

  /**
   * Process newsletter job
   */
  static async processNewsletter(job: Job<NewsletterJob>): Promise<any> {
    const { templateId, subject, organizationId, campaignId, segmentId } = job.data;
    
    logger.jobProcessing(job.id!, 'newsletter', {
      organizationId,
      campaignId,
      segmentId,
    });

    try {
      // TODO: Fetch recipients from segment/database
      // For now, simulate with mock recipients
      const mockRecipients = [
        { email: 'subscriber1@test.com', data: { name: 'Subscriber 1' } },
        { email: 'subscriber2@test.com', data: { name: 'Subscriber 2' } },
        { email: 'subscriber3@test.com', data: { name: 'Subscriber 3' } },
      ];

      let successCount = 0;
      let failureCount = 0;
      const results = [];

      for (const recipient of mockRecipients) {
        try {
          const emailRequest: SendEmailRequest = {
            to: recipient.email,
            subject,
            content: '', // Will be filled by template
            templateId,
            templateData: recipient.data,
            metadata: {
              organizationId,
              campaignId,
              segmentId,
              jobId: job.id,
              type: 'newsletter',
            },
          };

          const result = await emailService.sendEmail(emailRequest);

          if (result.success) {
            successCount++;
            logger.emailSent(recipient.email, subject, {
              organizationId,
              campaignId,
              segmentId,
              messageId: result.messageId,
              type: 'newsletter',
            });

            results.push({
              recipient: recipient.email,
              success: true,
              messageId: result.messageId,
              sentAt: new Date().toISOString(),
            });
          } else {
            failureCount++;
            results.push({
              recipient: recipient.email,
              success: false,
              error: result.error,
            });
          }
        } catch (_error) {
          failureCount++;
          logger.emailFailed(recipient.email, error as Error, {
            organizationId,
            campaignId,
            segmentId,
            type: 'newsletter',
          });

          results.push({
            recipient: recipient.email,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      logger.info('Newsletter processing completed', {
        organizationId,
        campaignId,
        segmentId,
        totalRecipients: mockRecipients.length,
        successCount,
        failureCount,
      });

      return {
        totalRecipients: mockRecipients.length,
        successCount,
        failureCount,
        results,
        completedAt: new Date().toISOString(),
      };

    } catch (_error) {
      logger.error('Newsletter processing failed', error as Error, {
        organizationId,
        campaignId,
        segmentId,
        jobId: job.id,
      });
      throw _error;
    }
  }

  /**
   * Process campaign email job
   */
  static async processCampaignEmail(job: Job<CampaignEmailJob>): Promise<any> {
    const { recipients, templateId, subject, organizationId, campaignId } = job.data;
    
    logger.jobProcessing(job.id!, 'campaign_email', {
      recipientCount: recipients.length,
      organizationId,
      campaignId,
    });

    try {
      // Similar to bulk email but with campaign-specific logic
      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const recipient of recipients) {
        try {
          const emailRequest: SendEmailRequest = {
            to: recipient.email,
            subject,
            content: '', // Will be filled by template
            templateId,
            templateData: recipient.data,
            metadata: {
              organizationId,
              campaignId,
              jobId: job.id,
              type: 'campaign',
            },
          };

          const result = await emailService.sendEmail(emailRequest);

          if (result.success) {
            successCount++;
            results.push({
              recipient: recipient.email,
              success: true,
              messageId: result.messageId,
              sentAt: new Date().toISOString(),
            });
          } else {
            failureCount++;
            results.push({
              recipient: recipient.email,
              success: false,
              error: result.error,
            });
          }
        } catch (_error) {
          failureCount++;
          results.push({
            recipient: recipient.email,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      return {
        totalRecipients: recipients.length,
        successCount,
        failureCount,
        results,
        completedAt: new Date().toISOString(),
      };

    } catch (_error) {
      logger.error('Campaign email processing failed', error as Error, {
        organizationId,
        campaignId,
        jobId: job.id,
      });
      throw _error;
    }
  }
}

// Main job processor function
async function processEmailJob(job: Job<EmailJobData>): Promise<any> {
  const startTime = Date.now();

  try {
    let result;

    switch (job.data.type) {
      case 'single_email':
        result = await EmailJobProcessor.processSingleEmail(job as Job<SingleEmailJob>);
        break;
      case 'bulk_email':
        result = await EmailJobProcessor.processBulkEmail(job as Job<BulkEmailJob>);
        break;
      case 'newsletter':
        result = await EmailJobProcessor.processNewsletter(job as Job<NewsletterJob>);
        break;
      case 'campaign_email':
        result = await EmailJobProcessor.processCampaignEmail(job as Job<CampaignEmailJob>);
        break;
      default:
        throw new Error(`Unknown job type: ${(job.data as any).type}`);
    }

    const duration = Date.now() - startTime;
    logger.performance('email_job_processing', duration, {
      jobType: job.data.type,
      jobId: job.id,
      organizationId: job.data.organizationId,
    });

    return result;

  } catch (_error) {
    const duration = Date.now() - startTime;
    logger.error('Email job processing failed', error as Error, {
      jobType: job.data.type,
      jobId: job.id,
      organizationId: job.data.organizationId,
      duration,
    });
    throw _error;
  }
}

// Create and configure the worker
export const emailWorker = new Worker<EmailJobData>(
  'email-processing',
  processEmailJob,
  {
    connection: getQueueRedisConnection(),
    concurrency: WORKER_CONCURRENCY,
    stalledInterval: WORKER_STALLED_INTERVAL,
    maxStalledCount: WORKER_MAX_STALLED_COUNT,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

// Worker event handlers
emailWorker.on('ready', () => {
  logger.info('Email worker ready', {
    concurrency: WORKER_CONCURRENCY,
    stalledInterval: WORKER_STALLED_INTERVAL,
    maxStalledCount: WORKER_MAX_STALLED_COUNT,
  });
});

emailWorker.on('error', (error: Error) => {
  logger.error('Email worker error', error, {
    component: 'email_worker',
  });
});

emailWorker.on('stalled', (jobId: string) => {
  logger.warn('Email worker job stalled', {
    jobId,
    component: 'email_worker',
  });
});

emailWorker.on('completed', (job: Job) => {
  logger.info('Email worker job completed', {
    jobId: job.id,
    jobType: job.data.type,
    organizationId: job.data.organizationId,
    component: 'email_worker',
  });
});

emailWorker.on('failed', (job: Job | undefined, error: Error) => {
  logger.error('Email worker job failed', error, {
    jobId: job?.id,
    jobType: job?.data?.type,
    organizationId: job?.data?.organizationId,
    component: 'email_worker',
  });
});

// Worker management functions
export class EmailWorkerManager {
  static async startWorker(): Promise<void> {
    try {
      logger.info('Starting email worker...');
      // Worker automatically starts when created
    } catch (_error) {
      logger.error('Failed to start email worker', error);
      throw _error;
    }
  }

  static async stopWorker(): Promise<void> {
    try {
      logger.info('Stopping email worker...');
      await emailWorker.close();
      logger.info('Email worker stopped');
    } catch (_error) {
      logger.error('Failed to stop email worker', error);
      throw _error;
    }
  }

  static async pauseWorker(): Promise<void> {
    try {
      await emailWorker.pause();
      logger.info('Email worker paused');
    } catch (_error) {
      logger.error('Failed to pause email worker', error);
      throw _error;
    }
  }

  static async resumeWorker(): Promise<void> {
    try {
      await emailWorker.resume();
      logger.info('Email worker resumed');
    } catch (_error) {
      logger.error('Failed to resume email worker', error);
      throw _error;
    }
  }

  static getWorkerStats() {
    return {
      concurrency: WORKER_CONCURRENCY,
      stalledInterval: WORKER_STALLED_INTERVAL,
      maxStalledCount: WORKER_MAX_STALLED_COUNT,
      isRunning: emailWorker.isRunning(),
      isPaused: emailWorker.isPaused(),
    };
  }

  /**
   * Set email service provider
   */
  static setEmailService(service: EmailServiceProvider): void {
    emailService = service as any;
    logger.info('Email service provider updated', {
      provider: service.name,
    });
  }

  /**
   * Get enhanced email service instance
   */
  static getEmailService(): EnhancedEmailService {
    return emailService;
  }

  /**
   * Get email service statistics
   */
  static getEmailServiceStats(): Record<string, any> {
    return emailService.getProviderStats();
  }

  /**
   * Get email service health status
   */
  static getEmailServiceHealth(): Record<string, boolean> {
    return emailService.getHealthStatus();
  }
}

export { EmailJobProcessor };