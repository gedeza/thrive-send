# 📊 Comprehensive Monitoring and Alerting Guide

## Overview

This guide covers the comprehensive monitoring and alerting system implemented for massive scale operations in Thrive-Send. The system provides real-time metrics collection, intelligent alerting, system health monitoring, and performance tracking.

## 🎯 Monitoring Capabilities

### **System Coverage**

| Component | Metrics Collected | Alert Thresholds | Health Checks |
|-----------|-------------------|------------------|---------------|
| **Database** | Connections, Query Time, Pool Usage | > 28 connections, > 500ms queries | Connection test, Query performance |
| **Cache** | Hit Rate, Memory Usage, Connections | < 70% hit rate, > 85% memory | Redis ping, Memory cache test |
| **Email Queue** | Queue Size, Processing Rate, Failures | > 1000 queued, > 100 failed | Queue stats, Worker status |
| **Rate Limiting** | Block Rate, Rule Hits, Circuit Breakers | > 95% block rate, breaker trips | Redis connection, Rule processing |
| **System Resources** | CPU, Memory, Disk, Network | > 80% CPU, > 85% memory | Resource availability |
| **Application** | Response Time, Error Rate, Throughput | > 2s response, > 10% errors | Endpoint tests, Health checks |

## 🏗️ Architecture Overview

### **Monitoring System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Monitoring Service (High-Level API)                       │
├─────────────────────────────────────────────────────────────┤
│  System Monitor    │  Alert Manager    │  Metrics Collector │
├─────────────────────────────────────────────────────────────┤
│  Health Checks     │  Thresholds      │  Data Collection   │
├─────────────────────────────────────────────────────────────┤
│  Email  │  Slack  │  Webhook  │  SMS  │  Discord  │  Custom │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Implementation Details

### **1. Metrics Collector**

**Features:**
- **Real-time collection** every 30 seconds
- **Multiple aggregations** (avg, sum, min, max, count)
- **Time-series storage** with automatic cleanup
- **Alert threshold monitoring**
- **Export formats** (Prometheus, InfluxDB, JSON)

**Usage:**
```typescript
// Record custom metric
metricsCollector.recordMetric({
  name: 'email_sent',
  value: 1,
  timestamp: Date.now(),
  tags: { campaign: 'newsletter', org: 'org-123' },
  unit: 'count',
});

// Get metric aggregation
const avgResponseTime = metricsCollector.getMetricAggregation(
  'response_time',
  'avg',
  { endpoint: '/api/campaigns' },
  { start: Date.now() - 3600000, end: Date.now() }
);
```

### **2. Alert Manager**

**Alert Channels:**
- **Email**: Operations team notifications
- **Slack**: Real-time team alerts
- **Webhook**: External monitoring integration
- **SMS**: Critical incident notifications
- **Discord**: Development team alerts

**Alert Rules:**
```typescript
// High response time alert
{
  id: 'high-response-time',
  name: 'High Response Time',
  enabled: true,
  channels: ['email-ops', 'slack-ops'],
  cooldownPeriod: 300000, // 5 minutes
  conditions: [{
    metric: 'response_time',
    operator: 'gt',
    value: 2000,
    duration: 120000, // 2 minutes
    aggregation: 'avg',
  }],
  escalationRules: [{
    delay: 300000, // 5 minutes
    channels: ['webhook-monitoring'],
    severity: 'critical',
  }],
}
```

### **3. System Monitor**

**Health Checks:**
- **Database**: Connection test, query performance
- **Cache**: Redis ping, memory cache validation
- **Email Queue**: Worker status, queue statistics
- **Rate Limiting**: Redis connection, rule processing
- **System Resources**: CPU, memory, disk usage
- **Application**: Endpoint tests, functionality checks

### **4. Performance Tracking**

**Automatic Tracking:**
```typescript
// Performance decorator
@performanceTracker('email_send', { provider: 'sendgrid' })
async sendEmail(emailData: EmailData): Promise<void> {
  // Email sending logic
}

// Middleware tracking
app.use(monitoringMiddleware.trackRequest);

// Manual tracking
systemMonitor.recordTiming('db_query', duration, {
  operation: 'user_lookup',
  table: 'users',
});
```

