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
  platforms?: string[];
  media?: any;
  mediaItems?: Array<{
    id: string;
    type: string;
    url: string;
    title: string;
    description?: string;
    altText?: string;
    caption?: string;
    metadata?: any;
  }>;
  publishingOptions?: {
    crossPost: boolean;
    autoOptimize: boolean;
    trackAnalytics: boolean;
  };
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
  contentListId?: string;
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

    // If content list ID is provided, associate content with the list
    if (data.contentListId && savedContent.id) {
      try {
        await associateContentWithList(savedContent.id, data.contentListId);
      } catch (associationError) {
        console.error('Failed to associate content with list:', associationError);
        // Don't fail the content creation if association fails
      }
    }

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

/**
 * Associate a content item with a content list
 */
export async function associateContentWithList(contentId: string, contentListId: string): Promise<void> {
  try {
    console.log('Associating content with list:', { contentId, contentListId });
    const response = await fetch(`/api/content-lists/${contentListId}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ contentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to associate content with list');
    }

    console.log('Content associated with list successfully');
  } catch (error) {
    console.error('Error associating content with list:', error);
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
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
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
    
    // Handle both old and new API response formats
    if (data.pagination) {
      return {
        content: data.content,
        total: data.pagination.total,
        pages: data.pagination.pages,
        pagination: data.pagination
      };
    } else {
      // Legacy format fallback
      return data;
    }
  } catch (error) {
    console.error('Error fetching content list:', error);
    throw error;
  }
}

export async function createContent(data: ContentFormValues): Promise<ContentData> {
  try {
    console.log('Creating content with media:', data);
    
    // Ensure media is properly serialized
    const processedData = {
      ...data,
      media: data.media ? JSON.stringify(data.media) : undefined,
    };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to create content');
    }

    const createdContent = await response.json();
    console.log('Content created successfully:', createdContent);

    // Force refresh of content list
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('content-created'));
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
      'DRAFT': 'draft',           // Show as draft in calendar
      'IN_REVIEW': 'review',      // Show as under review
      'PENDING_REVIEW': 'review', // Show as under review
      'CHANGES_REQUESTED': 'draft', // Back to draft
      'APPROVED': 'scheduled',    // Ready for publishing
      'PUBLISHED': 'sent',        // Published content
      'ARCHIVED': 'failed'        // Archived content
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
      contentId: content.id, // Add this critical line
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

    console.log('Creating calendar event from content with contentId:', {
      contentId: content.id,
      calendarEventData
    });

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
    console.log('Calendar event created successfully with contentId link:', calendarEvent);
    return calendarEvent;
  } catch (error) {
    console.error('Error creating calendar event from content:', error);
    throw error;
  }
}

/**
 * Sync existing content to calendar events with retry mechanism
 */
export async function syncContentToCalendar(retryCount = 0): Promise<{ synced: number; errors: number }> {
  try {
    console.log('Starting content to calendar sync with relationship tracking...');
    
    let synced = 0;
    let errors = 0;
    const statusesToSync = ['PUBLISHED', 'APPROVED'];
    
    for (const status of statusesToSync) {
      try {
        const response = await fetch(`${API_URL}?limit=100&status=${status}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${status} content:`, response.status, response.statusText);
          errors++;
          continue;
        }

        const data = await response.json();
        const contentList = data.content || [];
        
        console.log(`Found ${contentList.length} content items with status ${status}`);

        for (const content of contentList) {
          try {
            // Check if calendar event already exists for this content using contentId
            const calendarResponse = await fetch(`/api/calendar/events?contentId=${content.id}`, {
              credentials: 'include',
            });

            if (calendarResponse.ok) {
              const { events } = await calendarResponse.json();
              
              if (events.length === 0) {
                console.log(`Creating calendar event for content: ${content.title} (ID: ${content.id})`);
                await createCalendarEventFromContent(content);
                synced++;
              } else {
                console.log(`Calendar event already exists for content: ${content.title} (ID: ${content.id})`);
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

    console.log(`Sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error during content to calendar sync:', error);
    throw error;
  }
}