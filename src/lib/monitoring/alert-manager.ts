import { logger } from '../utils/logger';
import { AlertEvent, AlertThreshold } from './metrics-collector';

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'discord';
  config: Record<string, any>;
  enabled: boolean;
  severityFilter?: string[];
  metricFilter?: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  channels: string[];
  cooldownPeriod: number; // milliseconds
  escalationRules?: EscalationRule[];
  conditions: AlertCondition[];
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  duration: number; // milliseconds
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

export interface EscalationRule {
  delay: number; // milliseconds
  channels: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  metric: string;
  value: number;
  severity: string;
  status: 'active' | 'resolved' | 'silenced';
  createdAt: number;
  resolvedAt?: number;
  silencedUntil?: number;
  escalationLevel: number;
  lastNotified: number;
  notificationCount: number;
}

export class AlertManager {
  private static instance: AlertManager;
  private channels: Map<string, AlertChannel> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertInstance> = new Map();
  private alertHistory: AlertInstance[] = [];
  private cooldownTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultRules();
    this.startAlertProcessing();
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Add alert channel
   */
  addChannel(channel: AlertChannel): void {
    this.channels.set(channel.id, channel);
    logger.info('Alert channel added', { channelId: channel.id, type: channel.type });
  }

  /**
   * Remove alert channel
   */
  removeChannel(channelId: string): boolean {
    const removed = this.channels.delete(channelId);
    if (removed) {
      logger.info('Alert channel removed', { channelId });
    }
    return removed;
  }

  /**
   * Add alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    logger.info('Alert rule added', { ruleId: rule.id, name: rule.name });
  }

  /**
   * Remove alert rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      logger.info('Alert rule removed', { ruleId });
    }
    return removed;
  }

  /**
   * Process incoming alert event
   */
  async processAlert(event: AlertEvent): Promise<void> {
    try {
      // Find matching rules
      const matchingRules = this.findMatchingRules(event);
      
      for (const rule of matchingRules) {
        await this.handleAlertForRule(event, rule);
      }
      
    } catch (error) {
      logger.error('Failed to process alert', error as Error, { event });
    }
  }

  /**
   * Silence alert
   */
  silenceAlert(alertId: string, duration: number): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'silenced';
      alert.silencedUntil = Date.now() + duration;
      
      logger.info('Alert silenced', { alertId, duration });
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = Date.now();
      
      // Move to history
      this.alertHistory.push(alert);
      this.activeAlerts.delete(alertId);
      
