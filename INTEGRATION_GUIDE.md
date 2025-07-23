# 🚀 Email Queue System Integration Guide

## Overview

The email queue system has been fully integrated into your existing Thrive-Send campaign management system. Here's how to use all the new functionality:

## 🔧 Setup & Configuration

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Redis Configuration (Required)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email Worker Configuration
EMAIL_WORKER_CONCURRENCY=5
EMAIL_WORKER_MAX_STALLED_COUNT=3
EMAIL_WORKER_STALLED_INTERVAL=30000
```

### 2. Start the Worker

```bash
# Production
pnpm worker:start

# Development (auto-restart)
pnpm worker:dev
```

### 3. Install Redis (if not already installed)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server
```

## 🎯 Usage Examples

### 1. Send Campaign Emails via API

```bash
# Send campaign immediately
curl -X POST "http://localhost:3000/api/campaigns/CAMPAIGN_ID/send" \
  -H "Content-Type: application/json" \
  -d '{
    "batchSize": 100,
    "priority": 1,
    "testMode": false
  }'

# Schedule campaign for later
curl -X POST "http://localhost:3000/api/campaigns/CAMPAIGN_ID/send" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleFor": "2025-01-20T10:00:00Z",
    "batchSize": 50,
    "priority": 2
  }'
```

### 2. Monitor Campaign Status

```bash
# Check campaign email status
curl "http://localhost:3000/api/campaigns/CAMPAIGN_ID/status"
```

### 3. Frontend Integration

Add the email queue status component to your campaign pages:

```tsx
import { EmailQueueStatus } from '@/components/campaigns/EmailQueueStatus';

export default function CampaignPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Your existing campaign content */}
      
      {/* NEW: Email Queue Status */}
      <EmailQueueStatus 
        campaignId={params.id}
        autoRefresh={true}
        refreshInterval={30000}
      />
    </div>
  );
}
```

## 🔄 Automated Workflow Integration

### 1. Auto-Send After Content Approval

Configure campaigns to automatically send emails when content is approved:

```json
// In campaign metadata
{
  "autoSend": {
    "enabled": true,
    "delay": 30,        // minutes after approval
    "batchSize": 100,
    "priority": 1
  }
}
```

### 2. Content Approval Workflow

The system now automatically:
1. ✅ Content gets approved
2. 🚀 Email queue job is created (if auto-send enabled)
3. 📧 Worker processes and sends emails
4. 📊 Analytics are tracked

## 🛠 Advanced Usage

### 1. Direct Queue Management

```typescript
import { EmailQueueManager } from '@/lib/queue';

// Send single email
const job = await EmailQueueManager.addSingleEmail({
  to: 'user@example.com',
  subject: 'Hello!',
  content: 'Email content',
  organizationId: 'org-123',
  campaignId: 'campaign-456',
});

// Send bulk campaign
const jobs = await EmailQueueManager.addBulkEmail({
  recipients: [
    { email: 'user1@example.com', data: { name: 'John' } },
    { email: 'user2@example.com', data: { name: 'Jane' } },
  ],
  templateId: 'template-123',
  subject: 'Campaign Subject',
  campaignId: 'campaign-456',
  organizationId: 'org-123',
}, {
  batchSize: 100,
  priority: 1,
});
```

### 2. Test Email Functionality

```typescript
import { CampaignEmailService } from '@/lib/services/campaign-email-service';

// Send test email
await CampaignEmailService.sendTestEmail(
  'content-id',
  ['test@example.com'],
  'user-id'
);
```

### 3. Queue Monitoring

```bash
# Check queue statistics
pnpm queue:stats

# Clear all jobs (development only)
pnpm queue:clear
```

## 📊 Dashboard Integration

### Campaign Dashboard Updates

1. **Email Queue Status Card**: Real-time email delivery status
2. **Send Campaign Button**: Direct integration with queue system
3. **Progress Indicators**: Live progress bars for email delivery
4. **Error Monitoring**: Failed job tracking and retry options

### Analytics Integration

The system tracks:
- **Email Delivery Rates**: Success/failure rates per campaign
- **Queue Performance**: Processing times and throughput
- **Batch Processing**: Optimal batch sizes for different campaigns
- **Error Patterns**: Common failure reasons and solutions

## 🔧 Configuration Options

### Campaign-Level Settings

```json
{
  "emailSettings": {
    "autoSend": {
      "enabled": true,
      "delay": 30,
      "batchSize": 100,
      "priority": 1
    },
    "retryOptions": {
      "attempts": 3,
      "backoff": "exponential",
      "delay": 2000
    },
    "scheduling": {
      "timezone": "America/New_York",
      "businessHours": {
        "start": "09:00",
        "end": "17:00"
      }
    }
  }
}
```

### Organization-Level Settings

```json
{
  "emailDefaults": {
    "batchSize": 100,
    "priority": 1,
    "workerConcurrency": 5,
    "rateLimits": {
      "emailsPerMinute": 60,
      "emailsPerHour": 3600
    }
  }
}
```

## 📈 Performance Recommendations

### For Small Campaigns (< 1,000 recipients)
```json
{
  "batchSize": 50,
  "priority": 1,
  "concurrency": 3
}
```

### For Large Campaigns (> 10,000 recipients)
```json
{
  "batchSize": 200,
  "priority": 0,
  "concurrency": 10
}
```

### For Newsletter Campaigns
```json
{
  "batchSize": 100,
  "priority": 2,
  "scheduling": {
    "delay": 1800000  // 30 minutes
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Restart Redis
   brew services restart redis
   ```

2. **Worker Not Processing Jobs**
   ```bash
   # Check worker logs
   pnpm worker:start
   
   # Check queue stats
   pnpm queue:stats
   ```

3. **Email Sending Failures**
   ```bash
   # Check failed jobs
   curl "http://localhost:3000/api/campaigns/CAMPAIGN_ID/status"
   
   # Retry failed jobs through UI or API
   ```

### Debug Commands

```bash
# View queue statistics
pnpm queue:stats

# View worker logs
pnpm worker:dev

# Clear development queue
pnpm queue:clear

# Test email sending
curl -X POST "http://localhost:3000/api/campaigns/test-campaign/send" \
  -H "Content-Type: application/json" \
  -d '{"testMode": true}'
```

## 🎯 Next Steps

1. **Configure Email Providers**: Set up SendGrid, AWS SES, or other providers
2. **Set up Monitoring**: Add alerts for failed campaigns
3. **Optimize Performance**: Tune batch sizes based on your email volume
4. **Add Analytics**: Enhanced reporting for email performance
5. **Scale Workers**: Run multiple worker instances for high volume

## 📞 Support

For issues or questions:
1. Check the logs in `pnpm worker:dev`
2. Monitor queue status via API endpoints
3. Review campaign analytics in the dashboard
4. Check Redis connectivity and performance