## 📊 Metrics and KPIs

### **Performance Metrics**

| Metric | Target | Warning | Critical | Description |
|--------|--------|---------|----------|-------------|
| Response Time | < 500ms | > 1s | > 5s | API endpoint response time |
| Throughput | > 1000 req/min | < 500 req/min | < 100 req/min | Requests processed per minute |
| Error Rate | < 1% | > 5% | > 15% | Percentage of failed requests |
| Success Rate | > 99% | < 95% | < 85% | Percentage of successful operations |

### **Resource Metrics**

| Metric | Target | Warning | Critical | Description |
|--------|--------|---------|----------|-------------|
| CPU Usage | < 70% | > 80% | > 95% | Server CPU utilization |
| Memory Usage | < 70% | > 85% | > 95% | Server memory utilization |
| Disk Usage | < 80% | > 90% | > 95% | Disk space utilization |
| Network | < 70% | > 85% | > 95% | Network bandwidth usage |

### **Business Metrics**

| Metric | Description | Alert Conditions |
|--------|-------------|------------------|
| Emails Processed | Total emails sent per hour | < 100/hour (low activity) |
| Campaign Success Rate | Percentage of successful campaigns | < 90% (delivery issues) |
| Queue Backlog | Number of pending email jobs | > 5000 (processing delays) |
| Bounce Rate | Email bounce percentage | > 10% (reputation issues) |
| Active Users | Concurrent users in system | > 5000 (capacity planning) |

## 🚀 Usage Instructions

### **1. Initialize Monitoring**

```typescript
import { initializeMonitoring, monitoringService } from '@/lib/monitoring/index';

// Initialize on app startup
const monitoringSystem = initializeMonitoring();

// Use monitoring service
const systemHealth = await monitoringService.getSystemHealth();
console.log(`System status: ${systemHealth.overall}`);
```

### **2. Record Custom Metrics**

```typescript
// Business events
monitoringService.recordBusinessEvent('campaign_sent', 1, {
  campaignId: 'campaign-123',
  recipientCount: '5000',
  organizationId: 'org-456',
});

// Performance metrics
monitoringService.recordTiming('email_delivery', 1250, {
  provider: 'sendgrid',
  campaign: 'newsletter',
});

// Custom metrics
monitoringService.recordMetric('user_registration', 1, {
  source: 'organic',
  plan: 'premium',
});
```

### **3. Health Monitoring**

```typescript
// System health check
const health = await monitoringService.getSystemHealth();
console.log(`Overall: ${health.overall}`);
console.log(`Database: ${health.components.database.status}`);
console.log(`Cache: ${health.components.cache.status}`);

// Component-specific health
const dbHealth = await monitoringService.getComponentHealth('database');
console.log(`DB Response Time: ${dbHealth.responseTime}ms`);
console.log(`DB Connections: ${dbHealth.metrics.connections}`);
```

### **4. Alert Management**

```typescript
// Get active alerts
const alerts = monitoringService.getActiveAlerts({
  severity: ['critical', 'high'],
});

console.log(`Critical alerts: ${alerts.length}`);

// Get alert statistics
const alertStats = monitoringService.getAlertStats();
console.log(`Total alerts (24h): ${alertStats.total}`);
console.log(`Resolution time: ${alertStats.avgResolutionTime}ms`);
```

### **5. Dashboard Data**

```typescript
// Get comprehensive dashboard data
const dashboard = await monitoringService.getDashboardData();

console.log('System Overview:', {
  status: dashboard.system.overall,
  uptime: dashboard.system.uptime,
  activeAlerts: dashboard.alerts.alerts.active,
  criticalAlerts: dashboard.alerts.alerts.critical,
});

console.log('Performance:', {
  responseTime: dashboard.system.metrics.performance.responseTime,
  throughput: dashboard.system.metrics.performance.throughput,
  errorRate: dashboard.system.metrics.performance.errorRate,
});
```

## 🔧 API Endpoints

### **Health Monitoring**

