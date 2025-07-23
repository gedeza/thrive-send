import { errorLogger } from '../error/errorLogger';

export interface LogContext {
  organizationId?: string;
  campaignId?: string;
  jobId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('info', message, context);
    console.log(formattedMessage);
  }

  warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('warn', message, context);
    console.warn(formattedMessage);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const formattedMessage = this.formatMessage('error', message, context);
    console.error(formattedMessage);
    
    if (error) {
      console.error('Error details:', error);
    }

    // Log to error tracking system
    errorLogger.log(error instanceof Error ? error : new Error(message), {
      variant: 'error',
      context: { ...context, originalMessage: message },
    });
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage('debug', message, context);
      console.debug(formattedMessage);
    }
  }

  // Queue-specific logging methods
  queueEvent(event: string, jobId: string, context?: LogContext): void {
    this.info(`Queue Event: ${event}`, { 
      jobId, 
      event,
      ...context 
    });
  }

  jobProcessing(jobId: string, jobType: string, context?: LogContext): void {
    this.info(`Processing job: ${jobType}`, { 
      jobId, 
      jobType,
      status: 'processing',
      ...context 
    });
  }

  jobCompleted(jobId: string, duration: number, context?: LogContext): void {
    this.info(`Job completed`, { 
      jobId, 
      duration: `${duration}ms`,
      status: 'completed',
      ...context 
    });
  }

  jobFailed(jobId: string, error: Error, attempts: number, context?: LogContext): void {
    this.error(`Job failed`, error, { 
      jobId, 
      attempts,
      status: 'failed',
      ...context 
    });
  }

  // Email-specific logging methods
  emailSent(recipient: string, subject: string, context?: LogContext): void {
    this.info(`Email sent successfully`, { 
      recipient, 
      subject,
      action: 'email_sent',
      ...context 
    });
  }

  emailFailed(recipient: string, error: Error, context?: LogContext): void {
    this.error(`Email delivery failed`, error, { 
      recipient,
      action: 'email_failed',
      ...context 
    });
  }

  bulkEmailProgress(sent: number, total: number, context?: LogContext): void {
    this.info(`Bulk email progress: ${sent}/${total}`, { 
      sent, 
      total,
      progress: `${Math.round((sent / total) * 100)}%`,
      action: 'bulk_email_progress',
      ...context 
    });
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, { 
      operation, 
      duration: `${duration}ms`,
      type: 'performance',
      ...context 
    });
  }

  // Security logging
  security(event: string, severity: 'low' | 'medium' | 'high', context?: LogContext): void {
    const message = `Security Event: ${event}`;
    
    if (severity === 'high') {
      this.error(message, undefined, { 
        severity, 
        type: 'security',
        ...context 
      });
    } else if (severity === 'medium') {
      this.warn(message, { 
        severity, 
        type: 'security',
        ...context 
      });
    } else {
      this.info(message, { 
        severity, 
        type: 'security',
        ...context 
      });
    }
  }
}

export const logger = Logger.getInstance();