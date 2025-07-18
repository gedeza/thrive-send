import sgMail from '@sendgrid/mail';
import { BaseEmailProvider, SendEmailRequest, SendEmailResponse, BulkEmailRequest, BulkEmailResponse, EmailProviderConfig } from './base-email-provider';
import { logger } from '@/lib/utils/logger';

export class SendGridProvider extends BaseEmailProvider {
  private isInitialized = false;

  constructor(config: EmailProviderConfig) {
    super(config);
    this.initialize();
  }

  get name(): string {
    return 'sendgrid';
  }

  private initialize(): void {
    try {
      sgMail.setApiKey(this.config.apiKey);
      this.isInitialized = true;
      
      logger.info('SendGrid provider initialized', {
        provider: this.name,
        hasDefaultFrom: !!this.config.defaultFrom,
      });
    } catch (error) {
      logger.error('Failed to initialize SendGrid provider', error as Error);
      throw error;
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

      // Prepare SendGrid message
      const message: any = {
        to: request.to,
        from: request.from || this.config.defaultFrom,
        subject: request.subject,
        replyTo: request.replyTo,
        headers: request.headers,
        customArgs: {
          ...request.metadata,
          provider: this.name,
        },
      };

      // Handle content
      if (request.templateId) {
        message.templateId = request.templateId;
        message.dynamicTemplateData = request.templateData || {};
      } else {
        if (request.htmlContent) {
          message.html = request.htmlContent;
        }
        if (request.textContent) {
          message.text = request.textContent;
        }
        if (request.content && !request.htmlContent && !request.textContent) {
          message.text = request.content;
        }
      }

      // Handle attachments
      if (request.attachments) {
        message.attachments = request.attachments.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          type: att.contentType,
          disposition: att.disposition || 'attachment',
          contentId: att.contentId,
        }));
      }

      // Handle tracking
      if (request.trackOpens !== undefined || request.trackClicks !== undefined) {
        message.trackingSettings = {
          clickTracking: {
            enable: request.trackClicks !== false,
          },
          openTracking: {
            enable: request.trackOpens !== false,
          },
        };
      }

      // Handle unsubscribe URL
      if (request.unsubscribeUrl) {
        message.asm = {
          groupId: 1, // Default unsubscribe group
          groupsToDisplay: [1],
        };
      }

      // Send email
      const response = await sgMail.send(message);
      const responseTime = Date.now() - startTime;

      // Update stats
      this.updateStats(true, responseTime);

      logger.info('Email sent successfully via SendGrid', {
        provider: this.name,
        to: Array.isArray(request.to) ? request.to.length : 1,
        messageId: response[0].headers['x-message-id'],
        responseTime,
        statusCode: response[0].statusCode,
      });

      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        provider: this.name,
        statusCode: response[0].statusCode,
        metadata: {
          responseTime,
          headers: response[0].headers,
        },
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      this.updateStats(false, responseTime);

      logger.error('SendGrid email sending failed', error, {
        provider: this.name,
        to: request.to,
        subject: request.subject,
        responseTime,
        statusCode: error.code,
      });

      return {
        success: false,
        provider: this.name,
        error: error.message || 'Unknown SendGrid error',
        statusCode: error.code || 500,
        metadata: {
          responseTime,
          sendGridError: error.response?.body || error,
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
      logger.info('Starting bulk email send via SendGrid', {
        provider: this.name,
        emailCount: request.emails.length,
        batchSize: request.batchSize || 1000,
      });

      // Process emails in batches
      const batchSize = request.batchSize || 1000; // SendGrid can handle up to 1000 emails per request
      const batches = [];
      
      for (let i = 0; i < request.emails.length; i += batchSize) {
        batches.push(request.emails.slice(i, i + batchSize));
      }

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        try {
          // Check rate limits before processing batch
          if (!this.checkRateLimit('minute') || !this.checkRateLimit('hour')) {
            // Wait if rate limited
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          // Prepare batch message for SendGrid
          const batchMessage = {
            personalizations: batch.map(email => ({
              to: [{ email: Array.isArray(email.to) ? email.to[0] : email.to }],
              subject: email.subject,
              dynamicTemplateData: {
                ...request.globalTemplateData,
                ...email.templateData,
              },
              customArgs: {
                ...email.metadata,
                batchIndex,
                provider: this.name,
              },
            })),
            from: { email: batch[0].from || this.config.defaultFrom },
            templateId: request.templateId || batch[0].templateId,
            trackingSettings: {
              clickTracking: { enable: true },
              openTracking: { enable: true },
            },
          };

          // Send batch
          const response = await sgMail.send(batchMessage as any);
          
          // Process batch results
          for (let i = 0; i < batch.length; i++) {
            const email = batch[i];
            results.push({
              success: true,
              messageId: response[0].headers['x-message-id'],
              provider: this.name,
              statusCode: response[0].statusCode,
              metadata: {
                batchIndex,
                indexInBatch: i,
                recipient: Array.isArray(email.to) ? email.to[0] : email.to,
              },
            });
            totalSent++;
          }

          logger.info(`Batch ${batchIndex + 1}/${batches.length} sent successfully`, {
            provider: this.name,
            batchSize: batch.length,
            totalSent,
          });

        } catch (batchError: any) {
          logger.error(`Batch ${batchIndex + 1} failed`, batchError, {
            provider: this.name,
            batchSize: batch.length,
          });

          // Mark all emails in this batch as failed
          for (const email of batch) {
            results.push({
              success: false,
              provider: this.name,
              error: batchError.message || 'Batch sending failed',
              statusCode: batchError.code || 500,
              metadata: {
                batchIndex,
                recipient: Array.isArray(email.to) ? email.to[0] : email.to,
                sendGridError: batchError.response?.body || batchError,
              },
            });
            totalFailed++;
          }
        }

        // Small delay between batches to respect rate limits
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const totalTime = Date.now() - startTime;
      
      logger.info('Bulk email send completed via SendGrid', {
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
        batchId: `sendgrid-bulk-${Date.now()}`,
        metadata: {
          totalTime,
          batches: batches.length,
          avgTimePerEmail: totalTime / request.emails.length,
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
          sendGridError: error.response?.body || error,
        },
      };
    }
  }

  async validateTemplate(templateId: string): Promise<boolean> {
    try {
      // SendGrid doesn't have a direct template validation API
      // We'll attempt to retrieve template information
      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      logger.error('Template validation failed', error as Error, {
        provider: this.name,
        templateId,
      });
      return false;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<any> {
    try {
      // SendGrid Event Webhook provides delivery status
      // This would typically be handled by webhook endpoints
      // For now, we'll return a placeholder
      return {
        messageId,
        status: 'unknown',
        provider: this.name,
        note: 'Delivery status available via SendGrid webhooks',
      };
    } catch (error) {
      logger.error('Failed to get delivery status', error as Error, {
        provider: this.name,
        messageId,
      });
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test SendGrid API connectivity
      const response = await fetch('https://api.sendgrid.com/v3/user/account', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      const isHealthy = response.ok;
      
      logger.info('SendGrid health check completed', {
        provider: this.name,
        healthy: isHealthy,
        statusCode: response.status,
      });

      return isHealthy;
    } catch (error) {
      logger.error('SendGrid health check failed', error as Error, {
        provider: this.name,
      });
      return false;
    }
  }
}