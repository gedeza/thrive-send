/**
 * Real-time Feedback System
 * Provides instant optimization feedback with severity levels
 */

import { InterceptionResult, OverallMetrics } from './optimization-hook-system';
import { OptimizationResult } from './optimization-hook-system';

export interface FeedbackConfig {
  enabled: boolean;
  displayMode: 'console' | 'notification' | 'both';
  severityLevels: {
    error: boolean;
    warning: boolean;
    info: boolean;
  };
  thresholds: {
    performance: number;
    security: number;
    maintainability: number;
    cost: number;
  };
  animations: boolean;
  sound: boolean;
  persistence: boolean;
}

export interface FeedbackMessage {
  id: string;
  timestamp: number;
  severity: 'error' | 'warning' | 'info' | 'success';
  category: 'performance' | 'security' | 'maintainability' | 'cost';
  title: string;
  message: string;
  suggestions: string[];
  filePath: string;
  autofix?: boolean;
  metrics: OverallMetrics;
}

export class RealTimeFeedbackSystem {
  private static instance: RealTimeFeedbackSystem;
  private config: FeedbackConfig;
  private messageQueue: FeedbackMessage[] = [];
  private listeners: Map<string, Function[]> = new Map();
  private notificationPermission: NotificationPermission = 'default';

  private constructor(config: FeedbackConfig) {
    this.config = config;
    this.initializeNotifications();
    this.setupEventListeners();
  }

  public static getInstance(config?: FeedbackConfig): RealTimeFeedbackSystem {
    if (!RealTimeFeedbackSystem.instance) {
      RealTimeFeedbackSystem.instance = new RealTimeFeedbackSystem(config || {
        enabled: true,
        displayMode: 'both',
        severityLevels: {
          error: true,
          warning: true,
          info: true
        },
        thresholds: {
          performance: 70,
          security: 80,
          maintainability: 70,
          cost: 75
        },
        animations: true,
        sound: true,
        persistence: true
      });
    }
    return RealTimeFeedbackSystem.instance;
  }

  private async initializeNotifications(): Promise<void> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  private setupEventListeners(): void {
    // Listen for optimization results
    this.on('optimization:result', this.handleOptimizationResult.bind(this));
    
    // Listen for performance metrics
    this.on('performance:threshold', this.handlePerformanceThreshold.bind(this));
    
    // Listen for security violations
    this.on('security:violation', this.handleSecurityViolation.bind(this));
  }

  public processFeedback(filePath: string, result: InterceptionResult): void {
    if (!this.config.enabled) return;

    const messages = this.generateFeedbackMessages(filePath, result);
    
    messages.forEach(message => {
      this.addMessage(message);
      this.displayMessage(message);
    });
  }

  private generateFeedbackMessages(filePath: string, result: InterceptionResult): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    
    // Generate messages for each optimization result
    result.results.forEach(optimizationResult => {
      if (!optimizationResult.passed) {
        const message = this.createFeedbackMessage(filePath, optimizationResult, result.metrics);
        messages.push(message);
      }
    });
    
    // Generate overall performance message
    if (result.metrics.overallScore < 50) {
      messages.push(this.createPerformanceMessage(filePath, result.metrics, result.recommendations));
    }
    