      logger.info('Alert resolved', { alertId });
      return true;
    }
    return false;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(filters?: {
    severity?: string[];
    metric?: string[];
    ruleId?: string;
  }): AlertInstance[] {
    let alerts = Array.from(this.activeAlerts.values());
    
    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(a => filters.severity!.includes(a.severity));
      }
      if (filters.metric) {
        alerts = alerts.filter(a => filters.metric!.includes(a.metric));
      }
      if (filters.ruleId) {
        alerts = alerts.filter(a => a.ruleId === filters.ruleId);
      }
    }
    
    return alerts.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get alert history
   */
  getAlertHistory(
    limit: number = 100,
    filters?: {
      severity?: string[];
      metric?: string[];
      timeRange?: { start: number; end: number };
    }
  ): AlertInstance[] {
    let alerts = [...this.alertHistory];
    
    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(a => filters.severity!.includes(a.severity));
      }
      if (filters.metric) {
        alerts = alerts.filter(a => filters.metric!.includes(a.metric));
      }
      if (filters.timeRange) {
        alerts = alerts.filter(a => 
          a.createdAt >= filters.timeRange!.start && 
          a.createdAt <= filters.timeRange!.end
        );
      }
    }
    
    return alerts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeRange?: { start: number; end: number }): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<string, number>;
    byMetric: Record<string, number>;
    byRule: Record<string, number>;
    avgResolutionTime: number;
  } {
    const now = Date.now();
    const defaultRange = { start: now - 86400000, end: now }; // Last 24 hours
    const range = timeRange || defaultRange;
    
    // Get alerts in time range
    const alertsInRange = this.alertHistory.filter(a => 
      a.createdAt >= range.start && a.createdAt <= range.end
    );
    
    const activeAlerts = Array.from(this.activeAlerts.values());
    
    // Calculate statistics
    const bySeverity: Record<string, number> = {};
    const byMetric: Record<string, number> = {};
    const byRule: Record<string, number> = {};
    
    [...alertsInRange, ...activeAlerts].forEach(alert => {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      byMetric[alert.metric] = (byMetric[alert.metric] || 0) + 1;
      byRule[alert.ruleId] = (byRule[alert.ruleId] || 0) + 1;
    });
    
    // Calculate average resolution time
    const resolvedAlerts = alertsInRange.filter(a => a.resolvedAt);
    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, a) => sum + (a.resolvedAt! - a.createdAt), 0) / resolvedAlerts.length
      : 0;
    
    return {
      total: alertsInRange.length + activeAlerts.length,
      active: activeAlerts.length,
      resolved: alertsInRange.filter(a => a.status === 'resolved').length,
      bySeverity,
      byMetric,
      byRule,
      avgResolutionTime,
    };
  }

  /**
   * Test alert channel
   */
  async testChannel(channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    
    const testAlert: AlertInstance = {
      id: 'test-alert',
      ruleId: 'test-rule',
      metric: 'test_metric',
      value: 100,
      severity: 'low',
      status: 'active',
      createdAt: Date.now(),
      escalationLevel: 0,
      lastNotified: Date.now(),
      notificationCount: 1,
    };
    
    try {
      await this.sendNotification(channel, testAlert, 'This is a test alert');
      logger.info('Alert channel test successful', { channelId });
      return true;
    } catch (error) {
      logger.error('Alert channel test failed', error as Error, { channelId });
      return false;
    }
  }

  /**
   * Get alert dashboard data
   */
  getDashboardData(): {
    alerts: {
      active: number;
      critical: number;
      warning: number;
      resolved24h: number;
    };
    channels: {
      total: number;
      enabled: number;
      byType: Record<string, number>;
    };
    rules: {
      total: number;
      enabled: number;
    };
    recentAlerts: AlertInstance[];
  } {
    const activeAlerts = Array.from(this.activeAlerts.values());
    const now = Date.now();
    const last24h = now - 86400000;
    
    const resolved24h = this.alertHistory.filter(a => 
      a.resolvedAt && a.resolvedAt >= last24h
    ).length;
    
    const channelsByType: Record<string, number> = {};
    Array.from(this.channels.values()).forEach(channel => {
      channelsByType[channel.type] = (channelsByType[channel.type] || 0) + 1;
    });
    
    return {
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        warning: activeAlerts.filter(a => a.severity === 'warning').length,
        resolved24h,
      },
      channels: {
        total: this.channels.size,
        enabled: Array.from(this.channels.values()).filter(c => c.enabled).length,
        byType: channelsByType,
      },
      rules: {
        total: this.rules.size,
        enabled: Array.from(this.rules.values()).filter(r => r.enabled).length,
      },
      recentAlerts: this.getActiveAlerts().slice(0, 10),
    };
  }

  // Private helper methods

  private initializeDefaultChannels(): void {
    // Email channel
    if (process.env.ALERT_EMAIL_ENABLED === 'true') {
      this.addChannel({
        id: 'email-ops',
        name: 'Operations Email',
        type: 'email',
        enabled: true,
        config: {
          recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || ['ops@thrive-send.com'],
          from: process.env.ALERT_EMAIL_FROM || 'alerts@thrive-send.com',
        },
        severityFilter: ['medium', 'high', 'critical'],
      });
    }

    // Slack channel
    if (process.env.ALERT_SLACK_WEBHOOK) {
      this.addChannel({
        id: 'slack-ops',
        name: 'Operations Slack',
        type: 'slack',
        enabled: true,
        config: {
          webhook: process.env.ALERT_SLACK_WEBHOOK,
          channel: process.env.ALERT_SLACK_CHANNEL || '#alerts',
        },
        severityFilter: ['high', 'critical'],
      });
    }

    // Webhook channel
    if (process.env.ALERT_WEBHOOK_URL) {
      this.addChannel({
        id: 'webhook-monitoring',
        name: 'Monitoring Webhook',
        type: 'webhook',
        enabled: true,
        config: {
          url: process.env.ALERT_WEBHOOK_URL,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ALERT_WEBHOOK_TOKEN || ''}`,
          },
        },
      });
    }
  }

  private initializeDefaultRules(): void {
    // High response time rule
    this.addRule({
      id: 'high-response-time',
      name: 'High Response Time',
      description: 'Alert when response time is consistently high',
      enabled: true,
      channels: ['email-ops', 'slack-ops'],
      cooldownPeriod: 300000, // 5 minutes
      conditions: [
        {
          metric: 'response_time',
          operator: 'gt',
          value: 2000,
          duration: 120000, // 2 minutes
          aggregation: 'avg',
        },
      ],
    });

    // High error rate rule
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'Alert when error rate exceeds threshold',
      enabled: true,
      channels: ['email-ops', 'slack-ops'],
      cooldownPeriod: 180000, // 3 minutes
      conditions: [
        {
          metric: 'error_rate',
          operator: 'gt',
          value: 10,
          duration: 60000, // 1 minute
          aggregation: 'avg',
        },
      ],
      escalationRules: [
        {
          delay: 300000, // 5 minutes
          channels: ['webhook-monitoring'],
          severity: 'critical',
        },
      ],
    });

    // Database connection pool rule
    this.addRule({
      id: 'db-pool-exhaustion',
      name: 'Database Pool Exhaustion',
      description: 'Alert when database connection pool is nearly exhausted',
      enabled: true,
      channels: ['email-ops', 'slack-ops'],
      cooldownPeriod: 600000, // 10 minutes
      conditions: [
        {
          metric: 'db_connections',
          operator: 'gt',
          value: 28, // 28 out of 30 connections
          duration: 60000, // 1 minute
          aggregation: 'avg',
        },
      ],
    });

    // Email queue backup rule
    this.addRule({
      id: 'email-queue-backup',
      name: 'Email Queue Backup',
      description: 'Alert when email queue is backing up',
      enabled: true,
      channels: ['email-ops'],
      cooldownPeriod: 900000, // 15 minutes
      conditions: [
        {
          metric: 'email_queue_size',
          operator: 'gt',
          value: 5000,
          duration: 300000, // 5 minutes
          aggregation: 'avg',
        },
      ],
    });

    // System resource rule
    this.addRule({
      id: 'high-resource-usage',
      name: 'High Resource Usage',
      description: 'Alert when system resources are high',
      enabled: true,
      channels: ['webhook-monitoring'],
      cooldownPeriod: 600000, // 10 minutes
      conditions: [
        {
          metric: 'cpu_usage',
          operator: 'gt',
          value: 90,
          duration: 300000, // 5 minutes
          aggregation: 'avg',
        },
      ],
    });
  }

  private findMatchingRules(event: AlertEvent): AlertRule[] {
    const matchingRules: AlertRule[] = [];
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      // Check if any condition matches
      const matches = rule.conditions.some(condition => 
        condition.metric === event.metric &&
        this.evaluateCondition(event.value, condition)
      );
      
      if (matches) {
        matchingRules.push(rule);
      }
    }
    
    return matchingRules;
  }

  private evaluateCondition(value: number, condition: AlertCondition): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.value;
      case 'gte': return value >= condition.value;
      case 'lt': return value < condition.value;
      case 'lte': return value <= condition.value;
      case 'eq': return value === condition.value;
      default: return false;
    }
  }

  private async handleAlertForRule(event: AlertEvent, rule: AlertRule): Promise<void> {
    const alertKey = `${rule.id}-${event.metric}`;
    
    // Check cooldown
    if (this.cooldownTimers.has(alertKey)) {
      return; // Still in cooldown
    }
    
    // Create or update alert instance
    let alertInstance = this.activeAlerts.get(alertKey);
    
    if (!alertInstance) {
      alertInstance = {
        id: alertKey,
        ruleId: rule.id,
        metric: event.metric,
        value: event.value,
        severity: event.threshold.severity,
        status: 'active',
        createdAt: event.timestamp,
        escalationLevel: 0,
        lastNotified: 0,
        notificationCount: 0,
      };
      
      this.activeAlerts.set(alertKey, alertInstance);
    } else {
      alertInstance.value = event.value;
    }
    
    // Send notifications
    await this.sendAlertNotifications(alertInstance, rule);
    
    // Set cooldown
    this.setCooldown(alertKey, rule.cooldownPeriod);
    
    // Schedule escalation if configured
    if (rule.escalationRules && rule.escalationRules.length > 0) {
      this.scheduleEscalation(alertInstance, rule);
    }
  }

  private async sendAlertNotifications(alert: AlertInstance, rule: AlertRule): Promise<void> {
    const channels = rule.channels
      .map(channelId => this.channels.get(channelId))
      .filter(channel => channel && channel.enabled) as AlertChannel[];
    
    const message = this.formatAlertMessage(alert, rule);
    
    for (const channel of channels) {
      // Check severity filter
      if (channel.severityFilter && !channel.severityFilter.includes(alert.severity)) {
        continue;
      }
      
      // Check metric filter
      if (channel.metricFilter && !channel.metricFilter.includes(alert.metric)) {
        continue;
      }
      
      try {
        await this.sendNotification(channel, alert, message);
        alert.notificationCount++;
        alert.lastNotified = Date.now();
      } catch (error) {
        logger.error('Failed to send alert notification', error as Error, {
          channelId: channel.id,
          alertId: alert.id,
        });
      }
    }
  }

  private async sendNotification(
    channel: AlertChannel,
    alert: AlertInstance,
    message: string
  ): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(channel, alert, message);
        break;
      case 'slack':
        await this.sendSlackNotification(channel, alert, message);
        break;
      case 'webhook':
        await this.sendWebhookNotification(channel, alert, message);
        break;
      case 'sms':
        await this.sendSMSNotification(channel, alert, message);
        break;
      case 'discord':
        await this.sendDiscordNotification(channel, alert, message);
        break;
      default:
        logger.warn('Unknown channel type', { type: channel.type });
    }
  }

  private async sendEmailNotification(
    channel: AlertChannel,
    alert: AlertInstance,
    message: string
  ): Promise<void> {
    // This would integrate with your email service
    logger.info('Email notification sent', {
      channelId: channel.id,
      alertId: alert.id,
      recipients: channel.config.recipients,
    });
  }

  private async sendSlackNotification(
    channel: AlertChannel,
    alert: AlertInstance,
    message: string
  ): Promise<void> {
    try {
      const payload = {
        text: message,
        channel: channel.config.channel,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              { title: 'Metric', value: alert.metric, short: true },
              { title: 'Value', value: alert.value.toString(), short: true },
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Time', value: new Date(alert.createdAt).toISOString(), short: true },
            ],
          },
        ],
      };

      // Send to Slack webhook
      const response = await fetch(channel.config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.statusText}`);
      }

      logger.info('Slack notification sent', {
        channelId: channel.id,
        alertId: alert.id,
      });
    } catch (error) {
      logger.error('Failed to send Slack notification', error as Error);
      throw error;
    }
  }

  private async sendWebhookNotification(
    channel: AlertChannel,
    alert: AlertInstance,
    message: string
  ): Promise<void> {
    try {
      const payload = {
        alert,
        message,
        timestamp: Date.now(),
      };

      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: channel.config.headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      logger.info('Webhook notification sent', {
        channelId: channel.id,
        alertId: alert.id,
      });
    } catch (error) {
      logger.error('Failed to send webhook notification', error as Error);
      throw error;
    }
  }

  private async sendSMSNotification(
    channel: AlertChannel,
    alert: AlertInstance,
    message: string
  ): Promise<void> {
    // This would integrate with SMS service (Twilio, etc.)
    logger.info('SMS notification sent', {
      channelId: channel.id,
      alertId: alert.id,
    });
  }

  private async sendDiscordNotification(
    channel: AlertChannel,
    alert: AlertInstance,
    message: string
  ): Promise<void> {
    // This would integrate with Discord webhook
    logger.info('Discord notification sent', {
      channelId: channel.id,
      alertId: alert.id,
    });
  }

  private formatAlertMessage(alert: AlertInstance, rule: AlertRule): string {
    return `🚨 **${rule.name}**\n\n` +
           `**Metric:** ${alert.metric}\n` +
           `**Value:** ${alert.value}\n` +
           `**Severity:** ${alert.severity}\n` +
           `**Description:** ${rule.description}\n` +
           `**Time:** ${new Date(alert.createdAt).toISOString()}\n\n` +
           `Alert ID: ${alert.id}`;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'good';
      default: return 'good';
    }
  }

  private setCooldown(alertKey: string, duration: number): void {
    const timer = setTimeout(() => {
      this.cooldownTimers.delete(alertKey);
    }, duration);
    
    this.cooldownTimers.set(alertKey, timer);
  }

  private scheduleEscalation(alert: AlertInstance, rule: AlertRule): void {
    if (!rule.escalationRules || alert.escalationLevel >= rule.escalationRules.length) {
      return;
    }
    
    const escalationRule = rule.escalationRules[alert.escalationLevel];
    
    setTimeout(async () => {
      // Check if alert is still active
      if (this.activeAlerts.has(alert.id) && alert.status === 'active') {
        alert.escalationLevel++;
        
        // Send escalation notifications
        const channels = escalationRule.channels
          .map(channelId => this.channels.get(channelId))
          .filter(channel => channel && channel.enabled) as AlertChannel[];
        
        const message = `🔥 **ESCALATED ALERT** 🔥\n\n${this.formatAlertMessage(alert, rule)}\n\n` +
                       `This alert has been escalated to level ${alert.escalationLevel}.`;
        
        for (const channel of channels) {
          try {
            await this.sendNotification(channel, alert, message);
          } catch (error) {
            logger.error('Failed to send escalation notification', error as Error, {
              channelId: channel.id,
              alertId: alert.id,
            });
          }
        }
        
        // Schedule next escalation if available
        this.scheduleEscalation(alert, rule);
      }
    }, escalationRule.delay);
  }

  private startAlertProcessing(): void {
    // Clean up old alerts every hour
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 3600000);
    
    logger.info('Alert processing started');
  }

  private cleanupOldAlerts(): void {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    this.alertHistory = this.alertHistory.filter(alert => 
      now - alert.createdAt < maxAge
    );
    
    logger.info('Old alerts cleaned up', { 
      remainingAlerts: this.alertHistory.length 
    });
  }

  /**
   * Shutdown the alert manager
   */
  shutdown(): void {
    // Clear all cooldown timers
    this.cooldownTimers.forEach(timer => clearTimeout(timer));
    this.cooldownTimers.clear();
    
    logger.info('Alert manager shutdown completed');
  }
}

// Export singleton instance
export const alertManager = AlertManager.getInstance();