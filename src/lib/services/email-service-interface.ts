// Email service interface for worker processing
export interface EmailServiceProvider {
  name: string;
  send(emailData: SendEmailRequest): Promise<SendEmailResponse>;
  sendBulk?(emails: SendEmailRequest[]): Promise<SendEmailResponse[]>;
}

export interface SendEmailRequest {
  to: string | string[];
  subject: string;
  content: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType: string;
  }>;
  metadata?: Record<string, any>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

// Basic mock email service for testing
export class MockEmailService implements EmailServiceProvider {
  name = 'mock';

  async send(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) { // 10% failure rate
      return {
        success: false,
        provider: this.name,
        error: 'Simulated random email delivery failure',
        statusCode: 500,
      };
    }

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: this.name,
      statusCode: 200,
      metadata: {
        sentAt: new Date().toISOString(),
        recipient: emailData.to,
      },
    };
  }

  async sendBulk(emails: SendEmailRequest[]): Promise<SendEmailResponse[]> {
    // Process emails in parallel for bulk sending
    const results = await Promise.all(
      emails.map(email => this.send(email))
    );
    return results;
  }
}