```bash
# System health check
GET /api/monitoring/health
Response: {
  "healthy": true,
  "system": { "overall": "healthy", ... },
  "monitoring": { "healthy": true, ... },
  "uptime": 3600000
}

# Component health
GET /api/monitoring/metrics?component=database
Response: {
  "component": "database",
  "health": { "status": "healthy", ... }
}
```

### **Metrics Export**

```bash
# JSON format (default)
GET /api/monitoring/metrics
GET /api/monitoring/metrics?format=json

# Prometheus format
GET /api/monitoring/metrics?format=prometheus

# InfluxDB format
GET /api/monitoring/metrics?format=influxdb
```

### **Dashboard Data**

```bash
# Complete dashboard
GET /api/monitoring/dashboard
Response: {
  "dashboard": {
    "system": { ... },
    "alerts": { ... },
    "metrics": { ... },
    "performance": { ... }
  }
}
```

### **Alert Management**

```bash
# Get active alerts
GET /api/monitoring/alerts
GET /api/monitoring/alerts?severity=critical,high
GET /api/monitoring/alerts?metric=response_time,error_rate

# Get alert history
GET /api/monitoring/alerts?history=true

# Manage alerts
POST /api/monitoring/alerts
{
  "action": "silence",
  "alertId": "alert-123",
  "duration": 3600000
}

POST /api/monitoring/alerts
{
  "action": "resolve",
  "alertId": "alert-123"
}
```

## 🔧 Command Line Tools

### **Health Checks**

```bash
# System health
pnpm monitoring:health

# Dashboard data
pnpm monitoring:dashboard

# Active alerts
pnpm monitoring:alerts

# Export metrics
pnpm monitoring:export
```

### **Component-Specific Checks**

```bash
# Database health
pnpm db:health

# Cache health
pnpm cache:health

# Rate limiting health
pnpm rate-limit:health

# Queue health
pnpm queue:stats
```

## 📈 Advanced Features

### **1. Custom Alert Channels**

```typescript
// Add custom Slack channel
alertManager.addChannel({
  id: 'slack-dev',
  name: 'Development Team',
  type: 'slack',
  enabled: true,
  config: {
    webhook: process.env.DEV_SLACK_WEBHOOK,
    channel: '#dev-alerts',
  },
  severityFilter: ['high', 'critical'],
  metricFilter: ['response_time', 'error_rate'],
});

// Add webhook for external monitoring
alertManager.addChannel({
  id: 'external-monitoring',
  name: 'External Monitoring System',
  type: 'webhook',
  enabled: true,
  config: {
    url: 'https://monitoring.example.com/webhook',
    headers: {
      'Authorization': 'Bearer your-token',
      'Content-Type': 'application/json',
    },
  },
});
```

### **2. Custom Alert Rules**

```typescript
// Email queue backup alert
alertManager.addRule({
  id: 'email-queue-critical',
  name: 'Critical Email Queue Backup',
  description: 'Email queue has critical backlog',
  enabled: true,
  channels: ['slack-ops', 'email-ops', 'external-monitoring'],
  cooldownPeriod: 600000, // 10 minutes
  conditions: [{
    metric: 'email_queue_size',
    operator: 'gt',
    value: 10000,
    duration: 300000, // 5 minutes
    aggregation: 'avg',
  }],
  escalationRules: [{
    delay: 900000, // 15 minutes
    channels: ['webhook-oncall'],
    severity: 'critical',
  }],
});
```

### **3. Performance Decorators**

```typescript
// Automatic performance tracking
export class EmailService {
  @performanceTracker('email_send_bulk', { provider: 'sendgrid' })
  async sendBulkEmail(emails: EmailData[]): Promise<void> {
    // Implementation automatically tracked
  }

  @performanceTracker('email_template_render')
  async renderTemplate(templateId: string, data: any): Promise<string> {
    // Template rendering performance tracked
  }
}
```

### **4. Middleware Integration**

```typescript
// Express/Next.js middleware
import { createMonitoringMiddleware } from '@/lib/monitoring';

const monitoring = createMonitoringMiddleware();

// Track all API requests
app.use(monitoring.trackRequest);

// Track specific operations
app.post('/api/email/send', (req, res, next) => {
  const recipientCount = req.body.recipients.length;
  
  monitoring.trackEmailOperation('bulk_send', recipientCount, true);
  next();
});
```

