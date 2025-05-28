import { toast } from '@/components/ui/use-toast';
import { ContentFormValues } from '@/lib/validations/content';

const API_URL = '/api/content';

export interface ContentData {
  id: string;
  title: string;
  slug: string;
  type: 'ARTICLE' | 'BLOG' | 'SOCIAL' | 'EMAIL';
  content: string;
  excerpt?: string;
  tags: string[];
  media?: any;
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFormData {
  id?: string;
  title: string;
  type: 'ARTICLE' | 'BLOG' | 'SOCIAL' | 'EMAIL';
  content: string;
  tags: string[];
  media?: any;
  excerpt?: string;
  scheduledAt?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
}

export async function saveContent(data: ContentFormData): Promise<ContentData> {
  try {
    console.log('Saving content:', data);

    const requestBody = {
      ...data,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    console.log('Request body:', requestBody);

    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to save content');
    }

    const savedContent = await response.json();
    console.log('Content saved successfully:', savedContent);

    // Create corresponding calendar event if content is scheduled or published
    // Include draft content that has a scheduled date
    if (savedContent.scheduledAt || savedContent.status === 'PUBLISHED' || savedContent.status === 'APPROVED') {
      try {
        console.log('Creating calendar event for content:', {
          title: savedContent.title,
          status: savedContent.status,
          scheduledAt: savedContent.scheduledAt,
          type: savedContent.type
        });
        const calendarEvent = await createCalendarEventFromContent(savedContent);
        console.log('Calendar event created successfully:', calendarEvent.id);
      } catch (calendarError) {
        console.error('Failed to create calendar event for content:', calendarError);
        // Don't fail the content creation if calendar event creation fails
      }
    } else {
      console.log('Content does not meet criteria for calendar event creation:', {
        title: savedContent.title,
        status: savedContent.status,
        scheduledAt: savedContent.scheduledAt,
        hasScheduledAt: !!savedContent.scheduledAt
      });
    }

    return savedContent;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

export async function getContent(id: string): Promise<ContentData> {
  try {
    console.log('Fetching content:', id);
    const response = await fetch(`/api/content/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }
    const content = await response.json();
    console.log('Content fetched:', content);
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function updateContent(id: string, data: Partial<ContentFormValues>): Promise<ContentData> {
  try {
    console.log('Updating content:', { id, data });
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update content');
    }

    const updatedContent = await response.json();
    console.log('Content updated:', updatedContent);
    return updatedContent;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
}

export async function deleteContent(id: string): Promise<void> {
  try {
    console.log('Deleting content:', id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content');
    }
    console.log('Content deleted successfully');
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
}

export async function listContent(params: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}): Promise<{
  content: ContentData[];
  total: number;
  pages: number;
}> {
  try {
    console.log('Listing content with params:', params);
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.type) searchParams.set('type', params.type.toUpperCase());
    if (params.status) searchParams.set('status', params.status.toUpperCase());

    const response = await fetch(`${API_URL}?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to fetch content');
    }

    const data = await response.json();
    console.log('Content list response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching content list:', error);
    throw error;
  }
}

export async function createContent(data: ContentFormValues): Promise<ContentData> {
  try {
    console.log('Creating content:', data);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to create content');
    }

    const createdContent = await response.json();
    console.log('Content created:', createdContent);

    // Create corresponding calendar event if content is scheduled
    if (createdContent.scheduledAt || createdContent.status === 'PUBLISHED') {
      try {
        await createCalendarEventFromContent(createdContent);
      } catch (calendarError) {
        console.warn('Failed to create calendar event for content:', calendarError);
        // Don't fail the content creation if calendar event creation fails
      }
    }

    return createdContent;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
}

/**
 * Create a calendar event from content data
 */
export async function createCalendarEventFromContent(content: ContentData): Promise<any> {
  try {
    // Map content type to calendar event type
    const typeMapping: Record<string, string> = {
      'ARTICLE': 'article',
      'BLOG': 'blog', 
      'SOCIAL': 'social',
      'EMAIL': 'email'
    };

    // Map content status to calendar event status
    const statusMapping: Record<string, string> = {
      'DRAFT': 'scheduled',
      'IN_REVIEW': 'draft',
      'PENDING_REVIEW': 'draft',
      'CHANGES_REQUESTED': 'draft',
      'APPROVED': 'scheduled',
      'PUBLISHED': 'sent',
      'ARCHIVED': 'failed'
    };

    const eventStartTime = content.scheduledAt || content.publishedAt || new Date().toISOString();
    const eventEndTime = new Date(new Date(eventStartTime).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration

    // Determine calendar status - if content has scheduledAt, it should be 'scheduled' even if status is DRAFT
    const calendarStatus = content.scheduledAt && content.scheduledAt !== '' 
      ? 'scheduled' 
      : statusMapping[content.status] || 'draft';

    console.log('Calendar event mapping:', {
      contentType: content.type,
      contentStatus: content.status,
      calendarType: typeMapping[content.type] || 'article',
      calendarStatus,
      eventStartTime,
      hasScheduledAt: !!content.scheduledAt
    });

    const calendarEventData = {
      title: content.title,
      description: content.excerpt || content.content.substring(0, 200) + '...',
      startTime: eventStartTime,
      endTime: eventEndTime,
      type: typeMapping[content.type] || 'article',
      status: calendarStatus,
      socialMediaContent: content.type === 'SOCIAL' ? {
        platform: 'FACEBOOK', // Default platform, could be made configurable
        postType: 'post',
        content: content.content,
        mediaUrls: content.media ? [content.media] : [],
        scheduledTime: content.scheduledAt,
        status: calendarStatus
      } : undefined,
      articleContent: content.type === 'ARTICLE' ? {
        content: content.content,
        metadata: {
          slug: content.slug,
          tags: content.tags,
          excerpt: content.excerpt
        }
      } : undefined,
      blogPost: content.type === 'BLOG' ? {
        title: content.title,
        content: content.content,
        excerpt: content.excerpt,
        tags: content.tags,
        slug: content.slug,
        publishedAt: content.publishedAt,
        status: calendarStatus
      } : undefined,
      emailCampaign: content.type === 'EMAIL' ? {
        subject: content.title,
        content: content.content,
        scheduledAt: content.scheduledAt,
        status: calendarStatus
      } : undefined,
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
    };

    console.log('Creating calendar event from content:', calendarEventData);

    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(calendarEventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create calendar event');
    }

    const calendarEvent = await response.json();
    console.log('Calendar event created successfully:', calendarEvent);
    return calendarEvent;
  } catch (error) {
    console.error('Error creating calendar event from content:', error);
    throw error;
  }
}

/**
 * Sync existing content to calendar events
 */
export async function syncContentToCalendar(): Promise<{ synced: number; errors: number }> {
  try {
    console.log('Starting content to calendar sync...');
    
    let synced = 0;
    let errors = 0;
    const statusesToSync = ['PUBLISHED', 'APPROVED'];
    
    // Fetch content for each status separately since API doesn't support multiple statuses
    for (const status of statusesToSync) {
      try {
        const response = await fetch(`${API_URL}?limit=100&status=${status}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${status} content:`, response.status, response.statusText);
          continue;
        }

        const data = await response.json();
        const contentList = data.content || [];
        
        console.log(`Found ${contentList.length} content items with status ${status}`);

        for (const content of contentList) {
          try {
            // Check if calendar event already exists for this content
            const calendarResponse = await fetch(`/api/calendar/events?title=${encodeURIComponent(content.title)}`, {
              credentials: 'include',
            });

            if (calendarResponse.ok) {
              const { events } = await calendarResponse.json();
              const existingEvent = events.find((event: any) => 
                event.title === content.title && 
                new Date(event.startTime).toDateString() === new Date(content.scheduledAt || content.publishedAt || content.createdAt).toDateString()
              );

              if (!existingEvent) {
                console.log(`Creating calendar event for content: ${content.title}`);
                await createCalendarEventFromContent(content);
                synced++;
              } else {
                console.log(`Calendar event already exists for content: ${content.title}`);
              }
            }
          } catch (error) {
            console.error(`Failed to sync content ${content.id} to calendar:`, error);
            errors++;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch content with status ${status}:`, error);
        errors++;
      }
    }

    // Also fetch content that might be scheduled but not marked as APPROVED or PUBLISHED
    try {
      const response = await fetch(`${API_URL}?limit=100`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const allContent = data.content || [];
        
        // Filter content that has a scheduledAt date
        const scheduledContent = allContent.filter((content: any) => 
          content.scheduledAt && !statusesToSync.includes(content.status)
        );

        console.log(`Found ${scheduledContent.length} additional scheduled content items`);

        for (const content of scheduledContent) {
          try {
            const calendarResponse = await fetch(`/api/calendar/events?title=${encodeURIComponent(content.title)}`, {
              credentials: 'include',
            });

            if (calendarResponse.ok) {
              const { events } = await calendarResponse.json();
              const existingEvent = events.find((event: any) => 
                event.title === content.title && 
                new Date(event.startTime).toDateString() === new Date(content.scheduledAt).toDateString()
              );

              if (!existingEvent) {
                console.log(`Creating calendar event for scheduled content: ${content.title}`);
                await createCalendarEventFromContent(content);
                synced++;
              }
            }
          } catch (error) {
            console.error(`Failed to sync scheduled content ${content.id} to calendar:`, error);
            errors++;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch scheduled content:', error);
      errors++;
    }

    console.log(`Sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error during content to calendar sync:', error);
    throw error;
  }
} 