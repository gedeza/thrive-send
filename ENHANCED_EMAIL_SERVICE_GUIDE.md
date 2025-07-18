# 🚀 Enhanced Email Service Guide

## Overview

The Enhanced Email Service provides a robust, scalable email delivery system with multiple provider support, automatic failover, load balancing, and comprehensive monitoring. Perfect for massive email campaigns.

## 🔧 Features

### ✅ **Multi-Provider Support**
- **SendGrid**: High-volume transactional and marketing emails
- **AWS SES**: Cost-effective, scalable email delivery 
- **Mock Provider**: Development and testing
- **Resend**: (Coming soon)

### ✅ **Advanced Capabilities**
- **Automatic Failover**: Seamless provider switching on failures
- **Load Balancing**: Distribute load across multiple providers
- **Rate Limiting**: Respect provider limits automatically
- **Health Monitoring**: Real-time provider health checks
- **Bulk Processing**: Efficient batch email sending
- **Template Support**: Dynamic email templates
- **Delivery Tracking**: Monitor email delivery status

## 📋 Configuration

### Environment Variables

```env
# Primary email provider
EMAIL_PRIMARY_PROVIDER=sendgrid
EMAIL_FALLBACK_PROVIDER=aws-ses

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_DEFAULT_FROM=noreply@yourcompany.com

# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_SES_DEFAULT_FROM=noreply@yourcompany.com

# Load Balancing
EMAIL_LOAD_BALANCING=true
EMAIL_LOAD_BALANCING_STRATEGY=round-robin

# Failover Settings
EMAIL_FAILOVER=true
EMAIL_FAILOVER_RETRIES=3
EMAIL_FAILOVER_DELAY=1000
```

### Service Configuration

```typescript
const emailServiceConfig = {
  primary: 'sendgrid',
  fallback: 'aws-ses',
  providers: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      defaultFrom: 'noreply@yourcompany.com',
      rateLimits: {
        requestsPerSecond: 100,
        requestsPerMinute: 6000,
        requestsPerHour: 360000,
      },
    },
    'aws-ses': {
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      defaultFrom: 'noreply@yourcompany.com',
      rateLimits: {
        requestsPerSecond: 14,
        requestsPerMinute: 200,
        requestsPerHour: 200,
      },
    },
  },
  loadBalancing: {
    enabled: true,
    strategy: 'round-robin', // 'round-robin', 'least-used', 'health-based'
  },
  failover: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
};
```

## 🎯 Usage Examples

### 1. Basic Email Sending

```typescript
import { EnhancedEmailService } from '@/lib/services/enhanced-email-service';

const emailService = new EnhancedEmailService(emailServiceConfig);

// Send single email
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform!',
  htmlContent: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
  textContent: 'Welcome! Thanks for joining us.',
  trackOpens: true,
  trackClicks: true,
});

console.log('Email sent:', result.success);
```

### 2. Bulk Email Campaigns

```typescript
// Send to multiple recipients
const bulkResult = await emailService.sendBulkEmails({
  emails: [
    {
      to: 'user1@example.com',
      subject: 'Special Offer for You!',
      templateId: 'promotional-template',
      templateData: { 
        name: 'John',
        discount: '20%' 
      },
    },
    {
      to: 'user2@example.com',
      subject: 'Special Offer for You!',
      templateId: 'promotional-template',
      templateData: { 
        name: 'Jane',
        discount: '15%' 
      },
    },
  ],
  globalTemplateData: {
    company: 'Your Company',
    year: new Date().getFullYear(),
  },
  batchSize: 100,
});

console.log(`Bulk send: ${bulkResult.totalSent} sent, ${bulkResult.totalFailed} failed`);
```

### 3. Template-Based Emails

```typescript
// Using email templates
const templateResult = await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Order Confirmation',
  templateId: 'order-confirmation',
  templateData: {
    orderNumber: '12345',
    items: [
      { name: 'Product A', price: '$29.99' },
      { name: 'Product B', price: '$19.99' },
    ],
    total: '$49.98',
    customerName: 'John Doe',
  },
});
```

### 4. Provider-Specific Sending

```typescript
// Force specific provider
const sesResult = await emailService.sendWithProvider({
  to: 'user@example.com',
  subject: 'Test Email',
  content: 'Testing AWS SES specifically',
}, 'aws-ses');

const sendgridResult = await emailService.sendWithProvider({
  to: 'user@example.com',
  subject: 'Test Email',
  content: 'Testing SendGrid specifically',
}, 'sendgrid');
```

## 📊 Monitoring & Analytics

### Provider Statistics

```typescript
// Get all provider stats
const stats = emailService.getProviderStats();
console.log('Provider Statistics:', stats);

// Example output:
{
  "sendgrid": {
    "totalSent": 1250,
    "totalFailed": 23,
    "rateLimitHits": 2,
    "avgResponseTime": 145,
    "lastUsed": "2025-01-20T10:30:00Z",
    "healthy": true
  },
  "aws-ses": {
    "totalSent": 890,
    "totalFailed": 12,
    "rateLimitHits": 0,
    "avgResponseTime": 89,
    "lastUsed": "2025-01-20T10:29:00Z",
    "healthy": true
  }
}
```

### Health Monitoring

```typescript
// Check provider health
const health = emailService.getHealthStatus();
console.log('Provider Health:', health);

// Example output:
{
  "sendgrid": true,
  "aws-ses": true,
  "mock": true
}
```

### Service Testing