## 🛡️ Security and Privacy

### **1. Sensitive Data Handling**

- **No PII in metrics**: Only aggregate data collected
- **Secure transmission**: HTTPS for all webhook alerts
- **Access control**: API endpoints require authentication
- **Data retention**: Automatic cleanup of old metrics

### **2. Alert Channel Security**

- **Token-based authentication** for webhooks
- **Encrypted secrets** for channel configurations
- **Rate limiting** on alert endpoints
- **Audit logging** for alert actions

## 🔧 Environment Configuration

### **Development Setup**

```env
# Development monitoring
MONITORING_ENABLED=true
METRICS_COLLECTION_INTERVAL=60000
HEALTH_CHECK_INTERVAL=300000
ALERT_EMAIL_ENABLED=false
METRICS_RETENTION_HOURS=24
```

### **Production Setup**

```env
# Production monitoring
MONITORING_ENABLED=true
METRICS_COLLECTION_INTERVAL=30000
HEALTH_CHECK_INTERVAL=120000

# Alert channels
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_RECIPIENTS=ops@company.com,alerts@company.com
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...
ALERT_WEBHOOK_URL=https://monitoring.company.com/webhook

# Data retention
METRICS_RETENTION_HOURS=168
METRICS_EXPORT_ENABLED=true
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Missing Metrics**
   ```bash
   # Check metrics collection
   pnpm monitoring:health
   
   # Verify collection interval
   # Check for errors in logs
   ```

2. **Alert Delivery Issues**
   ```bash
   # Test alert channels
   curl -X POST /api/monitoring/alerts \
     -d '{"action": "test", "channelId": "slack-ops"}'
   
   # Check channel configuration
   # Verify webhook URLs and tokens
   ```

3. **High Memory Usage**
   ```bash
   # Check metrics memory usage
   pnpm monitoring:dashboard
   
   # Clear old metrics if needed
   # Adjust retention settings
   ```

### **Performance Tuning**

1. **Metrics Collection**
   ```env
   # Adjust collection frequency
   METRICS_COLLECTION_INTERVAL=60000  # Less frequent
   
   # Reduce retention period
   METRICS_RETENTION_HOURS=72  # 3 days instead of 7
   ```

2. **Alert Optimization**
   ```typescript
   // Increase cooldown periods
   cooldownPeriod: 900000, // 15 minutes
   
   // Adjust thresholds
   value: 5000, // Higher threshold
   duration: 300000, // Longer duration
   ```

## 📋 Deployment Checklist

### **Pre-Deployment**

- [ ] Configure alert channels and test delivery
- [ ] Set appropriate thresholds for production load
- [ ] Configure external monitoring integrations
- [ ] Test health check endpoints
- [ ] Verify metrics export functionality

### **Deployment**

- [ ] Deploy monitoring system with conservative settings
- [ ] Verify all components are reporting health
- [ ] Test alert generation and delivery
- [ ] Monitor system performance impact
- [ ] Validate metrics collection and storage

### **Post-Deployment**

- [ ] Monitor system for 24 hours
- [ ] Tune alert thresholds based on actual performance
- [ ] Set up external monitoring dashboards
- [ ] Train team on alert procedures
- [ ] Document incident response procedures

## 🎯 Expected Results

After implementing comprehensive monitoring and alerting, you should have:

- **Real-time visibility** into all system components
- **Proactive alerting** before issues impact users
- **Comprehensive metrics** for performance optimization
- **Automated incident detection** and notification
- **Historical analysis** for capacity planning
- **Integration** with external monitoring tools
- **Scalable monitoring** for massive operations

The monitoring system now provides complete observability for handling massive scale operations while maintaining optimal performance and reliability.

## 📚 Additional Resources

- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [InfluxDB Line Protocol](https://docs.influxdata.com/influxdb/v2.0/reference/syntax/line-protocol/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [PagerDuty Integration](https://developer.pagerduty.com/docs/webhooks/)

---

*Last updated: 2025-01-18*
*Version: 1.0.0*