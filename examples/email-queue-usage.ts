/**
 * Email Queue Usage Examples
 * 
 * This file shows how to use the email queue system in your application
 */

import { EmailQueueManager, EmailWorkerManager } from '../src/lib/queue';

// Example 1: Send a single email
async function sendSingleEmail() {
  try {
    const job = await EmailQueueManager.addSingleEmail({
      to: 'user@example.com',
      subject: 'Welcome to Thrive-Send!',
      content: 'Thank you for joining our platform.',
      organizationId: 'org-123',
      campaignId: 'welcome-campaign',
    });

    console.log(`Single email queued: ${job.id}`);
  } catch (error) {
    console.error('Failed to queue single email:', error);
  }
}

// Example 2: Send bulk campaign emails
async function sendBulkCampaign() {
  try {
    const jobs = await EmailQueueManager.addBulkEmail({
      recipients: [
        { email: 'user1@example.com', data: { name: 'John', discount: '10%' } },
        { email: 'user2@example.com', data: { name: 'Jane', discount: '15%' } },
        { email: 'user3@example.com', data: { name: 'Bob', discount: '20%' } },
      ],
      templateId: 'promotional-template',
      subject: 'Special Offer Just for You!',
      campaignId: 'summer-promo-2025',
      organizationId: 'org-123',
    }, {
      batchSize: 100,  // Process 100 emails per batch
      priority: 1,     // Higher priority
    });

    console.log(`Bulk campaign queued: ${jobs.length} batches`);
  } catch (error) {
    console.error('Failed to queue bulk campaign:', error);
  }
}

// Example 3: Schedule a newsletter
async function scheduleNewsletter() {
  try {
    const scheduleTime = new Date();
    scheduleTime.setHours(scheduleTime.getHours() + 2); // Send in 2 hours

    const job = await EmailQueueManager.addNewsletter({
      templateId: 'newsletter-template-v2',
      subject: 'Weekly Newsletter - Latest Updates',
      campaignId: 'weekly-newsletter-2025-03',
      organizationId: 'org-123',
      segmentId: 'newsletter-subscribers',
      scheduledFor: scheduleTime,
    });

    console.log(`Newsletter scheduled: ${job.id} for ${scheduleTime.toISOString()}`);
  } catch (error) {
    console.error('Failed to schedule newsletter:', error);
  }
}

// Example 4: Monitor queue statistics
async function monitorQueue() {
  try {
    const stats = await EmailQueueManager.getQueueStats();
    console.log('Current queue statistics:', stats);

    // Get failed jobs for investigation
    const failedJobs = await EmailQueueManager.getJobsByStatus('failed', 0, 10);
    if (failedJobs.length > 0) {
      console.log(`Found ${failedJobs.length} failed jobs requiring attention`);
    }

    // Get worker status
    const workerStats = EmailWorkerManager.getWorkerStats();
    console.log('Worker status:', workerStats);

  } catch (error) {
    console.error('Failed to get queue stats:', error);
  }
}

// Example 5: API endpoint integration (Next.js API route)
export async function POST(request: Request) {
  try {
    const { type, ...emailData } = await request.json();

    let job;
    switch (type) {
      case 'single':
        job = await EmailQueueManager.addSingleEmail(emailData);
        break;
      case 'bulk':
        job = await EmailQueueManager.addBulkEmail(emailData);
        break;
      case 'newsletter':
        job = await EmailQueueManager.addNewsletter(emailData);
        break;
      default:
        return Response.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return Response.json({ 
      success: true, 
      jobId: Array.isArray(job) ? job.map(j => j.id) : job.id 
    });

  } catch (error) {
    return Response.json({ 
      error: 'Failed to queue email',
      details: error.message 
    }, { status: 500 });
  }
}

// Export examples for easy testing
export {
  sendSingleEmail,
  sendBulkCampaign,
  scheduleNewsletter,
  monitorQueue,
};