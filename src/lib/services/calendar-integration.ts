import { prisma } from '@/lib/prisma';

interface ContentData {
  id: string;
  title: string;
  type: string;
  status: string;
  content: string;
  excerpt?: string;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  authorId: string;
}

/**
 * Simple, reliable calendar integration service
 * Bypasses complex API validation and works directly with database
 */
export class CalendarIntegrationService {
  
  /**
   * Create calendar event directly in database
   */
  static async createEventForContent(content: ContentData, organizationId: string) {
    try {
      console.log(`📅 Creating calendar event for content: ${content.title}`, {
        contentId: content.id,
        organizationId,
        contentType: content.type,
        contentStatus: content.status
      });

      // Validate required parameters
      if (!organizationId) {
        throw new Error('organizationId is required');
      }
      if (!content.id) {
        throw new Error('content.id is required');
      }
      if (!content.authorId) {
        throw new Error('content.authorId is required');
      }

      // Simple type mapping
      const typeMap: Record<string, string> = {
        'ARTICLE': 'article',
        'BLOG': 'blog', 
        'SOCIAL': 'social',
        'EMAIL': 'email'
      };

      // Simple status mapping
      const statusMap: Record<string, string> = {
        'DRAFT': 'draft',
        'PUBLISHED': 'sent',
        'APPROVED': 'scheduled'
      };

      // Determine event times
      const startTime = content.scheduledAt || content.publishedAt || new Date();
      const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000); // 1 hour later

      // Get mapped values with fallbacks
      const eventType = typeMap[content.type] || 'article';
      const eventStatus = content.scheduledAt ? 'scheduled' : (statusMap[content.status] || 'draft');

      console.log('📅 Calendar event data prepared:', {
        eventType,
        eventStatus,
        startTime,
        endTime
      });

      // Create event directly in database
      const calendarEvent = await prisma.calendarEvent.create({
        data: {
          title: content.title,
          description: content.excerpt || content.content.substring(0, 200),
          contentId: content.id,
          type: eventType,
          status: eventStatus,
          startTime,
          endTime,
          organizationId,
          createdBy: content.authorId,
          
          // Add content-specific data based on type
          socialMediaContent: content.type === 'SOCIAL' ? {
            platform: 'LINKEDIN',
            content: content.content,
            status: eventStatus
          } : null,
          
          blogPost: content.type === 'BLOG' ? {
            title: content.title,
            content: content.content,
            excerpt: content.excerpt,
            status: eventStatus
          } : null,
          
          emailCampaign: content.type === 'EMAIL' ? {
            subject: content.title,
            content: content.content,
            status: eventStatus
          } : null,
          
          articleContent: content.type === 'ARTICLE' ? {
            content: content.content,
            metadata: {
              excerpt: content.excerpt
            }
          } : null,
          
          analytics: {
            views: 0,
            engagement: {
              likes: 0,
              shares: 0,
              comments: 0
            },
            clicks: 0,
            lastUpdated: new Date().toISOString()
          }
        }
      });

      console.log(`✅ Calendar event created: ${calendarEvent.id}`);
      return calendarEvent;

    } catch (error) {
      console.error('❌ Calendar event creation failed:', error);
      throw error;
    }
  }

  /**
   * Check if content should have a calendar event
   * More inclusive for social media content
   */
  static shouldCreateCalendarEvent(content: ContentData): boolean {
    // Always create calendar events for social media content (drafts included)
    if (content.type === 'SOCIAL') {
      return true;
    }
    
    // For other content types, use stricter criteria
    return !!(
      content.scheduledAt || 
      content.status === 'PUBLISHED' || 
      content.status === 'APPROVED'
    );
  }

  /**
   * Sync existing content to calendar events
   */
  static async syncContentToCalendar(organizationId: string) {
    try {
      console.log('🔄 Starting content-calendar sync...');

      // Get content that needs calendar events
      const contentNeedingEvents = await prisma.content.findMany({
        where: {
          OR: [
            { status: 'PUBLISHED' },
            { status: 'APPROVED' },
            { scheduledAt: { not: null } }
          ],
          calendarEvents: {
            none: {}
          }
        },
        include: {
          author: {
            include: {
              organizationMemberships: true
            }
          }
        }
      });

      let created = 0;
      let errors = 0;

      for (const content of contentNeedingEvents) {
        try {
          // Get organization ID from content author
          const contentOrgId = content.author.organizationMemberships[0]?.organizationId;
          
          if (contentOrgId === organizationId) {
            await this.createEventForContent(content, organizationId);
            created++;
          }
        } catch (error) {
          console.error(`Failed to create event for content ${content.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ Sync complete: ${created} created, ${errors} errors`);
      return { created, errors };

    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }
}