    return messages;
  }

  private createFeedbackMessage(
    filePath: string,
    result: OptimizationResult,
    metrics: OverallMetrics
  ): FeedbackMessage {
    return {
      id: this.generateId(),
      timestamp: Date.now(),
      severity: this.mapSeverity(result.severity),
      category: this.determineCategory(result.message),
      title: this.generateTitle(result),
      message: result.message,
      suggestions: result.suggestions,
      filePath,
      autofix: !!result.autofix,
      metrics
    };
  }

  private createPerformanceMessage(
    filePath: string,
    metrics: OverallMetrics,
    recommendations: string[]
  ): FeedbackMessage {
    return {
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'warning',
      category: 'performance',
      title: 'Performance Optimization Needed',
      message: `Overall score: ${metrics.overallScore.toFixed(1)}`,
      suggestions: recommendations,
      filePath,
      autofix: false,
      metrics
    };
  }

  private mapSeverity(severity: 'error' | 'warning' | 'info'): 'error' | 'warning' | 'info' | 'success' {
    return severity;
  }

  private determineCategory(message: string): 'performance' | 'security' | 'maintainability' | 'cost' {
    const categoryMap: Record<string, 'performance' | 'security' | 'maintainability' | 'cost'> = {
      'performance': 'performance',
      'security': 'security',
      'maintainability': 'maintainability',
      'cost': 'cost',
      'query': 'performance',
      'authentication': 'security',
      'complexity': 'maintainability',
      'memory': 'cost'
    };
    
    const lowerMessage = message.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerMessage.includes(keyword)) {
        return category;
      }
    }
    
    return 'maintainability';
  }

  private generateTitle(result: OptimizationResult): string {
    const severityEmoji = {
      error: '🔴',
      warning: '🟡',
      info: '🔵'
    };
    
    const categoryEmoji = {
      performance: '⚡',
      security: '🔒',
      maintainability: '🔧',
      cost: '💰'
    };
    
    const category = this.determineCategory(result.message);
    return `${severityEmoji[result.severity]} ${categoryEmoji[category]} ${result.message}`;
  }

  private addMessage(message: FeedbackMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
    
    // Emit event
    this.emit('message:added', message);
  }

  private displayMessage(message: FeedbackMessage): void {
    if (!this.config.severityLevels[message.severity]) return;
    
    if (this.config.displayMode === 'console' || this.config.displayMode === 'both') {
      this.displayConsoleMessage(message);
    }
    
    if (this.config.displayMode === 'notification' || this.config.displayMode === 'both') {
      this.displayNotification(message);
    }
    
    if (this.config.sound) {
      this.playSound(message.severity);
    }
  }

  private displayConsoleMessage(message: FeedbackMessage): void {
    const styles = this.getConsoleStyles(message.severity);
    const fileName = message.filePath.split('/').pop();
    
    console.group(`${styles.emoji} ${message.title} - ${fileName}`);
    console.log(`%c${message.message}`, styles.message);
    
    if (message.suggestions.length > 0) {
      console.log('%c💡 Suggestions:', 'color: #2196F3; font-weight: bold');
      message.suggestions.forEach(suggestion => {
        console.log(`  • ${suggestion}`);
      });
    }
    
    console.log('%c📊 Metrics:', 'color: #9C27B0; font-weight: bold');
    console.table(message.metrics);
    
    if (message.autofix) {
      console.log('%c🔧 Autofix available', 'color: #4CAF50; font-weight: bold');
    }
    
    console.groupEnd();
  }

  private displayNotification(message: FeedbackMessage): void {
    if (this.notificationPermission !== 'granted') return;
    
    const notification = new Notification(message.title, {
      body: message.message,
      icon: this.getNotificationIcon(message.severity),
      tag: `optimization-${message.id}`,
      requireInteraction: message.severity === 'error',
      actions: message.autofix ? [{
        action: 'autofix',
        title: 'Apply Autofix'
      }] : []
    });
    
    notification.onclick = () => {
      this.handleNotificationClick(message);
    };
    
    // Auto-close after 5 seconds for non-error messages
    if (message.severity !== 'error') {
      setTimeout(() => notification.close(), 5000);
    }
  }

  private getConsoleStyles(severity: 'error' | 'warning' | 'info' | 'success'): any {
    const styles = {
      error: {
        emoji: '🔴',
        message: 'color: #F44336; font-weight: bold; background: #FFEBEE; padding: 4px 8px; border-radius: 4px'
      },
      warning: {
        emoji: '🟡',
        message: 'color: #FF9800; font-weight: bold; background: #FFF3E0; padding: 4px 8px; border-radius: 4px'
      },
      info: {
        emoji: '🔵',
        message: 'color: #2196F3; font-weight: bold; background: #E3F2FD; padding: 4px 8px; border-radius: 4px'
      },
      success: {
        emoji: '🟢',
        message: 'color: #4CAF50; font-weight: bold; background: #E8F5E8; padding: 4px 8px; border-radius: 4px'
      }
    };
    
    return styles[severity];
  }

  private getNotificationIcon(severity: 'error' | 'warning' | 'info' | 'success'): string {
    const icons = {
      error: '🔴',
      warning: '🟡',
      info: '🔵',
      success: '🟢'
    };
    
    return icons[severity];
  }

  private playSound(severity: 'error' | 'warning' | 'info' | 'success'): void {
    if (typeof window === 'undefined') return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different severities
    const frequencies = {
      error: 800,
      warning: 600,
      info: 400,
      success: 200
    };
    
    oscillator.frequency.value = frequencies[severity];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  private handleNotificationClick(message: FeedbackMessage): void {
    this.emit('notification:clicked', message);
  }

  private handleOptimizationResult(result: InterceptionResult): void {
    console.log('🔍 Optimization result processed:', result);
  }

  private handlePerformanceThreshold(metrics: OverallMetrics): void {
    if (metrics.performance < this.config.thresholds.performance) {
      console.warn('⚠️ Performance threshold breached:', metrics.performance);
    }
  }

  private handleSecurityViolation(violation: any): void {
    console.error('🔒 Security violation detected:', violation);
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Message management
  public getMessages(): FeedbackMessage[] {
    return [...this.messageQueue];
  }

  public getMessagesByFile(filePath: string): FeedbackMessage[] {
    return this.messageQueue.filter(msg => msg.filePath === filePath);
  }

  public getMessagesBySeverity(severity: 'error' | 'warning' | 'info' | 'success'): FeedbackMessage[] {
    return this.messageQueue.filter(msg => msg.severity === severity);
  }

  public clearMessages(): void {
    this.messageQueue = [];
    this.emit('messages:cleared');
  }

  public clearMessagesByFile(filePath: string): void {
    this.messageQueue = this.messageQueue.filter(msg => msg.filePath !== filePath);
    this.emit('messages:cleared:file', filePath);
  }

  // Configuration
  public updateConfig(newConfig: Partial<FeedbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config:updated', this.config);
  }

  public getConfig(): FeedbackConfig {
    return { ...this.config };
  }

  // Statistics
  public getStatistics(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byFile: Record<string, number>;
  } {
    const stats = {
      total: this.messageQueue.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byFile: {} as Record<string, number>
    };
    
    this.messageQueue.forEach(msg => {
      stats.byCategory[msg.category] = (stats.byCategory[msg.category] || 0) + 1;
      stats.bySeverity[msg.severity] = (stats.bySeverity[msg.severity] || 0) + 1;
      stats.byFile[msg.filePath] = (stats.byFile[msg.filePath] || 0) + 1;
    });
    
    return stats;
  }

  public enable(): void {
    this.config.enabled = true;
    this.emit('system:enabled');
  }

  public disable(): void {
    this.config.enabled = false;
    this.emit('system:disabled');
  }
}

// Export singleton
export const feedbackSystem = RealTimeFeedbackSystem.getInstance();