```typescript
// Test all providers
const testResults = await emailService.testEmailSending('test@yourcompany.com');
console.log('Test Results:', testResults);
```

## 🔄 Integration with Campaign System

### Automatic Campaign Sending

```typescript
// In your campaign API
import { EmailWorkerManager } from '@/lib/queue/email-worker';

// Get email service from worker
const emailService = EmailWorkerManager.getEmailService();

// Send campaign
const result = await emailService.sendBulkEmails({
  emails: campaignRecipients,
  templateId: campaign.emailTemplate.id,
  globalTemplateData: {
    campaignName: campaign.name,
    unsubscribeUrl: `${baseUrl}/unsubscribe`,
  },
  batchSize: 100,
});
```

### Worker Integration

The Enhanced Email Service is automatically integrated with your email worker:

```typescript
// The worker automatically uses the enhanced service
import { EmailWorkerManager } from '@/lib/queue/email-worker';

// Get service statistics
const stats = EmailWorkerManager.getEmailServiceStats();

// Get health status
const health = EmailWorkerManager.getEmailServiceHealth();
```

## ⚙️ Advanced Configuration

### Custom Rate Limits

```typescript
const customConfig = {
  providers: {
    sendgrid: {
      rateLimits: {
        requestsPerSecond: 50,   // Reduce for smaller plans
        requestsPerMinute: 3000,
        requestsPerHour: 180000,
      },
    },
    'aws-ses': {
      rateLimits: {
        requestsPerSecond: 1,    // Conservative for sandbox
        requestsPerMinute: 60,
        requestsPerHour: 200,
      },
    },
  },
};
```

### Load Balancing Strategies

```typescript
const loadBalancingConfig = {
  loadBalancing: {
    enabled: true,
    strategy: 'least-used',  // Use provider with lowest usage
  },
};

// Or health-based routing
const healthBasedConfig = {
  loadBalancing: {
    enabled: true,
    strategy: 'health-based',  // Prefer healthy providers
  },
};
```

### Failover Configuration

```typescript
const failoverConfig = {
  failover: {
    enabled: true,
    maxRetries: 5,        // More retries for critical emails
    retryDelay: 2000,     // Longer delay between retries
  },
};
```

## 📈 Performance Optimization

### For High-Volume Campaigns

```typescript
// Optimize for massive campaigns
const highVolumeConfig = {
  providers: {
    sendgrid: {
      rateLimits: {
        requestsPerSecond: 200,
        requestsPerMinute: 12000,
        requestsPerHour: 720000,
      },
    },
  },
  loadBalancing: {
    enabled: true,
    strategy: 'round-robin',
  },
};

// Use larger batch sizes
const result = await emailService.sendBulkEmails({
  emails: massiveRecipientList,
  batchSize: 1000,  // SendGrid supports up to 1000 per batch
});
```

### For Transactional Emails

```typescript
// Optimize for speed and reliability
const transactionalConfig = {
  primary: 'sendgrid',  // Fast delivery
  fallback: 'aws-ses',  // Reliable backup
  failover: {
    enabled: true,
    maxRetries: 2,      // Quick failover
    retryDelay: 500,    // Fast retry
  },
};
```

## 🛡️ Error Handling

### Comprehensive Error Handling

```typescript
try {
  const result = await emailService.sendEmail(emailRequest);
  
  if (result.success) {
    console.log('Email sent successfully:', result.messageId);
  } else {
    console.error('Email failed:', result.error);
    
    // Handle specific errors
    if (result.statusCode === 429) {
      console.log('Rate limited, will retry later');
    } else if (result.statusCode === 400) {
      console.log('Invalid email data:', result.error);
    }
  }
} catch (error) {
  console.error('Service error:', error);
  // All providers failed
}
```

### Retry Logic

```typescript
// The service automatically retries with different providers
// You can also implement custom retry logic
async function sendWithRetry(emailRequest, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await emailService.sendEmail(emailRequest);
      if (result.success) return result;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Provider Not Healthy**
   ```bash
   # Check provider health
   curl http://localhost:3000/api/email/health
   ```

2. **Rate Limits Exceeded**
   ```typescript
   // Check rate limit status
   const stats = emailService.getProviderStats();
   console.log('Rate limit hits:', stats.sendgrid.rateLimitHits);
   ```

3. **Configuration Issues**
   ```typescript
   // Validate configuration
   const config = emailService.getConfig();
   console.log('Current config:', config);
   ```

### Debug Commands

```bash
# Check email service status
curl http://localhost:3000/api/email/status

# Test email sending
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Get provider statistics
curl http://localhost:3000/api/email/stats
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
export EMAIL_PRIMARY_PROVIDER=sendgrid
export EMAIL_FALLBACK_PROVIDER=aws-ses
export SENDGRID_API_KEY=your_production_sendgrid_key
export AWS_ACCESS_KEY_ID=your_production_aws_key
export AWS_SECRET_ACCESS_KEY=your_production_aws_secret
export EMAIL_LOAD_BALANCING=true
export EMAIL_FAILOVER=true
```

### Monitoring Setup

```typescript
// Set up monitoring alerts
const monitoringConfig = {
  alerts: {
    failureRate: 0.05,     // Alert if >5% failure rate
    responseTime: 5000,    // Alert if >5s response time
    rateLimitHits: 10,     // Alert if >10 rate limit hits
  },
};
```

This enhanced email service provides enterprise-grade email delivery with automatic failover, load balancing, and comprehensive monitoring - perfect for handling massive email campaigns reliably!