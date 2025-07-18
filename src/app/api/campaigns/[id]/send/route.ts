import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { EmailQueueManager } from '@/lib/queue';
import { logger } from '@/lib/utils/logger';

// Validation schema for campaign send request
const CampaignSendSchema = z.object({
  scheduleFor: z.string().datetime().optional(),
  batchSize: z.number().min(1).max(1000).default(100),
  priority: z.number().min(0).max(10).default(1),
  testMode: z.boolean().default(false),
  segmentId: z.string().optional(),
});

/**
 * POST /api/campaigns/[id]/send
 * 
 * Triggers email sending for a campaign by queuing jobs
 * Integrates with existing campaign management system
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const validatedData = CampaignSendSchema.parse(body);

    // Get campaign with all necessary relations
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
      include: {
        content: {
          where: {
            status: 'PUBLISHED', // Only send published content
          },
          include: {
            template: true,
          },
        },
        audience: {
          include: {
            contactList: {
              include: {
                contacts: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign is in sendable state
    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign must be active to send emails' },
        { status: 400 }
      );
    }

    // Get email content from campaign
    const emailContent = campaign.content.find(c => c.type === 'EMAIL');
    if (!emailContent) {
      return NextResponse.json(
        { error: 'No email content found for this campaign' },
        { status: 400 }
      );
    }

    // Prepare recipients from audience/contact lists
    const recipients = [];
    
    // If specific segment is requested
    if (validatedData.segmentId) {
      const segment = await prisma.audienceSegment.findFirst({
        where: {
          id: validatedData.segmentId,
          organizationId: orgId,
        },
        include: {
          contacts: true,
        },
      });

      if (segment) {
        recipients.push(...segment.contacts.map(contact => ({
          email: contact.email,
          data: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            customFields: contact.customFields,
          },
        })));
      }
    } else {
      // Get all contacts from campaign audience
      if (campaign.audience) {
        for (const contactList of campaign.audience.contactList) {
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
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found for this campaign' },
        { status: 400 }
      );
    }

    // Log campaign send initiation
    logger.info('Campaign send initiated', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      organizationId: orgId,
      recipientCount: recipients.length,
      userId,
      testMode: validatedData.testMode,
    });

    // Queue email jobs based on campaign type
    let queuedJobs;
    
    if (campaign.goalType === 'NEWSLETTER') {
      // Handle newsletter campaigns
      queuedJobs = await EmailQueueManager.addNewsletter({
        templateId: emailContent.template?.id || emailContent.id,
        subject: emailContent.title,
        campaignId: campaign.id,
        organizationId: orgId,
        segmentId: validatedData.segmentId,
        scheduledFor: validatedData.scheduleFor ? new Date(validatedData.scheduleFor) : undefined,
        metadata: {
          campaignName: campaign.name,
          campaignType: campaign.goalType,
          contentId: emailContent.id,
          recipientCount: recipients.length,
          testMode: validatedData.testMode,
        },
      }, {
        priority: validatedData.priority,
        delay: validatedData.scheduleFor ? 
          new Date(validatedData.scheduleFor).getTime() - Date.now() : 0,
      });

    } else {
      // Handle campaign emails (promotional, transactional, etc.)
      queuedJobs = await EmailQueueManager.addCampaignEmail({
        recipients,
        templateId: emailContent.template?.id || emailContent.id,
        subject: emailContent.title,
        campaignId: campaign.id,
        organizationId: orgId,
        metadata: {
          campaignName: campaign.name,
          campaignType: campaign.goalType,
          contentId: emailContent.id,
          testMode: validatedData.testMode,
        },
      }, {
        batchSize: validatedData.batchSize,
        priority: validatedData.priority,
        delay: validatedData.scheduleFor ? 
          new Date(validatedData.scheduleFor).getTime() - Date.now() : 0,
      });
    }

    // Update campaign status to indicate sending
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'ACTIVE',
        metadata: {
          ...campaign.metadata,
          lastSendAt: new Date().toISOString(),
          emailJobIds: Array.isArray(queuedJobs) ? 
            queuedJobs.map(job => job.id) : [queuedJobs.id],
          recipientCount: recipients.length,
        },
      },
    });

    // Create campaign analytics record
    await prisma.campaignAnalytics.create({
      data: {
        campaignId: campaign.id,
        organizationId: orgId,
        totalRecipients: recipients.length,
        queuedAt: new Date(),
        status: 'QUEUED',
        metadata: {
          batchSize: validatedData.batchSize,
          priority: validatedData.priority,
          testMode: validatedData.testMode,
          jobIds: Array.isArray(queuedJobs) ? 
            queuedJobs.map(job => job.id) : [queuedJobs.id],
        },
      },
    });

    // Log successful queue operation
    logger.info('Campaign emails queued successfully', {
      campaignId: campaign.id,
      jobCount: Array.isArray(queuedJobs) ? queuedJobs.length : 1,
      recipientCount: recipients.length,
      organizationId: orgId,
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign emails queued successfully',
      data: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        recipientCount: recipients.length,
        jobCount: Array.isArray(queuedJobs) ? queuedJobs.length : 1,
        jobIds: Array.isArray(queuedJobs) ? 
          queuedJobs.map(job => job.id) : [queuedJobs.id],
        scheduledFor: validatedData.scheduleFor,
        testMode: validatedData.testMode,
      },
    });

  } catch (error) {
    logger.error('Campaign send failed', error as Error, {
      campaignId: params.id,
      userId: auth().userId,
      orgId: auth().orgId,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send campaign emails' },
      { status: 500 }
    );
  }
}