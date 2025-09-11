import { ErrorVariant } from "@/components/error/ErrorMessage";

export interface ErrorLog {
  id: string;
  timestamp: string;
  variant: ErrorVariant;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  component?: string;
  user?: {
    id?: string;
    email?: string;
  };
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private truncateLogs(): void {
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }
  }

  private async sendToErrorTracking(error: ErrorLog): Promise<void> {
    // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
    console.error("", _error);
  }

  log(
    error: Error | string,
    options: {
      variant?: ErrorVariant;
      context?: Record<string, unknown>;
      component?: string;
      user?: {
        id?: string;
        email?: string;
      };
    } = {}
  ): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      variant: options.variant || 'error',
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context: options.context,
      component: options.component,
      user: options.user,
    };

    this.logs.push(errorLog);
    this.truncateLogs();

    // Send to error tracking service
    this.sendToErrorTracking(errorLog).catch(console.error);

    return errorLog.id;
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getLogById(id: string): ErrorLog | undefined {
    return this.logs.find(log => log.id === id);
  }

  clearLogs(): void {
    this.logs = [];
  }

  async flush(): Promise<void> {
    // TODO: Implement log flushing to persistent storage
    console.log('Log flushing not implemented');
  }
}

export const errorLogger = ErrorLogger.getInstance(); 