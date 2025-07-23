/**
 * Campaign Email Service
 * 
 * Integrates content approval workflow with email queue system
 * Handles automatic email sending when content is approved
 */

import { prisma } from '@/lib/prisma';
import { EmailQueueManager } from '@/lib/queue';
import { logger } from '@/lib/utils/logger';

export interface AutoSendConfig {
  enabled: boolean;
  delay?: number; // Delay in minutes after approval
  batchSize?: number;
  priority?: number;
}

export class CampaignEmailService {
  /**
   * Triggered when content is approved - automatically queue emails if configured
   */
  static async onContentApproved(contentId: string, approvalData: any) {
    try {
      // Get content with campaign and organization info
      const content = await prisma.content.findFirst({
        where: { id: contentId },
        include: {
          campaign: {
            include: {
              organization: true,
              audience: {
                include: {
                  contactList: {
                    include: {
                      contacts: true,
                    },
                  },
                },
              },
            },
          },
          template: true,
        },
      });

      if (!content || !content.campaign) {
        logger.warn('Content approved but no campaign found', { contentId });
        return;
      }

      // Check if auto-send is enabled for this campaign
      const autoSendConfig = content.campaign.metadata?.autoSend as AutoSendConfig;
      if (!autoSendConfig?.enabled) {
        logger.info('Auto-send disabled for campaign', {
          contentId,
          campaignId: content.campaign.id,
        });
        return;
      }

      // Only auto-send email content
      if (content.type !== 'EMAIL') {
        logger.info('Content approved but not email type', {
          contentId,
          contentType: content.type,
        });
        return;
      }

      // Only auto-send if campaign is active
      if (content.campaign.status !== 'ACTIVE') {
        logger.info('Content approved but campaign not active', {
          contentId,
          campaignId: content.campaign.id,
          campaignStatus: content.campaign.status,
        });
        return;
      }

      // Prepare recipients
      const recipients = [];
      if (content.campaign.audience) {
        for (const contactList of content.campaign.audience.contactList) {
          recipients.push(...contactList.contacts.map(contact => ({
            email: contact.email,
            data: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              customFields: contact.customFields,
            },
          })));
        }
      }

      if (recipients.length === 0) {
        logger.warn('No recipients found for auto-send', {
          contentId,
          campaignId: content.campaign.id,
        });
        return;
      }

      // Calculate delay if specified
      const delay = autoSendConfig.delay ? autoSendConfig.delay * 60 * 1000 : 0;

      // Queue the email campaign
      let queuedJobs;
      
      if (content.campaign.goalType === 'NEWSLETTER') {
        queuedJobs = await EmailQueueManager.addNewsletter({
          templateId: content.template?.id || content.id,
          subject: content.title,
          campaignId: content.campaign.id,
          organizationId: content.campaign.organizationId,
          metadata: {
            contentId: content.id,
            autoSend: true,
            approvalId: approvalData.id,
            approvedBy: approvalData.userId,
            approvedAt: new Date().toISOString(),
          },
        }, {
          delay,
          priority: autoSendConfig.priority || 1,
        });
      } else {
        queuedJobs = await EmailQueueManager.addCampaignEmail({
          recipients,
          templateId: content.template?.id || content.id,
          subject: content.title,
          campaignId: content.campaign.id,
          organizationId: content.campaign.organizationId,
          metadata: {
            contentId: content.id,
            autoSend: true,
            approvalId: approvalData.id,
            approvedBy: approvalData.userId,
            approvedAt: new Date().toISOString(),
          },
        }, {
          batchSize: autoSendConfig.batchSize || 100,
          delay,
          priority: autoSendConfig.priority || 1,
        });
      }

      // Update campaign with job information
      await prisma.campaign.update({
        where: { id: content.campaign.id },
        data: {
          metadata: {
            ...content.campaign.metadata,
            lastAutoSendAt: new Date().toISOString(),
            autoSendJobIds: Array.isArray(queuedJobs) ? 
              queuedJobs.map(job => job.id) : [queuedJobs.id],
          },
        },
      });

      // Create analytics record
      await prisma.campaignAnalytics.create({
        data: {
          campaignId: content.campaign.id,
          organizationId: content.campaign.organizationId,
          totalRecipients: recipients.length,
          queuedAt: new Date(),
          status: 'QUEUED',
          metadata: {
            contentId: content.id,
            autoSend: true,
            approvalId: approvalData.id,
            delay,
            jobIds: Array.isArray(queuedJobs) ? 
              queuedJobs.map(job => job.id) : [queuedJobs.id],
          },
        },
      });

      logger.info('Auto-send email queued after content approval', {
        contentId,
        campaignId: content.campaign.id,
        recipientCount: recipients.length,
        delay,
        jobCount: Array.isArray(queuedJobs) ? queuedJobs.length : 1,
      });

    } catch (error) {
      logger.error('Failed to auto-send email after content approval', error as Error, {
        contentId,
        approvalData,
      });
    }
  }

  /**
   * Send test email for content preview
   */
  static async sendTestEmail(contentId: string, testRecipients: string[], userId: string) {
    try {
      const content = await prisma.content.findFirst({
        where: { id: contentId },
        include: {
          campaign: true,
          template: true,
        },
      });

      if (!content) {
        throw new Error('Content not found');
      }

      // Queue test emails
      const jobs = await Promise.all(
        testRecipients.map(email => 
          EmailQueueManager.addSingleEmail({
            to: email,
            subject: `[TEST] ${content.title}`,
            content: content.body || '',
            templateId: content.template?.id,
            organizationId: content.organizationId,
            campaignId: content.campaign?.id,
            metadata: {
              contentId: content.id,
              testEmail: true,
              sentBy: userId,
              sentAt: new Date().toISOString(),
            },
          }, {
            priority: 10, // High priority for test emails
          })
        )
      );

      logger.info('Test emails queued', {
        contentId,
        testRecipients: testRecipients.length,
        jobIds: jobs.map(job => job.id),
        sentBy: userId,
      });

      return {
        success: true,
        jobIds: jobs.map(job => job.id),
        testRecipients: testRecipients.length,
      };

    } catch (error) {
      logger.error('Failed to send test email', error as Error, {
        contentId,
        testRecipients: testRecipients.length,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get campaign email delivery analytics
   */
  static async getCampaignEmailAnalytics(campaignId: string, organizationId: string) {
    try {
      const analytics = await prisma.campaignAnalytics.findMany({
        where: {
          campaignId,
          organizationId,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get current queue statistics
      const queueStats = await EmailQueueManager.getQueueStats();

      return {
        historical: analytics,
        current: queueStats,
      };

    } catch (error) {
      logger.error('Failed to get campaign email analytics', error as Error, {
        campaignId,
        organizationId,
      });
      throw error;
    }
  }

  /**
   * Pause/Resume campaign email sending
   */
  static async pauseCampaignSending(campaignId: string, organizationId: string) {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          organizationId,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get job IDs from campaign metadata
      const jobIds = campaign.metadata?.emailJobIds || [];
      
      // Pause email worker (affects all jobs)
      await EmailQueueManager.pauseQueue();

      logger.info('Campaign email sending paused', {
        campaignId,
        organizationId,
        jobIds: jobIds.length,
      });

      return { success: true, message: 'Campaign email sending paused' };

    } catch (error) {
      logger.error('Failed to pause campaign sending', error as Error, {
        campaignId,
        organizationId,
      });
      throw error;
    }
  }

  static async resumeCampaignSending(campaignId: string, organizationId: string) {
    try {
      // Resume email worker
      await EmailQueueManager.resumeQueue();

      logger.info('Campaign email sending resumed', {
        campaignId,
        organizationId,
      });

      return { success: true, message: 'Campaign email sending resumed' };

    } catch (error) {
      logger.error('Failed to resume campaign sending', error as Error, {
        campaignId,
        organizationId,
      });
      throw error;
    }
  }
}