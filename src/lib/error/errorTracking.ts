import { ErrorLog } from "./errorLogger";

export interface ErrorTrackingConfig {
  dsn: string;
  environment: string;
  release?: string;
  sampleRate?: number;
}

export interface ErrorTrackingService {
  init(config: ErrorTrackingConfig): void;
  captureError(error: Error | string, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
  setUser(user: { id?: string; email?: string }): void;
  setTag(key: string, value: string): void;
  setExtra(key: string, value: unknown): void;
}

class DefaultErrorTracking implements ErrorTrackingService {
  private initialized = false;
  private config: ErrorTrackingConfig | null = null;

  init(config: ErrorTrackingConfig): void {
    this.config = config;
    this.initialized = true;
    console.log('Error tracking initialized with config:', config);
  }

  captureError(error: Error | string, context?: Record<string, unknown>): void {
    if (!this.initialized) {
      console.error('Error tracking not initialized');
      return;
    }

    const errorLog: ErrorLog = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      variant: 'error',
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    // TODO: Implement actual error tracking service integration
    console.error('Error captured:', errorLog);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized) {
      console.error('Error tracking not initialized');
      return;
    }

    // TODO: Implement actual error tracking service integration
    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  setUser(user: { id?: string; email?: string }): void {
    if (!this.initialized) {
      console.error('Error tracking not initialized');
      return;
    }

    // TODO: Implement actual error tracking service integration
    console.log('User set:', user);
  }

  setTag(key: string, value: string): void {
    if (!this.initialized) {
      console.error('Error tracking not initialized');
      return;
    }

    // TODO: Implement actual error tracking service integration
    console.log(`Tag set: ${key}=${value}`);
  }

  setExtra(key: string, value: unknown): void {
    if (!this.initialized) {
      console.error('Error tracking not initialized');
      return;
    }

    // TODO: Implement actual error tracking service integration
    console.log(`Extra set: ${key}=`, value);
  }
}

export const errorTracking = new DefaultErrorTracking(); 