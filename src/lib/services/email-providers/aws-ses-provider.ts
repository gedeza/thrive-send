import { SESClient, SendEmailCommand, SendBulkTemplatedEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import { BaseEmailProvider, SendEmailRequest, SendEmailResponse, BulkEmailRequest, BulkEmailResponse, EmailProviderConfig } from './base-email-provider';
import { logger } from '@/lib/utils/logger';

export interface AWSSESConfig extends EmailProviderConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export class AWSSESProvider extends BaseEmailProvider {
  private sesClient: SESClient;
  private sendQuota: { max24HourSend: number; maxSendRate: number; sentLast24Hours: number } | null = null;

  constructor(config: AWSSESConfig) {
    super(config);
    this.initialize(config);
  }

  get name(): string {
    return 'aws-ses';
  }

  private initialize(config: AWSSESConfig): void {
    try {
      this.sesClient = new SESClient({
        region: config.region || process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || '',
          sessionToken: config.sessionToken || process.env.AWS_SESSION_TOKEN,
        },
      });

      logger.info('AWS SES provider initialized', {
        provider: this.name,
        region: config.region || process.env.AWS_REGION || 'us-east-1',
      });

      // Get send quota on initialization
      this.updateSendQuota();
    } catch (_error) {
      logger.error('Failed to initialize AWS SES provider', error as Error);
      throw _error;
    }
  }

  private async updateSendQuota(): Promise<void> {
    try {
      const command = new GetSendQuotaCommand({});
      const response = await this.sesClient.send(command);
      
      this.sendQuota = {
        max24HourSend: response.Max24HourSend || 0,
        maxSendRate: response.MaxSendRate || 0,
        sentLast24Hours: response.SentLast24Hours || 0,
      };

      logger.info('AWS SES quota updated', {
        provider: this.name,
        quota: this.sendQuota,
      });
    } catch (_error) {
      logger.error('Failed to update AWS SES quota', error as Error);
    }
  }

  async send(request: SendEmailRequest): Promise<SendEmailResponse> {
    const startTime = Date.now();
    
    try {
      // Validate request
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          provider: this.name,
          error: `Validation failed: ${validationErrors.join(', ')}`,
          statusCode: 400,
        };
      }

      // Check rate limits
      if (!this.checkRateLimit('second') || !this.checkRateLimit('minute') || !this.checkRateLimit('hour')) {
        return {
          success: false,
          provider: this.name,
          error: 'Rate limit exceeded',
          statusCode: 429,
        };
      }

      // Check AWS SES quota
      if (this.sendQuota && this.sendQuota.sentLast24Hours >= this.sendQuota.max24HourSend) {
        return {
          success: false,
          provider: this.name,
          error: '24-hour send quota exceeded',
          statusCode: 429,
          metadata: {
            quota: this.sendQuota,
          },
        };
      }

      // Prepare SES message
      const destinations = Array.isArray(request.to) ? request.to : [request.to];
      
      const message = {
        Source: request.from || this.config.defaultFrom,
        Destination: {
          ToAddresses: destinations,
        },
        Message: {
          Subject: {
            Data: request.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Text: request.textContent || request.content ? {
              Data: request.textContent || request.content || '',
              Charset: 'UTF-8',
            } : undefined,
            Html: request.htmlContent ? {
              Data: request.htmlContent,
              Charset: 'UTF-8',
            } : undefined,
          },
        },
        ReplyToAddresses: request.replyTo ? [request.replyTo] : undefined,
        Tags: request.tags ? request.tags.map(tag => ({
          Name: 'tag',
          Value: tag,
        })) : undefined,
      };

      // Send email
      const command = new SendEmailCommand(message);
      const response = await this.sesClient.send(command);
      const responseTime = Date.now() - startTime;

      // Update stats
      this.updateStats(true, responseTime);

      logger.info('Email sent successfully via AWS SES', {
        provider: this.name,
        to: destinations.length,
        messageId: response.MessageId,
        responseTime,
      });

      return {
        success: true,
        messageId: response.MessageId,
        provider: this.name,
        statusCode: 200,
        metadata: {
          responseTime,
          destinations: destinations.length,
        },
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      this.updateStats(false, responseTime);

      logger.error('AWS SES email sending failed', error, {
        provider: this.name,
        to: request.to,
        subject: request.subject,
        responseTime,
        errorCode: error.name,
      });

      return {
        success: false,
        provider: this.name,
        error: error.message || 'Unknown AWS SES error',
        statusCode: this.getHttpStatusFromSESError(error),
        metadata: {
          responseTime,
          errorCode: error.name,
          sesError: error,
        },
      };
    }
  }

  async sendBulk(request: BulkEmailRequest): Promise<BulkEmailResponse> {
    const startTime = Date.now();
    const results: SendEmailResponse[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    try {
      logger.info('Starting bulk email send via AWS SES', {
        provider: this.name,
        emailCount: request.emails.length,
        batchSize: request.batchSize || 50,
      });

      // AWS SES bulk sending is limited to 50 destinations per call
      const batchSize = Math.min(request.batchSize || 50, 50);
      const batches = [];
      
      for (let i = 0; i < request.emails.length; i += batchSize) {
        batches.push(request.emails.slice(i, i + batchSize));
      }

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        try {
          // Check rate limits and quota
          if (!this.checkRateLimit('second') || !this.checkRateLimit('minute')) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          if (this.sendQuota && this.sendQuota.sentLast24Hours >= this.sendQuota.max24HourSend) {
            logger.warn('AWS SES quota exceeded, stopping bulk send', {
              provider: this.name,
              quota: this.sendQuota,
            });
            break;
          }

          // Use SendBulkTemplatedEmailCommand if template is specified
          if (request.templateId) {
            const bulkCommand = new SendBulkTemplatedEmailCommand({
              Source: batch[0].from || this.config.defaultFrom,
              Template: request.templateId,
              DefaultTemplateData: JSON.stringify(request.globalTemplateData || {}),
              Destinations: batch.map(email => ({
                Destination: {
                  ToAddresses: [Array.isArray(email.to) ? email.to[0] : email.to],
                },
                ReplacementTemplateData: JSON.stringify(email.templateData || {}),
                ReplacementTags: email.tags ? email.tags.map(tag => ({
                  Name: 'tag',
                  Value: tag,
                })) : undefined,
              })),
            });

            const response = await this.sesClient.send(bulkCommand);
            
            // Process results
            response.Status?.forEach((status, index) => {
              const email = batch[index];
              if (status.Status === 'Success') {
                results.push({
                  success: true,
                  messageId: status.MessageId,
                  provider: this.name,
                  statusCode: 200,
                  metadata: {
                    batchIndex,
                    indexInBatch: index,
                    recipient: Array.isArray(email.to) ? email.to[0] : email.to,
                  },
                });
                totalSent++;
              } else {
                results.push({
                  success: false,
                  provider: this.name,
                  error: status.Error || 'Unknown error',
                  statusCode: 500,
                  metadata: {
                    batchIndex,
                    indexInBatch: index,
                    recipient: Array.isArray(email.to) ? email.to[0] : email.to,
                  },
                });
                totalFailed++;
              }
            });

          } else {
            // Send individual emails in parallel (respecting rate limits)
            const batchPromises = batch.map(async (email, index) => {
              try {
                const result = await this.send(email);
                return {
                  ...result,
                  metadata: {
                    ...result.metadata,
                    batchIndex,
                    indexInBatch: index,
                  },
                };
              } catch (_error) {
                return {
                  success: false,
                  provider: this.name,
                  error: (error as Error).message,
                  statusCode: 500,
                  metadata: {
                    batchIndex,
                    indexInBatch: index,
                    recipient: Array.isArray(email.to) ? email.to[0] : email.to,
                  },
                };
              }
            });

            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach(result => {
              if (result.status === 'fulfilled') {
                results.push(result.value);
                if (result.value.success) {
                  totalSent++;
                } else {
                  totalFailed++;
                }
              } else {
                results.push({
                  success: false,
                  provider: this.name,
                  error: result.reason.message,
                  statusCode: 500,
                });
                totalFailed++;
              }
            });
          }

          logger.info(`Batch ${batchIndex + 1}/${batches.length} processed`, {
            provider: this.name,
            batchSize: batch.length,
            totalSent,
            totalFailed,
          });

          // Rate limiting delay between batches
          if (batchIndex < batches.length - 1) {
            const delay = this.sendQuota ? 1000 / this.sendQuota.maxSendRate : 100;
            await new Promise(resolve => setTimeout(resolve, delay));
          }

        } catch (batchError: any) {
          logger.error(`Batch ${batchIndex + 1} failed`, batchError, {
            provider: this.name,
            batchSize: batch.length,
          });

          // Mark all emails in this batch as failed
          for (let i = 0; i < batch.length; i++) {
            const email = batch[i];
            results.push({
              success: false,
              provider: this.name,
              error: batchError.message || 'Batch sending failed',
              statusCode: this.getHttpStatusFromSESError(batchError),
              metadata: {
                batchIndex,
                indexInBatch: i,
                recipient: Array.isArray(email.to) ? email.to[0] : email.to,
              },
            });
            totalFailed++;
          }
        }
      }

      const totalTime = Date.now() - startTime;
      
      logger.info('Bulk email send completed via AWS SES', {
        provider: this.name,
        totalEmails: request.emails.length,
        totalSent,
        totalFailed,
        totalTime,
        avgTimePerEmail: totalTime / request.emails.length,
      });

      return {
        success: totalSent > 0,
        results,
        totalSent,
        totalFailed,
        provider: this.name,
        batchId: `aws-ses-bulk-${Date.now()}`,
        metadata: {
          totalTime,
          batches: batches.length,
          avgTimePerEmail: totalTime / request.emails.length,
          quota: this.sendQuota,
        },
      };

    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      
      logger.error('Bulk email send failed completely', error, {
        provider: this.name,
        totalEmails: request.emails.length,
        totalTime,
      });

      return {
        success: false,
        results,
        totalSent,
        totalFailed: request.emails.length,
        provider: this.name,
        metadata: {
          totalTime,
          error: error.message,
          sesError: error,
        },
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const command = new GetSendQuotaCommand({});
      const response = await this.sesClient.send(command);
      
      const isHealthy = response.Max24HourSend !== undefined;
      
      logger.info('AWS SES health check completed', {
        provider: this.name,
        healthy: isHealthy,
        quota: response,
      });

      return isHealthy;
    } catch (_error) {
      logger.error('AWS SES health check failed', error as Error, {
        provider: this.name,
      });
      return false;
    }
  }

  private getHttpStatusFromSESError(error: any): number {
    switch (error.name) {
      case 'Throttling':
        return 429;
      case 'SendingPausedException':
        return 503;
      case 'MessageRejected':
        return 400;
      case 'MailFromDomainNotVerifiedException':
        return 403;
      default:
        return 500;
    }
  }

  async getSendQuota(): Promise<{ max24HourSend: number; maxSendRate: number; sentLast24Hours: number } | null> {
    await this.updateSendQuota();
    return this.sendQuota;
  }

  async validateTemplate(templateId: string): Promise<boolean> {
    try {
      // AWS SES template validation would require GetTemplate command
      // For now, return true as templates are typically validated on creation
      return true;
    } catch (_error) {
      logger.error('Template validation failed', error as Error, {
        provider: this.name,
        templateId,
      });
      return false;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<any> {
    // AWS SES delivery status is available through SNS notifications
    // This would typically be handled by webhook endpoints
    return {
      messageId,
      status: 'unknown',
      provider: this.name,
      note: 'Delivery status available via AWS SES SNS notifications',
    };
  }
}