import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { EmailQueueManager } from '@/lib/queue';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/campaigns/[id]/status
 * 
 * Gets detailed campaign email delivery status
 * Integrates with email queue system for real-time status
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = auth();
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get campaign with analytics
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
      include: {
        analytics: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get job IDs from campaign metadata
    const jobIds = campaign.metadata?.emailJobIds || [];
    
    if (jobIds.length === 0) {
      return NextResponse.json({
        campaignId: campaign.id,
        status: 'NOT_SENT',
        message: 'No email jobs found for this campaign',
        queueStats: null,
        analytics: campaign.analytics[0] || null,
      });
    }

    // Get queue statistics
    const queueStats = await EmailQueueManager.getQueueStats();

    // Get job details from queue
    const jobDetails = await Promise.all(
      jobIds.map(async (jobId: string) => {
        const job = await EmailQueueManager.getJob(jobId);
        if (job) {
          return {
            id: job.id,
            name: job.name,
            data: job.data,
            opts: job.opts,
            progress: job.progress,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
            failedReason: job.failedReason,
            returnvalue: job.returnvalue,
            attemptsMade: job.attemptsMade,
            delay: job.delay,
            timestamp: job.timestamp,
          };
        }
        return null;
      })
    );

    // Filter out null jobs
    const validJobs = jobDetails.filter(job => job !== null);

    // Calculate overall campaign status
    let overallStatus = 'UNKNOWN';
    let completedJobs = 0;
    let failedJobs = 0;
    let totalSent = 0;
    let totalFailed = 0;

    validJobs.forEach(job => {
      if (job.finishedOn) {
        if (job.failedReason) {
          failedJobs++;
        } else {
          completedJobs++;
          // Count successful sends from job return value
          if (job.returnvalue?.successCount) {
            totalSent += job.returnvalue.successCount;
          }
          if (job.returnvalue?.failureCount) {
            totalFailed += job.returnvalue.failureCount;
          }
        }
      }
    });

    if (validJobs.length === 0) {
      overallStatus = 'NOT_FOUND';
    } else if (completedJobs === validJobs.length) {
      overallStatus = failedJobs > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';
    } else if (failedJobs > 0) {
      overallStatus = 'PROCESSING_WITH_ERRORS';
    } else {
      overallStatus = 'PROCESSING';
    }

    // Update campaign analytics if we have new data
    if (campaign.analytics.length > 0) {
      const analytics = campaign.analytics[0];
      await prisma.campaignAnalytics.update({
        where: { id: analytics.id },
        data: {
          emailsSent: totalSent,
          emailsFailed: totalFailed,
          completedJobs,
          failedJobs,
          totalJobs: validJobs.length,
          lastUpdated: new Date(),
          status: overallStatus,
        },
      });
    }

    // Log status check
    logger.info('Campaign status checked', {
      campaignId: campaign.id,
      userId,
      orgId,
      status: overallStatus,
      totalJobs: validJobs.length,
      completedJobs,
      failedJobs,
      totalSent,
      totalFailed,
    });

    return NextResponse.json({
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: overallStatus,
      summary: {
        totalJobs: validJobs.length,
        completedJobs,
        failedJobs,
        processingJobs: validJobs.length - completedJobs - failedJobs,
        totalSent,
        totalFailed,
        totalRecipients: campaign.analytics[0]?.totalRecipients || 0,
      },
      queueStats,
      jobs: validJobs,
      analytics: campaign.analytics[0] || null,
      lastChecked: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Campaign status check failed', error as Error, {
      campaignId: params.id,
      userId: auth().userId,
      orgId: auth().orgId,
    });

    return NextResponse.json(
      { error: 'Failed to get campaign status' },
      { status: 500 }
    );
  }
}