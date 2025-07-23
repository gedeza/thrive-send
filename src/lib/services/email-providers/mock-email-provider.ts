import { BaseEmailProvider, SendEmailRequest, SendEmailResponse, BulkEmailRequest, BulkEmailResponse, EmailProviderConfig } from './base-email-provider';
import { logger } from '@/lib/utils/logger';

export class MockEmailProvider extends BaseEmailProvider {
  constructor(config: EmailProviderConfig = { apiKey: 'mock-key' }) {
    super(config);
  }

  get name(): string {
    return 'mock';
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

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate occasional failures for testing (10% failure rate)
      if (Math.random() < 0.1) {
        const responseTime = Date.now() - startTime;
        this.updateStats(false, responseTime);
        
        return {
          success: false,
          provider: this.name,
          error: 'Simulated random email delivery failure',
          statusCode: 500,
          metadata: {
            responseTime,
            simulatedFailure: true,
          },
        };
      }

      const responseTime = Date.now() - startTime;
      this.updateStats(true, responseTime);

      const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      logger.info('Mock email sent successfully', {
        provider: this.name,
        to: Array.isArray(request.to) ? request.to.length : 1,
        subject: request.subject,
        messageId,
        responseTime,
      });

      return {
        success: true,
        messageId,
        provider: this.name,
        statusCode: 200,
        metadata: {
          responseTime,
          sentAt: new Date().toISOString(),
          recipient: request.to,
          mockProvider: true,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateStats(false, responseTime);

      logger.error('Mock email sending failed', error as Error, {
        provider: this.name,
        to: request.to,
        subject: request.subject,
        responseTime,
      });

      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown mock error',
        statusCode: 500,
        metadata: {
          responseTime,
          mockProvider: true,
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
      logger.info('Starting mock bulk email send', {
        provider: this.name,
        emailCount: request.emails.length,
        batchSize: request.batchSize || 100,
      });

      // Process emails in batches
      const batchSize = request.batchSize || 100;
      const batches = [];
      
      for (let i = 0; i < request.emails.length; i += batchSize) {
        batches.push(request.emails.slice(i, i + batchSize));
      }

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Simulate batch processing delay
        await new Promise(resolve => setTimeout(resolve, 50));

        // Process batch results
        for (let i = 0; i < batch.length; i++) {
          const email = batch[i];
          
          // Simulate occasional failures (10% failure rate)
          const isFailure = Math.random() < 0.1;
          
          if (isFailure) {
            results.push({
              success: false,
              provider: this.name,
              error: 'Simulated batch email failure',
              statusCode: 500,
              metadata: {
                batchIndex,
                indexInBatch: i,
                recipient: Array.isArray(email.to) ? email.to[0] : email.to,
                mockProvider: true,
              },
            });
            totalFailed++;
          } else {
            const messageId = `mock-bulk-${Date.now()}-${batchIndex}-${i}`;
            results.push({
              success: true,
              messageId,
              provider: this.name,
              statusCode: 200,
              metadata: {
                batchIndex,
                indexInBatch: i,
                recipient: Array.isArray(email.to) ? email.to[0] : email.to,
                sentAt: new Date().toISOString(),
                mockProvider: true,
              },
            });
            totalSent++;
          }
        }

        logger.info(`Mock batch ${batchIndex + 1}/${batches.length} processed`, {
          provider: this.name,
          batchSize: batch.length,
          totalSent,
          totalFailed,
        });
      }

      const totalTime = Date.now() - startTime;
      
      logger.info('Mock bulk email send completed', {
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
        batchId: `mock-bulk-${Date.now()}`,
        metadata: {
          totalTime,
          batches: batches.length,
          avgTimePerEmail: totalTime / request.emails.length,
          mockProvider: true,
        },
      };

    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      logger.error('Mock bulk email send failed', error as Error, {
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
          error: error instanceof Error ? error.message : 'Unknown error',
          mockProvider: true,
        },
      };
    }
  }

  async validateTemplate(templateId: string): Promise<boolean> {
    // Mock template validation - always return true for testing
    logger.info('Mock template validation', {
      provider: this.name,
      templateId,
      result: true,
    });
    return true;
  }

  async getDeliveryStatus(messageId: string): Promise<any> {
    // Mock delivery status
    const statuses = ['delivered', 'opened', 'clicked', 'bounced'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      messageId,
      status: randomStatus,
      provider: this.name,
      deliveredAt: new Date().toISOString(),
      mockProvider: true,
    };
  }

  async healthCheck(): Promise<boolean> {
    // Mock health check - always healthy
    logger.info('Mock health check completed', {
      provider: this.name,
      healthy: true,
    });
    return true;
  }
}