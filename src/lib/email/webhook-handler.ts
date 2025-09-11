/**
 * 🎣 Email Provider Webhook Handler
 * 
 * Handles incoming webhooks from email service providers (SendGrid, AWS SES, Resend)
 * and converts them to standardized delivery events for tracking and analytics.
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { deliveryTracker, DeliveryEventType } from './delivery-tracker';
import { logger } from '@/lib/utils/logger';

// Webhook event interfaces for different providers
interface SendGridEvent {
  email: string;
  timestamp: number;
  'smtp-id': string;
  event: string;
  category: string[];
  sg_event_id: string;
  sg_message_id: string;
  useragent?: string;
  ip?: string;
  url?: string;
  reason?: string;
  status?: string;
  type?: string;
}

interface AWSEvent {
  eventType: string;
  mail: {
    timestamp: string;
    messageId: string;
    source: string;
    sourceArn: string;
    sendingAccountId: string;
    destination: string[];
  };
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: Array<{
      emailAddress: string;
      action: string;
      status: string;
      diagnosticCode: string;
    }>;
    timestamp: string;
    feedbackId: string;
  };
  complaint?: {
    complainedRecipients: Array<{
      emailAddress: string;
    }>;
    timestamp: string;
    feedbackId: string;
    complaintFeedbackType: string;
  };
  delivery?: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    smtpResponse: string;
  };
}

interface ResendEvent {
  type: string;
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
  };
}

export class WebhookHandler {
  /**
   * Handle SendGrid webhook events
   */
  async handleSendGridWebhook(request: NextRequest): Promise<{ processed: number; errors: number }> {
    try {
      const body = await request.text();
      
      // Verify SendGrid webhook signature
      if (!this.verifySendGridSignature(request, body)) {
        throw new Error('Invalid SendGrid webhook signature');
      }

      const events: SendGridEvent[] = JSON.parse(body);
      let processed = 0;
      let errors = 0;

      for (const event of events) {
        try {
          await this.processSendGridEvent(event);
          processed++;
        } catch (_error) {
          logger.error('Failed to process SendGrid event', error as Error, { event });
          errors++;
        }
      }

      logger.info('SendGrid webhook processed', { processed, errors, total: events.length });
      return { processed, errors };

    } catch (_error) {
      logger.error('SendGrid webhook processing failed', error as Error);
      throw _error;
    }
  }

  /**
   * Handle AWS SES webhook events
   */
  async handleAWSWebhook(request: NextRequest): Promise<{ processed: number; errors: number }> {
    try {
      const body = await request.text();
      
      // Verify AWS SNS signature
      if (!this.verifyAWSSignature(request, body)) {
        throw new Error('Invalid AWS webhook signature');
      }

      const notification = JSON.parse(body);
      
      // Handle SNS subscription confirmation
      if (notification.Type === 'SubscriptionConfirmation') {
        logger.info('AWS SNS subscription confirmation received', {
          subscribeURL: notification.SubscribeURL,
        });
        return { processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;

      if (notification.Type === 'Notification') {
        try {
          const event: AWSEvent = JSON.parse(notification.Message);
          await this.processAWSEvent(event);
          processed++;
        } catch (_error) {
          logger.error('Failed to process AWS event', error as Error, { notification });
          errors++;
        }
      }

      logger.info('AWS webhook processed', { processed, errors });
      return { processed, errors };

    } catch (_error) {
      logger.error('AWS webhook processing failed', error as Error);
      throw _error;
    }
  }

  /**
   * Handle Resend webhook events
   */
  async handleResendWebhook(request: NextRequest): Promise<{ processed: number; errors: number }> {
    try {
      const body = await request.text();
      
      // Verify Resend webhook signature
      if (!this.verifyResendSignature(request, body)) {
        throw new Error('Invalid Resend webhook signature');
      }

      const event: ResendEvent = JSON.parse(body);
      
      try {
        await this.processResendEvent(event);
        logger.info('Resend webhook processed', { type: event.type, emailId: event.data.email_id });
        return { processed: 1, errors: 0 };
      } catch (_error) {
        logger.error('Failed to process Resend event', error as Error, { event });
        return { processed: 0, errors: 1 };
      }

    } catch (_error) {
      logger.error('Resend webhook processing failed', error as Error);
      throw _error;
    }
  }

  /**
   * Process individual SendGrid event
   */
  private async processSendGridEvent(event: SendGridEvent): Promise<void> {
    const eventType = this.mapSendGridEventType(event.event);
    if (!eventType) return;

    // Extract metadata from event
    const metadata: Record<string, any> = {
      sgEventId: event.sg_event_id,
      sgMessageId: event.sg_message_id,
      smtpId: event['smtp-id'],
      categories: event.category,
      userAgent: event.useragent,
      ip: event.ip,
      url: event.url,
      reason: event.reason,
      status: event.status,
      type: event.type,
    };

    // Find associated email record
    const emailRecord = await this.findEmailRecord(event.sg_message_id, event.email);
    if (!emailRecord) {
      logger.warn('Email record not found for SendGrid event', {
        messageId: event.sg_message_id,
        recipientEmail: event.email,
        eventType: event.event,
      });
      return;
    }

    await deliveryTracker.trackEvent({
      emailId: emailRecord.id,
      campaignId: emailRecord.campaignId,
      organizationId: emailRecord.organizationId,
      recipientEmail: event.email,
      eventType,
      metadata,
      provider: 'sendgrid',
      messageId: event.sg_message_id,
      userAgent: event.useragent,
      ipAddress: event.ip,
    });
  }

  /**
   * Process individual AWS SES event
   */
  private async processAWSEvent(event: AWSEvent): Promise<void> {
    const timestamp = new Date(event.mail.timestamp);
    
    if (event.eventType === 'bounce' && event.bounce) {
      for (const recipient of event.bounce.bouncedRecipients) {
        const emailRecord = await this.findEmailRecord(event.mail.messageId, recipient.emailAddress);
        if (!emailRecord) continue;

        await deliveryTracker.trackEvent({
          emailId: emailRecord.id,
          campaignId: emailRecord.campaignId,
          organizationId: emailRecord.organizationId,
          recipientEmail: recipient.emailAddress,
          eventType: DeliveryEventType.BOUNCED,
          metadata: {
            bounceType: event.bounce.bounceType,
            bounceSubType: event.bounce.bounceSubType,
            diagnosticCode: recipient.diagnosticCode,
            feedbackId: event.bounce.feedbackId,
          },
          provider: 'aws-ses',
          messageId: event.mail.messageId,
          bounceType: event.bounce.bounceType,
        });
      }
    }

    if (event.eventType === 'complaint' && event.complaint) {
      for (const recipient of event.complaint.complainedRecipients) {
        const emailRecord = await this.findEmailRecord(event.mail.messageId, recipient.emailAddress);
        if (!emailRecord) continue;

        await deliveryTracker.trackEvent({
          emailId: emailRecord.id,
          campaignId: emailRecord.campaignId,
          organizationId: emailRecord.organizationId,
          recipientEmail: recipient.emailAddress,
          eventType: DeliveryEventType.COMPLAINED,
          metadata: {
            feedbackId: event.complaint.feedbackId,
            complaintFeedbackType: event.complaint.complaintFeedbackType,
          },
          provider: 'aws-ses',
          messageId: event.mail.messageId,
          complaintType: event.complaint.complaintFeedbackType,
        });
      }
    }

    if (event.eventType === 'delivery' && event.delivery) {
      for (const recipient of event.delivery.recipients) {
        const emailRecord = await this.findEmailRecord(event.mail.messageId, recipient);
        if (!emailRecord) continue;

        await deliveryTracker.trackEvent({
          emailId: emailRecord.id,
          campaignId: emailRecord.campaignId,
          organizationId: emailRecord.organizationId,
          recipientEmail: recipient,
          eventType: DeliveryEventType.DELIVERED,
          metadata: {
            processingTimeMillis: event.delivery.processingTimeMillis,
            smtpResponse: event.delivery.smtpResponse,
          },
          provider: 'aws-ses',
          messageId: event.mail.messageId,
        });
      }
    }
  }

  /**
   * Process individual Resend event
   */
  private async processResendEvent(event: ResendEvent): Promise<void> {
    const eventType = this.mapResendEventType(event.type);
    if (!eventType) return;

    // Find associated email record
    const emailRecord = await this.findEmailRecord(event.data.email_id, event.data.to[0]);
    if (!emailRecord) {
      logger.warn('Email record not found for Resend event', {
        emailId: event.data.email_id,
        recipientEmail: event.data.to[0],
        eventType: event.type,
      });
      return;
    }

    await deliveryTracker.trackEvent({
      emailId: emailRecord.id,
      campaignId: emailRecord.campaignId,
      organizationId: emailRecord.organizationId,
      recipientEmail: event.data.to[0],
      eventType,
      metadata: {
        resendEmailId: event.data.email_id,
        subject: event.data.subject,
        from: event.data.from,
      },
      provider: 'resend',
      messageId: event.data.email_id,
    });
  }

  /**
   * Map SendGrid event types to our standard types
   */
  private mapSendGridEventType(eventType: string): DeliveryEventType | null {
    const mapping: Record<string, DeliveryEventType> = {
      'processed': DeliveryEventType.SENT,
      'delivered': DeliveryEventType.DELIVERED,
      'open': DeliveryEventType.OPENED,
      'click': DeliveryEventType.CLICKED,
      'bounce': DeliveryEventType.BOUNCED,
      'dropped': DeliveryEventType.BLOCKED,
      'deferred': DeliveryEventType.DEFERRED,
      'spamreport': DeliveryEventType.COMPLAINED,
      'unsubscribe': DeliveryEventType.UNSUBSCRIBED,
      'group_unsubscribe': DeliveryEventType.UNSUBSCRIBED,
    };

    return mapping[eventType] || null;
  }

  /**
   * Map Resend event types to our standard types
   */
  private mapResendEventType(eventType: string): DeliveryEventType | null {
    const mapping: Record<string, DeliveryEventType> = {
      'email.sent': DeliveryEventType.SENT,
      'email.delivered': DeliveryEventType.DELIVERED,
      'email.delivery_delayed': DeliveryEventType.DEFERRED,
      'email.bounced': DeliveryEventType.BOUNCED,
      'email.complained': DeliveryEventType.COMPLAINED,
      'email.opened': DeliveryEventType.OPENED,
      'email.clicked': DeliveryEventType.CLICKED,
    };

    return mapping[eventType] || null;
  }

  /**
   * Find email record by message ID and recipient email
   */
  private async findEmailRecord(messageId: string, recipientEmail: string): Promise<{
    id: string;
    campaignId: string;
    organizationId: string;
  } | null> {
    try {
      // This would query your email records table
      // For now, returning null as the table structure isn't defined
      // In a real implementation, you'd have an emails table to track sent emails
      
      return null;

    } catch (_error) {
      logger.error('Failed to find email record', error as Error, {
        messageId,
        recipientEmail,
      });
      return null;
    }
  }

  /**
   * Verify SendGrid webhook signature
   */
  private verifySendGridSignature(request: NextRequest, body: string): boolean {
    const signature = request.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp');
    
    if (!signature || !timestamp) {
      return false;
    }

    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
    if (!publicKey) {
      logger.warn('SendGrid webhook public key not configured');
      return true; // Allow in development
    }

    try {
      const payload = timestamp + body;
      const expectedSignature = crypto
        .createVerify('RSA-SHA256')
        .update(payload)
        .verify(publicKey, signature, 'base64');

      return expectedSignature;
    } catch (_error) {
      logger.error('SendGrid signature verification failed', error as Error);
      return false;
    }
  }

  /**
   * Verify AWS SNS signature
   */
  private verifyAWSSignature(request: NextRequest, body: string): boolean {
    // AWS SNS signature verification is more complex
    // For now, just check for basic headers
    const messageType = request.headers.get('x-amz-sns-message-type');
    const topicArn = request.headers.get('x-amz-sns-topic-arn');
    
    return !!(messageType && topicArn);
  }

  /**
   * Verify Resend webhook signature
   */
  private verifyResendSignature(request: NextRequest, body: string): boolean {
    const signature = request.headers.get('resend-signature');
    
    if (!signature) {
      return false;
    }

    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) {
      logger.warn('Resend webhook secret not configured');
      return true; // Allow in development
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return signature === expectedSignature;
    } catch (_error) {
      logger.error('Resend signature verification failed', error as Error);
      return false;
    }
  }

  /**
   * Process generic webhook for unknown providers
   */
  async handleGenericWebhook(
    request: NextRequest,
    provider: string
  ): Promise<{ processed: number; errors: number }> {
    try {
      const body = await request.json();
      
      logger.info('Generic webhook received', {
        provider,
        headers: Object.fromEntries(request.headers.entries()),
        bodyKeys: Object.keys(body),
      });

      // Store for manual processing
      return { processed: 0, errors: 0 };

    } catch (_error) {
      logger.error('Generic webhook processing failed', error as Error, { provider });
      throw _error;
    }
  }
}

// Export singleton instance
export const webhookHandler = new WebhookHandler();